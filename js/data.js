/**
 * Codex Skills Hub — data
 * 数据来源：
 *   - openai/skills 官方精选 39 个
 *   - 社区 awesome 清单 4 个
 *   - Codex CLI 配套工具 3 个
 *   - 通用 Agent Skills（兼容 Codex）10 个
 *
 * 数据生成时间：2026-06-04
 */

window.SKILL_DATA = {
  meta: {
    title: "Codex Skills Hub",
    description: "Curated index of OpenAI Codex skills — official + community",
    lastUpdated: "2026-06-04",
    totalCount: 56,        // 总数（去重后）
    sources: 17,            // 仓库源数
  },

  // 4 大类
  categories: [
    {
      id: "official",
      label: "Official Curated",
      icon: "🎯",
      description: "OpenAI 官方精选的 39 个 skills，$skill-installer 可直接安装",
      color: "#6366f1",
      groups: [
        { id: "figma", label: "Figma" },
        { id: "github", label: "GitHub" },
        { id: "notion", label: "Notion" },
        { id: "playwright", label: "Playwright" },
        { id: "deploy", label: "Deployment" },
        { id: "security", label: "Security" },
        { id: "other", label: "Other" },
      ],
    },
    {
      id: "community",
      label: "Community Lists",
      icon: "🌟",
      description: "社区维护的 awesome 清单，收录各种 Codex skills",
      color: "#10b981",
      groups: null,
    },
    {
      id: "tools",
      label: "Codex CLI Tools",
      icon: "🛠",
      description: "配合 Codex 使用的 CLI 工具 — proxy、router、wrapper",
      color: "#f59e0b",
      groups: null,
    },
    {
      id: "general",
      label: "General Agent Skills",
      icon: "🤖",
      description: "通用 AI agent skills — 多端兼容（Codex/Claude Code/OpenCode）",
      color: "#ec4899",
      groups: null,
    },
  ],

  // 所有 skills
  skills: [
    // ========== 官方精选 39 个 ==========
    // Figma (12)
    { name: "figma", source: "official", group: "figma", repo: "openai/skills", stars: 21251,
      desc: "Use the Figma MCP server to fetch design context, screenshots, variables, and assets from Figma, and to translate Figma...",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/figma",
      install: "$skill-installer figma" },

    { name: "figma-code-connect-components", source: "official", group: "figma", repo: "openai/skills", stars: 21251,
      desc: "Work with Figma Code Connect components: list available components, generate usage examples, and import the right component...",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/figma-code-connect-components",
      install: "$skill-installer figma-code-connect-components" },

    { name: "figma-create-design-system-rules", source: "official", group: "figma", repo: "openai/skills", stars: 21251,
      desc: "Create design system rules in Figma based on existing design context, conventions, and brand guidelines.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/figma-create-design-system-rules",
      install: "$skill-installer figma-create-design-system-rules" },

    { name: "figma-create-new-file", source: "official", group: "figma", repo: "openai/skills", stars: 21251,
      desc: "Create a new Figma design file with proper structure, naming conventions, and starter frames.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/figma-create-new-file",
      install: "$skill-installer figma-create-new-file" },

    { name: "figma-generate-design", source: "official", group: "figma", repo: "openai/skills", stars: 21251,
      desc: "Generate Figma designs from prompts, screenshots, wireframes, or reference files using the Figma MCP server.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/figma-generate-design",
      install: "$skill-installer figma-generate-design" },

    { name: "figma-generate-library", source: "official", group: "figma", repo: "openai/skills", stars: 21251,
      desc: "Generate a Figma component library from design tokens, brand guidelines, or existing components.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/figma-generate-library",
      install: "$skill-installer figma-generate-library" },

    { name: "figma-implement-design", source: "official", group: "figma", repo: "openai/skills", stars: 21251,
      desc: "Implement Figma designs in code — translate Figma components, tokens, and layouts into matching UI code.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/figma-implement-design",
      install: "$skill-installer figma-implement-design" },

    { name: "figma-use", source: "official", group: "figma", repo: "openai/skills", stars: 21251,
      desc: "Use Figma: fetch design context, screenshots, and assets via the Figma MCP server for any Figma-related task.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/figma-use",
      install: "$skill-installer figma-use" },

    // GitHub (2)
    { name: "gh-address-comments", source: "official", group: "github", repo: "openai/skills", stars: 21251,
      desc: "Help address review/issue comments on the open GitHub PR for the current branch using gh CLI.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/gh-address-comments",
      install: "$skill-installer gh-address-comments" },

    { name: "gh-fix-ci", source: "official", group: "github", repo: "openai/skills", stars: 21251,
      desc: "Diagnose and fix failing CI runs on the current branch's open PR using gh CLI and workflow logs.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/gh-fix-ci",
      install: "$skill-installer gh-fix-ci" },

    // Notion (4)
    { name: "notion-knowledge-capture", source: "official", group: "notion", repo: "openai/skills", stars: 21251,
      desc: "Capture knowledge from conversations, meetings, and documents into structured Notion pages.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/notion-knowledge-capture",
      install: "$skill-installer notion-knowledge-capture" },

    { name: "notion-meeting-intelligence", source: "official", group: "notion", repo: "openai/skills", stars: 21251,
      desc: "Turn meeting notes, transcripts, and recordings into structured meeting intelligence in Notion.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/notion-meeting-intelligence",
      install: "$skill-installer notion-meeting-intelligence" },

    { name: "notion-research-documentation", source: "official", group: "notion", repo: "openai/skills", stars: 21251,
      desc: "Compile research findings, sources, and notes into a polished research document in Notion.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/notion-research-documentation",
      install: "$skill-installer notion-research-documentation" },

    { name: "notion-spec-to-implementation", source: "official", group: "notion", repo: "openai/skills", stars: 21251,
      desc: "Turn a Notion spec into a working implementation — read the spec, plan tasks, and produce code.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/notion-spec-to-implementation",
      install: "$skill-installer notion-spec-to-implementation" },

    // Playwright (2)
    { name: "playwright", source: "official", group: "playwright", repo: "openai/skills", stars: 21251,
      desc: "Write, run, and debug Playwright tests in headless browsers for end-to-end testing and automation.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/playwright",
      install: "$skill-installer playwright" },

    { name: "playwright-interactive", source: "official", group: "playwright", repo: "openai/skills", stars: 21251,
      desc: "Drive a browser interactively with Playwright — fill forms, click buttons, scrape data, take screenshots.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/playwright-interactive",
      install: "$skill-installer playwright-interactive" },

    // Deployment (4)
    { name: "cloudflare-deploy", source: "official", group: "deploy", repo: "openai/skills", stars: 21251,
      desc: "Deploy applications to Cloudflare Pages, Workers, or R2 using the Wrangler CLI with proper config.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/cloudflare-deploy",
      install: "$skill-installer cloudflare-deploy" },

    { name: "netlify-deploy", source: "official", group: "deploy", repo: "openai/skills", stars: 21251,
      desc: "Deploy static sites and functions to Netlify using the Netlify CLI with build configuration.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/netlify-deploy",
      install: "$skill-installer netlify-deploy" },

    { name: "render-deploy", source: "official", group: "deploy", repo: "openai/skills", stars: 21251,
      desc: "Deploy web services, databases, and static sites to Render using the Render API or CLI.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/render-deploy",
      install: "$skill-installer render-deploy" },

    { name: "vercel-deploy", source: "official", group: "deploy", repo: "openai/skills", stars: 21251,
      desc: "Deploy Next.js apps, static sites, and serverless functions to Vercel using the Vercel CLI.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/vercel-deploy",
      install: "$skill-installer vercel-deploy" },

    // Security (3)
    { name: "security-best-practices", source: "official", group: "security", repo: "openai/skills", stars: 21251,
      desc: "Apply security best practices when writing code — input validation, secret handling, dependency hygiene.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/security-best-practices",
      install: "$skill-installer security-best-practices" },

    { name: "security-ownership-map", source: "official", group: "security", repo: "openai/skills", stars: 21251,
      desc: "Map code ownership and trust boundaries to identify security-sensitive areas in a codebase.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/security-ownership-map",
      install: "$skill-installer security-ownership-map" },

    { name: "security-threat-model", source: "official", group: "security", repo: "openai/skills", stars: 21251,
      desc: "Generate a threat model for a system or feature — identify assets, adversaries, attack surfaces, mitigations.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/security-threat-model",
      install: "$skill-installer security-threat-model" },

    // Other (12)
    { name: "aspnet-core", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Build, review, refactor, or architect ASP.NET Core web applications using current official guidance.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/aspnet-core",
      install: "$skill-installer aspnet-core" },

    { name: "chatgpt-apps", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Build, scaffold, refactor, and troubleshoot ChatGPT Apps SDK applications combining an MCP server and widget UI.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/chatgpt-apps",
      install: "$skill-installer chatgpt-apps" },

    { name: "cli-creator", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Build a composable CLI for Codex from API docs, an OpenAPI spec, existing curl examples, an SDK, or an admin tool.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/cli-creator",
      install: "$skill-installer cli-creator" },

    { name: "define-goal", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Help define a clear, measurable goal for a project or task before writing any code.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/define-goal",
      install: "$skill-installer define-goal" },

    { name: "hatch-pet", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Hatch a Codex pet — an interactive companion that grows as you use Codex.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/hatch-pet",
      install: "$skill-installer hatch-pet" },

    { name: "jupyter-notebook", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Create, edit, and execute Jupyter notebooks for data analysis, exploration, and visualization.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/jupyter-notebook",
      install: "$skill-installer jupyter-notebook" },

    { name: "linear", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Manage issues, projects, and cycles in Linear — create, update, search, and triage from Codex.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/linear",
      install: "$skill-installer linear" },

    { name: "migrate-to-codex", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Migrate from another AI agent (Claude Code, Cursor, etc.) to Codex — adapt configs, AGENTS.md, hooks, skills.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/migrate-to-codex",
      install: "$skill-installer migrate-to-codex" },

    { name: "openai-docs", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Search and cite OpenAI documentation, including API references, guides, and cookbook recipes.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/openai-docs",
      install: "$skill-installer openai-docs" },

    { name: "pdf", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Read, extract, and process PDF files — text extraction, table extraction, form filling, generation.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/pdf",
      install: "$skill-installer pdf" },

    { name: "screenshot", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Take screenshots of web pages, the desktop, or specific UI elements for testing or documentation.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/screenshot",
      install: "$skill-installer screenshot" },

    { name: "sentry", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Read and triage Sentry errors — find recent issues, identify root causes, suggest fixes.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/sentry",
      install: "$skill-installer sentry" },

    { name: "speech", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Generate, transcribe, and process speech audio using OpenAI's speech models.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/speech",
      install: "$skill-installer speech" },

    { name: "transcribe", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Transcribe audio and video files to text using OpenAI's transcription models.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/transcribe",
      install: "$skill-installer transcribe" },

    { name: "winui-app", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Build Windows apps with WinUI 3 and the Windows App SDK — XAML, MVVM, packaging.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/winui-app",
      install: "$skill-installer winui-app" },

    { name: "yeet", source: "official", group: "other", repo: "openai/skills", stars: 21251,
      desc: "Yeet a file, URL, or snippet to a destination — quick share/send helper.",
      url: "https://github.com/openai/skills/tree/main/skills/.curated/yeet",
      install: "$skill-installer yeet" },

    // ========== 社区清单 4 个 ==========
    { name: "awesome-codex-skills", source: "community", group: null, repo: "ComposioHQ/awesome-codex-skills", stars: 12859,
      desc: "A curated list of practical Codex skills for automating workflows across the Codex CLI and API.",
      url: "https://github.com/ComposioHQ/awesome-codex-skills",
      install: "git clone https://github.com/ComposioHQ/awesome-codex-skills.git" },

    { name: "awesome-codex-subagents", source: "community", group: null, repo: "VoltAgent/awesome-codex-subagents", stars: 5034,
      desc: "A collection of 130+ specialized Codex subagents covering development, security, research, and more.",
      url: "https://github.com/VoltAgent/awesome-codex-subagents",
      install: "git clone https://github.com/VoltAgent/awesome-codex-subagents.git" },

    { name: "awesome-codex-plugins", source: "community", group: null, repo: "hashgraph-online/awesome-codex-plugins", stars: 369,
      desc: "A curated list of awesome OpenAI Codex plugins, skills, and subagents from the community.",
      url: "https://github.com/hashgraph-online/awesome-codex-plugins",
      install: "git clone https://github.com/hashgraph-online/awesome-codex-plugins.git" },

    { name: "awesome-codex-cli", source: "community", group: null, repo: "RoggeOhta/awesome-codex-cli", stars: 253,
      desc: "Curated list of 150+ tools, skills, subagents & plugins for Codex CLI.",
      url: "https://github.com/RoggeOhta/awesome-codex-cli",
      install: "git clone https://github.com/RoggeOhta/awesome-codex-cli.git" },

    // ========== Codex CLI 工具 3 个 ==========
    { name: "CLIProxyAPI", source: "tools", group: null, repo: "router-for-me/CLIProxyAPI", stars: 35938,
      desc: "Wrap Gemini CLI, Antigravity, ChatGPT Codex, Claude Code as a unified OpenAI-compatible API server.",
      url: "https://github.com/router-for-me/CLIProxyAPI",
      install: "docker pull router-for-me/cli-proxy-api" },

    { name: "9router", source: "tools", group: null, repo: "decolua/9router", stars: 16104,
      desc: "Unlimited FREE AI coding. Connect Claude Code, Codex, Cursor via a single router with usage analytics.",
      url: "https://github.com/decolua/9router",
      install: "npm i -g 9router" },

    { name: "codex-cli", source: "tools", group: null, repo: "openai/codex", stars: 88304,
      desc: "OpenAI Codex CLI — the official command-line interface for running Codex locally.",
      url: "https://github.com/openai/codex",
      install: "npm i -g @openai/codex" },

    // ========== 通用 Agent Skills 10 个 ==========
    { name: "ECC", source: "general", group: null, repo: "affaan-m/ECC", stars: 205378,
      desc: "The agent harness performance optimization system. Skills + context engineering for top-tier agents.",
      url: "https://github.com/affaan-m/ECC",
      install: "git clone https://github.com/affaan-m/ECC.git" },

    { name: "graphify", source: "general", group: null, repo: "safishamsi/graphify", stars: 58802,
      desc: "AI coding assistant skill (Claude Code, Codex, OpenCode) — graph-based code understanding.",
      url: "https://github.com/safishamsi/graphify",
      install: "git clone https://github.com/safishamsi/graphify.git" },

    { name: "claude-skills", source: "general", group: null, repo: "alirezarezvani/claude-skills", stars: 17031,
      desc: "337 Claude Code skills & agent skills & plugins (30+ agents, Codex 兼容).",
      url: "https://github.com/alirezarezvani/claude-skills",
      install: "git clone https://github.com/alirezarezvani/claude-skills.git" },

    { name: "codex-autoresearch", source: "general", group: null, repo: "leo-lilinxiao/codex-autoresearch", stars: 1827,
      desc: "Codex Autoresearch Skill — A self-directed iterative research skill for Codex.",
      url: "https://github.com/leo-lilinxiao/codex-autoresearch",
      install: "git clone https://github.com/leo-lilinxiao/codex-autoresearch.git" },

    { name: "ctf-skills", source: "general", group: null, repo: "ljagiello/ctf-skills", stars: 2275,
      desc: "Agent skills for solving CTF challenges — web exploitation, crypto, forensics, reverse engineering.",
      url: "https://github.com/ljagiello/ctf-skills",
      install: "git clone https://github.com/ljagiello/ctf-skills.git" },

    { name: "cybersecurity-skills", source: "general", group: null, repo: "mukul975/Anthropic-Cybersecurity-Skills", stars: 13833,
      desc: "754 structured cybersecurity skills for AI agents — MITRE ATT&CK mapping, security playbooks.",
      url: "https://github.com/mukul975/Anthropic-Cybersecurity-Skills",
      install: "git clone https://github.com/mukul975/Anthropic-Cybersecurity-Skills.git" },

    { name: "obsidian-skills", source: "general", group: null, repo: "kepano/obsidian-skills", stars: 34131,
      desc: "Agent skills for Obsidian. Teach your agent to use Obsidian vaults, plugins, and the API.",
      url: "https://github.com/kepano/obsidian-skills",
      install: "git clone https://github.com/kepano/obsidian-skills.git" },

    { name: "marketingskills", source: "general", group: null, repo: "coreyhaines31/marketingskills", stars: 31765,
      desc: "Marketing skills for Claude Code and AI agents — CRO, copywriting, SEO, analytics.",
      url: "https://github.com/coreyhaines31/marketingskills",
      install: "git clone https://github.com/coreyhaines31/marketingskills.git" },

    { name: "awesome-llm-skills", source: "general", group: null, repo: "Prat011/awesome-llm-skills", stars: 1287,
      desc: "A curated list of awesome LLM and AI Agent Skills, resources, and tooling.",
      url: "https://github.com/Prat011/awesome-llm-skills",
      install: "git clone https://github.com/Prat011/awesome-llm-skills.git" },

    { name: "antigravity-awesome-skills", source: "general", group: null, repo: "sickn33/antigravity-awesome-skills", stars: 39596,
      desc: "Installable GitHub library of 1,494+ agentic skills — for Claude Code, Codex, and other agents.",
      url: "https://github.com/sickn33/antigravity-awesome-skills",
      install: "git clone https://github.com/sickn33/antigravity-awesome-skills.git" },
  ],
};
