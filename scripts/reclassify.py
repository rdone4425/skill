#!/usr/bin/env python3
"""Reclassify skills to create new hot categories from existing data."""
import json, os
from collections import defaultdict

BASE = '/tmp/skill_repo'
CATEGORIES_DIR = os.path.join(BASE, 'categories')

# Classification rules: {new_category_id: {from_category: [subCategoryIds to match]}}
RULES = {
    'agent-framework': {
        'dev-tools': ['agent', 'agents', 'framework'],
    },
    'video-gen': {
        'video-multimedia': ['video'],
    },
    'audio-speech': {
        'video-multimedia': ['audio'],
    },
}

# 1. Extract skills per rule
new_skills = defaultdict(list)
for new_cat, sources in RULES.items():
    for src_cat, sub_ids in sources.items():
        sp = os.path.join(CATEGORIES_DIR, src_cat, 'skills.json')
        if not os.path.exists(sp):
            continue
        with open(sp) as f:
            data = json.load(f)
        for s in data['skills']:
            if s.get('subCategoryId') in sub_ids:
                s2 = dict(s)
                s2['functionCategory'] = new_cat
                s2['categoryPath'] = new_cat
                s2['subCategoryId'] = 'general'
                new_skills[new_cat].append(s2)

# 2. Create new category dirs and skills.json files
for new_cat, skills in new_skills.items():
    cat_dir = os.path.join(CATEGORIES_DIR, new_cat)
    os.makedirs(cat_dir, exist_ok=True)
    
    entry = {
        "meta": {
            "functionCategory": new_cat,
            "topCategoryId": new_cat,
            "subCategoryId": "general",
            "categoryPath": new_cat,
            "count": len(skills),
            "sourceData": "categories"
        },
        "skills": skills
    }
    with open(os.path.join(cat_dir, 'skills.json'), 'w') as f:
        json.dump(entry, f, ensure_ascii=False, indent=2)
    print(f"Created {new_cat}: {len(skills)} skills")

# 3. Update index.json
with open(os.path.join(CATEGORIES_DIR, 'index.json')) as f:
    index = json.load(f)

existing_ids = {c['id'] for c in index['categories']}
for new_cat, skills in new_skills.items():
    if new_cat in existing_ids:
        print(f"SKIP {new_cat} — already in index.json")
        continue
    index['categories'].append({
        "id": new_cat,
        "path": new_cat,
        "groupId": new_cat,
        "subcategoryId": "general",
        "count": len(skills)
    })
    index['totalSkills'] += len(skills)
    print(f"Added {new_cat} to index.json ({len(skills)} skills)")

with open(os.path.join(CATEGORIES_DIR, 'index.json'), 'w') as f:
    json.dump(index, f, ensure_ascii=False, indent=2)

print(f"\nTotal categories: {len(index['categories'])}")
print(f"Total skills: {index['totalSkills']}")