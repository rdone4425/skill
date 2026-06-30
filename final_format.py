#!/usr/bin/env python3
import json
from datetime import datetime
from collections import Counter

with open('/tmp/skill_repo/github_new_findings.json', 'r') as f:
    data = json.load(f)

all_projects = data['projects']

# Sort by stars descending
all_projects.sort(key=lambda x: x['stars'], reverse=True)

# Select at least 50 high quality projects
# Priority: >100 stars first, then >50 stars
selected = []

# We need to ensure coverage across  categories
category_counts = Counter()
for p in all_projects:
    cats = p['categories']
    selected.append(p)
    
# Actually let's just take the top 70 to ensure variety and >50 count
top_70 = all_projects[:70]

# Also include some medium quality (50-100 stars) if not already included
medium_quality = [p for p in all_projects if 50 <= p['stars'] < 100][:30]
low_quality = [p for p in all_projects if 10 <= p['stars'] < 50][:20]

# Combine: top projects + some medium + some low for variety
final_selection = []
seen_ids = set()
for p in all_projects[:50]:  # Top 50
    final_selection.append(p)
    seen_ids.add(p['id'])

# Add more to reach exactly/at least 50 (already done above)
# Let's create a nice balanced set of 50+

final_projects = []
for p in all_projects:
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
    
    if len(final_projects) >= 55:
        break

result = {
    "search_date": datetime.now().strftime("%Y-%m-%d"),
    "search_period": "2026-06-01 to 2026-06-30",
    "total_found": len(all_projects),
    "total_selected": len(final_projects),
    "projects": final_projects
}

with open('/tmp/skill_repo/github_new_findings.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f"Saved {len(final_projects)} projects to /tmp/skill_repo/github_new_findings.json")

# Verify output
print("\nyo output verification:")
print(f"Total projects: {len(final_projects)}")

stars_ranges = {
    ">1000": 0,
    "100-999": 0,
    "50-99": 0,
    "10-49": 0,
    "<10": 0
}
for p in final_projects:
    s = p['stars']
    if s >= 1000: stars_ranges[">1000"] += 1
    elif s >= 100: stars_ranges["100-999"] += 1
    elif s >= 50: stars_ranges["50-99"] += 1
    elif s >= 10: stars_ranges["10-49"] += 1
    else: stars_ranges["<10"] += 1

print(f"Stars distribution: {stars_ranges}")

cats = Counter()
for p in final_projects:
    for c in p['categories']:
        cats[c] += 1
print(f"Category coverage: {dict(cats)}")

print(f"\nTop 10 projects:")
for i, p in enumerate(final_projects[:10], 1):
    print(f"{i}. {p['name']} - ⭐{p['stars']} - {p['description'][:70]}...")
