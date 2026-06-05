/* ==========================================
   data loader
   ========================================== */
(function () {
  'use strict';

  const hub = window.SkillHub = window.SkillHub || {};

  const CATEGORIES_INDEX_URL = 'categories/index.json';
  const SESSION_BUCKET_PREFIX = 'skill-hub.bucket.';

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

  function normalizeSkill(skill, categoryId) {
    const install = String(skill.install || '').trim();
    const functionCategory = String(skill.functionCategory || categoryId || 'general').trim() || 'general';
    const supportedAgents = Array.isArray(skill.supportedAgents)
      ? [...new Set(skill.supportedAgents.map((agentId) => String(agentId || '').trim()).filter(Boolean))]
      : [];

    const normalized = {
      ...skill,
      functionCategory,
      supportedAgents,
      install,
    };

    normalized.searchText = [
      normalized.name,
      normalized.desc,
      normalized.repo,
      normalized.install,
      normalized.functionCategory,
      ...supportedAgents,
    ].filter(Boolean).join(' ').toLowerCase();

    return normalized;
  }

  function createMeta(index, overrides) {
    const next = overrides || {};
    return {
      title: 'Skill Hub',
      description: 'AI agent skill directory',
      lastUpdated: index.generatedAt || '',
      totalCount: index.totalSkills || 0,
      sources: next.sources || 0,
      categoryCount: Array.isArray(index.categories) ? index.categories.length : 0,
      platformCount: Array.isArray(index.platforms) ? index.platforms.length : 0,
    };
  }

  function prepareBuckets(index) {
    return (index.categories || []).map((category) => ({
      id: category.id,
      count: category.count || 0,
      cacheKey: String(category.id || 'general'),
      url: `categories/${category.id}/skills.json`,
    }));
  }

  function loadBucket(bucket) {
    if (bucketCache.has(bucket.cacheKey)) {
      return bucketCache.get(bucket.cacheKey);
    }

    const cached = readBucketSessionCache(bucket.cacheKey);
    if (cached) {
      const cachedPromise = Promise.resolve(cached);
      bucketCache.set(bucket.cacheKey, cachedPromise);
      return cachedPromise;
    }

    const promise = fetchJson(bucket.url).then((payload) => {
      const skills = (payload.skills || []).map((skill) => normalizeSkill(skill, bucket.id));
      writeBucketSessionCache(bucket.cacheKey, skills);
      return skills;
    });

    bucketCache.set(bucket.cacheKey, promise);
    return promise;
  }

  async function loadBuckets(buckets) {
    const groups = await Promise.all(buckets.map(loadBucket));
    return groups.flat();
  }

  function createSummaryFromSkills(index, skills) {
    const repoCount = new Set((skills || []).map((skill) => skill.repo).filter(Boolean)).size;
    return {
      meta: createMeta(index, {
        sources: repoCount,
      }),
      categories: (index.categories || []).map((category) => ({
        id: category.id,
        count: category.count || 0,
      })),
      skills,
      sources: repoCount,
    };
  }

  function loadIndex() {
    if (indexPromise) return indexPromise;

    indexPromise = fetchJson(CATEGORIES_INDEX_URL).then((index) => ({
      raw: index,
      meta: createMeta(index),
      categories: (index.categories || []).map((category) => ({
        id: category.id,
        count: category.count || 0,
      })),
      buckets: prepareBuckets(index),
      platforms: index.platforms || [],
    }));

    return indexPromise;
  }

  function prefetchAllData() {
    if (allDataPromise) return allDataPromise;

    allDataPromise = loadIndex().then(async (indexData) => {
      const skills = await loadBuckets(indexData.buckets);
      return createSummaryFromSkills(indexData.raw, skills);
    });

    return allDataPromise;
  }

  async function loadForSelection(selection) {
    const indexData = await loadIndex();
    const summaryPromise = prefetchAllData();

    if (selection.category === 'all') {
      const allData = await summaryPromise;
      return {
        meta: allData.meta,
        categories: allData.categories,
        skills: allData.skills,
      };
    }

    const bucket = indexData.buckets.find((item) => item.id === selection.category);
    const [allData, skills] = await Promise.all([
      summaryPromise,
      bucket ? loadBucket(bucket) : Promise.resolve([]),
    ]);

    return {
      meta: allData.meta,
      categories: allData.categories,
      skills,
    };
  }

  hub.data = {
    loadIndex,
    prefetchAllData,
    loadForSelection,
  };
})();
