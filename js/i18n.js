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
      brandSubtitle: '功能分类导航',
      heroSub: '功能分类驱动的 AI Agent Skills 导航',
      heroDesc: '分类来自目录自动发现，平台标签支持点选叠加筛选。',
      navStats: '统计页',
      navGitHub: '仓库',
      filtersLabel: '筛选',
      categorySectionTitle: '功能分类',
      resultsLabel: '结果',
      toggleLanguage: '切换语言',
      searchPlaceholder: '搜索 skills / API关键词 / 仓库 / 描述...',
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
      resultsCount: '共 {count} 个 skill',
      resultsCountFiltered: '当前 {count} / 全部 {total}',
      skills: '技能',
      categoriesLabel: '分类',
      platformsLabel: '平台',
      reposLabel: '仓库',
      viewOnGitHub: '查看仓库',
      copyCommand: '复制命令',
      copyCommandCopied: '已复制',
      viewModeFlat: '平铺',
      viewModeGrouped: '分组',
      pricingFree: '免费',
      pricingFreemium: '增值',
      pricingPaid: '付费',
      affiliateLabel: '推荐',
      promoTitle: '推广内容',
      promoDesc: '以下平台与工具支持 Skill Hub，欢迎了解！',
      viewModeSwitchToFlat: '切换到平铺视图',
      viewModeSwitchToGrouped: '切换到分组视图',
      expandCategory: '展开子分类',
      collapseCategory: '收起子分类',
      categoryAll: '全部',
      categoryAllDesc: '所有功能分类',
      activeCategory: '当前分类',
      activePlatform: '当前平台',
      clearPlatformFilter: '清除平台筛选',
      recTitle: '为你推荐',
      recDesc: '基于你的浏览记录精选',
      trendingTitle: '热门趋势',
      trendingDesc: '最高星标的优质 Skill，最近更新活跃',
      relatedTitle: '相关技能',
      relatedDesc: '基于当前分类为你发现更多',
      skipToMain: '跳到主要内容',
      toggleLanguage: '切换语言',
      toggleView: '切换视图',
      flatView: '平铺',
      groupedView: '分组',
      labelSearch: '搜索 skills',
      clearSearch: '清空',
      searchSuggestions: '搜索建议',
      navHome: '返回首页',
      statsHeroSub: '功能分类与平台兼容统计',
      statsHeroDesc: '数据来自 categories 目录自动生成的索引和技能集合。',
      statsOverview: '总览',
      statsDistribution: '分类分布',
      statsByCategory: '按功能分类',
      statsTopRepos: '热门仓库 Top 10',
      statsPlatformCoverage: '平台覆盖',
      statsTitle: 'Skill Hub - 统计页',
      statsMetaDesc: 'Skill Hub 统计页：功能分类分布、平台覆盖率、热门仓库排名。数据自动汇总。',
      statsSummaryLabel: '总览',
      statsDistributionLabel: '分类分布',
      statsByCategoryLabel: '按功能分类',
      statsTopReposLabel: '热门仓库 Top 10',
      statsPlatformCoverageLabel: '平台覆盖',
      statsHeroSub: '功能分类与平台兼容统计',
      statsHeroDesc: '数据来自 categories 目录自动生成的索引和技能集合。',
      starsLabel: 'Stars',
    },
    en: {
      pageTitle: 'Skill Hub - AI Agent Skills Directory',
      metaDesc: 'Browse AI agent skills by function category with platform compatibility filters, search, sorting, and stats.',
      heroTitle: 'Skill Hub',
      brandSubtitle: 'Function-first directory',
      heroSub: 'Function-category-first AI agent skills directory',
      heroDesc: 'Categories are discovered from directories, and platform chips act as additive filters.',
      navStats: 'Stats',
      navGitHub: 'GitHub',
      filtersLabel: 'Filters',
      categorySectionTitle: 'Categories',
      resultsLabel: 'Results',
      toggleLanguage: 'Toggle language',
      searchPlaceholder: 'Search skills / API keywords / repos / descriptions...',
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
      resultsCountFiltered: '{count} of {total}',
      skills: 'Skills',
      categoriesLabel: 'Categories',
      platformsLabel: 'Platforms',
      reposLabel: 'Repos',
      viewOnGitHub: 'View repo',
      copyCommand: 'Copy command',
      copyCommandCopied: 'Copied',
      viewModeFlat: 'Flat',
      viewModeGrouped: 'Grouped',
      pricingFree: 'Free',
      pricingFreemium: 'Freemium',
      pricingPaid: 'Paid',
      affiliateLabel: 'Recommended',
      promoTitle: 'Featured',
      promoDesc: 'These tools and platforms support Skill Hub. Check them out!',
      viewModeSwitchToFlat: 'Switch to flat view',
      viewModeSwitchToGrouped: 'Switch to grouped view',
      expandCategory: 'Expand subcategories',
      collapseCategory: 'Collapse subcategories',
      categoryAll: 'All',
      categoryAllDesc: 'All function categories',
      activeCategory: 'Active category',
      activePlatform: 'Active platform',
      clearPlatformFilter: 'Clear platform filter',
      recTitle: 'Recommended for You',
      recDesc: 'Picked based on your browsing history',
      trendingTitle: 'Trending',
      trendingDesc: 'Top-starred quality skills, actively updated',
      relatedTitle: 'Related Skills',
      relatedDesc: 'Discover more based on this category',
      skipToMain: 'Skip to main content',
      toggleLanguage: 'Toggle language',
      toggleView: 'Toggle view',
      flatView: 'Flat',
      groupedView: 'Grouped',
      labelSearch: 'Search skills',
      clearSearch: 'Clear',
      searchSuggestions: 'Search suggestions',
      navHome: 'Home',
      statsHeroSub: 'Category distribution & platform coverage',
      statsHeroDesc: 'Data auto-generated from the categories directory index and skill collections.',
      statsOverview: 'Overview',
      statsDistribution: 'Category Distribution',
      statsByCategory: 'By Function Category',
      statsTopRepos: 'Top 10 Repos',
      statsPlatformCoverage: 'Platform Coverage',
      statsTitle: 'Skill Hub - Stats',
      statsMetaDesc: 'Skill Hub stats: category distribution, platform coverage, and top repos. Data auto-generated.',
      statsSummaryLabel: 'Overview',
      statsDistributionLabel: 'Category Distribution',
      statsByCategoryLabel: 'By Function Category',
      statsTopReposLabel: 'Top 10 Repos',
      statsPlatformCoverageLabel: 'Platform Coverage',
      statsHeroSub: 'Function categories and platform compatibility',
      statsHeroDesc: 'Data is auto-generated from the categories directory index and skill buckets.',
      starsLabel: 'Stars',
    },
  };

  function getLang() {
    const saved = localStorage.getItem('skill-hub.lang') || localStorage.getItem('lang');
    if (saved === 'en' || saved === 'zh') return saved;
    return navigator.language && navigator.language.startsWith('zh') ? 'zh' : 'en';
  }

  function t(key) {
    const current = dictionary[getLang()] || {};
    const english = dictionary.en || {};
    const chinese = dictionary.zh || {};
    return current[key] || english[key] || chinese[key] || key;
  }

  function applyI18n(lang) {
    const dict = dictionary[lang] || dictionary.zh;
    document.documentElement.lang = lang;

    const langElement = document.getElementById('lang-current');
    if (langElement) langElement.textContent = lang === 'zh' ? '中文' : 'EN';

    const langButton = document.getElementById('lang-btn');
    if (langButton && dict.toggleLanguage) {
      langButton.title = dict.toggleLanguage;
      langButton.setAttribute('aria-label', dict.toggleLanguage);
    }

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
