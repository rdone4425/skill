/* ==========================================
   analytics: A/B testing, user behavior tracking, recommendations
   ponytail: minimal client-only implementation
   ========================================== */
(function () {
  'use strict';

  const hub = window.SkillHub = window.SkillHub || {};

  /* ===== Config ===== */
  var TRACK_ENDPOINT = (hub.config && hub.config.trackEndpoint) || '/api/track';
  var TRACK_KEY = 'skill-hub.track.v1';
  var AB_KEY = 'skill-hub.ab.v1';
  var HISTORY_KEY = 'skill-hub.history.v1';
  var MAX_HISTORY = 50;
  var FLUSH_THRESHOLD = 10; // flush after N events

  /* ===== A/B Testing ===== */
  function getOrCreateBucket() {
    try {
      var stored = localStorage.getItem(AB_KEY);
      if (stored) return stored;
      var bucket = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem(AB_KEY, bucket);
      return bucket;
    } catch (e) {
      return 'A';
    }
  }

  hub.ab = {
    bucket: getOrCreateBucket(),
    isVariantB: function () { return getOrCreateBucket() === 'B'; },
    // ponytail: variant-specific config — add new variants here
    getSortDefault: function () { return getOrCreateBucket() === 'B' ? 'name-asc' : 'stars-desc'; },
    getViewDefault: function () { return getOrCreateBucket() === 'B' ? 'flat' : 'grouped'; },
  };

  /* ===== Event Queue ===== */
  var eventQueue = [];

  function queueEvent(type, data) {
    eventQueue.push(Object.assign({ type: type, ts: Date.now(), ab: hub.ab.bucket }, data));
    if (eventQueue.length >= FLUSH_THRESHOLD) flushEvents();
  }

  function flushEvents() {
    if (eventQueue.length === 0) return;
    var payload = { events: eventQueue.slice(), ua: navigator.userAgent, lang: document.documentElement.lang || 'zh' };
    eventQueue = [];
    try {
      var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(TRACK_ENDPOINT, blob);
      } else {
        fetch(TRACK_ENDPOINT, { method: 'POST', body: blob, keepalive: true }).catch(function () {});
      }
    } catch (e) {
      // silently ignore — tracking must never break the app
    }
  }

  // flush on page unload
  window.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flushEvents();
  });
  window.addEventListener('beforeunload', flushEvents);

  /* ===== Behavior Tracking ===== */
  hub.track = {
    search: function (keyword, resultCount) {
      queueEvent('search', { keyword: keyword, results: resultCount });
    },
    categorySelect: function (categoryId, subcategoryId) {
      queueEvent('category_select', { category: categoryId, subcategory: subcategoryId || '' });
    },
    skillView: function (skill) {
      if (!skill || !skill.name) return;
      addToHistory({ name: skill.name, repo: skill.repo, category: skill.topCategoryId, ts: Date.now() });
      queueEvent('skill_view', { skill: skill.name, repo: skill.repo, stars: skill.stars || 0 });
    },
    skillClick: function (skill, linkType) {
      queueEvent('skill_click', { skill: skill.name || '', repo: skill.repo || '', link: linkType || 'card' });
    },
    tagClick: function (tag) {
      queueEvent('tag_click', { tag: tag });
    },
    agentFilter: function (agentId) {
      queueEvent('agent_filter', { agent: agentId || '' });
    },
    sortChange: function (sortValue) {
      queueEvent('sort_change', { sort: sortValue });
    },
    viewModeToggle: function (mode) {
      queueEvent('view_mode', { mode: mode });
    },
    scrollDepth: function (percent) {
      queueEvent('scroll_depth', { depth: percent });
    },
    timeOnPage: function (seconds) {
      queueEvent('time_on_page', { seconds: seconds });
    },
  };

  /* ===== Browsing History ===== */
  function addToHistory(entry) {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      var history = raw ? JSON.parse(raw) : [];
      // deduplicate by name
      history = history.filter(function (h) { return h.name !== entry.name; });
      history.unshift(entry);
      if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {}
  }

  hub.history = {
    get: function () {
      try {
        var raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    },
    clear: function () {
      try { localStorage.removeItem(HISTORY_KEY); } catch (e) {}
    },
  };

  /* ===== Recommendation Engine ===== */
  hub.recommend = {
    // Content-based: find skills similar to recently viewed
    getSimilar: function (skills, limit) {
      limit = limit || 6;
      var history = hub.history.get();
      if (history.length === 0) return [];

      var viewedCategories = {};
      var viewedRepos = {};
      history.forEach(function (h) {
        if (h.category) viewedCategories[h.category] = (viewedCategories[h.category] || 0) + 1;
        if (h.repo) viewedRepos[h.repo] = true;
      });

      var viewedNames = {};
      history.forEach(function (h) { viewedNames[h.name] = true; });

      // Score each skill
      var scored = skills.map(function (skill) {
        var score = 0;
        var cat = skill.topCategoryId || skill.functionCategory || '';
        score += viewedCategories[cat] || 0;
        // boost higher-starred skills
        score += Math.log((Number(skill.stars) || 1) + 1) * 0.3;
        // penalize already viewed
        if (viewedNames[skill.name]) score -= 100;
        return { skill: skill, score: score };
      });

      scored.sort(function (a, b) { return b.score - a.score; });
      return scored.slice(0, limit).map(function (s) { return s.skill; });
    },

    // Cross-category recommendations: skills from categories the user visited
    getCrossCategory: function (skills, limit) {
      limit = limit || 4;
      var history = hub.history.get();
      if (history.length === 0) return [];

      var topCategories = {};
      history.forEach(function (h) {
        if (h.category) topCategories[h.category] = (topCategories[h.category] || 0) + 1;
      });

      var sortedCats = Object.entries(topCategories).sort(function (a, b) { return b[1] - a[1]; });
      if (sortedCats.length < 2) return [];

      var viewedRepos = {};
      history.forEach(function (h) { if (h.repo) viewedRepos[h.repo] = true; });

      var result = [];
      var seen = new Set();
      history.forEach(function (h) { if (h.name) seen.add(h.name); });

      for (var i = 1; i < sortedCats.length; i++) { // skip top category, pick next
        var cat = sortedCats[i][0];
        var candidates = skills.filter(function (s) {
          return (s.topCategoryId || s.functionCategory || '') === cat && !seen.has(s.name);
        });
        if (candidates.length > 0) {
          candidates.sort(function (a, b) { return (b.stars || 0) - (a.stars || 0); });
          result.push(candidates[0]);
          seen.add(candidates[0].name);
          if (result.length >= limit) break;
        }
      }
      return result;
    },
  };

})();
