#!/usr/bin/env python3
"""
fetch-skills.py — 抓取所有 skill 仓库的最新数据

数据源（全部从 config/repos.json 读取）：
  1. openai/skills（官方 curated skills）— 拉 SKILL.md frontmatter
  2. anthropics/skills（Claude skills）— 拉 SKILL.md frontmatter
  3. repos 中所有其他仓库的最新 stars 和描述

输出：
  js/data.js (覆盖)

设计原则：
  - 标准库 only（urllib），无 pip 依赖
  - GitHub API rate limit 友好（带 retry + 401/403/429 处理）
  - 幂等：重复运行结果一致
  - 部分失败容错：单个 skill 抓不到不影响其他
  - 仓库配置全部在 config/repos.json，无需改代码

环境变量：
  GITHUB_TOKEN  — 可选，提供后 API rate limit 提到 5000/小时

Author: rdone4425
License: MIT
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

# ============================================================
# 配置
# ============================================================
REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_JS_PATH = REPO_ROOT / "js" / "data.js"
CONFIG_PATH = REPO_ROOT / "config" / "repos.json"

GITHUB_API = "https://api.github.com"

# 接受多种 env var 名字（兼容 CI / 本地 / sandbox）
_token_file = os.environ.get("GITHUB_TOKEN_FILE", "")
GITHUB_TOKEN = (
    open(_token_file).read().strip()
    if _token_file and os.path.exists(_token_file)
    else os.environ.get("GITHUB_TOKEN")
    or os.environ.get("GH_TOKEN")
    or os.environ.get("GIT_TOKEN")
    or ""
)


def load_config():
    """加载 config/repos.json 配置文件。"""
    if not CONFIG_PATH.exists():
        print(f"❌ Config file not found: {CONFIG_PATH}", file=sys.stderr)
        print("   Create it first or run from the correct directory.", file=sys.stderr)
        sys.exit(1)
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ============================================================
# HTTP 工具
# ============================================================
def http_get(url, timeout=15, retries=3):
    """GET 一个 URL，返回 bytes；带 retry 和 rate limit 处理。"""
    headers = {
        "User-Agent": "skill-hub-bot/1.0",
        "Accept": "application/vnd.github+json",
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    last_err = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except urllib.error.HTTPError as e:
            if e.code == 401:
                print(f"  ✗ HTTP 401 Unauthorized (check token)", file=sys.stderr)
                return None
            elif e.code == 429 or (e.code == 403 and "rate limit" in (e.reason or "").lower()):
                wait = int(e.headers.get("Retry-After", 60))
                print(f"  ⏳ Rate limited, waiting {wait}s...", file=sys.stderr)
                time.sleep(min(wait, 120))
                last_err = e
            elif e.code == 404:
                return None
            elif e.code == 403:
                print(f"  ✗ HTTP 403: {e.reason}", file=sys.stderr)
                return None
            else:
                last_err = e
                time.sleep(2 ** attempt)
        except (urllib.error.URLError, TimeoutError) as e:
            last_err = e
            time.sleep(2 ** attempt)

    print(f"  ✗ Failed after {retries} retries: {last_err}", file=sys.stderr)
    return None


def http_get_json(url, **kwargs):
    """GET 并 parse JSON。"""
    data = http_get(url, **kwargs)
    if data is None:
        return None
    try:
        return json.loads(data)
    except json.JSONDecodeError as e:
        print(f"  ✗ JSON parse error: {e}", file=sys.stderr)
        return None


def http_get_text(url, **kwargs):
    """GET 并 decode 为 utf-8 文本。"""
    data = http_get(url, **kwargs)
    if data is None:
        return None
    return data.decode("utf-8", errors="replace")


# ============================================================
# 抓取函数
# ============================================================
def fetch_repo_info(owner, repo):
    """获取仓库的 stars、description。"""
    info = http_get_json(f"{GITHUB_API}/repos/{owner}/{repo}")
    if not info:
        return None
    return {
        "stars": info.get("stargazers_count", 0),
        "description": info.get("description", ""),
        "html_url": info.get("html_url", f"https://github.com/{owner}/{repo}"),
    }


def fetch_skill_frontmatter(owner, repo, path, ref="main"):
    """抓一个 skill 的 SKILL.md frontmatter。"""
    raw = http_get_text(
        f"https://raw.githubusercontent.com/{owner}/{repo}/{ref}/{path}/SKILL.md"
    )
    if not raw:
        return None

    # YAML frontmatter: ---\n...\n---
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", raw, re.DOTALL)
    if not m:
        return None
    fm = m.group(1)

    # 提取 name
    name_m = re.search(r"^name:\s*(.+)$", fm, re.MULTILINE)
    name = name_m.group(1).strip() if name_m else None

    # 提取 description（多行，用 | 折叠或 > 折叠）
    desc_m = re.search(r"^description:\s*[|>]?\s*(.*?)$", fm, re.MULTILINE)
    description = ""
    if desc_m:
        first = desc_m.group(1).strip()
        if first in ("|", ">"):
            lines = re.findall(r"^\s{2,}(.+?)$", fm[desc_m.end():], re.MULTILINE)
            description = " ".join(l.strip() for l in lines)
        else:
            description = first

    # 提取 short-description
    short_m = re.search(r"short-description:\s*(.+)$", fm, re.MULTILINE)
    short = short_m.group(1).strip() if short_m else ""

    return {
        "name": name,
        "description": description,
        "short_description": short,
    }


def infer_group(skill_name):
    """根据 skill name 推断官方分组。"""
    if skill_name.startswith("figma"):
        return "figma"
    if skill_name.startswith("gh-"):
        return "github"
    if skill_name.startswith("notion-"):
        return "notion"
    if skill_name.startswith("playwright"):
        return "playwright"
    if skill_name.endswith("-deploy"):
        return "deploy"
    if skill_name.startswith("security-"):
        return "security"
    return "other"


def fetch_skill_dir(owner, repo, dir_path, source, install_tpl, ref="main"):
    """抓取一个目录下所有子目录的 SKILL.md frontmatter。
    
    Args:
        owner: 仓库 owner
        repo: 仓库名
        dir_path: skill 目录路径（如 "skills/.curated" 或 "skills"）
        source: 分类（official / claude）
        install_tpl: 安装命令模板（如 "$skill-installer {name}"）
        ref: git ref
    
    Returns:
        list of dict: skills 数据列表
    """
    print(f"📥 Fetching {owner}/{repo}/{dir_path}...")
    data = http_get_json(f"{GITHUB_API}/repos/{owner}/{repo}/contents/{dir_path}")
    if not data or not isinstance(data, list):
        print(f"  ✗ Failed to fetch {dir_path} listing", file=sys.stderr)
        return []

    names = [item["name"] for item in data if item.get("type") == "dir"]
    print(f"  ✓ Found {len(names)} skills in {dir_path}")

    repo_info = fetch_repo_info(owner, repo)
    base_stars = repo_info["stars"] if repo_info else 0

    skills = []
    for name in names:
        path = f"{dir_path}/{name}"
        fm = fetch_skill_frontmatter(owner, repo, path, ref=ref)
        if not fm:
            print(f"  ✗ {name}: failed to fetch frontmatter, skipping")
            continue

        short = fm.get("short_description", "") or (fm.get("description", "")[:120] if fm.get("description") else "")
        install = install_tpl.replace("{name}", name) if install_tpl else f"$skill-installer {name}"

        skills.append({
            "name": name,
            "source": source,
            "group": infer_group(name) if source == "official" else None,
            "repo": f"{owner}/{repo}",
            "stars": base_stars,
            "desc": fm.get("description", "")[:240] or short,
            "url": f"https://github.com/{owner}/{repo}/tree/{ref}/{path}",
            "install": install,
        })
        print(f"  ✓ {name} ({short[:50]})")
        time.sleep(0.3)

    return skills


# ============================================================
# 主流程
# ============================================================
def main():
    today = time.strftime("%Y-%m-%d")
    print(f"🚀 Skill Hub — fetch-skills.py @ {today}")
    print(f"   GITHUB_TOKEN: {'set' if GITHUB_TOKEN else 'NOT set (rate limit 60/h)'}")

    # 加载配置
    config = load_config()
    print(f"   Config: {CONFIG_PATH}")
    print(f"   Repos in config: {len(config.get('repos', {}))}")
    print()

    all_skills = []

    # ─── 1. 抓 skill_dir 类型的源（openai、anthropic）───
    for key, src in config.get("sources", {}).items():
        if src.get("type") != "skill_dir":
            continue

        repo_full = src["repo"]
        owner, repo_name = repo_full.split("/")
        dir_path = src["path"]
        source = src["source"]
        install_tpl = src.get("install", "$skill-installer {name}")

        print(f"📦 {source.upper()} skills ({repo_full})")
        skills = fetch_skill_dir(owner, repo_name, dir_path, source, install_tpl)
        all_skills.extend(skills)
        print(f"  → {len(skills)} {source} skills fetched\n")

    # ─── 2. 抓 repos 中的所有其他仓库 ───
    print(f"📦 Other repos ({len(config.get('repos', {}))} repos)")
    for repo_full, repo_cfg in config.get("repos", {}).items():
        owner, repo_name = repo_full.split("/")
        source = repo_cfg["source"]
        name = repo_cfg.get("name", repo_name)
        install_override = repo_cfg.get("install")

        info = fetch_repo_info(owner, repo_name)
        if not info:
            print(f"  ✗ {repo_full}: fetch failed")
            all_skills.append({
                "name": name,
                "source": source,
                "group": None,
                "repo": repo_full,
                "stars": 0,
                "desc": "(description unavailable)",
                "url": f"https://github.com/{repo_full}",
                "install": install_override or f"git clone https://github.com/{repo_full}.git",
            })
            continue

        # 安装命令
        if install_override:
            install = install_override
        elif source == "community":
            install = f"git clone https://github.com/{repo_full}.git  # browse the awesome list"
        else:
            install = f"git clone https://github.com/{repo_full}.git"

        desc = (info["description"] or "").strip() or f"{repo_full} — curated resource."

        all_skills.append({
            "name": name,
            "source": source,
            "group": None,
            "repo": repo_full,
            "stars": info["stars"],
            "desc": desc[:240],
            "url": info["html_url"],
            "install": install,
        })
        print(f"  ✓ {repo_full}: ⭐{info['stars']:,}")
        time.sleep(0.5)

    # ─── 3. 统计 ───
    sources = set(s["repo"] for s in all_skills)
    total_stars = sum(s["stars"] for s in all_skills)

    print()
    print(f"📊 Summary:")
    print(f"   Total skills:  {len(all_skills)}")
    print(f"   Sources:       {len(sources)}")
    print(f"   Total stars:   {total_stars:,}")
    print(f"   By source:")
    src_counts = {}
    for s in all_skills:
        src_counts[s["source"]] = src_counts.get(s["source"], 0) + 1
    for src, cnt in sorted(src_counts.items()):
        print(f"     {src:10}  {cnt}")

    # ─── 4. 生成 data.js ───
    meta = {
        "title": "Skill Hub",
        "description": "AI Agent Skills 导航站 — Codex · Claude · Hermes · OpenCode · OpenClaw",
        "lastUpdated": today,
        "totalCount": len(all_skills),
        "sources": len(sources),
    }

    categories = config.get("categories", [])

    # ─── 5. 写文件 ───
    DATA_JS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_JS_PATH, "w", encoding="utf-8") as f:
        f.write("/**\n")
        f.write(" * Skill Hub — data\n")
        f.write(" * 自动生成，请勿手动编辑。运行 `python scripts/fetch-skills.py` 重新生成。\n")
        f.write(" * 配置文件：config/repos.json\n")
        f.write(" */\n\n")
        f.write("window.SKILL_DATA = ")
        f.write(json.dumps(
            {"meta": meta, "categories": categories, "skills": all_skills},
            ensure_ascii=False, indent=2,
        ))
        f.write(";\n")

    print(f"\n✅ Wrote {len(all_skills)} skills to {DATA_JS_PATH.relative_to(REPO_ROOT)}")
    print("   Done.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Interrupted")
        sys.exit(130)
