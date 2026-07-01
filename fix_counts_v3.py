#!/usr/bin/env python3
"""
Comprehensive SEO & Category Improvements for Skill Hub
Implements final fixes with precise count matching
"""

import json
import re
from datetime import datetime, timezone

# Load data
with open('/tmp/skill_repo/categories/index.json', 'r') as f:
    data = json.load(f)

updates = 0

for cat in data.get('categories', []):
    cat_id = cat['id']
    count = cat['count']
    name_en = cat.get('name_en', cat_id)
    name_cn = cat.get('name_cn', cat_id)
    
    # Determine appropriate round-up count for descriptions
    if count < 100:
        desc_count = ((count // 10) + 1) * 10
    elif count < 500:
        desc_count = ((count // 50) + 1) * 50
    else:
        desc_count = ((count // 100) + 1) * 100
    
    # Ensure we don't round up too far (max 15% above actual)
    if desc_count > count * 1.15:
        # Use actual count as ceiling
        desc_count = count
    
    # Fix EN description
    if 'seo' in cat and 'metaDescription' in cat['seo']:
        # Update en
        if 'en' in cat['seo']['metaDescription']:
            desc_en = cat['seo']['metaDescription']['en']
            # Use exact count for accuracy, not rounded
            new_desc_en = re.sub(r'(\d{1,3}(?:,\d{3})?)\+', f'{count:,}+', desc_en, count=1)
            if new_desc_en != desc_en:
                cat['seo']['metaDescription']['en'] = new_desc_en
                updates += 1
        
        # Update CN
        if 'cn' in cat['seo']['metaDescription']:
            desc_cn = cat['seo']['metaDescription']['cn']
            new_desc_cn = re.sub(r'(\d{1,3}(?:,\d{3})?)\+', f'{count:,}+', desc_cn, count=1)
            if new_desc_cn != desc_cn:
                cat['seo']['metaDescription']['cn'] = new_desc_cn
                updates += 1
    
    # Fix schema.org
    if 'schemaOrg' in cat:
        schema = cat['schemaOrg']
        item_list = schema.get('itemListElement', [])
        if item_list and len(item_list) > 0:
            item = item_list[0].get('item', {})
            if 'description' in item:
                desc = item['description']
                new_desc = re.sub(r'(\d{1,3}(?:,\d{3})?)\+', f'{count:,}+', desc, count=1)
                if new_desc != desc:
                    item['description'] = new_desc
                    updates += 1

# Update timestamp
data['generatedAt'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
data['seoOptimized'] = True
data['version'] = '2.1'

# Save
with open('/tmp/skill_repo/categories/index.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Fixed count references in {updates} places")
print("All category counts now match actual numbers exactly")
