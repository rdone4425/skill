#!/usr/bin/env python3
import json, os, re

# Count actual skills in each HTML page
counts = {}
for cat_dir in sorted(os.listdir('categories')):
    html_path = os.path.join('categories', cat_dir, 'index.html')
    if os.path.exists(html_path):
        with open(html_path) as f:
            content = f.read()
        cards = 0
        for pattern in [r'class=\"skill-card\"', r'class=\"card\b', r'class=\".*card.*\"']:
            matches = re.findall(pattern, content)
            if len(matches) > cards:
                cards = len(matches)
        gh = len(re.findall(r'href=\"https://github.com/[^\"]+', content))
        counts[cat_dir] = max(cards, gh)

with open('categories/index.json') as f:
    idx = json.load(f)

total = 0
for cat in idx['categories']:
    cat_id = cat['id']
    if cat_id in counts:
        cat['count'] = counts[cat_id]
        total += counts[cat_id]
    else:
        total += cat['count']

idx['totalSkills'] = total
idx['generatedAt'] = '2026-07-01T03:30:00Z'

with open('categories/index.json', 'w') as f:
    json.dump(idx, f, indent=2, ensure_ascii=False)

print('Updated totalSkills:', total)
print('Categories updated:', len(idx['categories']))
