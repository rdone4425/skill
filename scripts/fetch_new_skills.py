#!/usr/bin/env python3
"""Skill Content Agent: Fetch new AI tools from identifying duplicates and batching."""

import urllib.request
import json
import os, sys

REPO_DIR = "/tmp/skill_repo"

def load_existing_names():
    """Load all existing skill names to avoid duplicates."""
    names = set()
    batch_path = os.path.join(REPO_DIR, "new_skills_batch.json")
    with open(batch_path) as f:
        for item in json.load(f):
            names.add(item["name"])

    cats = os.listdir(os.path.join(REPO_DIR, "static-categories"))
    for cat in cats:
        p = os.path.join(REPO_DIR, "static-categories", cat)
        if os.path.isdir(p):
            for fn in os.listdir(p):
                if fn.endswith(".json"):
                    names.add(fn.replace(".json", ""))
    return names


def fetch_repos():
    """Fetch trending AI repos from GitHub API."""
    queries = [
        ("AI+agent+automation+2026", 2026),
        ("MCP+server+tool", 2026),
    ]
    all_items = []
    for kw, year in queries:
        try:
            url = f"https://api.github.com/search/repositories?q={kw}+created:%3E{year}-01-01&sort=stars&order=desc&per_page=15"
            req = urllib.request.Request(url, headers={"User-Agent": "skill-hub"})
            with urllib.request.urlopen(req, timeout=20) as r:
                data = json.loads(r.read().decode())
                all_items.extend(data.get("items", []))
        except Exception as e:
            print(f"Error fetching {kw}: {e}", file=sys.stderr)
            continue
    return all_items


def map_category(repo):
    """Map a repo to a skill-hub category based metadata."""
    topics = " ".join(repo.get("topics", [])).lower()
    desc = (repo.get("description", "") or "").lower()
    if "agent" in topics or "agent" in desc:
        return "agent-framework"
    if "dev" in topics or "code" in desc:
        return "dev-tools"
    if "security" in topics or "scan" in desc:
        return "security"
    if "data" in topics or "analysis" in desc:
        return "data-ai"
    if "design" in topics or "ui" in desc:
        return "design-ui"
    if "autom" in topics or "automation" in desc or "workflow" in topics:
        return "automation-productivity"
    if "video" in topics or "video" in desc:
        return "video-multimedia"
    if "audio" in topics or "audio" in desc or "voice" in desc:
        return "audio"
    return "general"


def main():
    print("Loading existing names...")
    existing_names = load_existing_names()
    print("Existing skills in repo:", len(existing_names))

    print("Fetching from GitHub API...")
    items = fetch_repos()
    dedup = {i["full_name"]: i for i in items}
    print(f"Fetched {len(dedup)} unique repos")

    new_skills = []
    for full_name, repo in dedup.items():
        stars = repo.get("stargazers_count", 0)
        desc = repo.get("description", "") or ""
        if stars > 30 and desc and len(desc) > 10 and repo["name"] not in existing_names:
            new_skills.append({
                "name": repo["name"],
                "description": desc[:200],
                "url": repo["html_url"],
                "category": map_category(repo),
                "platform": "general",
                "stars": stars,
            })

    new_skills.sort(key=lambda x: -x["stars"])
    print(f"New skills: {len(new_skills)}")
    for s in new_skills[:15]:
        print(f"  [{s['stars']}] {s['category']} {s['name']}")

    if new_skills:
        batch_path = os.path.join(REPO_DIR, "new_skills_batch.json")
        with open(batch_path) as f:
            existing = json.load(f)
        for s in new_skills:
            s2 = {k: v for k, v in s.items() if k != "stars"}
            existing.append(s2)
        with open(batch_path, "w") as f:
            json.dump(existing, f, indent=2, ensure_ascii=False)
        print(f"Saved. Total batch size: {len(existing)}")
    else:
        print("No new skills added.")


if __name__ == "__main__":
    main()
