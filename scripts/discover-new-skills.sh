#!/bin/bash
# discover-new-skills.sh — 搜索 GitHub 发现新 skill 仓库
# 由 Hermes 定时任务调用（每 3 小时）
# 只负责发现新仓库，写入 config/repos.json
# 不更新 stars（那是 GitHub Actions 的工作）

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

enter_repo_dir

echo "🔍 Skill Hub — discover @ $(date -u +%Y-%m-%d_%H:%M:%S_UTC)"

ensure_github_token
pull_latest_main

# 搜索发现新仓库
echo ""
python3 scripts/discover-skills.py 2>&1

# 检查 config/repos.json 是否有变化
echo ""
if git diff --quiet config/repos.json; then
  echo "✅ No new repos discovered."
  exit 0
fi

# 有新仓库，提交推送
echo "📝 New repos found! Committing..."
configure_git_identity
git add config/repos.json

NEW_COUNT="$(git diff --cached --numstat config/repos.json | awk '{print $1}' || echo '?')"
DATE="$(date -u +"%Y-%m-%d %H:%M UTC")"

git commit -m "chore: discover new skill repos

- Updated: $DATE
- Source: Hermes auto-discovery (every 3h)"

echo "📦 Estimated inserted lines: $NEW_COUNT"

echo "📤 Pushing to main..."
git push origin main

echo ""
echo "✅ Done! New repos added to config/repos.json"
echo "   GitHub Actions will fetch their data on next run."
