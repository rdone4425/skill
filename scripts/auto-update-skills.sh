#!/bin/bash
# auto-update-skills.sh — 自动发现新 skill 仓库并更新 data.js
# 由 Hermes 定时任务或 CI 调用

set -e

REPO_DIR="/root/skill"
cd "$REPO_DIR"

echo "🚀 Skill Hub — auto-update @ $(date -u +%Y-%m-%d_%H:%M:%S_UTC)"

# 检查是否有 GitHub token
if [ -z "$GITHUB_TOKEN" ] && [ -z "$GH_TOKEN" ]; then
    export GH_TOKEN=*** auth token 2>/dev/null || echo "")
fi

if [ -z "$GH_TOKEN" ] && [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ No GitHub token available. Run 'gh auth login' first."
    exit 1
fi

# 拉取最新代码
echo "📥 Pulling latest..."
git pull --rebase origin main 2>/dev/null || true

# 1. 发现新仓库（写入 config/repos.json）
echo ""
echo "🔍 Step 1: Discovering new skill repos..."
python3 scripts/discover-skills.py 2>&1 || echo "⚠️  Discover had issues"

# 2. 从 config/repos.json 读取配置，更新 data.js
echo ""
echo "📊 Step 2: Fetching latest data..."
python3 scripts/fetch-skills.py 2>&1 || echo "⚠️  Fetch had issues"

# 3. 检查变更
echo ""
CHANGED=false
git diff --quiet js/data.js config/repos.json scripts/ || CHANGED=true

if [ "$CHANGED" = "false" ]; then
    echo "✅ No changes detected. Data is up to date."
    exit 0
fi

# 4. 提交并推送
echo "📝 Step 3: Committing changes..."
git config user.email "rdone4425@gmail.com"
git config user.name "rdone4425"
git add js/data.js config/repos.json scripts/

TOTAL=$(grep -c '"name":' js/data.js || echo "?")
STARS=$(grep -oE '"stars": [0-9]+' js/data.js | awk '{s+=$2} END {print s}')
REPOS=$(python3 -c "import json; print(len(json.load(open('config/repos.json')).get('repos', {})))" 2>/dev/null || echo "?")
DATE=$(date -u +"%Y-%m-%d %H:%M UTC")

git commit -m "chore: auto-update Skill Hub data

- Total skills: $TOTAL
- Total stars:  $STARS
- Repos tracked: $REPOS
- Updated at:   $DATE
- Source: Hermes cron job"

echo "📤 Pushing to main..."
git push origin main

echo ""
echo "✅ Done! $TOTAL skills, $STARS total stars, $REPOS repos tracked"
