#!/usr/bin/env python3
import json
from datetime import datetime

with open('/tmp/skill_repo/github_new_findings.json', 'r') as f:
    data = json.load(f)

# Filter and format projects
all_projects = data['projects']

# Sort by stars descending
all_projects.sort(key=lambda x: x['stars'], reverse=True)

# We want at least 50 projects, prioritize stars > 100, then > 50
high_quality = [p for p in all_projects if p['stars'] > 100]
medium_quality = [p for p in all_projects if 50 < p['stars'] <= 100]
low_quality = [p for p in all_projects if 10 < p['stars'] <= 50]

print(f"Stars > 100: {len(high_quality)}")
print(f"Stars 51-100: {len(medium_quality)}")
print(f"Stars 11-50: {len(low_quality)}")

# Select top projects ensuring we have at least 50
selected = high_quality + medium_quality + low_quality
selected = selected[:100]  # Take top 100 to ensure variety

print(f"Selected total: {len(selected)}")

# Format final output
formatted_projects = []
for p in selected:
    tags = p['categories'] + p['topics']
    # Deduplicate and limit tags
    seen = set()
    unique_tags = []
    for t in tags:
        if t.lower() not in seen:
            seen.add(t.lower())
            unique_tags.append(t)
    
    formatted_projects.append({
        "name": p['name'],
        "github_url": p['html_url'],
        "stars": p['stars'],
        "forks": p['forks'],
        "description": p['description'] or "",
        "language": p['language'] or "",
        "created_at": p['created_at'],
        "updated_at": p['updated_at'],
        "categories": p['categories'],
        "tags": unique_tags[:10]  # Limit to 10 tags
    })

result = {
    "search_date": datetime.now().strftime("%Y-%m-%d"),
    "search_period": "2026-06-01 to 2026-06-30",
    "total_found": len(all_projects),
    "high_quality_count": len(high_quality),
    "medium_quality_count": len(medium_quality),
    "total_selected": len(formatted_projects),
    "projects": formatted_projects
}

with open('/tmp/skill_repo/github_new_findings.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f"\nSaved {len(formatted_projects)} projects to /tmp/skill_repo/github_new_findings.json")
print(f"Top 10 projects by stars:")
for i, p in enumerate(formatted_projects[:10], 1):
    print(f"  {i}. {p['name']} - ⭐ {p['stars']} - {p['description'][:80] if p['description'] else 'No description'}...")
