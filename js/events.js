/* ==========================================
   events
   ========================================== */
(function () {
  'use strict';

  const hub = window.SkillHub = window.SkillHub || {};
  const s = hub.state;
  const r = hub.render;
  const { state, dom } = s;

  /* ===== Search Suggestions ===== */
  let suggestDebounce = null;

  function hideSearchSuggest() {
    const suggestEl = document.getElementById('search-suggest');
    if (suggestEl) {
      suggestEl.hidden = true;
      suggestEl.innerHTML = '';
    }
  }

  function getSearchSuggestions(keyword, limit) {
    const lower = keyword.toLowerCase().trim();
    if (!lower) return [];

    const data = state.data || [];
    const matches = [];
    const seen = new Set();

    // Exact name match
    for (const skill of data) {
      if (matches.length >= limit * 2) break;
      const name = String(skill.name || '').toLowerCase();
      if (name.includes(lower) && !seen.has(skill.name)) {
        seen.add(skill.name);
        matches.push({
          type: 'name',
          value: skill.name,
          skill: skill,
          priority: name.startsWith(lower) ? 0 : 1,
        });
      }
    }

    // Description match
    for (const skill of data) {
      if (matches.length >= limit * 2) break;
      const desc = String(skill.desc || '').toLowerCase();
      if (desc.includes(lower) && !seen.has('desc:' + skill.name)) {
        seen.add('desc:' + skill.name);
        matches.push({
          type: 'desc',
          value: skill.desc,
          skill: skill,
          priority: 2,
        });
      }
    }

    // Repo match
    for (const skill of data) {
      if (matches.length >= limit * 2) break;
      const repo = String(skill.repo || '').toLowerCase();
      if (repo.includes(lower) && !seen.has('repo:' + skill.repo)) {
        seen.add('repo:' + skill.repo);
        matches.push({
          type: 'repo',
          value: skill.repo,
          skill: skill,
          priority: 3,
        });
      }
    }

    // Category match
    const catLabels = s.CATEGORY_LABELS || {};
    for (const [catId, labels] of Object.entries(catLabels)) {
      if (matches.length >= limit * 2) break;
      const label = (hub.i18n.getLang() === 'zh' ? labels.zh : labels.en) || catId;
      if (label.toLowerCase().includes(lower) && !seen.has('cat:' + catId)) {
        seen.add('cat:' + catId);
        matches.push({
          type: 'category',
          value: label,
          catId: catId,
          priority: 4,
        });
      }
    }

    matches.sort((a, b) => a.priority - b.priority);
    return matches.slice(0, limit);
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function highlightText(text, keyword) {
    if (!keyword) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const lower = keyword.toLowerCase();
    const idx = text.toLowerCase().indexOf(lower);
    if (idx === -1) return escaped;
    return escaped.substring(0, idx) + '<strong>' + escaped.substring(idx, idx + keyword.length) + '</strong>' + escaped.substring(idx + keyword.length);
  }

  function renderSuggestions(results, container) {
    container.innerHTML = '';
    results.forEach((item, index) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'search-suggest-item';
      el.setAttribute('role', 'option');
      el.dataset.index = index;

      let display = '';
      let typeLabel = '';
      if (item.type === 'name') {
        display = highlightText(item.value, state.keyword || '');
        typeLabel = '名称';
      } else if (item.type === 'desc') {
        display = highlightText(item.value, state.keyword || '');
        typeLabel = '描述';
      } else if (item.type === 'repo') {
        display = highlightText(item.value, state.keyword || '');
        typeLabel = '仓库';
      } else if (item.type === 'category') {
        display = highlightText(item.value, state.keyword || '');
        typeLabel = '分类';
      }

      el.innerHTML = '<span>' + display + '</span><span class="suggest-type">' + typeLabel + '</span>';

      el.addEventListener('click', () => {
        if (item.type === 'category' && item.catId) {
          s.selectCategory(item.catId);
          s.ensureDataForCurrentState().then(() => {
            r.renderAll();
          });
        } else if (item.skill) {
          const keyword = item.skill.name || item.value;
          s.setKeyword(keyword);
          if (dom.search) dom.search.value = keyword;
          r.renderListOnly();
        }
        hideSearchSuggest();
      });

      container.appendChild(el);
    });
    container.hidden = false;
  }

  function updateSearchSuggest(keyword) {
    const suggestEl = document.getElementById('search-suggest');
    if (!suggestEl) return;

    if (!keyword || keyword.length < 1) {
      suggestEl.hidden = true;
      return;
    }

    clearTimeout(suggestDebounce);
    suggestDebounce = setTimeout(() => {
      const results = getSearchSuggestions(keyword, 5);
      if (results.length === 0) {
        suggestEl.innerHTML = '<div class="search-suggest-empty"><span>无匹配结果</span></div>';
        suggestEl.hidden = false;
        return;
      }
      renderSuggestions(results, suggestEl);
    }, 80);
  }

  /* ===== Category Quick Entry ===== */
  function initCategoryQuickEntry() {
    const quickEl = document.getElementById('category-quick-entry');
    const scrollEl = document.getElementById('category-quick-scroll');
    if (!quickEl || !scrollEl) return;

    quickEl.hidden = true;

    const renderQuickChips = () => {
      const cats = state.categories || [];
      if (cats.length === 0) return;

      scrollEl.innerHTML = '';
      cats.forEach(cat => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'category-quick-chip' + (state.category === cat.id ? ' active' : '');
        chip.dataset.category = cat.id;
        chip.innerHTML = '<span>' + s.getCategoryLabel(cat.id) + '</span><span class="chip-count">' + (cat.count || 0) + '</span>';
        chip.addEventListener('click', async () => {
          s.selectCategory(cat.id);
          await s.ensureDataForCurrentState();
          r.renderAll();
          scrollEl.querySelectorAll('.category-quick-chip').forEach(c => c.classList.toggle('active', c.dataset.category === cat.id));
        });
        scrollEl.appendChild(chip);
      });
      quickEl.hidden = false;
    };

    const observer = new MutationObserver(() => {
      if ((state.categories || []).length > 0) {
        renderQuickChips();
        observer.disconnect();
      }
    });
    observer.observe(document.getElementById('category-tabs') || document.body, { childList: true });
  }

  /* ===== Main bindEvents ===== */
  function bindEvents() {
    const search = dom.search;

    // Keyboard shortcut: / to focus search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (search) { search.focus(); search.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      }
      // Escape to blur search and hide suggestions
      if (e.key === 'Escape') {
        if (document.activeElement === search) {
          search.blur();
        }
        hideSearchSuggest();
      }
      // Arrow key and Enter for search suggestions
      if (document.activeElement === search && dom['search-suggest'] && !dom['search-suggest'].hidden) {
        const suggestEl = dom['search-suggest'];
        if (!suggestEl) return;
        const activeItem = suggestEl.querySelector('.search-suggest-item:focus');
        const items = suggestEl.querySelectorAll('.search-suggest-item');
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!activeItem && items.length > 0) {
            items[0].focus();
          } else if (activeItem && activeItem.nextElementSibling) {
            activeItem.nextElementSibling.focus();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (activeItem && activeItem.previousElementSibling) {
            activeItem.previousElementSibling.focus();
          }
        } else if (e.key === 'Enter') {
          if (document.activeElement !== search) {
            document.activeElement.click();
          }
        }
      }
    });

    if (search) {
      let timer = null;
      search.addEventListener('input', () => {
        clearTimeout(timer);
        const raw = search.value;
        if (raw.length === 0) {
          hideSearchSuggest();
          s.setKeyword('');
          r.renderListOnly();
          return;
        }
        // Show suggestions immediately
        updateSearchSuggest(raw);
        timer = setTimeout(() => {
          s.setKeyword(raw);
          hub.track.search(raw, (state.data || []).filter(function(item) {
            var kw = raw.toLowerCase();
            return (item.searchText || '').includes(kw) || (item.name || '').toLowerCase().includes(kw);
          }).length);
          r.renderListOnly();
        }, 250);
      });
      // Hide suggestions when clicking outside
      search.addEventListener('blur', () => {
        setTimeout(() => hideSearchSuggest(), 180);
      });
      search.addEventListener('focus', () => {
        if (search.value.length >= 1) {
          updateSearchSuggest(search.value);
        }
      });
    }

    if (dom['search-clear']) {
      dom['search-clear'].addEventListener('click', () => {
        if (dom.search) dom.search.value = '';
        s.setKeyword('');
        hideSearchSuggest();
        r.renderListOnly();
        if (dom.search) dom.search.focus();
      });
    }

    // Trending tag pills click handler
    document.querySelectorAll('.tag-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const tag = pill.getAttribute('data-tag');
        hub.track.tagClick(tag);
        if (dom.search) dom.search.value = tag;
        s.setKeyword(tag);
        hideSearchSuggest();
        r.renderListOnly();
        if (dom.search) dom.search.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    if (dom['sort-select']) {
      dom['sort-select'].addEventListener('change', () => {
        s.setSort(dom['sort-select'].value);
        r.renderListOnly();
      });
    }

    if (dom['view-toggle']) {
      dom['view-toggle'].addEventListener('click', () => {
        s.setViewMode(state.viewMode === 'grouped' ? 'flat' : 'grouped');
        r.renderListOnly();
      });
    }

    if (dom['category-tabs']) {
      dom['category-tabs'].addEventListener('click', async (event) => {
        const expandButton = event.target.closest('.cat-expand');
        if (expandButton) {
          event.preventDefault();
          event.stopPropagation();
          s.toggleExpandedCategory(expandButton.dataset.expandId || null);
          r.renderFilterChrome();
          return;
        }

        const subgroupButton = event.target.closest('.subgroup-tab');
        if (subgroupButton) {
          event.preventDefault();
          const parentItem = subgroupButton.closest('.category-item');
          const parentCategoryButton = parentItem ? parentItem.querySelector('.category-row .cat-tab') : null;
          if (parentCategoryButton && parentCategoryButton.dataset.id) {
            s.selectCategory(parentCategoryButton.dataset.id);
          }
          s.selectSubcategory(subgroupButton.dataset.subcategoryId || null);
          await s.ensureDataForCurrentState();
          r.renderAll();
          return;
        }

        const button = event.target.closest('.cat-tab');
        if (!button || button.closest('.subgroup-tabs-inline')) return;
        event.preventDefault();
        const prevCat = state.category;
        s.selectCategory(button.dataset.id);
        hub.track.categorySelect(button.dataset.id, null);
        await s.ensureDataForCurrentState();
        r.renderAll();
      });
    }

    if (dom['subgroup-tabs']) {
      dom['subgroup-tabs'].addEventListener('click', async (event) => {
        const button = event.target.closest('[data-subcategory-id]');
        if (!button) return;
        s.selectSubcategory(button.dataset.subcategoryId || null);
        hub.track.categorySelect(state.category, button.dataset.subcategoryId || null);
        await s.ensureDataForCurrentState();
        r.renderAll();
      });
    }

    if (dom.results) {
      dom.results.addEventListener('click', (event) => {
        const agentButton = event.target.closest('[data-agent-id]');
        if (agentButton) {
          const nextAgent = agentButton.dataset.agentId;
          s.setAgentFilter(state.agent === nextAgent ? null : nextAgent);
          r.renderAll();
          return;
        }
      });
    }

    if (dom['category-desc']) {
      dom['category-desc'].addEventListener('click', (event) => {
        const clearButton = event.target.closest('[data-clear-agent]');
        if (!clearButton) return;
        s.setAgentFilter(null);
        r.renderAll();
      });
    }

    if (dom['page-prev']) {
      dom['page-prev'].addEventListener('click', () => {
        if (state.page > 1) {
          state.page -= 1;
          r.renderListOnly();
        }
      });
    }

    if (dom['page-next']) {
      dom['page-next'].addEventListener('click', () => {
        state.page += 1;
        r.renderListOnly();
      });
    }
  }

  function setupI18nListener() {
    const langButton = document.getElementById('lang-btn');
    if (!langButton) return;
    langButton.addEventListener('click', () => {
      hub.i18n.setLang(hub.i18n.getLang() === 'zh' ? 'en' : 'zh');
      setTimeout(() => r.renderAll(), 50);
    });
  }

  function setupHistoryListener() {
    window.addEventListener('popstate', async () => {
      const next = { ...s.readStoredState(), ...s.readUrlState() };
      if (typeof next.keyword === 'string') state.keyword = next.keyword;
      if (typeof next.category === 'string') state.category = next.category || 'all';
      state.subcategory = Object.prototype.hasOwnProperty.call(next, 'subcategory') ? (next.subcategory || null) : null;
      state.expandedCategory = Object.prototype.hasOwnProperty.call(next, 'expandedCategory') ? (next.expandedCategory || null) : (state.category !== 'all' ? state.category : null);
      state.agent = Object.prototype.hasOwnProperty.call(next, 'agent') ? (next.agent || null) : null;
      if (typeof next.sort === 'string') state.sort = next.sort || 'stars-desc';
      if (typeof next.viewMode === 'string') state.viewMode = next.viewMode === 'grouped' ? 'grouped' : 'flat';
      state.page = s.parsePositiveInt(next.page, 1);
      await s.ensureDataForCurrentState();
      r.renderAll();
    });
  }

  // Expose on hub
  hub._searchSuggest = { hideSearchSuggest, updateSearchSuggest, getSearchSuggestions };
  hub._categoryQuick = { initCategoryQuickEntry };

  hub.events = {
    bindEvents,
    setupI18nListener,
    setupHistoryListener,
  };

  /* ===== Behavior Tracking Integration ===== */
  function initBehaviorTracking() {
    // Track search
    if (dom.search) {
      dom.search.addEventListener('input', function () {
        // debounced tracking via render side
      });
    }

    // Track sort change
    if (dom['sort-select']) {
      dom['sort-select'].addEventListener('change', function () {
        hub.track.sortChange(dom['sort-select'].value);
      });
    }

    // Track view mode toggle
    if (dom['view-toggle']) {
      dom['view-toggle'].addEventListener('click', function () {
        hub.track.viewModeToggle(s.state.viewMode === 'grouped' ? 'grouped' : 'flat');
      });
    }

    // Track scroll depth (debounced)
    var lastDepth = 0;
    var scrollTimer = null;
    window.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var depth = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
        depth = Math.max(depth, lastDepth);
        if (depth > lastDepth) {
          hub.track.scrollDepth(depth);
          lastDepth = depth;
        }
      }, 500);
    });

    // Track time on page
    var startTime = Date.now();
    window.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        hub.track.timeOnPage(Math.round((Date.now() - startTime) / 1000));
      }
    });
  }

  // Ponytail: expose tracking init — called from app.js after data loads
  hub._track = { initBehaviorTracking: initBehaviorTracking };
})();
