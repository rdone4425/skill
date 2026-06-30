#!/usr/bin/env python3
import json
import urllib.request
from datetime import datetime
from collections import Counter
import time

# We need to get all raw data again and format properly

# First query: AI Agent Framework + LLM Tools
# Second query: Development Tools + Automation Tools
all_items = {}

def api_call(url):
    headers = {'User-Agent': 'Mozilla/5.0 (compatible; AI-Scout/1.0)'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        return {"error": str(e)}

# Define broader searches to find more recent projects
searches = {
    "AI Agent Framework": [
        "ai+agent+created:%3E2026-05-31",
        "autonomous+agent+created:%3E2026-05-31",
        "agent+orchestration+created:%3E2026-05-31",
        "multi-agent+system+created:%3E2026-05-31",
        "ai+agent+tool+created:%3E2026-05-31",
        "chatbot+framework+created:%3E2026-05-31",
        "agentic+ai+created:%3E2026-05-31",
        "agent+sdk+created:%3E2026-05-31",
    ],
    "LLM Tools": [
        "llm+tool+created:%3E2026-05-31",
        "llm+framework+created:%3E2026-05-31",
        "large+language+model+created:%3E2026-05-31",
        "llm+inference+created:%3E2026-05-31",
        "llm+rag+created:%3E2026-05-31",
        "llm+api+created:%3E2026-05-31",
        "langchain+created:%3E2026-05-31",
    ],
    "Development Tools": [
        "ai+developer+tool+created:%3E2026-05-31",
        "ai+coding+tool+created:%3E2026-05-31",
        "ai+programming+assistant+created:%3E2026-05-31",
        "ai+code+review+created:%3E2026-05-31",
        "ai+ide+created:%3E2026-05-31",
        "code+generation+ai+created:%3E2026-05-31",
    ],
    "Automation Tools": [
        "ai+automation+created:%3E2026-05-31",
        "ai+workflow+created:%3E2026-05-31",
        "ai+pipeline+created:%3E2026-05-31",
        "automation+ai+created:%3E2026-05-31",
        "ai+agent+automation+created:%3E2026-05-31",
        "ai+bot+created:%3E2026-05-31",
        "ai+task+automation+created:%3E2026-05-31",
    ]
}

for category, queries in searches.items():
    for query in queries:
        url = f"https://api.github.com/search/repositories?q={query}&sort=stars&order=desc&per_page=100"
        data = api_call(url)
        if "items" in data:
            for item in data["items"]:
                repo_id = item["id"]
                if repo_id not in all_items:
                    all_items[repo_id] = {
                        "id": item["id"], "name": item["name"], "full_name": item["full_name"],
                        "html_url": item["html_url"], "description": item.get("description", ""),
                        "stars": item["stargazers_count"], "forks": item["forks_count"],
                        "language": item.get("language", ""), "created_at": item["created_at"],
                        "updated_at": item["updated_at"], "categories": [category],
                        "topics": item.get("topics", []),
                    }
                else:
                    if category not in all_items[repo_id]["categories"]:
                        all_items[repo_id]["categories"].append(category)
        time.sleep(1.5)

print(f"Total unique: {len(all_items)}")

# Sort by stars
all_projects = sorted(all_items.values(), key=lambda x: x['stars'], reverse=True)

# Select at least 50 projects, prioritizing stars > 100
final_projects = []
for p in all_projects:
    if len(final_projects) < 55:  # Take top 55
        tags = list(set(p['categories'] + p.get('topics', [])))
        final_projects.append({
            "name": p['name'],
            "github_url": p['html_url'],
            "stars": p['stars'],
            "forks": p['forks'],
            "description": p.get('description') or "",
            "language": p.get('language') or "",
            "created_at": p['created_at'],
            "updated_at": p['updated_at'],
            "categories": p['categories'],
            "tags": tags[:10]
        })

result = {
    "search_date": datetime.now().strftime("%Y-%m-%d"),
    "search_period": "2026-06-01 to 2026-06-30",
    "total_found": len(all_projects),
    "total_selected": len(final_projects),
    "projects": final_projects
}

with open('/tmp/skill_repo/github_new_findings.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f"\nSaved {len(final_projects)} projects to /tmp/skill_repo/github_new_findings.json")

# Verify
cats = Counter()
for p in final_projects:
    for c in p['categories']:
        cats[c] += 1
print(f"Categories: {dict(cats)}")

print(f"\nTop 10:")
for i, p in enumerate(final_projects[:10], 1):
    print(f"{i}. {p['name']} - ⭐{p['stars']} - {p['description'][:70]}...")
