#!/bin/bash
# auto-update-skills.sh — 自动发现新 skill 仓库并更新中间数据与 agents 产物
# 由 Hermes 定时任务或 CI 调用

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

enter_repo_dir

echo "🚀 Skill Hub — auto-update @ $(date -u +%Y-%m-%d_%H:%M:%S_UTC)"

ensure_github_token
pull_latest_main

# 1. 发现新仓库（写入 config/repos.json）
echo ""
echo "🔍 Step 1: Discovering new skill repos..."
python3 scripts/discover-skills.py 2>&1 || echo "⚠️  Discover had issues"

# 2. 运行数据流水线
echo ""
"$SCRIPT_DIR/run-data-pipeline.sh" 2>&1 || echo "⚠️  Data pipeline had issues"

# 3. 检查变更
echo ""
CHANGED=false
git diff --quiet js/data.js agents/ config/repos.json scripts/ .github/workflows/ || CHANGED=true

if [ "$CHANGED" = "false" ]; then
    echo "✅ No changes detected. Data is up to date."
    exit 0
fi

# 4. 提交并推送
echo "📝 Step 4: Committing changes..."
configure_git_identity
git add js/data.js agents/ config/repos.json scripts/ .github/workflows/

TOTAL=$(grep -c '"name":' js/data.js || echo "?")
STARS=$(grep -oE '"stars": [0-9]+' js/data.js | awk '{s+=$2} END {print s}')
REPOS=$(python3 -c "import json; print(len(json.load(open('config/repos.json')).get('repos', {})))" 2>/dev/null || echo "?")
DATE=$(date -u +"%Y-%m-%d %H:%M UTC")

git commit -m "chore: auto-update Skill Hub data

- Total skills: $TOTAL
- Total stars:  $STARS
- Repos tracked: $REPOS
- Updated at:   $DATE
- Source: Hermes cron job
- Export: agents directory"

echo "📤 Pushing to main..."
git push origin main

echo ""
echo "✅ Done! $TOTAL skills, $STARS total stars, $REPOS repos tracked"
