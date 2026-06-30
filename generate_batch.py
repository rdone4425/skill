#!/usr/bin/env python3
"""
skill-content-agent: Collect and format AI tools/skills from GitHub for skill-hub.
Generates /tmp/skill_repo/content_batch_$(date +%Y%m%d).json
"""
import json
import datetime
import os

def main():
    # Create output directory
    os.makedirs("/tmp/skill_repo", exist_ok=True)
    
    # Generate filename with today's date
    today = datetime.datetime.now().strftime("%Y%m%d")
    output_path = f"/tmp/skill_repo/content_batch_{today}.json"
    
    # Skills data - curated from GitHub searches
    skills = [
        # AI Agent Frameworks
        {
            "name": "Mythos-Claude-Orchestrator",
            "description": "MythOS 2026: Claude-Powered AI Narrative Engine & Sub-Agent Framework for Epic Storytelling",
            "url": "https://github.com/KarmaDevplacer/Mythos-Claude-Orchestrator",
            "tags": ["AI Agent", "Claude", "Narrative", "Storytelling", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "awesome-ai-agents-2026",
            "description": "A curated list of AI Agent frameworks, tools, platforms, and resources for 2026 — the year agents went mainstream",
            "url": "https://github.com/Zijian-Ni/awesome-ai-agents-2026",
            "tags": ["AI Agent", "Awesome List", "Framework", "2026", "Curated"],
            "category": "agent-framework"
        },
        {
            "name": "open-ai-ecosystem",
            "description": "Top Open-Source AI Agents 2026 — Best Autonomous Tools & Frameworks",
            "url": "https://github.com/salimfk619-jpg/open-ai-ecosystem",
            "tags": ["AI Agent", "Open Source", "Autonomous", "Framework", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "agent-orchestrator-framework",
            "description": "Turn Your AI Agent Into a Full Developer Team: Plan, Code, Test & Ship in One Sprint 2026",
            "url": "https://github.com/hassamwaleed/agent-orchestrator-framework",
            "tags": ["AI Agent", "Orchestration", "Developer Team", "2026", "Sprint"],
            "category": "agent-framework"
        },
        {
            "name": "aios-starter",
            "description": "A framework for running a personal AIOS that supports multiple projects, skills, agents, and LLMs, based on best practices as of June 2026",
            "url": "https://github.com/joshsahib/aios-starter",
            "tags": ["AI Agent", "AIOS", "Framework", "Multi-Agent", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "elizaOS",
            "description": "Open source agentic operating system for building autonomous AI agents",
            "url": "https://github.com/elizaOS/eliza",
            "tags": ["AI Agent", "Operating System", "Open Source", "Autonomous", "Framework"],
            "category": "agent-framework"
        },
        {
            "name": "PraisonAI",
            "description": "Hire a 24/7 AI Workforce — autonomous self-improving agents that research, plan, code, and execute tasks with built-in memory, RAG, and support for 100+ LLMs",
            "url": "https://github.com/MervinPraison/PraisonAI",
            "tags": ["AI Agent", "Workforce", "Autonomous", "RAG", "LLM", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "Nyxora",
            "description": "A zero-trust, local-first AI execution framework for autonomous Web3 agents with OS-native keyring security and DeFi automation",
            "url": "https://github.com/nyxoraAI/Nyxora",
            "tags": ["AI Agent", "Web3", "Zero Trust", "Local First", "Framework"],
            "category": "agent-framework"
        },
        {
            "name": "zhixing",
            "description": "The local execution runtime for the Yuling ecosystem — an LLM-driven autonomous agent framework designed for native 'Computer Use' with secure WebSocket tunneling",
            "url": "https://github.com/Tandem-Agents/zhixing",
            "tags": ["AI Agent", "Local", "Computer Use", "WebSocket", "Framework"],
            "category": "agent-framework"
        },
        {
            "name": "omnigent",
            "description": "Open-source AI agent framework and meta-harness: orchestrate Claude Code, Codex, Cursor, Pi, and custom agents with real-time collaboration",
            "url": "https://github.com/omnigent-ai/omnigent",
            "tags": ["AI Agent", "Meta Harness", "Orchestration", "Multi-Agent", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "soul.py",
            "description": "Build intelligent agents using soul.py, a Python framework that simplifies creating adaptable and autonomous AI-driven systems",
            "url": "https://github.com/sidiishan/soul.py",
            "tags": ["AI Agent", "Python", "Framework", "Autonomous", "Adaptable"],
            "category": "agent-framework"
        },
        {
            "name": "AgentCore",
            "description": "Autonomous LLM Quality Research and Implementation Framework (vibecoded)",
            "url": "https://github.com/ayushsawant464/AgentCore",
            "tags": ["AI Agent", "LLM", "Autonomous", "Research", "Framework"],
            "category": "agent-framework"
        },
        {
            "name": "rlalph-aios",
            "description": "Orchestrate AI agents through story-driven workflows that enable autonomous development and continuous learning within the Synkra AIOS framework",
            "url": "https://github.com/Ricocoswig/ralph-aios",
            "tags": ["AI Agent", "Story-Driven", "Autonomous", "AIOS", "Framework"],
            "category": "agent-framework"
        },
        {
            "name": "loki-mode",
            "description": "Multi-agent autonomous SDLC framework — Spec to deployed app with 5 AI providers and 11 quality gates",
            "url": "https://github.com/asklokesh/loki-mode",
            "tags": ["AI Agent", "SDLC", "Multi-Agent", "Framework", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "aeon",
            "description": "Autonomous agent framework for building intelligent, self-governing AI systems",
            "url": "https://github.com/Hollup/aeon",
            "tags": ["AI Agent", "Autonomous", "Framework", "Self-Governing", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "Doberman Core",
            "description": "AI agent security framework for guardrails, prompt injection defense, runtime policy enforcement, and secure AI deployment",
            "url": "https://github.com/fu351/Doberman-Core",
            "tags": ["AI Agent", "Security", "Guardrails", "Framework", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "agent-supervisor",
            "description": "Multi-role AI coding orchestrator — run Architect, Developer and QA agents side-by-side in real PTY terminals. Supports Claude Code, Gemini CLI, Codex and Kimi Code",
            "url": "https://github.com/zhijun714/agent-supervisor",
            "tags": ["AI Agent", "Coding", "Multi-Role", "Orchestration", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "arche",
            "description": "Build apps with Claude using Archē, a context framework that helps it work autonomously from idea to live app",
            "url": "https://github.com/harshavardhan1516/arche",
            "tags": ["AI Agent", "Claude", "Context Framework", "Autonomous", "App Builder"],
            "category": "agent-framework"
        },
        {
            "name": "sage-router",
            "description": "Local-first AI model router for serious agents. One endpoint for OpenClaw, Codex, Claude Code, Cursor, Ollama, NVIDIA NIM, and authorized provider fallback",
            "url": "https://github.com/earlvanze/sage-router",
            "tags": ["AI Agent", "Router", "Local-First", "Multi-Model", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "Hermit",
            "description": "Local AI Agent Console for solo operators and small teams — puts Claude Code, Codex, Gemini, Qoder into one unified dashboard, messaging and review flow",
            "url": "https://github.com/yancyuu/Hermit",
            "tags": ["AI Agent", "Local", "Console", "Multi-Agent", "2026"],
            "category": "agent-framework"
        },
        
        # MCP Tools
        {
            "name": "ahma",
            "description": "Reliable and fast concurrent adapter turning command line and web tools into async Model Context Protocol AI tools",
            "url": "https://github.com/paulirotta/ahma",
            "tags": ["MCP", "Tool Adapter", "CLI", "Async", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "linux-remote-mcp",
            "description": "MCP Server for remote Linux machine control via SSH — 35 tools for session management, file ops, system admin, Docker, and CTF",
            "url": "https://github.com/yu-xiaohaozi/linux-remote-mcp",
            "tags": ["MCP", "SSH", "Linux", "Remote Control", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "m365-copilot-companion-mcp",
            "description Statesdependente-climb": "Personal-use MCP server that gives Microsoft 365 Copilot real hands on your own laptop: files, Python, Office, SQL, Web. 100+ tools, autonomous relay",
y": "https://github.com/MasayukiTa/m365-copilot-companion-mcp",
            "tags": ["MCP", "Microsoft 365", "Copilot", "Productivity", "2026"],
            "category": "automation-productivity"
        },
        {
            "name": "mcpscan",
            "description": "Supply-chain security scanner for MCP servers & Claude Code projects — catch tool-poisoning, command injection & risky permissions before you install",
            "url": "https://github.com/glatinone/mcpscan",
            "tags": ["MCP", "Security", "Scanner", "Supply Chain", "2026"],
            "category": "security"
        },
        {
            "name": "claude-session-bus",
            "description": "A tiny Claude Code plugin that lets separate Claude sessions in one project pass each other short messages via MCP broadcast() tool",
            "url": "https://github.com/exalsch/claude-session-bus",
            "tags": ["MCP", "Claude Code", "Session Management", "Plugin", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "toolgate",
            "description": "Policy, approval, redaction, timeout, and audit middleware for MCP server tools",
            "url": "https://github.com/Wezylnia/toolgate",
            "tags": ["MCP", "Middleware", "Policy", "Audit", "2026"],
            "category": "security"
        },
        {
            "name": "Webasyst MCP Server",
            "description": "AI Tools for Apps, Plugins & Themes via MCP protocol for Webasyst platform",
            "url": "https://github.com/amit491k-del/webasyst-ai-workbench",
            "tags": ["MCP", "Webasyst", "Plugin", "AI Tools", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "memory-forge",
            "description": "AI Agent persistent memory engine — 8 MCP tools + 5 auto-engines. Free local + Pro Shelby cloud",
            "url": "https://github.com/shelby-protocol/memory-forge",
            "tags": ["MCP", "Memory", "AI Agent", "Persistent", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "agent-thinktank-stack",
            "description": "AI Coding Memory MCP 2026: 20 Tools for Persistent Sprint & Decision Management",
            "url": "https://github.com/PranavGS2006/agent-thinktank-stack",
            "tags": ["MCP", "Memory", "Coding", "Sprint Management", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "fak",
            "description": "The Fused Agent Kernel: treat the model like an untrusted program and the tool call like a syscall — a default-deny capability gate with bit-exact KV cache",
            "url": o.description",
            "tags": ["MCP", "Agent Security", "Capability Gate", "Kernel", "2026"],
            "category": "security"
        },
        {
            "name": "open-memory-protocol",
            "description": "An open standard for portable, interoperable AI memory across tools, sessions, and devices",
            "url": "https://github.com/SMJAI/open-memory-protocol",
            "tags": ["MCP", "Memory", "Open Standard", "Interoperable", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "mcp-threat-intel",
            "description": "Daily automated OWASP vulnerability scans for open-source Model Context Protocol (MCP) tools",
            "url": "https://github.com/OneZero-Network/mcp-threat-intel",
            "tags": ["MCP", "Security", "OWASP", "Vulnerability Scan", "2026"],
            "category": "security"
        },
        {
            "name": "cipher-mcp-pqc",
            "description": "Hybrid post-quantum governance framework for MCP — composite identity, protocol handshake hardening, and evidence repository for AI agent protocols. ACM QSec / Elsevier FGCS 2026",
            "url": "https://github.com/sunilgentyala/cipher-mcp-pqc",
            "tags": ["MCP", "Post-Quantum", "Security", "Governance", "2026"],
            "category": "security"
        },
        
        # AI Coding Assistants
        {
            "name": "oh-my-pi",
            "description": "AI Coding agent for the terminal — hash-anchored edits, optimized tool harness, LSP, Python, browser, subagents, and more",
            "url": "https://github.com/can1357/oh-my-pi",
            "tags": ["AI Coding", "Terminal", "LSP", "Python", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "agentpack",
            "description": "Local context engine for AI coding agents. Routes tasks to relevant files, tests, rules, and skills, supports prompt caching for Claude Code, Codex, Cursor, MCP",
            "url": "https://github.com/vishal2612200/agentpack",
            "tags": ["AI Coding", "Context Engine", "Local", "Claude Code", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "curion",
            "description": "Project-local memory layer for AI coding agents, published as an MCP server for Claude Code, Codex, OpenCode, and other MCP clients",
            "url": "https://github.com/geanatz/curion",
            "tags": ["AI Coding", "Memory", "MCP", "Local", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "okuro-ai",
            "description": "Agent-native OS — cross-CLI shared memory, structured subagent orchestration & handover, and cognitive-profile-aware delivery across Claude Code / Codex / Gemini / Cursor",
            "url": "https://github.com/saxmode/okuro-ai",
            "tags": ["AI Coding", "OS", "Shared Memory", "Multi-Agent", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "claude-craft",
            "description": "Supercharge Claude Code with Expert Knowledge — a comprehensive framework for AI-assisted development with standardized rules, agents, and commands",
            "url": "https://github.com/TheBeardedBearSAS/claude-craft",
            "tags": ["AI Coding", "Claude Code", "Framework", "Expert Knowledge", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "daintree",
            "description": "A delegation environment for orchestrating AI coding agents — manage Claude, Gemini, and Codex sessions across git worktrees with integrated terminals and context injection",
            "url": "https://github.com/daintreehq/daintree",
            "tags": ["AI Coding", "Orchestration", "Git Worktrees", "Multi-Agent", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "ai-coding-toolkit",
            "description": "An auto-syncing AI programming Skill toolkit — fetches quality programming skills daily, compatible with Kimi Code CLI, OpenAI Codex CLI, Claude Code, Cursor, OpenCode, Gemini CLI",
            "url": "https://github.com/ByronnX/ai-coding-toolkit",
            "tags": ["AI Coding", "Skill Toolkit", "Multi-Platform", "Auto-Sync", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "loop-engineering",
            "description": "Claude Code skill to set up an autonomous, self-running AI coding agent that discovers work, verifies it with a separate checker agent, and repeats until a verifiable goal is met",
            "url": "https://github.com/sxivansx/loop-engineering",
            "tags": ["AI Coding", "Autonomous", "Claude Code", "Self-Running", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "multi-agent-ide-nexus",
            "description": "Build Your Own AI Coding Army 2026 – Multi-Agent Dev Kit for Copilot, Cursor & Codex",
            "url": "https://github.com/kila234/multi-agent-ide-nexus",
            "tags": ["AI Coding", "Multi-Agent", "IDE", "Dev Kit", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "Trinity",
            "description": "Three minds, one context. Multi-agent AI orchestrator that unifies Claude Code, Codex, and Gemini through shared context, round-based deliberation, consensus building, and autonomous task distribution",
            "url": "https://github.com/hongdangmoo49/Trinity",
            "tags": ["AI Coding", "Multi-Agent", "Orchestration", "Claude Code", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "oj-oikc-openagent",
            "description": "The coding agent for tokenmaxxers; the one and only agent harness for complex codebases — for Codex, for OpenCode",
            "url": "https://github.com/code-yeongyu/oh-my-openagent",
            "tags": ["AI Coding", "Token Optimization", "Harness", "Codex", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "unslop-preflight",
            "description": "23-gate design quality enforcer for AI coding agents — autopilot CLI that blocks generic UI slop before implementation",
            "url": "https://github.com/imMamdouhaboammar/unslop-preflight",
            "tags": ["AI Coding", "Quality", "CLI", "Design", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "megingjord-harness",
            "description": "AI agent governance harness: baton workflow, fleet LLM routing (Ollama/Claude/OpenRouter), and CI gates for Copilot, Claude Code, and Codex",
            "url": "https://github.com/chf3198/megingjord-harness",
            "tags": ["AI Coding", "Governance", "LLM Routing", "CI Gates", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "ai-terminal-agents-guide",
            "description": "Benchmark data, setup frameworks, and spec-driven methodologies for autonomous AI coding CLI agents (Claude, Codex, Aider). Updated June 2026",
            "url": "https://github.com/ayushbishtdev/ai-terminal-agents-guide",
            "tags": ["AI Coding", "CLI", "Benchmark", "Autonomous", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "aidevops",
            "description": "Vibe-Coding is easy. DevOps is hard. OpenCode & Git token-efficient AI agent automation for your app, business, and personal development",
            "url": "https://github.com/marcusquinn/aidevops",
            "tags": ["AI Coding", "DevOps", "Automation", "Token-Efficient", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "claude-code-ripper-rs",
            "description": "PikoClaw 2026: Rust-Powered AI Agent for High-Performance Development",
            "url": "https://github.com/papislayboy/claude-code-ripper-rs",
            "tags": ["AI Coding", "Rust", "Performance", "Claude Code", "2026"],
            "category": "dev-tools"
        },
        
        # Open Source LLM Models
        {
            "name": "llama.cpp",
            "description": "Port of Facebook's LLaMA model in C/C++ — run LLMs locally with minimal resource usage, supports various model formats"
            "url": "https://github.com/ggerganov/llama.cpp",
            "tags": ["LLM", "Local", "C++", "Open Source", "Inference"],
            "category": "data-ai"
        },
        {
            "name": "ollama",
            "description": "Get up and running with Llama 3, Mistral, Gemma 2, and other large language models locally",
            "url": "https://github.com/ollama/ollama",
            "tags": ["LLM", "Local", "Open Source", "Inference", "Docker"],
            "category": "data-ai"
        },
        {
            "name": "vllm",
            "description": "A high-throughput and memory-efficient inference and serving engine for LLMs",
            "url": "https://github.com/vllm-project/vllm",
            "tags": ["LLM", "Inference", "Serving", "High-Throughput", "Open Source"],
            "category": "data-ai"
        },
        {
            "name": "deepseek",
            "description": "DeepSeek AI's open-source large language models — state-of-the-art reasoning and coding capabilities",
            "url": "https://github.com/deepseek-ai/deepseek",
            "tags": ["LLM", "DeepSeek", "Open Source", "Reasoning", "Coding"],
            "category": "data-ai"
        },
        {
            "name": "Open WebUI",
            "description": "User-friendly AI Interface for LLMs (Previously Ollama WebUI) — supports various local and remote LLM backends",
            "url": "https://github.com/open-webui/open-webui",
            "tags": ["LLM", "UI", "Local", "Open Source", "Chat Interface"],
            "category": "data-ai"
        },
        {
            "name": "lm-studio-local-2026",
            "description": "Run local LLMs like Llama and DeepSeek on your Windows PC with data privacy and offline processing",
            "url": "https://github.com/armorerrepertory598/local-llm-1-2026",
            "tags": ["LLM", "Local", "Windows", "Privacy", "2026"],
            "category": "data-ai"
        },
        {
            "name": "llm-notam-2026",
            "description": "Evaluation of Open-Source Large Language Models for Automatic Extraction of Runway Operational Restrictions from ICAO NOTAMs",
            "url": "https://github.com/pavelkrents/llm-notam-2026",
            "tags": ["LLM", "Evaluation", "Open Source", "Aviation", "2026"],
            "category": "data-ai"
        },
        {
            "name": "open-post-training-project",
            "description": "An open-source graduate-level textbook and engineering handbook documenting the complete evolution_avg# LLM post-training (2017-2026)",
            "url": "https://github.com/jaydeepraijada/open-post-training-project",
            "tags": ["LLM", "Post-Training", "Education", "Open Source", "2026"],
            "category": "education"
        },
        {
            "name": "IndicViet-Safe",
            "description": "Cross-lingual safety evaluation of open-source LLMs in Hindi and Vietnamese — Global South AI Safety Hackathon 2026",
            "url": "https://github.com/shch4747/IndicViet-Safe",
            "tags": ["LLM", "Safety", "Evaluation", "Open Source", "2026"],
            "category": "data-ai"
        },
        {
            "name": "EmoVecLLM",
            "description": "Open-source replication of Anthropic 2026 'Emotion Concepts and their Function in a Large Language Model' across Pythia, Llama-3, and Qwen-2.5",
            "url": "https://github.com/drgzkr/EmoVecLLM",
            "tags": ["LLM", "Research", "Anthropic", "Open Source", "2026"],
            "category": "data-ai"
        },
        {
            "name": "LLM4BeSci_StGallen2026",
            "description": "Course introducing the use of open-source large language models (LLMs) from the Hugging Face ecosystem for research in the behavioral and social sciences",
            "url": "https://github.com/Zak-Hussain/LLM4BeSci_StGallen2026",
            "tags": ["LLM", "Education", "Hugging Face", "Open Source", "2026"],
            "category": "education"
        },
        {
            "name": "agentraffic",
            "description": "Measurement framework for studying how coordination topology shapes LLM-call traffic in multi-agent systems — open-source release for NAIC 2026",
            "url": "https://github.com/dlamagna/agentraffic",
            "tags": ["LLM", "Multi-Agent", "Research", "Measurement", "2026"],
            "category": "data-ai"
        },
        
        # Browser Use / AI Browser Agents
        {
            "name": "browser-use",
            "description": "Make websites accessible for AI agents. Automate tasks online with ease",
            "url": "https://github.com/browser-use/browser-use",
            "tags": ["AI Agent", "Browser", "Automation", "Web", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "browser-harness",
            "description": "Browser Harness — Self-healing harness that enables LLMs to complete any task",
            "url": "https://github.com/browser-use/browser-harness",
            "tags": ["AI Agent", "Browser", "Self-Healing", "LLM", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "local-browser-use",
            "description": "Vision-native, local-first browser-use agent: chat with a local model and have it perform web tasks in your real browser session",
            "url": "https://github.com/koretex-ai/local-browser-use",
            "tags": ["AI Agent", "Browser", "Local", "Vision", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "seo-agent",
            "description": "Local AI agent that audits URLs for SEO issues using Browser Use + Claude API + Playwright",
            "url": "https://github.com/dannwaneri/seo-agent",
            "tags": ["AI Agent", "Browser", "SEO", "Claude", "2026"],
            "category": "automation-productivity"
        },
        {
            "name": "ClawBench",
            "description": "Open-source benchmark for browser AI agents on daily tasks",
            "url": "https://github.com/TIGER-AI-Lab/ClawBench",
            "tags": ["AI Agent", "Browser", "Benchmark", "Open Source", "2026"],
            "category": "testing-qa"
        },
        
        # RAG / Vector Databases
        {
            "name": "LlamaIndex",
            "description": "The leading document agent and OCR platform for building RAG applications",
            "url": "https://github.com/run-llama/llama_index",
            "tags": ["RAG", "Document Agent", "OCR", "LLM", "Open Source"],
            "category": "data-ai"
        },
        {
            "name": "milvus",
            "description": "A high-performance, cloud-native vector database built for scalable vector ANN search",
            "url": "https://github.com/milvus-io/milvus",
            "tags": ["Vector Database", "Cloud-Native", "ANN Search", "Scalable", "Open Source"],
            "category": "data-ai"
        },
        {
            "name": "opik",
            "description": "Debug, evaluate, and monitor your LLM applications, RAG systems, and agentic workflows with comprehensive tracing, automated evaluations, and production-ready dashboards",
            "url": "https://github.com/comet-ml/opik",
            "tags": ["RAG", "LLM", "Monitoring", "Tracing", "2026"],
            "category": "data-ai"
        },
        {
            "name": "coordinode",
            "description": "Unify graph, vector, and full-text search in one Rust engine for GraphRAG and AI retrieval with OpenCypher and MVCC",
            "url": "https://github.com/sarcosomebankcheck694/coordinode",
            "tags": ["RAG", "GraphRAG", "Rust", "Vector Search", "2026"],
            "category": "data-ai"
        },
        {
            "name": "ragpipe",
            "description": "Build RAG pipelines in 3 functions for vector databases with zero config and support for Ollama, OpenAI, Qdrant, Pinecone, or JSON files",
            "url": "https://github.com/Genusophiophagussqueezeplay359/ragpipe",
            "tags": ["RAG", "Pipeline", "Zero Config", "Multi-Backend", "2026"],
            "category": "data-ai"
        },
        {
            "name": "CodeRAG",
            "description": "Build semantic vector databases from code and docs to enable AI agents to understand and navigate your entire codebase effectively",
            "url": "https://github.com/Eyram233/CodeRAG",
            "tags": ["RAG", "Code", "Semantic", "Vector Database", "2026"],
            "category": "data-ai"
        },
        {
            "name": "deeprecall",
            "description": "Enable recursive data reasoning with DeepRecall by integrating vector databases and LLMs for accurate, iterative information retrieval",
            "url": "https://github.com/leo2007960216/deeprecall",
            "tags": ["RAG", "Recursive", "Vector Database", "LLM", "2026"],
            "category": "data-ai"
        },
        {
            "name": "semantic-memory",
            "description": "Enable seamless semantic search for AI agents without the hassle of setting up a vector database server using PGlite and pgvector",
            "url": "https://github.com/tshephosekhu/semantic-memory",
            "tags": ["RAG", "Semantic Search", "PGlite", "pgvector", "2026"],
            "category": "data-ai"
        },
        {
            "name": "Agentic-RAG-LlamaIndex",
            "description": "Autonomous multi-document RAG chatbot using a ReAct agent that cross-references technical docs in real time. Built with LlamaIndex 0.14, Gemini 3.5 Flash, and Streamlit",
            "url": "https://github.com/mfpNahu07/Agentic-RAG-LlamaIndex",
            "tags": ["RAG", "Agentic", "LlamaIndex", "Multi-Document", "2026"],
            "category": "data-ai"
        },
        {
            "name": "Self-Corrective-RAG",
            "description": "Enhance your searches with Self-Corrective RAG — a system that optimizes queries and evaluates document relevance using LangGraph and Google Gemini",
            "url": "https://github.com/Jeroflo88/Self-Corrective-RAG",
            "tags": ["RAG", "Self-Corrective", "LangGraph", "Gemini", "2026"],
            "category": "data-ai"
        },
        {
            "name": "LEANN",
            "description": "RAG on Everything with LEANN. Enjoy 97% storage savings while running a fast, accurate, and 100% private RAG application on your personal device — MLSys 2026",
            "url": "https://github.com/StarTrail-org/LEANN",
            "tags": ["RAG", "Privacy", "Storage", "Local", "2026"],
            "category": "data-ai"
        },
        
        # Security / AI Safety
        {
            "name": "capguard",
            "description": "CapGuard (AgentCap) - Secure Agent Capability Layer for AI agents. Python-first OSS library providing typed capabilities, signed plugins, least-privilege enforcement, and audit logging for agent frameworks (LangGraph, CrewAI, etc.)",
            "url": "https://github.com/harsha-mangena/capguard",
            "tags": ["AI Security", "Capability Layer", "LangGraph", "CrewAI", "2026"],
            "category": "security"
        },
        {
            "name": "kevlar-benchmark",
            "description": "Automate detection and exploitation of Agent-Specific Injection vulnerabilities using the OWASP Top 10 framework for AI agent security testing",
            "url": "https://github.com/samsaeed22/kevlar-benchmark",
            "tags": ["AI Security", "OWASP", "Injection", "Benchmark", "2026"],
            "category": "security"
        },
        {
            "name": "SafeGuard",
            "description": "SafeGuard: A Multi-Agent Perception-Reasoning Framework for Social-Risk AI-Generated Video Detection — ECCV 2026",
            "url": "https://github.com/williamw99/SafeGuard",
            "tags": ["AI Safety", "Multi-Agent", "Video Detection", "ECCV 2026", "2026"],
            "category": "security"
        },
        {
            "name": "drishti-identity-trust",
            "description": "Agentic AI-powered Identity Trust Framework — continuous session monitoring, per-user behavioural memory, and explainable decisions for digital banking security. PSB Hackathon 2026",
            "url": "https://github.com/kashvo/drishti-identity-trust",
            "tags": ["AI Security", "Identity", "Banking", "Framework", "2026"],
            "category": "security"
        },
        {
            "name": "aishield",
            "description": "Agent-native AI tool security scanner. Scan MCP/Skill/GPT/Prompt for security risks with 4-dimensional scoring and guardrail MCP for auto-protection",
            "url": "https://github.com/lm203688/aishield",
            "tags": ["AI Security", "Scanner", "MCP", "Guardrail", "2026"],
            "category": "security"
        },
        
        # General AI Tools
        {
            "name": "ai-cortex-hub",
            "description": "Top AI Tools Discovery Platform 2026: Automated Curation & Live Leaderboards",
            "url": "https://github.com/Fabiojvv/ai-cortex-hub",
            "tags": ["AI Tools", "Discovery", "Platform", "Leaderboard", "2026"],
            "category": "general"
        },
        {
            "name": "awesome-free-ai-tools",
            "description": "Curated list of the best free AI tools for 2026",
            "url": "https://github.com/zlc000190/awesome-free-ai-tools",
            "tags": ["AI Tools", "Free", "Curated", "2026", "Awesome List"],
            "category": "general"
        },
        {
            "name": "ai-night-shift",
            "description": "Coordinate multiple AI agents to run autonomous tasks during off-hours with a tested framework for continuous multi-agent collaboration",
            "url": "https://github.com/Distortionistreversibleprocess687/ai-night-shift",
            "tags": ["AI Agent", "Automation", "Off-Hours", "Multi-Agent", "2026"],
            "category": "automation-productivity"
        },
        {
            "name": "ai-pr-review-analyzer",
            "description": "AI-Powered PR Review Assistant 2026 – Automated Code Quality & Efficiency Tool",
            "url": "https://github.com/can-cognizen/ai-pr-review-analyzer",
            "tags": ["AI Tool", "PR Review", "Code Quality", "Automation", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "zerl-to-ai-engineer-2026",
            "description": "Personal learning repository for the 2026 AI Engineer Roadmap. Tracking progress across Python, ML, Deep Learning, MLOps, and Agentic AI frameworks",
            "url": "https://github.com/muhammadmosid/zero-to-ai-engineer-2026",
            "tags": ["AI Education", "Roadmap", "Learning", "2026", "Agentic AI"],
            "category": "education"
        },
        {
            "name": "ai-website-cloner-template",
            "description": "Convert websites into clean Next.js codebases using AI coding agents — automates extraction, component design, and site reconstruction",
            "url": "https://github.com/quantized-lamphouse813/ai-website-cloner-template",
            "tags": ["AI Tool", "Website Clone", "Next.js", "Automation", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "singularity-platform",
            "description": "Singularity — multi-service AI agent platform: IAM, agent-and-tools, context-fabric, workgraph-studio, mcp-server, platform-registry with federated lookups",
            "url": "https://github.com/ashokraj211/singularity-platform",
            "tags": ["AI Platform", "Multi-Service", "MCP", "Registry", "2026"],
            "category": "devops-deploy"
        },
        {
            "name": "ai-codex-indexer",
            "description": "Build a compact codebase index for AI coding assistants to cut repo exploration time and speed up context in TypeScript projects",
            "url": "https://github.com/Extensive-doctorfish372/ai-codex",
            "tags": ["AI Tool", "Code Index", "TypeScript", "Developer Tool", "2026"],
            "category": "dev-tools"
        },
        {
            "name": "prompt-to-asset",
            "description": "Generate icons, favicons, logos, and platform assets from text prompts using free inference providers via CLI or AI coding assistants",
            "url": "https://github.com/lightsomenessvandyke9074/prompt-to-asset",
            "tags": ["AI Tool", "Asset Generation", "Design", "Prompt", "2026"],
            "category": "design-ui"
        },
        {
            "name": "natively-cluely-ai-assistant",
            "description": "Free open-source AI meeting assistant, interview copilot, and note taker with real-time transcription, local RAG, BYOK, and stealth mode. Runs locally with no subscriptions",
            "url": "https://github.com/Natively-AI-assistant/natively-cluely-ai-assistant",
            "tags": ["AI Tool", "Meeting Assistant", "Local", "Open Source", "2026"],
            "category": "general"
        },
        {
            "name": "memclaw",
            "description": "An open-source, local-first personal AI agent on the full Mastra stack — observational memory, browser use, a pub/sub event bus, and Studio observability",
            "url": "https://github.com/sanketagarwal/memclaw",
            "tags": ["AI Agent", "Local-First", "Open Source", "Mastra", "2026"],
            "category": "agent-framework"
        },
        {
            "name": "personal-monorepo-template",
            "description": "Manage your projects, contacts, and personal knowledge in one scalable workspace to provide durable memory and context for your AI coding assistant",
            "url": "https://github.com/Probono-glossy137/personal-monorepo-template",
            "tags": ["AI Tool", "Knowledge Management", "Monorepo", "Context", "2026"],
            "category": "general"
        },
    ]
    
    # Build output
    output = {
        "generatedAt": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "sourceData": "GitHub API Search",
        "totalSkills": len(skills),
        "skills": skills
    }
    
    # Write to file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Generated {output_path}")
    print(f"📊 Total skills collected: {len(skills)}")
    return output_path, len(skills)

if __name__ == "__main__":
    main()