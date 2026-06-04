#!/usr/bin/env python3
"""
discover-skills.py — 自动发现 GitHub 上的新 AI Agent Skills 仓库

搜索策略：
  1. 搜索 "agent skills" / "codex skills" / "claude code skills" 等关键词
  2. 过滤：stars >= 100，最近 6 个月内有更新
  3. 排除已在 config/repos.json 中的仓库
  4. 将新发现的仓库追加到 config/repos.json

输出：
  - config/repos.json（追加新发现的仓库）
  - 发现报告打印到 stdout

环境变量：
  GITHUB_TOKEN — 必须（搜索 API 需要认证）

Author: rdone4425
License: MIT
"""

import json
import os
import sys
import time
import urllib.error
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime, timedelta

# ============================================================
# 配置
# ============================================================
REPO_ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = REPO_ROOT / "config" / "repos.json"

GITHUB_API = "https://api.github.com"


def get_token():
    """获取 GitHub token（兼容多种环境变量名）。"""
    return (
        os.environ.get("GITHUB_TOKEN")
        or os.environ.get("GH_TOKEN")
        or os.environ.get("GIT_TOKEN")
        or ""
    )


# 搜索查询列表
SEARCH_QUERIES = [
    "agent skills codex",
    "claude code skills",
    "codex skills awesome",
    "AI agent skills curated",
    "LLM agent skills",
    "cursor skills agent",
    "copilot agent skills",
    "gemini CLI skills",
]

# 最低 stars 阈值
MIN_STARS = 100

# 最近 N 个月内更新过
MAX_AGE_MONTHS = 6

# 每个查询最多取多少结果
MAX_PER_QUERY = 30


# ============================================================
# HTTP 工具
# ============================================================
def http_get(url, timeout=15, retries=3):
    token = get_token()
    headers = {
        "User-Agent": "skill-hub-discover/1.0",
        "Accept": "application/vnd.github+json",
    }
    if token:
        headers["Authorization"] = f"token {token}"

    last_err = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except urllib.error.HTTPError as e:
            if e.code == 401:
                print(f"  ✗ HTTP 401 Unauthorized", file=sys.stderr)
                return None
            elif e.code == 429 or (e.code == 403 and "rate limit" in (e.reason or "").lower()):
                wait = int(e.headers.get("Retry-After", 60))
                print(f"  ⏳ Rate limited, waiting {wait}s...", file=sys.stderr)
                time.sleep(min(wait, 120))
                last_err = e
            elif e.code in (404, 422):
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
    data = http_get(url, **kwargs)
    if data is None:
        return None
    try:
        return json.loads(data)
    except json.JSONDecodeError as e:
        print(f"  ✗ JSON parse error: {e}", file=sys.stderr)
        return None


# ============================================================
# 配置文件操作
# ============================================================
def load_config():
    """加载 config/repos.json。"""
    if not CONFIG_PATH.exists():
        return {"sources": {}, "repos": {}, "categories": []}
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_config(config):
    """保存 config/repos.json（保持格式美观）。"""
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
        f.write("\n")


def get_existing_repos(config):
    """从配置中获取所有已知仓库的 full_name 集合。"""
    repos = set()
    for src in config.get("sources", {}).values():
        if "repo" in src:
            repos.add(src["repo"])
    for repo_name in config.get("repos", {}):
        repos.add(repo_name)
    return repos


# ============================================================
# 搜索 GitHub
# ============================================================
def search_repos(query, sort="stars", order="desc", per_page=30):
    """搜索 GitHub 仓库。"""
    params = urllib.parse.urlencode({
        "q": query,
        "sort": sort,
        "order": order,
        "per_page": per_page,
    })
    url = f"{GITHUB_API}/search/repositories?{params}"
    result = http_get_json(url)
    if not result or "items" not in result:
        return []
    return result["items"]


def classify_source(repo_info):
    """根据仓库信息推断分类。"""
    name = (repo_info.get("name") or "").lower()
    desc = (repo_info.get("description") or "").lower()
    topics = [t.lower() for t in (repo_info.get("topics") or [])]

    if "awesome" in name or "awesome" in desc or "curated-list" in topics:
        return "community"

    tool_keywords = ["cli", "proxy", "router", "wrapper", "tool", "installer"]
    if any(kw in name or kw in desc for kw in tool_keywords):
        return "tools"

    return "general"


def infer_install_cmd(full_name, repo_info):
    """推断安装命令。"""
    lang = (repo_info.get("language") or "").lower()
    name = repo_info.get("name", "")
    desc = (repo_info.get("description") or "").lower()

    if "awesome" in name.lower() or "curated" in desc:
        return f"git clone https://github.com/{full_name}.git  # browse the awesome list"

    if lang == "go":
        return f"go install github.com/{full_name}@latest"
    elif lang in ("javascript", "typescript"):
        return f"npm i -g {name}"
    else:
        return f"git clone https://github.com/{full_name}.git"


# ============================================================
# 主流程
# ============================================================
def main():
    today = time.strftime("%Y-%m-%d")
    token = get_token()
    print(f"🔍 Skill Hub — discover-skills.py @ {today}")
    print(f"   GITHUB_TOKEN: {'set' if token else 'NOT set'}")

    if not token:
        print("   ⚠️  No GITHUB_TOKEN — search API rate limit is 10/min, may be slow")
    print()

    # 加载配置
    config = load_config()
    existing = get_existing_repos(config)
    print(f"📦 Existing repos in config: {len(existing)}")
    print()

    # 搜索新仓库
    discovered = {}  # full_name → repo_info
    cutoff = datetime.utcnow() - timedelta(days=MAX_AGE_MONTHS * 30)

    for query in SEARCH_QUERIES:
        print(f"🔎 Searching: \"{query}\"")
        items = search_repos(query, per_page=MAX_PER_QUERY)
        new_count = 0

        for item in items:
            full_name = item["full_name"]

            if full_name in existing:
                continue

            stars = item.get("stargazers_count", 0)
            if stars < MIN_STARS:
                continue

            updated = item.get("updated_at", "")
            if updated:
                try:
                    update_dt = datetime.fromisoformat(updated.replace("Z", "+00:00")).replace(tzinfo=None)
                    if update_dt < cutoff:
                        continue
                except (ValueError, TypeError):
                    pass

            if full_name in discovered:
                continue

            discovered[full_name] = item
            new_count += 1

        print(f"  → Found {new_count} new candidates (total: {len(discovered)})")
        time.sleep(2)

    print(f"\n📊 Total new candidates: {len(discovered)}")

    if not discovered:
        print("✅ No new skills discovered. Config is up to date.")
        return 0

    # 构建新仓库配置并追加到 config
    added = 0
    new_repos = config.get("repos", {})

    for full_name, info in sorted(discovered.items(), key=lambda x: x[1].get("stargazers_count", 0), reverse=True):
        source = classify_source(info)
        name = info.get("name", full_name.split("/")[-1])
        stars = info.get("stargazers_count", 0)
        install = infer_install_cmd(full_name, info)

        new_repos[full_name] = {
            "source": source,
            "name": name,
            "install": install,
        }
        added += 1
        print(f"  ✓ {full_name} ⭐{stars:,} [{source}]")

    config["repos"] = new_repos
    config["lastUpdated"] = today

    # 保存配置
    save_config(config)

    print(f"\n✅ Added {added} new repos to config/repos.json")
    print(f"   Total repos in config: {len(new_repos)}")

    return added


if __name__ == "__main__":
    try:
        result = main()
        sys.exit(0 if result is not None else 1)
    except KeyboardInterrupt:
        print("\n🛑 Interrupted")
        sys.exit(130)
