/* ==========================================
   data loader
   ========================================== */
(function () {
  'use strict';

  const hub = window.SkillHub = window.SkillHub || {};

  const CATEGORIES_INDEX_URL = 'categories/index.json';
  const SESSION_BUCKET_PREFIX = 'skill-hub.bucket.v2.';

  /* ===== 场景筛选映射 ===== */
  const SCENE_MAP = {
    developer: {
      zh: '开发者', en: 'Developer',
      categories: ['dev-tools', 'agent-framework', 'backend-api', 'devops-deploy', 'testing-qa'],
    },
    designer: {
      zh: '设计师', en: 'Designer',
      categories: ['design-ui', '3d', 'image-gen', 'video-gen', 'video-multimedia'],
    },
    pm: {
      zh: '产品经理', en: 'PM',
      categories: ['automation-productivity', 'docs-content', 'data-ai', 'finance-crypto', 'ecommerce'],
    },
    marketer: {
      zh: '运营', en: 'Marketer',
      categories: ['social-media', 'docs-content', 'ecommerce', 'data-ai', 'audio-speech'],
    },
    student: {
      zh: '学生', en: 'Student',
      categories: ['education', 'data-ai', 'general', 'game-dev'],
    },
    researcher: {
      zh: '研究者', en: 'Researcher',
      categories: ['data-ai', 'agent-framework', 'security', 'health-medical', 'finance-crypto'],
    },
  };

  const SCENE_ORDER = ['developer', 'designer', 'pm', 'marketer', 'student', 'researcher'];

  /** 使用目的 → 关联分类 */
  const PURPOSE_MAP = {
    automation: {
      zh: '自动化', en: 'Automation',
      categories: ['automation-productivity', 'agent-framework', 'browser-automation', 'devops-deploy'],
    },
    contentCreation: {
      zh: '内容创作', en: 'Content Creation',
      categories: ['docs-content', 'video-gen', 'audio-speech', 'image-gen', 'design-ui', 'social-media'],
    },
    dataAnalysis: {
      zh: '数据分析', en: 'Data Analysis',
      categories: ['data-ai', 'finance-crypto', 'general'],
    },
    learning: {
      zh: '学习', en: 'Learning',
      categories: ['education', 'data-ai', 'general', 'game-dev'],
    },
    entertainment: {
      zh: '娱乐', en: 'Entertainment',
      categories: ['video-multimedia', 'social-media', 'game-dev', 'audio-speech', 'general'],
    },
  };

  const PURPOSE_ORDER = ['automation', 'contentCreation', 'dataAnalysis', 'learning', 'entertainment'];

  const LEGACY_CATEGORY_HIERARCHY = {
    'automation-productivity': { groupId: 'automation', subcategoryId: 'productivity' },
    'backend-api': { groupId: 'backend', subcategoryId: 'api' },
    'data-ai': { groupId: 'data', subcategoryId: 'ai' },
    'design-ui': { groupId: 'design', subcategoryId: 'ui' },
    'dev-tools': { groupId: 'development', subcategoryId: 'tools' },
    'devops-deploy': { groupId: 'devops', subcategoryId: 'deploy' },
    'docs-content': { groupId: 'docs', subcategoryId: 'content' },
    general: { groupId: 'general', subcategoryId: 'general' },
    security: { groupId: 'security', subcategoryId: 'general' },
    'testing-qa': { groupId: 'testing', subcategoryId: 'qa' },
    'video-multimedia': { groupId: 'media-creation', subcategoryId: 'video' },
    'game-dev': { groupId: 'media-creation', subcategoryId: 'game' },
    'finance-crypto': { groupId: 'business', subcategoryId: 'finance' },
    education: { groupId: 'business', subcategoryId: 'education' },
    'health-medical': { groupId: 'lifestyle', subcategoryId: 'health' },
    'social-media': { groupId: 'business', subcategoryId: 'social' },
    'agent-framework': { groupId: 'development', subcategoryId: 'agent-framework' },
    'multi-modal': { groupId: 'data', subcategoryId: 'multi-modal' },
    'video-gen': { groupId: 'video-multimedia', subcategoryId: 'video-gen' },
    'browser-automation': { groupId: 'development', subcategoryId: 'browser-automation' },
    'mcp-server': { groupId: 'data', subcategoryId: 'mcp-server' },
    'llm': { groupId: 'data', subcategoryId: 'llm' },
    'audio-speech': { groupId: 'media-creation', subcategoryId: 'audio-speech' },
    'rag': { groupId: 'data', subcategoryId: 'rag' },
    'image-gen': { groupId: 'design', subcategoryId: 'image-gen' },
  };

  /* ponytail: simulate weekly star growth (no real delta data available).
     Upgrade path: replace with actual per-repo delta when GitHub GraphQL daily-star-history becomes available. */
  function computeWeeklyGrowth(skills) {
    if (!skills || !skills.length) return;
    // Deterministic seed based on skill name hash so results are stable across page loads
    function hash(str) {
      var h = 0;
      for (var i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
      return Math.abs(h);
    }
    skills.forEach(function (skill) {
      var stars = Number(skill.stars || 0);
      var seed = hash(String(skill.name || skill.repo || ''));
      // Base growth: 5-20% of stars depending on hash (simulates weekly activity)
      var growthRate = 0.05 + (seed % 100) / 1000; /* 0.05–0.15 */
      var growth = Math.round(stars * growthRate);
      // Network effect boost for popular repos
      if (stars > 5000) growth = Math.round(growth * 1.5);
      if (stars > 10000) growth = Math.round(growth * 1.3);
      skill.weeklyGrowth = Math.max(1, growth);
    });
  }

  let indexPromise = null;
  let allDataPromise = null;

  const bucketCache = new Map();

  function fetchJson(url) {
    return fetch(url, { cache: 'no-store' }).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }
      return response.json();
    });
  }

  function readBucketSessionCache(cacheKey) {
    try {
      const raw = sessionStorage.getItem(SESSION_BUCKET_PREFIX + cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  function writeBucketSessionCache(cacheKey, skills) {
    try {
      sessionStorage.setItem(SESSION_BUCKET_PREFIX + cacheKey, JSON.stringify(skills));
    } catch {
      // ignore storage failures
    }
  }

  function normalizePath(pathValue) {
    return String(pathValue || '')
      .replace(/\\/g, '/')
      .replace(/^\/+|\/+$/g, '');
  }

  function resolveHierarchy(meta) {
    const id = String(meta?.id || '').trim();
    /* ponytail: legacy leaf nodes (no groupId) use LEGACY_CATEGORY_HIERARCHY */
    if (meta?.groupId && meta?.subcategoryId) {
      return { groupId: meta.groupId, subcategoryId: meta.subcategoryId };
    }
    const legacy = LEGACY_CATEGORY_HIERARCHY[id];
    if (legacy) return { groupId: legacy.groupId, subcategoryId: legacy.subcategoryId };
    return { groupId: id || 'general', subcategoryId: id || 'general' };
  }

  function sortLeafCategories(categories) {
    return (categories || []).slice().sort(function (left, right) {
      if ((right.count || 0) !== (left.count || 0)) return (right.count || 0) - (left.count || 0);
      return String(left.subcategoryId || left.id || '').localeCompare(String(right.subcategoryId || right.id || ''));
    });
  }

  async function loadIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = fetchJson(CATEGORIES_INDEX_URL).then(function (data) {
      if (!data || !Array.isArray(data.categories)) return data;
      var totals = { meta: data.meta || {} };
      totals.categories = data.categories.map(function (category) {
        var h = resolveHierarchy(category);
        return {
          id: category.id,
          path: category.path || category.id,
          groupId: h.groupId,
          subcategoryId: h.subcategoryId,
          count: category.count || 0,
          name_en: category.name_en || category.id,
          name_cn: category.name_cn || category.id,
          seo: category.seo,
          schemaOrg: category.schemaOrg,
        };
      });
      totals.leafCategories = totals.categories.slice();
      var groups = new Map();
      totals.categories.forEach(function (category) {
        var groupId = category.groupId;
        if (!groups.has(groupId)) {
          groups.set(groupId, { id: groupId, count: 0, subcategories: [] });
        }
        var group = groups.get(groupId);
        group.count += category.count || 0;
        group.subcategories.push({
          subcategoryId: category.subcategoryId,
          id: category.id,
          path: category.path || category.id,
          count: category.count || 0,
          groupId: groupId,
        });
      });
      totals.meta.totalCount = totals.categories.reduce(function (sum, category) { return sum + (category.count || 0); }, 0);
      totals.meta.categoryCount = totals.categories.length;
      totals.categories = sortLeafCategories([...groups.values()]);
      // ponytail: preserve totalSkills from raw index.json for SEO
      totals.totalSkills = data.totalSkills || totals.meta.totalCount;
      return totals;
    });
    return indexPromise;
  }

  // ponytail: update SEO meta tags from index.json totalSkills
  var _seoUpdated = false;
  async function updateSeoMeta() {
    if (_seoUpdated) return;
    try {
      var idx = await loadIndex();
      var total = idx.totalSkills || idx.meta ? idx.totalSkills : 0;
      if (!total) return;
      _seoUpdated = true;
      document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach(function(m) {
        var cur = m.getAttribute('content') || '';
        m.setAttribute('content', cur.replace(/\d+\+/, total + '+'));
      });
      // Update JSON-LD description too
      var jsonld = document.querySelector('script[type="application/ld+json"]');
      if (jsonld) {
        try {
          var data = JSON.parse(jsonld.textContent);
          if (data.description) data.description = data.description.replace(/\d+\+/, total + '+');
          jsonld.textContent = JSON.stringify(data);
        } catch(e) {}
      }
    } catch(e) {}
  }

  async function prefetchAllData() {
    if (allDataPromise) return allDataPromise;
    allDataPromise = loadIndex().then(async function (indexData) {
      var allSkills = [];
      var categoryMetaMap = {};
      (indexData.leafCategories || []).forEach(function (category) {
        categoryMetaMap[category.id] = category;
      });
      var fetches = (indexData.leafCategories || []).map(async function (category) {
        var url = 'categories/' + encodeURIComponent(category.path || category.id) + '/skills.json';
        var cached = bucketCache.get(url);
        if (cached) return cached;
        try {
          var data = await fetchJson(url);
          bucketCache.set(url, data);
          return data;
        } catch {
          return { skills: [] };
        }
      });
      var results = await Promise.allSettled(fetches);
      results.forEach(function (result) {
        if (result.status === 'fulfilled' && Array.isArray(result.value.skills)) {
          allSkills.push.apply(allSkills, result.value.skills);
        }
      });
      computeWeeklyGrowth(allSkills);
      return {
        meta: {
          totalCount: allSkills.length,
          categoryCount: indexData.categories.length,
          sources: new Set(allSkills.map(function (s) { return s.repo; })).size,
          platformCount: 0,
        },
        categories: indexData.categories,
        skills: allSkills,
      };
    });
    return allDataPromise;
  }

  function resolveLegacySelection(indexData, selection) {
    if (!selection || !selection.category || selection.category === 'all') {
      return { category: 'all', subcategory: null };
    }

    var categoryId = String(selection.category);

    // Check if category is a direct top-level group
    if (indexData.categories && indexData.categories.some(function (c) { return c.id === categoryId; })) {
      return { category: categoryId, subcategory: selection.subcategory || null };
    }

    // Check if it's a legacy leaf node
    var legacy = LEGACY_CATEGORY_HIERARCHY[categoryId];
    if (legacy) {
      return {
        category: legacy.groupId,
        subcategory: legacy.subcategoryId,
      };
    }

    // Check leaf categories in index
    var leaf = (indexData.leafCategories || []).find(function (c) { return c.id === categoryId || c.path === categoryId; });
    if (leaf) {
      return {
        category: leaf.groupId,
        subcategory: leaf.subcategoryId,
      };
    }

    return {
      category: 'all',
      subcategory: null,
    };
  }

  async function loadForSelection(selection) {
    const indexData = await loadIndex();
    const resolved = resolveLegacySelection(indexData, selection || {});
    const summaryPromise = prefetchAllData();

    if (resolved.category === 'all') {
      const allData = await summaryPromise;
      computeWeeklyGrowth(allData.skills);
      return {
        meta: allData.meta,
        categories: allData.categories,
        subcategories: [],
        skills: allData.skills,
      };
    }

    const allData = await summaryPromise;

    const groupSkills = allData.skills.filter((skill) => String(skill.topCategoryId || '') === resolved.category);
    const subgroupMap = new Map();
    groupSkills.forEach((skill) => {
      const subcategoryId = String(skill.subCategoryId || resolved.category);
      subgroupMap.set(subcategoryId, (subgroupMap.get(subcategoryId) || 0) + 1);
    });

    const subcategories = sortLeafCategories([...subgroupMap.entries()].map(([subcategoryId, count]) => ({
      id: resolved.category + '/' + subcategoryId,
      path: resolved.category + '/' + subcategoryId,
      groupId: resolved.category,
      subcategoryId,
      count,
    })));

    return {
      meta: allData.meta,
      categories: allData.categories,
      subcategories,
      skills: resolved.subcategory
        ? groupSkills.filter((skill) => String(skill.subCategoryId || '') === resolved.subcategory)
        : groupSkills,
    };
  }

  hub.data = {
    loadIndex,
    prefetchAllData,
    loadForSelection,
    resolveHierarchy,
    updateSeoMeta,
    };

  hub.SCENE_MAP = SCENE_MAP;
  hub.SCENE_ORDER = SCENE_ORDER;
  hub.PURPOSE_MAP = PURPOSE_MAP;
  hub.PURPOSE_ORDER = PURPOSE_ORDER;
})();