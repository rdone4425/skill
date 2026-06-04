#!/bin/bash
# run-data-pipeline.sh — 生成中间数据并导出 agents 目录

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

enter_repo_dir

echo ""
echo "📊 Step 1: Fetching latest data..."
python3 scripts/fetch-skills.py

echo ""
echo "🗂️ Step 2: Exporting agent/function data..."
node scripts/export-agent-function-data.js

echo ""
echo "✅ Data pipeline finished."
