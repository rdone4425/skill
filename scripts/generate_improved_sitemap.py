#!/usr/bin/env python3
"""
生成改进版 sitemap，包含分类页和技能详情页
"""
import json
import os
from datetime import datetime
from urllib.parse import quote

BASE_URL = "https://skill.442595.xyz"
OUTPUT_FILE = "sitemap.xml"


def generate_sitemap():
    urls = []

    # 首页和统计页
    urls.append({"loc": f"{BASE_URL}/", "priority": "1.0", "changefreq": "daily"})
    urls.append({"loc": f"{BASE_URL}/stats.html", "priority": "0.7", "changefreq": "weekly"})
    urls.append({"loc": f"{BASE_URL}/rss.xml", "priority": "0.3", "changefreq": "daily"})

    # 读取分类索引
    try:
        with open("categories/index.json", "r", encoding="utf-8") as f:
            index = json.load(f)
    except FileNotFoundError:
        print("Error: categories/index.json not found")
        return

    # 分类页
    for cat in index.get("categories", []):
        cat_id = cat.get("id")
        if cat_id:
            urls.append({
                "loc": f"{BASE_URL}/categories/{cat_id}/",
                "priority": "0.8",
                "changefreq": "weekly"
            })

    # 技能详情页 (可选，受 sitemap 大小限制)
    total_skills = 0
    for cat in index.get("categories", []):
        cat_id = cat.get("id")
        if not cat_id:
            continue
        skills_file = f"categories/{cat_id}/skills.json"
        try:
            with open(skills_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                for skill in data.get("skills", [])[:20]:  # 每分类取前20个热门
                    name = skill.get("name", "")
                    if name:
                        urls.append({
                            "loc": f"{BASE_URL}/skill/{quote(name)}/",
                            "priority": "0.6",
                            "changefreq": "weekly"
                        })
                        total_skills += 1
        except FileNotFoundError:
            continue

    # 生成 XML
    now = datetime.now().strftime("%Y-%m-%d")
    xml_lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    for url in urls:
        xml_lines.append(f'  <url>')
        xml_lines.append(f'    <loc>{url["loc"]}</loc>')
        xml_lines.append(f'    <lastmod>{now}</lastmod>')
        xml_lines.append(f'    <changefreq>{url["changefreq"]}</changefreq>')
        xml_lines.append(f'    <priority>{url["priority"]}</priority>')
        xml_lines.append(f'  </url>')

    xml_lines.append('</urlset>')

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(xml_lines))

    print(f"Generated sitemap with {len(urls)} URLs (including {total_skills} skill pages)")


if __name__ == "__main__":
    generate_sitemap()
