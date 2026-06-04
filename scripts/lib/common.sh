#!/bin/bash
# 通用 shell 辅助函数

set -euo pipefail

resolve_repo_dir() {
  if [ -n "${REPO_DIR:-}" ]; then
    echo "$REPO_DIR"
    return
  fi

  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  echo "$(cd "$script_dir/../.." && pwd)"
}

enter_repo_dir() {
  local repo_dir
  repo_dir="$(resolve_repo_dir)"
  cd "$repo_dir"
}

ensure_github_token() {
  if [ -z "${GITHUB_TOKEN:-}" ] && [ -z "${GH_TOKEN:-}" ] && command -v gh >/dev/null 2>&1; then
    export GH_TOKEN
    GH_TOKEN="$(gh auth token 2>/dev/null || echo "")"
  fi

  if [ -z "${GH_TOKEN:-}" ] && [ -z "${GITHUB_TOKEN:-}" ]; then
    echo "❌ No GitHub token available."
    exit 1
  fi
}

pull_latest_main() {
  echo "📥 Pulling latest..."
  git pull --rebase origin main 2>/dev/null || true
}

configure_git_identity() {
  local name="${1:-rdone4425}"
  local email="${2:-rdone4425@gmail.com}"
  git config user.name "$name"
  git config user.email "$email"
}
