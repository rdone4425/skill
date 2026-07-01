#!/usr/bin/env python3
"""
Fix SEO metadata counts in categories/index.json to match actual counts numbers
"""

import json
import re

# Load data
with open('/tmp/skill_repo/categories/index.json', 'r') as f:
    data = json.load(f)

updates_made = 0

for cat in data.get('categories', []):
    cat_id = cat['id']
    count = cat['count']
    name_en = cat.get('name_en', cat_id)
    name_cn = cat.get('name_cn', cat_id)
    
    # Fix SEO descriptions - update count references
    if 'seo' in cat:
        seo = cat['seo']
        
        # Extract approximate count for descriptions (rounded up to nearest 10, 50, or 100)
        if count < 100:
            desc_count = ((count // 10) + 1) * 10
        elif count < 500:
            desc_count = ((count // 50) + 1) * 50
        else:
            desc_count = ((count // 100) + 1) * 100
        
        # Update EN description count
        if 'metaDescription' in seo and 'en' in seo['metaDescription']:
            desc_en = seo['metaDescription']['en']
            # Find and replace count numbers like "1,100+", "500+", "760+", etc.
            # Pattern: number followed by + (like 1,100+ or 500+)
            new_desc_en = re.sub(r'(\d{1,3}(?:,\d{3})*)\+', f'{desc_count:,}+', desc_en)
            if new_desc_en != desc_en:
                seo['metaDescription']['en'] = new_desc_en
                updates_made += 1
                print(f"Updated {cat_id} EN desc: {desc_en[:50]}... → {new_desc_en[:50]}...")
        
        # Update CN description count
        if 'metaDescription' in seo and 'cn' in seo['metaDescription']:
            desc_cn = seo['metaDescription']['cn']
            # Find Chinese number patterns like "1100+" or "500+"
            new_desc_cn = re.sub(r'(\d{1,3}(?:american)?)\+', f'{desc_count}+', desc_cn)
            # More carefully for Chinese numbers without comma
            new_desc_cn = re.sub(r'(\d{1,3}(?:,\d{3})*)\+', f'{desc_count:,}+', desc_cn)
            # Handle plain number+ in Chinese text
            import re as re2
            new_desc_cn = re2.sub(r'(\d{1,4})\+', f'{desc_count}+', new_desc_cn)
            if new_desc_cn != desc_cn:
                seo['metaDescription']['cn'] = new_desc_cn
                if cat_id not in ['dev-tools']:  # avoid double counting
                    pass
    
    # Fix schema.org descriptions
    if 'schemaOrg' in cat:
        schema = cat['schemaOrg']
        item_list = schema.get('itemListElement', [])
        if item_list and len(item_list) > 0:
            item = item_list[0].get('item', {})
            if 'description' in item:
                desc = item['description']
                # Update count in schema.org description too
                new_desc = re.sub(r'(\d{1,3}(?:,\d{3})*)\+', f'{((count // 100) + 1) * 100:,}+', desc)
                item['description'] = new_desc

# Save
with open('/tmp/skill_repo/categories/index.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\nTotal updates made: {updates_made}")
print("Save completed.")
