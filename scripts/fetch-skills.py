#!/usr/bin/env python3
"""
fetch-skills.py — 抓取 OpenAI Codex skills 最新数据

数据源：
  1. openai/skills（官方 39 个 curated skills）— 拉 SKILL.md frontmatter
  2. 17 个仓库的最新 stars 数

输出：
  js/data.js (覆盖)

设计原则：
  - 标准库 only（urllib），无 pip 依赖
  - GitHub API rate limit 友好（带 retry + 401/403/429 处理）
  - 幂等：重复运行结果一致
  - 部分失败容错：单个 skill 抓不到不影响其他

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

GITHUB_API = "https://api.github.com"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

# 已知仓库 → (source, group, repo_name)
# 用于在 official 之外给所有仓库分类
KNOWN_REPOS = {
    # source=community (社区清单)
    "ComposioHQ/awesome-codex-skills": ("community", None, "awesome-codex-skills"),
    "VoltAgent/awesome-codex-subagents": ("community", None, "awesome-codex-subagents"),
    "hashgraph-online/awesome-codex-plugins": ("community", None, "awesome-codex-plugins"),
    "RoggeOhta/awesome-codex-cli": ("community", None, "awesome-codex-cli"),
    # source=tools
    "router-for-me/CLIProxyAPI": ("tools", None, "CLIProxyAPI"),
    "decolua/9router": ("tools", None, "9router"),
    "openai/codex": ("tools", None, "codex-cli"),
    # source=general
    "affaan-m/ECC": ("general", None, "ECC"),
    "safishamsi/graphify": ("general", None, "graphify"),
    "alirezarezvani/claude-skills": ("general", None, "claude-skills"),
    "leo-lilinxiao/codex-autoresearch": ("general", None, "codex-autoresearch"),
    "ljagiello/ctf-skills": ("general", None, "ctf-skills"),
    "mukul975/Anthropic-Cybersecurity-Skills": ("general", None, "cybersecurity-skills"),
    "kepano/obsidian-skills": ("general", None, "obsidian-skills"),
    "coreyhaines31/marketingskills": ("general", None, "marketingskills"),
    "Prat011/awesome-llm-skills": ("general", None, "awesome-llm-skills"),
    "sickn33/antigravity-awesome-skills": ("general", None, "antigravity-awesome-skills"),
}

# ============================================================
# HTTP 工具
# ============================================================
def http_get(url, timeout=15, retries=3):
    """GET 一个 URL，返回 bytes；带 retry 和 rate limit 处理。"""
    headers = {
        "User-Agent": "codex-skills-hub-bot/1.0",
        "Accept": "application/vnd.github+json",
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    last_err = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except urllib.error.HTTPError as e:
            if e.code in (401, 403, 429):
                # 限流，等待并重试
                wait = int(e.headers.get("Retry-After", 60))
                if e.code == 403 and "rate limit" not in (e.reason or "").lower():
                    print(f"  ✗ HTTP {e.code}: {e.reason}", file=sys.stderr)
                    return None
                print(f"  ⏳ Rate limited, waiting {wait}s...", file=sys.stderr)
                time.sleep(min(wait, 120))
                last_err = e
            elif e.code == 404:
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


def fetch_official_curated():
    """抓 openai/skills 的 .curated 目录列表。"""
    print("📥 Fetching openai/skills .curated list...")
    data = http_get_json(f"{GITHUB_API}/repos/openai/skills/contents/skills/.curated")
    if not data:
        print("  ✗ Failed to fetch .curated listing", file=sys.stderr)
        return []
    names = [item["name"] for item in data if item.get("type") == "dir"]
    print(f"  ✓ Found {len(names)} curated skills: {names}")
    return names


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
            # 多行折叠：取后续缩进行
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


# ============================================================
# 主流程
# ============================================================
def main():
    today = time.strftime("%Y-%m-%d")
    print(f"🚀 Codex Skills Hub — fetch-skills.py @ {today}")
    print(f"   GITHUB_TOKEN: {'set' if GITHUB_TOKEN else 'NOT set (rate limit 60/h)'}")
    print()

    # 1. 抓官方 curated skills
    curated_names = fetch_official_curated()

    # 2. 抓每个官方 skill 的 frontmatter + openai/skills 仓库 stars
    print("\n📥 Fetching official skill details...")
    repo_info = fetch_repo_info("openai", "skills")
    base_stars = repo_info["stars"] if repo_info else 21251

    official_skills = []
    for name in curated_names:
        path = f"skills/.curated/{name}"
        fm = fetch_skill_frontmatter("openai", "skills", path)
        if not fm:
            print(f"  ✗ {name}: failed to fetch frontmatter, skipping")
            continue

        short = fm["short_description"] or (fm["description"][:120] if fm["description"] else "")
        official_skills.append({
            "name": name,
            "source": "official",
            "group": infer_group(name),
            "repo": "openai/skills",
            "stars": base_stars,
            "desc": fm["description"][:240] or short,
            "url": f"https://github.com/openai/skills/tree/main/{path}",
            "install": f"$skill-installer {name}",
        })
        print(f"  ✓ {name} ({fm.get('short_description', '')[:50]})")
        time.sleep(0.3)  # 礼貌延迟

    print(f"  → {len(official_skills)} official skills fetched")

    # 3. 抓社区/工具/通用仓库的最新 stars + description
    print("\n📥 Fetching other repo metadata...")
    other_skills = []
    for repo, (source, group, name) in KNOWN_REPOS.items():
        owner, repo_name = repo.split("/")
        info = fetch_repo_info(owner, repo_name)
        if not info:
            print(f"  ✗ {repo}: fetch failed")
            other_skills.append({
                "name": name,
                "source": source,
                "group": group,
                "repo": repo,
                "stars": 0,
                "desc": "(description unavailable)",
                "url": f"https://github.com/{repo}",
                "install": f"git clone https://github.com/{repo}.git",
            })
            continue

        # 安装命令
        if repo == "openai/codex":
            install = "npm i -g @openai/codex"
        elif repo == "decolua/9router":
            install = "npm i -g 9router"
        elif repo == "router-for-me/CLIProxyAPI":
            install = "go install github.com/router-for-me/CLIProxyAPI@latest"
        elif source == "community":
            # 社区清单是 awesome 列表，不是可执行 skill
            install = "git clone https://github.com/" + repo + ".git  # browse the awesome list"
        else:
            install = "git clone https://github.com/" + repo + ".git"

        # 描述
        desc = (info["description"] or "").strip() or f"{repo} — curated Codex-related resource."

        other_skills.append({
            "name": name,
            "source": source,
            "group": group,
            "repo": repo,
            "stars": info["stars"],
            "desc": desc[:240],
            "url": info["html_url"],
            "install": install,
        })
        print(f"  ✓ {repo}: ⭐{info['stars']:,}")
        time.sleep(0.5)

    # 4. 合并所有 skills
    all_skills = official_skills + other_skills

    # 5. 统计
    sources = set(s["repo"] for s in all_skills)
    total_stars = sum(s["stars"] for s in all_skills)

    print(f"\n📊 Summary:")
    print(f"   Total skills:  {len(all_skills)}")
    print(f"   Sources:       {len(sources)}")
    print(f"   Total stars:   {total_stars:,}")

    # 6. 生成 data.js
    meta = {
        "title": "Codex Skills Hub",
        "description": "Curated index of OpenAI Codex skills — official + community",
        "lastUpdated": today,
        "totalCount": len(all_skills),
        "sources": len(sources),
    }

    categories = [
        {
            "id": "official", "label": "Official Curated", "icon": "🎯",
            "description": "OpenAI 官方精选的 skills，$skill-installer 可直接安装",
            "color": "#6366f1",
            "groups": [
                {"id": "figma", "label": "Figma"},
                {"id": "github", "label": "GitHub"},
                {"id": "notion", "label": "Notion"},
                {"id": "playwright", "label": "Playwright"},
                {"id": "deploy", "label": "Deployment"},
                {"id": "security", "label": "Security"},
                {"id": "other", "label": "Other"},
            ],
        },
        {
            "id": "community", "label": "Community Lists", "icon": "🌟",
            "description": "社区维护的 awesome 清单，收录各种 Codex skills",
            "color": "#10b981", "groups": None,
        },
        {
            "id": "tools", "label": "Codex CLI Tools", "icon": "🛠",
            "description": "配合 Codex 使用的 CLI 工具 — proxy、router、wrapper",
            "color": "#f59e0b", "groups": None,
        },
        {
            "id": "general", "label": "General Agent Skills", "icon": "🤖",
            "description": "通用 AI agent skills — 多端兼容（Codex/Claude Code/OpenCode）",
            "color": "#ec4899", "groups": None,
        },
    ]

    # 7. 写文件
    DATA_JS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_JS_PATH, "w", encoding="utf-8") as f:
        f.write("/**\n")
        f.write(" * Codex Skills Hub — data\n")
        f.write(" * 自动生成，请勿手动编辑。运行 `python scripts/fetch-skills.py` 重新生成。\n")
        f.write(" */\n\n")
        f.write("window.SKILL_DATA = ")
        # 紧凑 JSON（无多余空格），保持单行可读
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
        print("\n✗ Interrupted", file=sys.stderr)
        sys.exit(1)
