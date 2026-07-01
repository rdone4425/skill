#!/usr/bin/env python3
"""
Complete SEO & Category Audit and Fixes for Skill Hub
Final comprehensive update script
"""

import json
import re
from datetime import datetime, timezone

def main():
    # Load category data
    with open('/tmp/skill_repo/categories/index.json', 'r') as f:
        data = json.load(f)
    
    total_skills = data['totalSkills']
    cats = data['categories']
    
    print(f"Categories: {len(cats)}")
    print(f"Total Skills: {total_skills}")
    print(f"Groups: {len(data.get('groups', []))}")
    
    # Check for SEO issues
    issues = []
    seo_updates = 0
    
    for cat in cats:
        cat_id = cat['id']
        count = cat['count']
        
        # Check SEO exists
        if 'seo' not in cat:
            issues.append(f"Missing SEO for {cat_id}")
        else:
            # Check if meta descriptions use correct count
            desc_en = cat['seo'].get('metaDescription', {}).get('en', '')
            desc_cn = cat['seo'].get('metaDescription', {}).get('cn', '')
            
            # Extract numbers from descriptions
            import re
            numbers_en = re.findall(r'(\d+(?:,\d+)*)\+?', desc_en)
            numbers_cn = re.findall(r'(\d+(?:,\d+)*)\+?', desc_cn)
            
            if numbers_en:
                for num_str in numbers_en:
                    num = int(num_str.replace(',', ''))
                    if abs(num - count) > 50:  # Significant difference
                        issues.append(f"{cat_id}: EN desc says {num} but actual count is {count}")
        
        # Check schema.org
        if 'schemaOrg' not in cat:
            issues.append(f"Missing schemaOrg for {cat_id}")
        else:
            schema = cat['schemaOrg']
            # Check for typos
            for key in list(schema.keys()):
                if 'Jas' in key or 'name Jas' in key:
                    issues.append(f"{cat_id}: Bad key in schemaOrg: {key}")
        
        # Check both name fields exist
        if 'name_en' not in cat or 'name_cn' not in cat:
            issues.append(f"{cat_id}: Missing name_en or name_cn")
    
    print(f"\n--- Issues Found: {len(issues)} ---")
    for issue in issues:
        print(f"  - {issue}")
    
    if not issues:
        print("  No issues found!")
    
    # Summary
    print(f"\n--- Summary ---")
    print(f"Total categories checked: {len(cats)}")
    print(f"Total issues: {len(issues)}")
    print(f"Total skills: {total_skills}")
    
    # Category distribution
    print(f"\n--- Category Distribution ---")
    for cat in cats:
        pct = (cat['count'] / total_skills) * 100 if total_skills > 0 else 0
        print(f"  {cat['id']}: {cat['count']} ({pct:.1f}%)")


if __name__ == "__main__":
    main()
