#!/usr/bin/env python3
"""
Precise fix for SEO metadata count mismatches in categories/index.json
Replaces outdated counts with exact numbers from the actual category counts
"""

import json
import re

with open('/tmp/skill_repo/categories/index.json', 'r') as f:
    data = json.load(f)

updates = 0

for cat in data.get('categories', []):
    cat_id = cat['id']
    count = cat['count']
    name_en = cat.get('name_en', cat_id)
    
    # Calculate appropriate display count
    # Use exact count or rounded up to nearest clean number
    if count < 100:
        desc_count = ((count // 10) + 1) * 10
    elif count < 500:
        desc_count = ((count // 50) + 1) * 50
    else:
        desc_count = ((count // 100) + 1) * 100
    
    # Fix EN description
    if 'seo' in cat and 'metaDescription' in cat['seo'] and 'en' in cat['seo']['metaDescription']:
        desc_en = cat['seo']['metaDescription']['en']
        # Find existing count pattern like "1,300+" or "500+" or "90+"
        # Replace only the count number, not context numbers like "JavaScript"
        # Look for: number followed by + and optional word boundary
        
        # Extract approximate current count from description
        match = re.search(r'(\d{1,3}(?:,\d{3})?)\+', desc_en)
        if match:
            current_count_str = match.group(1)
            current_count = int(current_count_str.replace(',', ''))
            
            # Only update if there's significant mismatch
            if abs(current_count - desc_count) > 50 or current_count < count:
                new_desc_en = re.sub(r'(\d{1,3}(?:,\d{3})?)\+', f'{desc_count:,}+', desc_en, count=1)
                if new_desc_en != desc_en:
                    cat['seo']['metaDescription']['en'] = new_desc_en
                    updates += 1
                    print(f"{cat_id}: EN {current_count}+ → {desc_count}+")
    
    # Fix CN description
    if 'seo' in cat and 'metaDescription' in cat['seo'] and 'cn' in cat['seo']['metaDescription']:
        desc_cn = cat['seo']['metaDescription']['cn']
        # Same extraction
        match = re.search(r'(\d{1,3}(?:,\d{3})?)\+', desc_cn)
        if match:
            current_count_str = match.group(1)
            current_count = int(current_count_str.replace(',', ''))
            
            # Only update if significant mismatch
            if abs(current_count - desc_count) > 50 or current_count < count:
                new_desc_cn = re.sub(r'(\d{1,3}(?:,\d{3})?)\+', f'{desc_count:,}+', desc_cn, count=1)
                if new_desc_cn != desc_cn:
                    cat['seo']['metaDescription']['cn'] = new_desc_cn
                    if updates == 0 or cat_id not in ['dev-tools']:
                        print(f"{cat_id}: CN {current_count}+ → {desc_count}+")
    
    # Fix schema.org description in itemListElement
    if 'schemaOrg' in cat:
        schema = cat['schemaOrg']
        item_list = schema.get('itemListElement', [])
        if item_list and len(item_list) > 0:
            item = item_list[0].get('item', {})
            if 'description' in item:
                schema_desc = item['description']
                # Same fix for schema.org
                match = re.search(r'(\d{1,3}(?:,\d{3})?)\+', schema_desc)
                if match:
                    current_count = int(match.group(1).replace(',', ''))
                    if abs(current_count - desc_count) > 50:
                        new_schema_desc = re.sub(r'(\d{1,3}(?:,\d{3})?)\+', f'{desc_count:,}+', schema_desc, count=1)
                        item['description'] = new_schema_desc

# Fix the CN dev-tools specifically - bad number "1,1300+"
for cat in data.get('categories', []):
    if cat['id'] == 'dev-tools':
        cn_desc = cat['seo']['metaDescription']['cn']
        if '1,1300+' in cn_desc or '11,300+' in cn_desc or '1,300+' in cn_desc:
            # Fix to proper format
            cat['seo']['metaDescription']['cn'] = "发现顶级开发工具、代码编辑器、调试器和生产力工具。浏览 1,300+ 个面向 JavaScript、Python、Rust 等的开源开发工具。"
            print(f"Fixed dev-tools CN: corrected malformed number")

with open('/tmp/skill_repo/categories/index.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\nUpdates completed: {updates} categories fixed")
