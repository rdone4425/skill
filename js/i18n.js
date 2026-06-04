/* ==========================================
   i18n 字符串定义
   ========================================== */
const I18N = {
  zh: {
    pageTitle: 'Skill Hub — AI Agent Skills 导航站',
    metaDesc: 'Skill Hub — 汇集 OpenAI Codex、Claude Code、Hermes Agent、OpenCode 等主流 AI Agent 平台的 Skills，按 Agent 分类，支持安装、收藏、分页浏览。输入关键词即可跨平台搜索，快速找到你需要的 skill。',
    heroTitle: '🔍 Skill Hub',
    heroSub: 'AI Agent Skills 导航站',
    heroDesc: '汇集主流 AI Agent 平台的 Skills，一站式搜索、浏览、安装。',
    searchPlaceholder: '搜索 skills / 仓库 / 描述…',
    searchClearTitle: '清空',
    emptyState: '没找到匹配的 skill 😕',
    pagePrev: '← 上一页',
    pageNext: '下一页 →',
    statsTitle: '📊 数据统计',
    statsBySource: '按 Agent 来源分布',
    statsTopRepos: '热门仓库 Top 10',
    aboutTitle: '📚 关于',
    aboutP1: 'Skill Hub 汇集了 <strong>OpenAI Codex</strong>、<strong>Claude Code</strong>、<strong>Hermes Agent</strong>、<strong>OpenCode</strong>、<strong>OpenClaw</strong> 等主流 AI Agent 平台的 Skills。<br>社区还在不断贡献中，欢迎 <a href="https://github.com/rdone4425/skill" target="_blank">提交你的仓库</a>！',
    aboutP2: '数据来源：GitHub 公开仓库，每日 UTC 00:00 自动更新。',
    footerDesc: '社区维护 · 每日自动更新',
    sortBy: '排序',
    groupBy: '分组',
    viewMode: '视图',
    flatView: '卡片视图',
    groupedView: '分组视图',
    sortStarsDesc: '⭐ 最多',
    sortStarsAsc: '⭐ 最少',
    sortNameAsc: 'A → Z',
    sortNameDesc: 'Z → A',
    groupNone: '不分组',
    groupAgent: '按 Agent',
    groupType: '按类型',
    resultsCount: '{count} 个 skill',
    resultsCountFiltered: '{count} 个 skill（共 {total} 个）',
    skills: '个 skill',
    viewOnGitHub: '仓库',
    install: '安装',
    sourceLabel: '来源',
    groupLabel: '类型',
    openLink: '🔗',
    categoryOfficial: 'OpenAI Codex',
    categoryClaude: 'Claude Code',
    categoryHermes: 'Hermes Agent',
    categoryOpencode: 'OpenCode',
    categoryOpenclaw: 'OpenClaw',
    categoryCommunity: 'Community',
    categoryTools: 'Dev Tools',
    categoryGeneral: '通用',
    categoryAll: '全部',
    categoryOfficialDesc: 'OpenAI Codex 官方精选的 skills，$skill-installer 可直接安装',
    categoryClaudeDesc: 'Claude Code 用户贡献的 skills 和指令模板',
    categoryHermesDesc: 'Hermes Agent 生态的 skills、插件和自动更新能力',
    categoryOpencodeDesc: 'OpenCode 平台的 skills 和 hooks',
    categoryOpenclawDesc: 'OpenClaw 生态的 skills、模板和工具',
    categoryCommunityDesc: '社区收集的 AI Agent skills 集合，精选高质量项目',
    categoryToolsDesc: '开发者工具、DevOps、Cloud、Testing 相关 skills',
    categoryGeneralDesc: '通用 AI 编程助手、prompt 工程和最佳实践',
    categoryAllDesc: '所有收录的 skills',
    group_figma: 'Figma',
    group_github: 'GitHub',
    group_notion: 'Notion',
    group_playwright: 'Playwright',
    group_deploy: '部署',
    group_security: '安全',
    group_other: '其他',
    group_claude_official: 'Claude 官方',
    group_nicoboss: '个人项目',
    group_community: '社区收集',
    group_skills: 'Skills',
    group_plugins: '插件',
    group_codegen: '代码生成',
    group_general: '通用'
  },
  en: {
    pageTitle: 'Skill Hub — AI Agent Skills Directory',
    metaDesc: 'Skill Hub — Browse skills from OpenAI Codex, Claude Code, Hermes Agent, OpenCode and more. Search across agents, install with one click, and stay up to date with community-driven skill collections.',
    heroTitle: '🔍 Skill Hub',
    heroSub: 'AI Agent Skills Directory',
    heroDesc: 'Browse and search skills from mainstream AI Agent platforms.',
    searchPlaceholder: 'Search skills / repos / descriptions…',
    searchClearTitle: 'Clear',
    emptyState: 'No matching skills found 😕',
    pagePrev: '← Previous',
    pageNext: 'Next →',
    statsTitle: '📊 Statistics',
    statsBySource: 'Distribution by Agent Source',
    statsTopRepos: 'Top 10 Popular Repos',
    aboutTitle: '📚 About',
    aboutP1: 'Skill Hub aggregates skills from <strong>OpenAI Codex</strong>, <strong>Claude Code</strong>, <strong>Hermes Agent</strong>, <strong>OpenCode</strong>, <strong>OpenClaw</strong> and more.<br>The community is growing — <a href="https://github.com/rdone4425/skill" target="_blank">submit your repo</a>!',
    aboutP2: 'Data source: public GitHub repos, auto-updated daily at UTC 00:00.',
    footerDesc: 'Community maintained · Updated daily',
    sortBy: 'Sort',
    groupBy: 'Group',
    viewMode: 'View',
    flatView: 'Cards',
    groupedView: 'Grouped',
    sortStarsDesc: '⭐ Most',
    sortStarsAsc: '⭐ Fewest',
    sortNameAsc: 'A → Z',
    sortNameDesc: 'Z → A',
    groupNone: 'No Group',
    groupAgent: 'By Agent',
    groupType: 'By Type',
    resultsCount: '{count} skills',
    resultsCountFiltered: '{count} skills (of {total})',
    skills: ' skills',
    viewOnGitHub: 'Repo',
    install: 'Install',
    sourceLabel: 'Source',
    groupLabel: 'Type',
    openLink: '🔗',
    categoryOfficial: 'OpenAI Codex',
    categoryClaude: 'Claude Code',
    categoryHermes: 'Hermes Agent',
    categoryOpencode: 'OpenCode',
    categoryOpenclaw: 'OpenClaw',
    categoryCommunity: 'Community',
    categoryTools: 'Dev Tools',
    categoryGeneral: 'General',
    categoryAll: 'All',
    categoryOfficialDesc: 'Official OpenAI Codex curated skills, installable via $skill-installer',
    categoryClaudeDesc: 'Claude Code community skills and instruction templates',
    categoryHermesDesc: 'Hermes Agent ecosystem skills, plugins and auto-update capabilities',
    categoryOpencodeDesc: 'OpenCode platform skills and hooks',
    categoryOpenclawDesc: 'OpenClaw ecosystem skills, templates and tools',
    categoryCommunityDesc: 'Community-curated AI Agent skill collections, hand-picked quality projects',
    categoryToolsDesc: 'Developer tools, DevOps, Cloud and Testing skills',
    categoryGeneralDesc: 'General AI coding assistants, prompt engineering and best practices',
    categoryAllDesc: 'All indexed skills',
    group_figma: 'Figma',
    group_github: 'GitHub',
    group_notion: 'Notion',
    group_playwright: 'Playwright',
    group_deploy: 'Deploy',
    group_security: 'Security',
    group_other: 'Other',
    group_claude_official: 'Claude Official',
    group_nicoboss: 'Personal Projects',
    group_community: 'Community',
    group_skills: 'Skills',
    group_plugins: 'Plugins',
    group_codegen: 'Code Generation',
    group_general: 'General'
  }
};

function getLang() {
  const saved = localStorage.getItem('lang');
  return (saved === 'en' || saved === 'zh') ? saved : 'zh';
}

function setLang(lang) {
  localStorage.setItem('lang', lang);
  applyI18n(lang);
}

function t(key) {
  return I18N[getLang()][key] || key;
}

function applyI18n(lang) {
  const dict = I18N[lang] || I18N.zh;

  document.documentElement.lang = lang;
  document.getElementById('lang-current').textContent = lang === 'zh' ? '中文' : 'EN';

  // 1. data-i18n：纯文本
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      el.textContent = dict[key];
    }
  });

  // 2. data-i18n-html：带 HTML 的文本
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key] !== undefined) {
      el.innerHTML = dict[key];
    }
  });

  // 3. data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) {
      el.placeholder = dict[key];
    }
  });

  // 4. data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key] !== undefined) {
      el.title = dict[key];
    }
  });

  // 5. <title>
  if (dict.pageTitle) {
    document.title = dict.pageTitle;
  }

  // 6. <meta description>
  if (dict.metaDesc) {
    const metaEl = document.querySelector('meta[name="description"]');
    if (metaEl) metaEl.content = dict.metaDesc;
  }

  // 7. Open Graph / Twitter
  if (dict.metaDesc) {
    document.querySelectorAll('meta[property="og:description"], meta[name="twitter:description"]').forEach(m => {
      m.content = dict.metaDesc;
    });
  }
  if (dict.pageTitle) {
    document.querySelectorAll('meta[property="og:title"], meta[name="twitter-title"]').forEach(m => {
      m.content = dict.pageTitle;
    });
  }

  // 8. JSON-LD
  const ld = document.getElementById('ld-json');
  if (ld) {
    try {
      const data = JSON.parse(ld.textContent);
      data.name = dict.heroTitle || data.name;
      data.description = dict.metaDesc || data.description;
      ld.textContent = JSON.stringify(data);
    } catch (e) { /* ignore */ }
  }

  // 9. data-i18n-options：为 <select> 的 <option> 批量翻译
  document.querySelectorAll('[data-i18n-options]').forEach(select => {
    const mapping = select.getAttribute('data-i18n-options');
    mapping.split(',').forEach(pair => {
      const [value, key] = pair.split(':');
      const opt = select.querySelector(`option[value="${value.trim()}"]`);
      if (opt && dict[key.trim()] !== undefined) {
        opt.textContent = dict[key.trim()];
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyI18n(getLang());
});
