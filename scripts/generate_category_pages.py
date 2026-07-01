#!/usr/bin/env python3
"""
Generate static HTML category pages for SEO.
Each category gets its own /categories/{id}/index.html with
unique meta, JSON-LD structured data, and top skills listing.

Usage:
    python3 scripts/generate_category_pages.py
"""
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

SITE_URL = "https://skill.442595.xyz"
REPO_URL = "https://github.com/rdone4425/skill"
OUT_DIR = Path("categories")
STATIC_OUT = Path("static-categories")
TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")

CATEGORY_ZH = {
    "dev-tools": "开发工具",
    "general": "通用工具",
    "data-ai": "数据AI",
    "design-ui": "设计UI",
    "docs-content": "文档内容",
    "automation-productivity": "自动化效率",
    "security": "安全测试",
    "finance-crypto": "金融加密",
    "devops-deploy": "DevOps部署",
    "backend-api": "后端API",
    "game-dev": "游戏开发",
    "testing-qa": "测试QA",
    "education": "教育学习",
    "social-media": "社交媒体",
    "health-medical": "健康医疗",
    "video-multimedia": "视频多媒体",
    "3d": "3D图形",
    "ecommerce": "电商",
    "audio": "音频",
    "agent-framework": "Agent框架",
    "video-gen": "视频生成",
    "audio-speech": "音频语音",
}

CATEGORY_EN = {
    "dev-tools": "Dev Tools",
    "general": "General Tools",
    "data-ai": "Data & AI",
    "design-ui": "Design & UI",
    "docs-content": "Docs & Content",
    "automation-productivity": "Automation",
    "security": "Security",
    "finance-crypto": "Finance & Crypto",
    "devops-deploy": "DevOps",
    "backend-api": "Backend & API",
    "game-dev": "Game Dev",
    "testing-qa": "Testing & QA",
    "education": "Education",
    "social-media": "Social Media",
    "health-medical": "Health & Medical",
    "video-multimedia": "Video & Multimedia",
    "3d": "3D Graphics",
    "ecommerce": "E-commerce",
    "audio": "Audio",
    "agent-framework": "Agent Framework",
    "video-gen": "Video Generation",
    "audio-speech": "Audio & Speech",
}

CATEGORY_DESC = {
    "dev-tools": "开发工具 Skills：编码、IDE、插件、平台工具。收录 Claude Code、Codex、Cursor、OpenCode、Hermes Agent 等平台的开发辅助工具。",
    "general": "通用工具 Skills：涵盖日常开发各类辅助工具，包括命令行工具、实用脚本、跨平台工具等。",
    "data-ai": "数据AI Skills：数据分析、机器学习、LLM推理、RAG检索、多模态模型等AI相关技能。",
    "design-ui": "设计UI Skills：UI设计、Figma集成、演示文稿、可视化图表、视觉设计工具。",
    "docs-content": "文档内容 Skills：文档写作、内容创作、技术文档、Awesome列表、参考资料。",
    "automation-productivity": "自动化效率 Skills：工作流自动化、生产力工具、发布工具、运营自动化、办公自动化。",
    "security": "安全测试 Skills：安全审计、漏洞检测、防御工具、渗透测试、安全合规。",
    "finance-crypto": "金融加密 Skills：加密货币、DeFi、量化交易、金融分析、区块链开发。",
    "devops-deploy": "DevOps部署 Skills：持续集成、基础设施即代码、容器化、CI/CD管道、云原生部署。",
    "backend-api": "后端API Skills：REST/GraphQL API设计、数据库集成、后端服务开发。",
    "game-dev": "游戏开发 Skills：游戏引擎、Unity/Unreal集成、2D/3D游戏开发工具。",
    "testing-qa": "测试QA Skills：自动化测试、浏览器测试、代码审查、质量保障工具。",
    "education": "教育学习 Skills：在线教育、学习工具、课程制作、教育技术。",
    "social-media": "社交媒体 Skills：社交媒体管理、内容发布、社区运营、影响力分析。",
    "health-medical": "健康医疗 Skills：健康追踪、医疗数据、远程医疗、健康分析。",
    "video-multimedia": "视频多媒体 Skills：视频处理、多媒体编辑、内容创作工具。",
    "3d": "3D图形 Skills：3D建模、渲染、Three.js、WebGL等3D图形工具。",
    "ecommerce": "电商 Skills：电商平台集成、订单管理、商品推荐、价格监控。",
    "audio": "音频 Skills：音频处理、语音合成、音乐生成、播客制作工具。",
    "agent-framework": "Agent框架 Skills：AI Agent开发框架、Agent Protocol、Multi-Agent系统。",
    "video-gen": "视频生成 Skills：AI视频生成、Sora、Kling、PixVerse等视频AI工具。",
    "audio-speech": "音频语音 Skills：语音识别、语音合成、TTS/STT技术。",
}

# English descriptions for international SEO and readers
CATEGORY_DESC_EN = {
    "dev-tools": "Dev Tools Skills: coding, IDE, plugins, and platform tools for Claude Code, Codex, Cursor, OpenCode, Hermes Agent. Covers developer productivity, code generation, testing, and tooling.",
    "general": "General Tools Skills: everyday development utilities, CLI tools, scripts, and cross-platform helpers.",
    "data-ai": "Data & AI Skills: data analysis, machine learning, LLM inference, RAG retrieval, multimodal models, and AI-related tools.",
    "design-ui": "Design & UI Skills: UI design, Figma integration, presentations, data visualization, and visual design tools.",
    "docs-content": "Docs & Content Skills: documentation, content creation, technical writing, Awesome lists, and reference materials.",
    "automation-productivity": "Automation Skills: workflow automation, productivity tools, release tooling, ops automation, and office automation.",
    "security": "Security Skills: security auditing, vulnerability detection, defense tools, penetration testing, and compliance.",
    "finance-crypto": "Finance & Crypto Skills: cryptocurrencies, DeFi, quantitative trading, financial analysis, and blockchain development.",
    "devops-deploy": "DevOps Skills: CI/CD, infrastructure as code, containerization, cloud-native deployments.",
    "backend-api": "Backend & API Skills: REST/GraphQL API design, database integration, and backend services.",
    "game-dev": "Game Dev Skills: game engines, Unity/Unreal integration, 2D/3D game development tools.",
    "testing-qa": "Testing & QA Skills: automated testing, browser testing, code review, and quality assurance tools.",
    "education": "Education Skills: online education, learning tools, course creation, and EdTech.",
    "social-media": "Social Media Skills: social media management, content publishing, community operations, and analytics.",
    "health-medical": "Health & Medical Skills: health tracking, medical data, telemedicine, and health analytics.",
    "video-multimedia": "Video & Multimedia Skills: video processing, multimedia editing, and content creation tools.",
    "3d": "3D Graphics Skills: 3D modeling, rendering, Three.js, WebGL, and graphics tools.",
    "ecommerce": "E-commerce Skills: e-commerce platform integrations, order management, recommendations, and price monitoring.",
    "audio": "Audio Skills: audio processing, speech synthesis, music generation, and podcast production tools.",
    "agent-framework": "Agent Framework Skills: AI agent development frameworks, Agent Protocol, and multi-agent systems.",
    "video-gen": "Video Generation Skills: AI video generation tools like Sora, Kling, PixVerse, and more.",
    "audio-speech": "Audio & Speech Skills: speech recognition, text-to-speech, and voice AI technologies.",
}

def escape_xml(s):
    if s is None:
        return ""
    return (str(s)
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&apos;"))

def escape_html(s):
    if s is None:
        return ""
    s = str(s)
    s = s.replace("&", "&amp;")
    s = s.replace("<", "&lt;")
    s = s.replace(">", "&gt;")
    s = s.replace('"', "&quot;")
    return s

def truncate(text, maxlen=200):
    if not text:
        return ""
    t = text.strip()
    if len(t) > maxlen:
        return t[:maxlen].rsplit(" ", 1)[0] + "…"
    return t

def format_stars(n):
    if n >= 1000:
        return f"{n/1000:.1f}k"
    return str(n)

AGENT_ICON = {
    "codex": ("C", "#6366f1"),
    "claude": ("A", "#fb923c"),
    "hermes": ("H", "#06b6d4"),
    "opencode": ("O", "#22c55e"),
    "openclaw": ("🦞", "#f97316"),
    "cursor": ("C", "#10b981"),
    "copilot": ("G", "#0ea5e9"),
    "gemini": ("G", "#8b5cf6"),
    "general": ("⚙", "#6b7280"),
}
AGENT_ZH = {
    "codex": "Codex", "claude": "Claude Code", "hermes": "Hermes Agent",
    "opencode": "OpenCode", "openclaw": "OpenClaw", "cursor": "Cursor",
    "copilot": "GitHub Copilot", "gemini": "Gemini", "general": "通用",
}
AGENT_ICON_URL = {
    "codex": "https://www.google.com/s2/favicons?domain=openai.com&sz=64",
    "claude": "https://www.google.com/s2/favicons?domain=anthropic.com&sz=64",
    "hermes": "https://www.google.com/s2/favicons?domain=nousresearch.com&sz=64",
    "opencode": "https://www.google.com/s2/favicons?domain=opencode.ai&sz=64",
    "cursor": "https://www.google.com/s2/favicons?domain=cursor.com&sz=64",
    "copilot": "https://www.google.com/s2/favicons?domain=github.com&sz=64",
    "gemini": "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64",
}

def get_agent_icon(agent_id):
    if agent_id in AGENT_ICON_URL:
        return AGENT_ICON.get(agent_id, ("?", "#6b7280"))
    return AGENT_ICON.get(agent_id, AGENT_ICON.get("general", ("⚙", "#6b7280")))

def load_categories():
    with open("categories/index.json", encoding="utf-8") as f:
        return json.load(f)

def load_skills(cat_id):
    path = f"categories/{cat_id}/skills.json"
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    return data.get("skills", [])

def make_card(skill):
    name = escape_html(skill.get("name", ""))
    repo = skill.get("repo", "")
    url = skill.get("url", f"https://github.com/{repo}") if repo else "#"
    stars = skill.get("stars", 0)
    desc = truncate(skill.get("desc", ""), 150)
    supported_agents = skill.get("supportedAgents", [])
    category_path = skill.get("categoryPath", "")
    install = skill.get("install", "")
    stars_str = format_stars(stars)
    stars_html = f'<span class="card-stars" title="{int(stars):,}">★ {stars_str}</span>' if stars else ""

    repo_parts = repo.split("/") if repo else []
    owner = repo_parts[0] if repo_parts else ""
    avatar_url = f"https://github.com/{owner}.png?size=96" if owner else ""

    # Primary agent icon
    primary_agent = supported_agents[0] if supported_agents else "general"
    icon_char, _ = get_agent_icon(primary_agent)
    icon_html = (f'<img class="card-avatar" src="{avatar_url}" alt="{escape_html(owner)}" loading="lazy" referrerpolicy="no-referrer">'
                 if avatar_url else f'<span class="card-emoji">{icon_char}</span>')

    # Agent chips
    agent_chips = ""
    if supported_agents:
        chips = []
        for a in supported_agents[:3]:
            char, color = get_agent_icon(a)
            zh = AGENT_ZH.get(a, a)
            chips.append(f'<span class="agent-chip" style="--chip-color:{color}"><span class="agent-chip-icon">{char}</span>{escape_html(zh)}</span>')
        agent_chips = '<div class="agent-chip-list">' + "".join(chips) + "</div>"

    # Install code
    install_html = ""
    if install:
        esc_install = escape_html(install)
        install_html = f'<div class="card-install" title="{esc_install}"><code>$ {esc_install}</code></div>'

    card = f"""<article class="card" data-category="{escape_html(category_path)}">
  <div class="card-head">
    <div class="card-icon">
      {icon_html}
    </div>
    <div class="card-title-wrap">
      <div class="card-name"><a href="{escape_html(url)}" target="_blank" rel="noopener">{name}</a></div>
      <div class="card-repo">
        <a href="https://github.com/{escape_html(repo)}" target="_blank" rel="noopener">{escape_html(repo)}</a>
        {stars_html}
      </div>
    </div>
  </div>
  <p class="card-desc">{escape_html(desc)}</p>
  {agent_chips}
  {install_html}
</article>"""
    return card

def make_jsonld(category_id, skills, count):
    name_zh = CATEGORY_ZH.get(category_id, category_id)
    desc = CATEGORY_DESC.get(category_id, f"{name_zh} Skills 导航页")
    skill_list = []
    for i, s in enumerate(skills[:50], 1):
        skill_list.append({
            "@type": "ListItem",
            "position": i,
            "url": s.get("url") or f"https://github.com/{s.get('repo','')}"
        })
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": f"Skill Hub {name_zh} Skills - AI Agent技能导航",
        "description": desc,
        "url": f"{SITE_URL}/categories/{category_id}/",
        "about": {"@type": "Thing", "name": name_zh},
        "mainEntity": {
            "@type": "ItemList",
            "name": f"{name_zh}分类下的AI Agent Skills",
            "numberOfItems": count,
            "itemListElement": skill_list
        },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Skill Hub", "item": f"{SITE_URL}/"},
                {"@type": "ListItem", "position": 2, "name": name_zh, "item": f"{SITE_URL}/categories/{category_id}/"}
            ]
        }
    }

def make_html(category_id, skills, total_count):
    name_zh = CATEGORY_ZH.get(category_id, category_id)
    name_en = CATEGORY_EN.get(category_id, category_id.replace("-", " ").title())
    desc_zh = CATEGORY_DESC.get(category_id, f"{name_zh}分类收录 {total_count} 个AI Agent Skills，支持Claude Code、Codex、Cursor、OpenCode、Hermes Agent平台。")
    desc_en = CATEGORY_DESC_EN.get(category_id, f"Browse {total_count} {name_en} AI Agent Skills. Filter by Claude Code, Codex, Cursor, OpenCode, Hermes Agent compatibility.")
    title_zh = f"Skill Hub {name_zh} Skills ({total_count}个) | AI Agent技能分类导航"
    title_en = f"Skill Hub {name_en} Skills ({total_count}) | AI Agent Skills Directory"
    canonical = f"{SITE_URL}/categories/{category_id}/"
    og_image = f"{SITE_URL}/og-image.png"
    category_url = f"{SITE_URL}/categories/{category_id}/"

    jsonld = make_jsonld(category_id, skills, total_count)
    jsonld_str = json.dumps(jsonld, ensure_ascii=False, indent=2)

    # Top 60 skills sorted by stars
    top_skills = sorted(skills, key=lambda x: x.get("stars", 0), reverse=True)[:60]
    cards_html = "\n".join(make_card(s) for s in top_skills)

    other_count = total_count - len(top_skills)
    show_more_note = f'<p class="category-show-more">还有 {other_count} 个技能，<a href="{SITE_URL}/?category={category_id}">在主站搜索查看全部 →</a></p>' if other_count > 0 else ""

    html = f"""<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{escape_html(title_zh)}</title>
      <meta name="description" content="{escape_html(desc_en)}">
      <meta name="keywords" content="{name_en} Skills, {name_zh} Skills, AI Agent, Claude Code, Codex, Cursor, OpenCode, Hermes Agent">
      <meta name="robots" content="index, follow">
      <meta name="author" content="rdone4425">

      <meta property="og:type" content="website">
      <meta property="og:title" content="{escape_html(title_en)}">
      <meta property="og:description" content="{escape_html(desc_en)}">
      <meta property="og:url" content="{canonical}">
      <meta property="og:image" content="{og_image}">
      <meta property="og:site_name" content="Skill Hub">

      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="{escape_html(title_en)}">
      <meta name="twitter:description" content="{escape_html(desc_en)}">
      <meta name="twitter:image" content="{og_image}">

      <link rel="canonical" href="{canonical}">
      <link rel="alternate" hreflang="zh" href="{canonical}">
      <link rel="alternate" hreflang="en" href="{canonical}?lang=en">
      <link rel="alternate" hreflang="x-default" href="{canonical}">
      <link rel="icon" type="image/x-icon" href="/assets/icons/favicon.ico?v=13">
      <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png?v=13">
      <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png?v=13">

      <script type="application/ld+json">
    {jsonld_str}
      </script>

      <link rel="preload" href="/css/style.css?v=31" as="style">
      <link rel="stylesheet" href="/css/style.css?v=31">
      <script>// dynamic canonical: strip ?search= & ?page= params
(function(){{var l=document.querySelector('link[rel="canonical"]');if(!l)return;var u=l.href;var q=u.indexOf('?');if(q===-1)return;var s=u.substring(q+1).split('&').filter(function(p){{return p.indexOf('search=')!==0&&p.indexOf('page=')!==0}}).join('&');if(s)l.href=u.substring(0,q)+'?'+s;else l.href=u.substring(0,q);}})();</script>
    </head>
    <body>
      <a class="skip-link" href="#main-content">跳到主要内容</a>

      <header class="site-header">
        <div class="header-inner">
          <div class="brand">
            <a href="{SITE_URL}/" class="brand-name brand-lockup">
              <img class="brand-logo" src="/assets/icons/favicon-32x32.png?v=13" alt="Skill Hub logo" loading="lazy">
              <span class="brand-copy">
                <span>Skill Hub</span>
                <span class="brand-subtitle">功能分类导航</span>
              </span>
            </a>
            <span class="brand-badge">BETA</span>
          </div>
          <div class="header-right">
            <nav class="main-nav">
              <a href="{SITE_URL}/stats.html" class="github-link">统计页</a>
              <a href="{REPO_URL}" class="github-link" target="_blank" rel="noopener">仓库</a>
            </nav>
          </div>
        </div>
      </header>

      <main id="main-content">
        <div class="category-page-hero">
          <div class="category-breadcrumb">
            <a href="{SITE_URL}/">首页</a> &gt; <span>{name_zh}</span>
          </div>
          <h1 class="category-page-title">{name_en} <span class="category-page-count">({total_count} Skills)</span></h1>
          <p class="category-page-desc">{escape_html(desc_en)}</p>

          <form class="category-search-form" action="{SITE_URL}/" method="get">
            <input type="hidden" name="category" value="{category_id}">
            <input type="search" name="search" class="search-input" placeholder="Search {name_en} skills…" aria-label="Search {name_en} category">
            <button type="submit" class="search-btn">Search</button>
          </form>
        </div>

        <section class="category-page-content">
          <div class="results grid-view">
            {cards_html}
          </div>
          {show_more_note}
        </section>

        <section class="about">
          <h2>About {name_en} Category</h2>
          <p>Skill Hub curates {total_count} AI Agent Skills in the {name_en} category. Browse by name, description, or API keyword, and filter by platform compatibility. Data refreshed daily.</p>
        </section>
      </main>

      <footer class="site-footer">
        <div class="footer-inner">
          <p>&copy; {datetime.now().year} Skill Hub &middot; <a href="{SITE_URL}/">Home</a> &middot; <a href="{REPO_URL}" target="_blank" rel="noopener">GitHub</a></p>
        </div>
      </footer>
    </body>
    </html>"""
    return html

def main():
    os.makedirs(STATIC_OUT, exist_ok=True)

    cats_data = load_categories()
    cats = cats_data.get("categories", [])
    results = []

    for cat in cats:
        cat_id = cat.get("id", "")
        if not cat_id:
            continue

        # Load skills for this category
        skills = load_skills(cat_id)
        total = len(skills)

        # Generate HTML
        html = make_html(cat_id, skills, total)

        # Write to static-categories/{id}/index.html
        out_path = STATIC_OUT / cat_id / "index.html"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)

        # Also write to categories/{id}/index.html for direct serving
        cat_out = OUT_DIR / cat_id / "index.html"
        cat_out.parent.mkdir(parents=True, exist_ok=True)
        with open(cat_out, "w", encoding="utf-8") as f:
            f.write(html)

        results.append((cat_id, total, str(out_path)))
        print(f"  [cat] {cat_id}: {total} skills → {out_path}")

    # Generate sitemap
    sitemap_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        f'  <url><loc>{SITE_URL}/</loc><lastmod>{TODAY}</lastmod><changefreq>daily</changefreq><priority>1.0</priority>',
        f'    <xhtml:link rel="alternate" hreflang="zh" href="{SITE_URL}/"/>',
        f'    <xhtml:link rel="alternate" hreflang="en" href="{SITE_URL}/?lang=en"/>',
        f'    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE_URL}/"/>',
        f'  </url>',
        f'  <url><loc>{SITE_URL}/stats.html</loc><lastmod>{TODAY}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority>',
        f'    <xhtml:link rel="alternate" hreflang="zh" href="{SITE_URL}/stats.html"/>',
        f'    <xhtml:link rel="alternate" hreflang="en" href="{SITE_URL}/stats.html?lang=en"/>',
        f'    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE_URL}/stats.html"/>',
        f'  </url>',
    ]
    for cat_id, count, _ in results:
        sitemap_lines.append(
            f'  <url><loc>{SITE_URL}/categories/{cat_id}/</loc>'
            f'<lastmod>{TODAY}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority>')
        sitemap_lines.append(
            f'    <xhtml:link rel="alternate" hreflang="zh" href="{SITE_URL}/categories/{cat_id}/"/>')
        sitemap_lines.append(
            f'    <xhtml:link rel="alternate" hreflang="en" href="{SITE_URL}/categories/{cat_id}/?lang=en"/>')
        sitemap_lines.append(
            f'    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE_URL}/categories/{cat_id}/"/>')
        sitemap_lines.append(f'  </url>')
    sitemap_lines.append("</urlset>")

    sitemap_path = "sitemap.xml"
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sitemap_lines) + "\n")
    print(f"  [sitemap] Updated {sitemap_path} with {len(results)} category pages")

    # Update robots.txt to reference new sitemap (already exists)
    print(f"\nDone: {len(results)} category pages + sitemap.xml")

if __name__ == "__main__":
    main()
