#!/usr/bin/env python3
import json
import time
import urllib.request
import urllib.error

def api_call(url):
    """Make a GitHub API call with rate limit handling."""
    headers = {'User-Agent': 'Mozilla/5.0 (compatible; AI-Scout/1.0)'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            return data
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason} for {url}")
        return {}
    except Exception as e:
        print(f"Error: {e} for {url}")
        return {}

# Define searches for different categories
searches = {
    "AI Agent Framework": [
        "ai+agent+framework+stars:%3E50",
        "autonomous+agent+stars:%3E50",
        "agent+orchestration+stars:%3E50",
        "multi-agent+system+stars:%3E50",
        "ai+agent+tool+stars:%3E50",
    ],
    "LLM Tools": [
        "llm+tool+stars:%3E50",
        "llm+framework+stars:%3E50",
        "large+language+model+tool+stars:%3E50",
        "llm+inference+stars:%3E50",
        "llm+rag+stars:%3E50",
    ],
    "Development Tools": [
        "ai+developer+tool+stars:%3E50",
        "ai+coding+tool+stars:%3E50",
        "ai+programming+assistant+stars:%3E50",
        "ai+code+review+stars:%3E50",
    ],
    "Automation Tools": [
        "ai+automation+stars:%3E50",
        "ai+workflow+stars:%3E50",
        "ai+pipeline+stars:%3E50",
        "ai+robot+automation+stars:%3E50",
        "automation+ai+stars:%3E50",
    ]
}

all_items = {}
for category, queries in searches.items():
    for query in queries:
        url = f"https://api.github.com/search/repositories?q={query}&sort=stars&order=desc&per_page=30"
        print(f"Fetching: {category} - {query}")
        data = api_call(url)
        if data and "items" in data:
            for item in data["items"]:
                repo_id = item["id"]
                if repo_id not in all_items:
                    all_items[repo_id] = {
                        "id": item["id"],
                        "name": item["name"],
                        "full_name": item["full_name"],
                        "html_url": item["html_url"],
                        "description": item.get("description", ""),
                        "stars": item["stargazers_count"],
                        "forks": item["forks_count"],
                        "language": item.get("language", ""),
                        "created_at": item["created_at"],
                        "updated_at": item["updated_at"],
                        "categories": [category],
                        "topics": item.get("topics", []),
                    }
                else:
                    if category not in all_items[repo_id]["categories"]:
                        all_items[repo_id]["categories"].append(category)
        time.sleep(1.5)

# Convert to list and sort by stars
projects = sorted(all_items.values(), key=lambda x: x["stars"], reverse=True)
print(f"Total unique projects found: {len(projects)}")

# Save results
with open("/tmp/skill_repo/github_new_findings.json", "w", encoding="utf-8") as f:
    json.dump({
        "total_count": len(projects),
        "projects": projects
    }, f, indent=2, ensure_ascii=False)

print("Saved to /tmp/skill_repo/github_new_findings.json")
