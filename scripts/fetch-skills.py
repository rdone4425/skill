#!/usr/bin/env python3
"""
fetch-skills.py — 抓取所有 skill 仓库的最新数据

数据源（全部从 config/repos.json 读取）：
  1. openai/skills（官方 curated skills）— 拉 SKILL.md frontmatter
  2. anthropics/skills（Claude skills）— 拉 SKILL.md frontmatter
  3. repos 中所有其他仓库的最新 stars 和描述

输出：
  js/data.js (覆盖，作为前端动态加载器的中间数据源)
  后续由 scripts/export-agent-function-data.js 拆分到 agents/ 目录

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


AGENT_CATALOG = [
    {
        "id": "codex",
        "keywords": ["codex", "openai/skills", "openai/codex"],
        "label": "Codex",
        "description": "面向 Codex 生态的 skills、工具和资源",
        "icon": "🎯",
        "color": "#6366f1",
        "order": 1,
    },
    {
        "id": "claude",
        "keywords": ["claude", "anthropic"],
        "label": "Claude Code",
        "description": "面向 Claude Code 生态的 skills、工具和资源",
        "icon": "🟠",
        "color": "#fb923c",
        "order": 2,
    },
    {
        "id": "hermes",
        "keywords": ["hermes", "nousresearch/hermes-agent"],
        "label": "Hermes Agent",
        "description": "面向 Hermes Agent 生态的 skills、工具和资源",
        "icon": "⚡",
        "color": "#06b6d4",
        "order": 3,
    },
    {
        "id": "opencode",
        "keywords": ["opencode"],
        "label": "OpenCode",
        "description": "面向 OpenCode 生态的 skills、工具和资源",
        "icon": "🟢",
        "color": "#22c55e",
        "order": 4,
    },
    {
        "id": "openclaw",
        "keywords": ["openclaw", "clawdbot", "moltbot"],
        "label": "OpenClaw",
        "description": "面向 OpenClaw 生态的 skills、工具和资源",
        "icon": "🐾",
        "color": "#f97316",
        "order": 5,
    },
    {
        "id": "cursor",
        "keywords": ["cursor"],
        "label": "Cursor",
        "description": "面向 Cursor 生态的 skills、工具和资源",
        "icon": "🖱️",
        "color": "#10b981",
        "order": 6,
    },
    {
        "id": "copilot",
        "keywords": ["copilot"],
        "label": "GitHub Copilot",
        "description": "面向 GitHub Copilot 生态的 skills、工具和资源",
        "icon": "🧭",
        "color": "#0ea5e9",
        "order": 7,
    },
    {
        "id": "gemini",
        "keywords": ["gemini"],
        "label": "Gemini",
        "description": "面向 Gemini 生态的 skills、工具和资源",
        "icon": "💠",
        "color": "#8b5cf6",
        "order": 8,
    },
]

AGENT_META = {item["id"]: item for item in AGENT_CATALOG}


def infer_agent(source, repo_full, name, text):
    """根据 skill / repo 内容推断 agent 分类。"""
    source = (source or "").lower()
    if source == "official":
        return "codex"
    if source == "claude":
        return "claude"
    if source == "hermes":
        return "hermes"
    if source == "opencode":
        return "opencode"
    if source == "openclaw":
        return "openclaw"

    haystack = " ".join([
        repo_full or "",
        name or "",
        text or "",
    ]).lower()

    matches = []
    for item in AGENT_CATALOG:
        if any(keyword in haystack for keyword in item["keywords"]):
            matches.append(item["id"])

    if len(matches) > 1:
        return "multi"
    if len(matches) == 1:
        return matches[0]
    return "other"


def build_categories(skills):
    """根据技能里的 agent 字段动态生成分类。"""
    categories = []
    present_ids = sorted({skill.get("agent", "other") for skill in skills})

    for agent_id in present_ids:
        meta = AGENT_META.get(agent_id, {})
        if agent_id == "multi":
            categories.append({
                "id": "multi",
                "label": "Multi-Agent",
                "description": "同时面向多个 Agent 生态的 skills、工具和资源",
                "icon": "🧩",
                "color": "#a855f7",
                "order": 90,
                "groups": None,
            })
            continue

        if agent_id == "other":
            categories.append({
                "id": "other",
                "label": "Other",
                "description": "暂未识别到明确 Agent 名称的 skills、工具和资源",
                "icon": "📦",
                "color": "#6b7280",
                "order": 99,
                "groups": None,
            })
            continue

        categories.append({
            "id": agent_id,
            "label": meta.get("label", agent_id.title()),
            "description": meta.get("description", f"面向 {agent_id} 生态的 skills、工具和资源"),
            "icon": meta.get("icon", "📦"),
            "color": meta.get("color", "#6b7280"),
            "order": meta.get("order", 50),
            "groups": [
                {"id": "figma", "label": "Figma"},
                {"id": "github", "label": "GitHub"},
                {"id": "notion", "label": "Notion"},
                {"id": "playwright", "label": "Playwright"},
                {"id": "deploy", "label": "Deployment"},
                {"id": "security", "label": "Security"},
                {"id": "other", "label": "Other"},
            ] if agent_id == "codex" else None,
        })

    categories.sort(key=lambda item: (item.get("order", 999), item["label"].lower()))
    return categories


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
            "agent": infer_agent(source, f"{owner}/{repo}", name, fm.get("description", "") or short),
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
                "agent": infer_agent(source, repo_full, name, ""),
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
            "agent": infer_agent(source, repo_full, name, desc),
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

    categories = build_categories(all_skills)

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
