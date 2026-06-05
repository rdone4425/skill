/* ==========================================
   i18n
   ========================================== */
(function () {
  'use strict';

  const hub = window.SkillHub = window.SkillHub || {};

  const dictionary = {
    zh: {
      pageTitle: 'Skill Hub - AI Agent Skills 导航站',
      metaDesc: '按功能分类浏览 AI Agent Skills，支持平台兼容筛选、搜索、排序与统计。',
      heroTitle: 'Skill Hub',
      heroSub: '功能分类驱动的 AI Agent Skills 导航',
      heroDesc: '分类来自目录自动发现，平台标签支持点选叠加筛选。',
      searchPlaceholder: '搜索 skills / 仓库 / 描述...',
      searchClearTitle: '清空',
      emptyState: '没有找到匹配的 skill',
      pagePrev: '上一页',
      pageNext: '下一页',
      aboutTitle: '关于',
      aboutP1: 'Skill Hub 现在以<strong>功能分类</strong>为主组织 skill，同时保留 <strong>Claude Code</strong>、<strong>Codex</strong>、<strong>Cursor</strong> 等平台兼容标签，方便跨平台筛选。',
      aboutP2: '数据来自仓库内的 <code>categories/</code> 目录，新增分类时只需创建一个目录，生成脚本会自动补齐索引与统计。',
      footerDesc: '社区维护 · 数据自动汇总',
      sortBy: '排序',
      sortStarsDesc: 'Stars 从高到低',
      sortStarsAsc: 'Stars 从低到高',
      sortNameAsc: '名称 A-Z',
      sortNameDesc: '名称 Z-A',
      resultsCount: '{count} 个 skill',
      resultsCountFiltered: '{count} 个 skill（当前集合共 {total} 个）',
      skills: '技能',
      categoriesLabel: '分类',
      platformsLabel: '平台',
      reposLabel: '仓库',
      viewOnGitHub: '查看仓库',
      install: '安装',
      installCopied: '已复制',
      categoryAll: '全部',
      categoryAllDesc: '所有功能分类',
      activeCategory: '当前分类',
      activePlatform: '当前平台',
      clearPlatformFilter: '清除平台筛选',
    },
    en: {
      pageTitle: 'Skill Hub - AI Agent Skills Directory',
      metaDesc: 'Browse AI agent skills by function category with platform compatibility filters, search, sorting, and stats.',
      heroTitle: 'Skill Hub',
      heroSub: 'Function-category-first AI agent skills directory',
      heroDesc: 'Categories are discovered from directories, and platform chips act as additive filters.',
      searchPlaceholder: 'Search skills / repos / descriptions...',
      searchClearTitle: 'Clear',
      emptyState: 'No matching skills found',
      pagePrev: 'Previous',
      pageNext: 'Next',
      aboutTitle: 'About',
      aboutP1: 'Skill Hub now organizes skills by <strong>function category</strong> first while keeping compatibility chips for <strong>Claude Code</strong>, <strong>Codex</strong>, <strong>Cursor</strong>, and more.',
      aboutP2: 'Data comes from the repository <code>categories/</code> directory. Creating a new category directory is enough for the generator to add index and stats output.',
      footerDesc: 'Community maintained · Auto-generated data',
      sortBy: 'Sort',
      sortStarsDesc: 'Stars high to low',
      sortStarsAsc: 'Stars low to high',
      sortNameAsc: 'Name A-Z',
      sortNameDesc: 'Name Z-A',
      resultsCount: '{count} skills',
      resultsCountFiltered: '{count} skills (of {total} in the current set)',
      skills: 'Skills',
      categoriesLabel: 'Categories',
      platformsLabel: 'Platforms',
      reposLabel: 'Repos',
      viewOnGitHub: 'View repo',
      install: 'Install',
      installCopied: 'Copied',
      categoryAll: 'All',
      categoryAllDesc: 'All function categories',
      activeCategory: 'Active category',
      activePlatform: 'Active platform',
      clearPlatformFilter: 'Clear platform filter',
    },
  };

  function getLang() {
    const saved = localStorage.getItem('skill-hub.lang') || localStorage.getItem('lang');
    if (saved === 'en' || saved === 'zh') return saved;
    return navigator.language && navigator.language.startsWith('zh') ? 'zh' : 'en';
  }

  function t(key) {
    return dictionary[getLang()][key] || key;
  }

  function applyI18n(lang) {
    const dict = dictionary[lang] || dictionary.zh;
    document.documentElement.lang = lang;

    const langElement = document.getElementById('lang-current');
    if (langElement) langElement.textContent = lang === 'zh' ? '中文' : 'EN';

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (dict[key] !== undefined) element.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach((element) => {
      const key = element.getAttribute('data-i18n-html');
      if (dict[key] !== undefined) element.innerHTML = dict[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const key = element.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) element.placeholder = dict[key];
    });

    document.querySelectorAll('[data-i18n-title]').forEach((element) => {
      const key = element.getAttribute('data-i18n-title');
      if (dict[key] !== undefined) element.title = dict[key];
    });

    if (dict.pageTitle) document.title = dict.pageTitle;

    if (dict.metaDesc) {
      const metaElement = document.querySelector('meta[name="description"]');
      if (metaElement) metaElement.content = dict.metaDesc;
    }

    document.querySelectorAll('[data-i18n-options]').forEach((select) => {
      const mapping = select.getAttribute('data-i18n-options');
      mapping.split(',').forEach((pair) => {
        const [value, key] = pair.split(':');
        const option = select.querySelector(`option[value="${value.trim()}"]`);
        if (option && dict[key.trim()] !== undefined) {
          option.textContent = dict[key.trim()];
        }
      });
    });
  }

  function setLang(lang) {
    localStorage.setItem('skill-hub.lang', lang);
    localStorage.setItem('lang', lang);
    applyI18n(lang);
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  hub.i18n = {
    dictionary,
    getLang,
    setLang,
    t,
    applyI18n,
  };
})();
