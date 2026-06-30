#!/usr/bin/env python3
"""
SEO & Category Optimization Script for Skill Hub
- Analyzes category structure
- Fixes duplicates, inconsistencies
- Adds SEO metadata and Schema.org structured data
"""

import json
import copy
from datetime import datetime, timezone

INPUT_FILE = '/tmp/skill_repo/categories/index.json'
OUTPUT_FILE = '/tmp/skill_repo/categories/index.json'
REPORT_FILE = '/tmp/skill_repo/SEO_REPORT.md'

# SEO metadata for each top-level category
SEO_DATA = {
    "dev-tools": {
        "metaDescription_en": "Discover top developer tools, code editors, debuggers, and productivity utilities. Browse 1,100+ open-source dev tools for JavaScript, Python, Rust, and more.",
        "metaDescription_cn": "发现顶级开发工具、代码编辑器、调试器和生产力工具。浏览 1100+ 个面向 JavaScript、Python、Rust 等的开源开发工具。",
        "keywords_en": "developer tools, code editor, debugger, npm, JavaScript tools, Python tools, Rust, VS Code extensions, CLI tools, open source devtools",
        "keywords_cn": "开发工具, 代码编辑器, 调试器, npm, JavaScript 工具, Python 工具, Rust, VS Code 扩展, CLI 工具, 开源开发工具"
    },
    "general": {
        "metaDescription_en": "Explore general-purpose tools and utilities. Find 600+ awesome open-source projects, productivity software, and must-have general tools for any workflow.",
        "metaDescription_cn": "探索通用工具和实用程序。发现 600+ 个精选开源项目、生产力软件和任何工作流都必不可少的通用工具。",
        "keywords_en": "general tools, open source, productivity software, awesome lists, utility tools, general purpose software, must-have tools",
        "keywords_cn": "通用工具, 开源, 生产力软件, 精选列表, 实用工具, 通用软件, 必备工具"
    },
    "data-ai": {
        "metaDescription_en": "Browse 500+ AI/ML tools, LLM frameworks, and data science utilities. Discover text-to-image, NLP, computer vision, and generative AI models and libraries.",
        "metaDescription_cn": "浏览 500+ 款 AI/ML 工具、大语言模型框架和数据科学实用程序。发现文本生成、自然语言处理、计算机视觉和生成式 AI 模型与库。",
        "keywords_en": "AI tools, machine learning, LLM, NLP, computer vision, generative AI, text-to-image, deep learning, open source AI, data science, Hugging Face models, RAG",
        "keywords_cn": "AI 工具, 机器学习, 大语言模型, 自然语言处理, 计算机视觉, 生成式 AI, 文本生成图像, 深度学习, 开源 AI, 数据科学, RAG"
    },
    "design-ui": {
        "metaDescription_en": "Find 400+ design systems, UI components, CSS frameworks, and front-end design tools. Best resources for React, Vue, and modern web UI design.",
        "metaDescription_cn": "发现 400+ 个设计系统、UI 组件、CSS 框架和前端设计工具。React、Vue 和现代网页 UI 设计的最佳资源。",
        "keywords_en": "UI design, design systems, CSS frameworks, React components, Vue components, front-end design, web design, UI kits, visual design tools",
        "keywords_cn": "UI 设计, 设计系统, CSS 框架, React 组件, Vue 组件, 前端设计, 网页设计, UI 套件, 视觉设计工具"
    },
    "agent-framework": {
        "metaDescription_en": "Explore 760+ AI agent frameworks and autonomous agent platforms. Build, deploy, and manage intelligent agents with the latest agentic AI frameworks.",
        "metaDescription_cn": "探索 760+ 个 AI Agent 框架和自主智能体平台。使用最新的 Agentic AI 框架构建、部署和管理智能代理。",
        "keywords_en": "AI agent framework, autonomous agent, agentic AI, AI agents, multi-agent systems, LLM agents, AI automation,agency, virtual agents, agent platforms",
        "keywords_cn": "AI Agent 框架, 自主代理, 智能体 AI, AI 代理, 多智能体系统, 大语言模型代理, AI 自动化, 代理平台"
    },
    "docs-content": {
        "metaDescription_en": "Browse 200+ documentation tools, content management systems, and writing utilities. Best markdown editors, doc generators, and knowledge base tools.",
        "metaDescription_cn": "浏览 200+ 个文档工具、内容管理系统和写作实用程序。最佳 Markdown 编辑器、文档生成器和知识库工具。",
        "keywords_en": "documentation tools, markdown editor, doc generator, knowledge base, content management, technical writing, API documentation, static site generator",
        "keywords_cn": "文档工具, Markdown 编辑器, 文档生成器, 知识库, 内容管理, 技术写作, API 文档, 静态站点生成器"
    },
    "automation-productivity": {
        "metaDescription_en": "Discover 220+ automation and productivity tools. Workflow automation, task management, and efficiency boosters for developers and teams.",
        "metaDescription_cn": "发现 220+ 个自动化和效率工具。面向开发者和团队的工作流自动化、任务管理和效率提升利器。",
        "keywords_en": "automation tools, productivity software, workflow automation, task management, efficiency tools, browser automation, project management, time tracking",
        "keywords_cn": "自动化工具, 生产力软件, 工作流自动化, 任务管理, 效率工具, 浏览器自动化, 项目管理, 时间追踪"
    },
    "security": {
        "metaDescription_en": "Browse 230+ cybersecurity and security tools. Find penetration testing, vulnerability scanning, and defensive security utilities.",
        "metaDescription_cn": "浏览 230+ 个网络安全和安全工具。渗透测试、漏洞扫描和防御性安全工具。",
        "keywords_en": "cybersecurity, security tools, penetration testing, vulnerability scanning, defensive security, offensive security, audit tools, security scanner, infosec",
        "keywords_cn": "网络安全, 安全工具, 渗透测试, 漏洞扫描, 防御性安全, 攻击性安全, 审计工具, 安全扫描, 信息安全"
    },
    "social-media": {
        "metaDescription_en": "Explore 140+ social media tools, analytics, and marketing utilities. Manage social presence and grow your audience with top open-source tools.",
        "metaDescription_cn": "探索 140+ 个社交媒体工具、分析工具和营销实用程序。使用顶级开源工具管理社交影响力并扩大受众。",
        "keywords_en": "social media tools, social marketing, social analytics, content scheduler, audience growth, social media management, open source social tools",
        "keywords_cn": "社交媒体工具, 社交营销, 社交分析, 内容排期, 受众增长, 社交媒体管理, 开源社交工具"
    },
    "finance-crypto": {
        "metaDescription_en": "Find 130+ finance, crypto, and trading tools. Open-source fintech utilities, blockchain tools, and algorithmic trading libraries.",
        "metaDescription_cn": "发现 130+ 个金融、加密和交易工具。开源金融科技实用程序、区块链工具和算法交易库。",
        "keywords_en": "finance tools, crypto, trading, fintech, blockchain, algorithmic trading, DeFi, investment tools, open source finance, crypto trading",
        "keywords_cn": "金融工具, 加密货币, 交易, 金融科技, 区块链, 算法交易, 去中心化金融, 投资工具, 开源金融, 加密货币交易"
    },
    "devops-deploy": {
        "metaDescription_en": "Discover 120+ DevOps and deployment tools. Docker, Kubernetes, CI/CD, cloud deployment, and infrastructure automation resources.",
        "metaDescription_cn": "发现 120+ 个 DevOps 和部署工具。Docker、Kubernetes、CI/CD、云部署和基础设施自动化资源。",
        "keywords_en": "DevOps, deployment tools, Docker, Kubernetes, CI/CD, cloud deployment, infrastructure automation, containerization, serverless",
        "keywords_cn": "DevOps, 部署工具, Docker, Kubernetes, 持续集成/持续部署, 云部署, 基础设施自动化, 容器化, 无服务器"
    },
    "backend-api": {
        "metaDescription_en": "Browse 170+ backend and API tools. REST API frameworks, database tools, server-side libraries, and backend development utilities.",
        "metaDescription_cn": "浏览 170+ 个后端和 API 工具。REST API 框架、数据库工具、服务端库和 backend 开发实用程序。",
        "keywords_en": "backend tools, API framework, REST API, database tools, server-side, backend development, API design, backend library, server framework",
        "keywords_cn": "后端工具, API 框架, REST API, 数据库工具, 服务端, 后端开发, API 设计, 后端库, 服务器框架"
    },
    "game-dev": {
        "metaDescription_en": "Explore 100+ game development tools, engines, and libraries. Godot, Unity alternatives, and open-source game dev resources.",
        "metaDescription_cn": "探索 100+ 个游戏开发工具、引擎和库。Godot、Unity 替代方案和开源游戏开发资源。",
        "keywords_en": "game development, game engine, Godot, Unity, game dev tools, game library, game framework, indie game, open source game engine",
        "keywords_cn": "游戏开发, 游戏引擎, Godot, Unity, 游戏开发工具, 游戏库, 游戏框架, 独立游戏, 开源游戏引擎"
    },
    "testing-qa": {
        "metaDescription_en": "Find 100+ testing and QA tools. Test automation, quality assurance, unit testing, and performance testing utilities.",
        "metaDescription_cn": "发现 100+ 个测试和 QA 工具。测试自动化、质量保证、单元测试和性能测试实用程序。",
        "keywords_en": "testing tools, QA, quality assurance, test automation, unit testing, performance testing, test framework, regression testing, QA automation",
        "keywords_cn": "测试工具, 质量保证, 测试自动化, 单元测试, 性能测试, 测试框架, 回归测试, 自动化测试"
    },
    "education": {
        "metaDescription_en": "Browse 100+ education and e-learning tools. Online learning platforms, course creators, and educational open-source projects.",
        "metaDescription_cn": "浏览 100+ 个教育和电子学习工具。在线学习平台、课程创建器和开源教育项目。",
        "keywords_en": "education tools, e-learning, online learning, course platform, educational software, learning management, open source education, teaching tools",
        "keywords_cn": "教育工具, 电子学习, 在线学习, 课程平台, 教育软件, 学习管理, 开源教育, 教学工具"
    },
    "health-medical": {
        "metaDescription_en": "Discover 80+ health and medical tools. Healthcare software, medical data utilities, and open-source health tech projects.",
        "metaDescription_cn": "发现 80+ 个健康和医疗工具。医疗软件、医疗数据实用程序和开源健康科技项目。",
        "keywords_en": "health tools, medical software, healthcare, medical data, health tech, open source healthcare, medical utilities",
        "keywords_cn": "健康工具, 医疗软件, 医疗保健, 医疗数据, 健康科技, 开源医疗, 医疗实用程序"
    },
    "3d": {
        "metaDescription_en": "Explore 80+ 3D modeling, rendering, and WebGL tools. Three.js, Babylon.js, and open-source 3D graphics libraries.",
        "metaDescription_cn": "探索 80+ 个 3D 建模、渲染和 WebGL 工具。Three.js、Babylon.js 和开源 3D 图形库。",
        "keywords_en": "3D modeling, 3D rendering, WebGL, Three.js, Babylon.js, 3D graphics, 3D engine, open source 3D, 3D library",
        "keywords_cn": "3D 建模, 3D 渲染, WebGL, Three.js, Babylon.js, 3D 图形, 3D 引擎, 开源 3D, 3D 库"
    },
    "ecommerce": {
        "metaDescription_en": "Find 70+ e-commerce tools and platforms. Shopify alternatives, shopping cart solutions, and open-source e-commerce software.",
        "metaDescription_cn": "发现 70+ 个电商工具和平台。Shopify 替代方案、购物车解决方案和开源电商软件。",
        "keywords_en": "e-commerce tools, ecommerce platform, Shopify alternative, shopping cart, online store, open source ecommerce, retail software",
        "keywords_cn": "电商工具, 电商平台, Shopify 替代, 购物车, 在线商店, 开源电商, 零售软件"
    },
    "video-multimedia": {
        "metaDescription_en": "Browse 90+ video and multimedia tools. Video processing, streaming, editing, and multimedia development utilities.",
        "metaDescription_cn": "浏览 90+ 个视频和多媒体工具。视频处理、流媒体、编辑和多媒体开发实用程序。",
        "keywords_en": "video tools, multimedia, video processing, streaming, video editing, FFmpeg, video library, media tools",
        "keywords_cn": "视频工具, 多媒体, 视频处理, 流媒体, 视频编辑, FFmpeg, 视频库, 媒体工具"
    },
    "audio": {
        "metaDescription_en": "Discover 70+ audio processing tools. Audio analysis, music production, and digital signal processing libraries.",
        "metaDescription_cn": "发现 70+ 个音频处理工具。音频分析、音乐制作和数字信号处理库。",
        "keywords_en": "audio processing, audio analysis, music production, DSP, sound tools, audio library, open source audio, music software",
        "keywords_cn": "音频处理, 音频分析, 音乐制作, 数字信号处理, 声音工具, 音频库, 开源音频, 音乐软件"
    },
    "video-gen": {
        "metaDescription_en": "Explore 50+ AI video generation tools. Text-to-video, image-to-video, and AI-powered video creation platforms.",
        "metaDescription_cn": "探索 50+ 个 AI 视频生成工具。文本生成视频、图像生成视频和 AI 驱动的视频创作平台。",
        "keywords_en": "AI video generation, text-to-video, image-to-video, AI video, video generation, generative video, synthetic video, open source video AI",
        "keywords_cn": "AI 视频生成, 文本生成视频, 图像生成视频, AI 视频, 视频生成, 生成式视频, 合成视频, 开源视频 AI"
    },
    "audio-speech": {
        "metaDescription_en": "Find 50+ speech recognition and text-to-speech tools. TTS engines, ASR, voice synthesis, and speech processing libraries.",
        "metaDescription_cn": "发现 50+ 个语音识别和文本转语音工具。TTS 引擎、ASR、语音合成和语音处理库。",
        "keywords_en": "text-to-speech, TTS, speech recognition, ASR, voice synthesis, speech processing, voice AI, open source TTS, speech-to-text",
        "keywords_cn": "文本转语音, TTS, 语音识别, ASR, 语音合成, 语音处理, 语音 AI, 开源 TTS, 语音转文本"
    }
}


def fix_duplicates(data):
    """Remove duplicate group entries for categories that exist in top-level"""
    # These categories exist as top-level entries, so remove from groups
    top_level_ids = {cat['id'] for cat in data.get('categories', [])}
    
    original_groups = data.get('groups', [])
    new_groups = []
    removed = []
    
    for group in original_groups:
        if group['id'] in top_level_ids:
            removed.append(group['id'])
            continue
        new_groups.append(group)
    
    data['groups'] = new_groups
    return data, removed


def fix_hf_tasks(data):
    """Remove duplicate hfTasks in data-ai category"""
    for cat in data.get('categories', []):
        if cat['id'] == 'data-ai':
            unique_tasks = list(dict.fromkeys(cat.get('hfTasks', [])))
            cat['hfTasks'] = unique_tasks
    return data


def add_seo_metadata(data):
    """Add SEO metadata to each top-level category"""
    for cat in data.get('categories', []):
        cat_id = cat['id']
        if cat_id in SEO_DATA:
            seo = SEO_DATA[cat_id]
            cat['seo'] = {
                "metaDescription": {
                    "en": seo['metaDescription_en'],
                    "cn": seo['metaDescription_cn']
                },
                "keywords": {
                    "en": seo['keywords_en'],
                    "cn": seo['keywords_cn']
                }
            }
            # Add schema.org structured data
            cat['schemaOrg'] = {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name Jas": "name",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "item": {
                            "@type": "Thing",
                            "name": cat['name_en'],
                            "description": seo['metaDescription_en']
                        }
                    }
                ]
            }
    return data


def validate_counts(data):
    """Validate and report on category counts"""
    total_skills = data.get('totalSkills', 0)
    categories = data.get('categories', [])
    
    cat_total = sum(c['count'] for c in categories)
    
    issues = []
    if cat_total > total_skills * 2:  # some overlap allowed
        issues.append(f"Categories sum ({cat_total}) far exceeds totalSkills ({total_skills}) - likely due to multi-categorization")
    
    for cat in categories:
        if cat['count'] > total_skills:
            issues.append(f"Category '{cat['id']}' count ({cat['count']}) exceeds totalSkills ({total_skills})")
    
    return issues


def generate_report(data, removed_groups, validation_issues):
    """Generate SEO report markdown"""
    lines = []
    lines.append("# Skill Hub SEO & Category Optimization Report\n")
    lines.append(f"**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n")
    lines.append(f"**Total Skills:** {data['totalSkills']}\n\n---\n")
    
    lines.append("\n## 1. Category Structure Fixes\n\n")
    if removed_groups:
        lines.append(f"**Removed duplicate groups:** {', '.join(removed_groups)}\n\n")
    else:
        lines.append("No duplicate groups found.\n\n")
    
    lines.append("### Validation Issues\n\n")
    for issue in validation_issues:
        lines.append(f"- {issue}\n")
    if not validation_issues:
        lines.append("- No critical validation issues detected.\n")
    
    lines.append("\n## 2. SEO Metadata per Category\n\n")
    for cat in data['categories']:
        seo = cat.get('seo', {})
        desc = seo.get('metaDescription', {})
        kw = seo.get('keywords', {})
        lines.append(f"### {cat['name_en']} ({cat['name_cn']})\n")
        lines.append(f"- **Path:** `{cat['path']}`\n")
        lines.append(f"- **Count:** {cat['count']}\n")
        lines.append(f"- **Meta Description (EN):** {desc.get('en', 'N/A')}\n")
        lines.append(f"- **Meta Description (CN):** {desc.get('cn', 'N/A')}\n")
        lines.append(f"- **Keywords (EN):** {kw.get('en', 'N/A')}\n")
        lines.append(f"- **Keywords (CN):** {kw.get('cn', 'N/A')}\n\n")
    
    lines.append("\n## 3. Schema.org Structured Data Summary\n\n")
    lines.append("Each category now includes a Schema.org `ItemList` object with:\n\n")
    lines.append("- `@context`: https://schema.org\n")
    lines.append("- `@type`: ItemList / ListItem / Thing hierarchy\n")
    lines.append("- `name`: Category name in English\n")
    lines.append("- `description`: SEO-optimized meta description (English)\n\n")
    
    with open(REPORT_FILE, 'w') as f:
        f.writelines(lines)
    
    return REPORT_FILE


def main():
    with open(INPUT_FILE, 'r') as f:
        data = json.load(f)
    
    # fix duplicates
    data, removed = fix_duplicates(data)
    
    # fix hfTasks
    data = fix_hf_tasks(data)
    
    # add SEO
    data = add_seo_metadata(data)
    
    # validation
    issues = validate_counts(data)
    
    # update timestamp
    data['generatedAt'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
    data['seoOptimized'] = True
    
    # write back
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Updated: {OUTPUT_FILE}")
    
    # generate report
    report_path = generate_report(data, removed, issues)
    print(f"Report generated: {report_path}")


if __name__ == "__main__":
    main()
