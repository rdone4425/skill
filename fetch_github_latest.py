#!/usr/bin/env python3
import json
import time
import urllib.request
import urllib.error
from datetime import datetime, timedelta

# Calculate date 30 days ago
one_month_ago = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
print(f"Searching for projects created after: {one_month_ago}")

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
        if e.code == 403:
            return {"error": "rate_limit"}
        return {}
    except Exception as e:
        print(f"Error: {e} for {url}")
        return {}

# Define broader searches to find more recent projects
searches = {
    "AI Agent Framework": [
        "ai+agent+created:%3E" + one_month_ago,
        "autonomous+agent+created:%3E" + one_month_ago,
        "agent+orchestration+created:%3E" + one_month_ago,
        "multi-agent+system+created:%3E" + one_month_ago,
        "ai+agent+tool+created:%3E" + one_month_ago,
        "chatbot+framework+created:%3E" + one_month_ago,
        "agentic+ai+created:%3E" + one_month_ago,
        "agent+sdk+created:%3E" + one_month_ago,
    ],
    "LLM Tools": [
        "llm+tool+created:%3E" + one_month_ago,
        "llm+framework+created:%3E" + one_month_ago,
        "large+language+model+created:%3E" + one_month_ago,
        "llm+inference+created:%3E" + one_month_ago,
        "llm+rag+created:%3E" + one_month_ago,
        "llm+api+created:%3E" + one_month_ago,
        "prompt+engineering+管理所" + one_month_ago,
        "langchain+created:%3E" + one_month_ago,
    ],
    "Development Tools": [
        "ai+developer+tool+created:%3E" + one_month_ago,
        "ai+coding+tool+created:%3E" + one_month_ago,
        "ai+programming+assistant+created:%3E" + one_month_ago,
        "ai+code+review+created:%3E" + one_month_ago,
        "ai+ide+created:%3E" + one_month_ago,
        "code+generation+ai+created:%3E" + one_month_ago,
    ],
    "Automation Tools": [
        "ai+automation+created:%3E" + one_month_ago,
        "ai+workflow+created:%3E" + one_month_ago,
        "ai+pipeline+created:%3E" + one_month_ago,
        "automation+ai+created:%3E" + one_month_ago,
        "ai+agent+automation+created:%3E" + one_month_ago,
        "ai+bot+created:%3E" + one_month_ago,
        "ai+task+automation+created:%3E" + one_month_ago,
    ]
}

all_items = {}
rate_limited = False

for category, queries in searches.items():
    for query in queries:
        if rate_limited:
            break
        url = f"https://api.github.com/search/repositories?q={query}&sort=stars&order=desc&per_page=100"
        print(f"Fetching: {category} - {query[:60]}...")
        data = api_call(url)
        if data and "error" in data and data["error"] == "rate_limit":
            rate_limited = True
            break
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
        time.sleep(1)

# Convert to list and sort by stars
projects = sorted(all_items.values(), key=lambda x: x["stars"], reverse=True)
print(f"\nTotal unique projects found: {len(projects)}")

# Save results
with open("/tmp/skill_repo/github_new_findings.json", "w", encoding="utf-8") as f:
    json.dump({
        "total_count": len(projects),
        "projects": projects
    }, f, indent=2, ensure_ascii=False)

print("Saved to /tmp/skill_repo/github_new_findings.json")
