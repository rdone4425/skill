/**
 * Skill Hub 主应用
 * 功能：搜索、分组过滤、分组视图、分页、排序、统计
 */

(function () {
  'use strict';

  /* ---------- 常量 ---------- */
  const PER_PAGE = 24;
  const STAR_FMT = n => n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : n.toLocaleString();

  /* Agent 来源元数据 */
  const AGENT_META = {
    official: { icon: '🎯', color: '#6366f1', order: 1 },
    claude:   { icon: '🟠', color: '#fb923c', order: 2 },
    hermes:   { icon: '⚡', color: '#06b6d4', order: 3 },
    opencode: { icon: '🟢', color: '#22c55e', order: 4 },
    openclaw: { icon: '🐾', color: '#f97316', order: 5 },
    community:{ icon: '👥', color: '#a855f7', order: 6 },
    tools:    { icon: '🛠️', color: '#f59e0b', order: 7 },
    general:  { icon: '📚', color: '#6b7280', order: 8 }
  };

  /* ---------- 状态 ---------- */
  const state = {
    data: [],
    categories: [],
    keyword: '',
    category: 'all',
    subgroup: null,
    sort: 'stars-desc',
    groupBy: 'agent',
    viewMode: 'grouped',
    page: 1
  };

  /* ---------- DOM 缓存 ---------- */
  const dom = {};
  function cacheDom() {
    ['search', 'search-clear', 'results', 'empty', 'results-count',
     'category-tabs', 'subgroup-tabs', 'category-desc',
     'stats-section', 'stats-chart', 'stats-bars',
     'pagination', 'page-info', 'page-prev', 'page-next',
     'sort-select', 'group-select', 'view-toggle'
    ].forEach(id => { dom[id] = document.getElementById(id); });
  }

  /* ---------- 过滤 + 排序 ---------- */
  function getFiltered() {
    let list = state.data;

    // 分类过滤
    if (state.category !== 'all') {
      list = list.filter(s => s.source === state.category);
    }
    if (state.subgroup) {
      list = list.filter(s => s.group === state.subgroup);
    }

    // 关键词过滤
    if (state.keyword) {
      const kw = state.keyword.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(kw) ||
        s.desc.toLowerCase().includes(kw) ||
        s.repo.toLowerCase().includes(kw)
      );
    }

    // 排序
    const [field, dir] = state.sort.split('-');
    const mul = dir === 'asc' ? 1 : -1;
    if (field === 'stars') {
      list = [...list].sort((a, b) => (a.stars - b.stars) * mul);
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name) * mul);
    }

    return list;
  }

  /* ---------- 渲染：分类 Tab ---------- */
  function renderCategoryTabs() {
    const wrap = dom['category-tabs'];
    if (!wrap) return;
    const lang = getLang();
    wrap.innerHTML = '';

    const allTab = document.createElement('button');
    allTab.className = 'cat-tab' + (state.category === 'all' ? ' active' : '');
    allTab.dataset.id = 'all';
    allTab.textContent = I18N[lang].categoryAll;
    wrap.appendChild(allTab);

    state.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'cat-tab' + (state.category === cat.id ? ' active' : '');
      btn.dataset.id = cat.id;
      btn.innerHTML = `${cat.icon} ${cat.label}`;
      wrap.appendChild(btn);
    });

    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.cat-tab');
      if (!btn) return;
      state.category = btn.dataset.id;
      state.subgroup = null;
      state.page = 1;
      renderCategoryTabs();
      renderSubgroupTabs();
      renderCategoryDesc();
      render();
    });
  }

  /* ---------- 渲染：子分组 Tab ---------- */
  function renderSubgroupTabs() {
    const wrap = dom['subgroup-tabs'];
    if (!wrap) return;
    const lang = getLang();
    wrap.innerHTML = '';
    wrap.hidden = true;

    if (state.category === 'all') return;

    const cat = state.categories.find(c => c.id === state.category);
    if (!cat || !cat.groups || cat.groups.length === 0) return;

    wrap.hidden = false;

    const allBtn = document.createElement('button');
    allBtn.className = 'sub-tab' + (!state.subgroup ? ' active' : '');
    allBtn.dataset.group = '';
    allBtn.textContent = I18N[lang].categoryAll;
    wrap.appendChild(allBtn);

    cat.groups.forEach(grp => {
      const btn = document.createElement('button');
      btn.className = 'sub-tab' + (state.subgroup === grp.id ? ' active' : '');
      btn.dataset.group = grp.id;
      const labelKey = 'group_' + grp.id.replace(/-/g, '_');
      btn.textContent = I18N[lang][labelKey] || grp.label;
      wrap.appendChild(btn);
    });

    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.sub-tab');
      if (!btn) return;
      state.subgroup = btn.dataset.group || null;
      state.page = 1;
      renderSubgroupTabs();
      render();
    });
  }

  /* ---------- 渲染：分类描述 ---------- */
  function renderCategoryDesc() {
    const el = dom['category-desc'];
    if (!el) return;
    const lang = getLang();
    el.hidden = true;

    if (state.category === 'all') {
      el.textContent = I18N[lang].categoryAllDesc;
      el.hidden = false;
      return;
    }

    const key = `category${state.category.charAt(0).toUpperCase() + state.category.slice(1)}Desc`;
    if (I18N[lang][key]) {
      el.textContent = I18N[lang][key];
      el.hidden = false;
    }
  }

  /* ---------- 渲染：卡片（单个 skill） ---------- */
  function createCard(skill) {
    const lang = getLang();
    const meta = AGENT_META[skill.source] || {};
    const color = meta.color || '#6b7280';
    const icon = meta.icon || '📦';
    const agentLabel = I18N[lang][`category${skill.source.charAt(0).toUpperCase() + skill.source.slice(1)}`] || skill.source;
    const groupKey = 'group_' + skill.group.replace(/-/g, '_');
    const groupLabel = I18N[lang][groupKey] || skill.group;

    const card = document.createElement('article');
    card.className = 'card';
    card.style.setProperty('--accent', color);
    card.innerHTML = `
      <div class="card-header">
        <span class="skill-name">${skill.name}</span>
        <span class="repo-stars" title="${skill.stars.toLocaleString()}">⭐ ${STAR_FMT(skill.stars)}</span>
      </div>
      <p class="skill-desc">${skill.desc}</p>
      <div class="card-meta">
        <span class="source-tag" style="background:${color}20;color:${color}">${icon} ${agentLabel}</span>
        <span class="group-tag">🏷️ ${groupLabel}</span>
      </div>
      <div class="card-actions">
        <a class="btn-link" href="https://github.com/${skill.repo}" target="_blank" rel="noopener">🔗 ${I18N[lang].viewOnGitHub}</a>
        <span class="btn-install" title="${skill.install}">$ ${skill.install}</span>
      </div>
    `;
    return card;
  }

  /* ---------- 渲染：分组视图（Agent → Type） ---------- */
  function renderGroupedView(list) {
    const lang = getLang();
    const grouped = {};

    // 按 agent 分组
    list.forEach(skill => {
      const agent = skill.source;
      if (!grouped[agent]) grouped[agent] = {};
      const group = skill.group || 'other';
      if (!grouped[agent][group]) grouped[agent][group] = [];
      grouped[agent][group].push(skill);
    });

    // 按 agent order 排序
    const agentKeys = Object.keys(grouped).sort((a, b) => {
      return (AGENT_META[a]?.order || 99) - (AGENT_META[b]?.order || 99);
    });

    const container = document.createDocumentFragment();

    agentKeys.forEach(agent => {
      const meta = AGENT_META[agent] || {};
      const agentLabel = I18N[lang][`category${agent.charAt(0).toUpperCase() + agent.slice(1)}`] || agent;
      const color = meta.color || '#6b7280';
      const icon = meta.icon || '📦';
      const groups = grouped[agent];
      const totalCount = Object.values(groups).reduce((sum, arr) => sum + arr.length, 0);

      const section = document.createElement('section');
      section.className = 'agent-section';
      section.style.setProperty('--agent-color', color);

      // Agent header
      const header = document.createElement('div');
      header.className = 'agent-header';
      header.innerHTML = `
        <div class="agent-header-left">
          <span class="agent-icon">${icon}</span>
          <h2 class="agent-title">${agentLabel}</h2>
          <span class="agent-count">${totalCount} ${I18N[lang].skills}</span>
        </div>
        <span class="agent-toggle">▼</span>
      `;

      const content = document.createElement('div');
      content.className = 'agent-content';

      // 按 group 排序（other 放最后）
      const groupKeys = Object.keys(groups).sort((a, b) => {
        if (a === 'other') return 1;
        if (b === 'other') return -1;
        return a.localeCompare(b);
      });

      groupKeys.forEach(group => {
        const skills = groups[group];
        const groupKey = 'group_' + group.replace(/-/g, '_');
        const groupLabel = I18N[lang][groupKey] || group;

        const groupSection = document.createElement('div');
        groupSection.className = 'type-group';

        const groupHeader = document.createElement('div');
        groupHeader.className = 'type-header';
        groupHeader.innerHTML = `
          <h3 class="type-title">🏷️ ${groupLabel}</h3>
          <span class="type-count">${skills.length}</span>
        `;

        const grid = document.createElement('div');
        grid.className = 'card-grid';

        skills.forEach(skill => {
          grid.appendChild(createCard(skill));
        });

        groupSection.appendChild(groupHeader);
        groupSection.appendChild(grid);
        content.appendChild(groupSection);
      });

      section.appendChild(header);
      section.appendChild(content);
      container.appendChild(section);

      // 折叠交互
      header.addEventListener('click', () => {
        section.classList.toggle('collapsed');
      });
    });

    return container;
  }

  /* ---------- 渲染：卡片网格（平铺） ---------- */
  function renderFlatView(list) {
    const container = document.createDocumentFragment();
    list.forEach(skill => {
      container.appendChild(createCard(skill));
    });
    return container;
  }

  /* ---------- 渲染：统计 ---------- */
  function renderStats() {
    const section = dom['stats-section'];
    if (!section) return;

    // 统计来源分布
    const bySource = {};
    state.data.forEach(s => {
      bySource[s.source] = (bySource[s.source] || 0) + 1;
    });

    const colors = ['#6366f1','#fb923c','#06b6d4','#22c55e','#f97316','#a855f7','#f59e0b','#6b7280'];
    const sortedSources = Object.entries(bySource).sort((a, b) => b[1] - a[1]);

    // 渲染表格（代替图表）
    const chartWrap = dom['stats-chart'];
    if (chartWrap) {
      const parent = chartWrap.parentElement;
      // 替换 canvas 为表格
      let table = parent.querySelector('.stats-table');
      if (!table) {
        chartWrap.style.display = 'none';
        table = document.createElement('div');
        table.className = 'stats-table';
        parent.appendChild(table);
      }

      table.innerHTML = sortedSources.map(([src, count], i) => {
        const pct = (count / state.data.length * 100).toFixed(1);
        const meta = AGENT_META[src] || {};
        const lang = getLang();
        const label = I18N[lang][`category${src.charAt(0).toUpperCase() + src.slice(1)}`] || src;
        return `<div class="stats-row">
          <span class="stats-label">${meta.icon || '📦'} ${label}</span>
          <div class="stats-bar-bg">
            <div class="stats-bar-fill" style="width:${pct}%;background:${meta.color || colors[i]}"></div>
          </div>
          <span class="stats-count">${count} (${pct}%)</span>
        </div>`;
      }).join('');
    }

    // 热门仓库
    const repoMap = {};
    state.data.forEach(s => {
      repoMap[s.repo] = (repoMap[s.repo] || 0) + 1;
    });
    const topRepos = Object.entries(repoMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const maxCount = topRepos.length > 0 ? topRepos[0][1] : 1;

    const barsWrap = dom['stats-bars'];
    if (barsWrap) {
      barsWrap.innerHTML = topRepos.map(([repo, count]) => {
        const pct = (count / maxCount * 100).toFixed(1);
        const shortName = repo.split('/')[1] || repo;
        return `<div class="stats-row">
          <a class="stats-label link" href="https://github.com/${repo}" target="_blank">${shortName}</a>
          <div class="stats-bar-bg">
            <div class="stats-bar-fill" style="width:${pct}%"></div>
          </div>
          <span class="stats-count">${count}</span>
        </div>`;
      }).join('');
    }
  }

  /* ---------- 渲染：分页 ---------- */
  function renderPagination(totalPages) {
    const nav = dom['pagination'];
    if (!nav) return;
    nav.hidden = totalPages <= 1;
    if (totalPages <= 1) return;

    const info = dom['page-info'];
    if (info) info.textContent = `${state.page} / ${totalPages}`;

    const prev = dom['page-prev'];
    const next = dom['page-next'];
    if (prev) prev.disabled = state.page <= 1;
    if (next) next.disabled = state.page >= totalPages;
  }

  /* ---------- 主渲染 ---------- */
  function render() {
    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    if (state.page > totalPages) state.page = totalPages;

    const start = (state.page - 1) * PER_PAGE;
    const pageData = filtered.slice(start, start + PER_PAGE);

    const results = dom.results;
    if (results) {
      results.innerHTML = '';
      results.className = state.viewMode === 'flat' ? 'results card-grid' : 'results results-grouped';

      if (state.viewMode === 'grouped') {
        const fragment = renderGroupedView(filtered);
        results.appendChild(fragment);
        // 分组视图不需要分页
        renderPagination(1);
      } else {
        const fragment = renderFlatView(pageData);
        results.appendChild(fragment);
        renderPagination(totalPages);
      }
    }

    const empty = dom.empty;
    if (empty) empty.hidden = filtered.length > 0;

    const countEl = dom['results-count'];
    if (countEl) {
      if (state.keyword || state.category !== 'all') {
        countEl.textContent = t('resultsCountFiltered')
          .replace('{count}', filtered.length)
          .replace('{total}', state.data.length);
      } else {
        countEl.textContent = t('resultsCount').replace('{count}', state.data.length);
      }
    }
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    // 搜索
    const search = dom.search;
    if (search) {
      let timer = null;
      search.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          state.keyword = search.value.trim();
          state.page = 1;
          render();
        }, 250);
      });
    }

    const clearBtn = dom['search-clear'];
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const input = dom.search;
        if (input) input.value = '';
        state.keyword = '';
        state.page = 1;
        render();
        if (input) input.focus();
      });
    }

    // 排序
    const sortSel = dom['sort-select'];
    if (sortSel) {
      sortSel.value = state.sort;
      sortSel.addEventListener('change', () => {
        state.sort = sortSel.value;
        state.page = 1;
        render();
      });
    }

    // 分组
    const groupSel = dom['group-select'];
    if (groupSel) {
      groupSel.value = state.groupBy;
      groupSel.addEventListener('change', () => {
        state.groupBy = groupSel.value;
        state.viewMode = groupSel.value === 'none' ? 'flat' : 'grouped';
        state.page = 1;
        render();
      });
    }

    // 视图切换按钮
    const viewToggle = dom['view-toggle'];
    if (viewToggle) {
      viewToggle.addEventListener('click', () => {
        state.viewMode = state.viewMode === 'grouped' ? 'flat' : 'grouped';
        state.page = 1;
        render();
        viewToggle.textContent = state.viewMode === 'grouped' ? '📋' : '📊';
        viewToggle.title = state.viewMode === 'grouped' ? t('flatView') : t('groupedView');
      });
    }

    // 分页
    if (dom['page-prev']) {
      dom['page-prev'].addEventListener('click', () => {
        if (state.page > 1) { state.page--; render(); }
      });
    }
    if (dom['page-next']) {
      dom['page-next'].addEventListener('click', () => {
        state.page++;
        render();
      });
    }
  }

  /* ---------- i18n 监听 ---------- */
  function setupI18nListener() {
    const observer = new MutationObserver(() => {
      renderCategoryTabs();
      renderSubgroupTabs();
      renderCategoryDesc();
      render();
    });

    // 监听语言切换按钮
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        setTimeout(() => {
          renderCategoryTabs();
          renderSubgroupTabs();
          renderCategoryDesc();
          render();
        }, 50);
      });
    }
  }

  /* ---------- 初始化 ---------- */
  function init() {
    cacheDom();

    // 加载数据
    if (window.SKILLS_DATA) {
      state.data = window.SKILLS_DATA.skills || [];
      state.categories = window.SKILLS_DATA.categories || [];
    }

    renderCategoryTabs();
    renderSubgroupTabs();
    renderCategoryDesc();
    bindEvents();
    renderStats();
    render();
    setupI18nListener();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
