/* ==========================================
   stats page
   ========================================== */
(function () {
  'use strict';

  const hub = window.SkillHub = window.SkillHub || {};

  function applyPageI18n() {
    // title handled by data-i18n flow via i18n.js, but we override with stats-specific
    document.title = hub.i18n.t('statsTitle');
    // meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = hub.i18n.t('statsMetaDesc');
  }

  function getStatsCategoryId(skill) {
    return hub.state.getSkillTopCategory(skill);
  }

  function renderSummary(data) {
    const wrap = document.getElementById('stats-summary');
    if (!wrap) return;

    const repos = new Set((data.skills || []).map((skill) => skill.repo).filter(Boolean));
    const platforms = new Set((data.skills || []).flatMap((skill) => skill.supportedAgents || []));
    const categories = new Set((data.skills || []).map(getStatsCategoryId));
    const totalStars = (data.skills || []).reduce((sum, skill) => sum + Number(skill.stars || 0), 0);

    const cards = [
      [hub.i18n.t('skills'), data.skills.length],
      [hub.i18n.t('reposLabel'), repos.size],
      [hub.i18n.t('categoriesLabel'), categories.size],
      [hub.i18n.t('platformsLabel'), platforms.size],
      [hub.i18n.t('starsLabel'), hub.state.STAR_FMT(totalStars)],
    ];

    wrap.innerHTML = cards.map(([label, value]) => `
      <article class="stats-summary-card">
        <div class="stats-summary-label">${label}</div>
        <div class="stats-summary-value">${value}</div>
      </article>
    `).join('');
  }

  function renderPlatformCards(data) {
    const wrap = document.getElementById('stats-agent-grid');
    if (!wrap) return;

    const map = new Map();
    (data.skills || []).forEach((skill) => {
      const supportedAgents = Array.isArray(skill.supportedAgents) && skill.supportedAgents.length > 0
        ? skill.supportedAgents
        : ['other'];

      supportedAgents.forEach((agentId) => {
        if (!map.has(agentId)) {
          map.set(agentId, {
            count: 0,
            stars: 0,
            categories: new Set(),
          });
        }
        const item = map.get(agentId);
        item.count += 1;
        item.stars += Number(skill.stars || 0);
        item.categories.add(getStatsCategoryId(skill));
      });
    });

    wrap.innerHTML = Array.from(map.entries())
      .sort((left, right) => (hub.state.getAgentMeta(left[0]).order || 999) - (hub.state.getAgentMeta(right[0]).order || 999))
      .map(([agentId, item]) => {
        const meta = hub.state.getAgentMeta(agentId);
        return `
          <article class="stats-agent-card">
            <div class="stats-agent-title">
              <span>${meta.iconUrl
                ? `<img class="agent-mark agent-mark-inline" src="${meta.iconUrl}" alt="${hub.state.getAgentLabel(agentId)}" loading="lazy" referrerpolicy="no-referrer">`
                : meta.icon || '?'} ${hub.state.getAgentLabel(agentId)}</span>
              <span>${item.count}</span>
            </div>
            <div class="stats-agent-meta">
              <div class="stats-agent-line"><span>${hub.i18n.t('categoriesLabel')}</span><span>${item.categories.size}</span></div>
              <div class="stats-agent-line"><span>${hub.i18n.t('starsLabel')}</span><span>${hub.state.STAR_FMT(item.stars)}</span></div>
            </div>
          </article>
        `;
      }).join('');
  }

  function renderStatsTable(data) {
    const byCategory = new Map();
    (data.skills || []).forEach((skill) => {
      const category = getStatsCategoryId(skill);
      byCategory.set(category, (byCategory.get(category) || 0) + 1);
    });

    const sortedCategories = Array.from(byCategory.entries()).sort((left, right) => right[1] - left[1]);
    const chartWrap = document.getElementById('stats-chart');

    if (chartWrap) {
      const parent = chartWrap.parentElement;
      let table = parent.querySelector('.stats-table');
      if (!table) {
        chartWrap.style.display = 'none';
        table = document.createElement('div');
        table.className = 'stats-table';
        parent.appendChild(table);
      }

      table.innerHTML = sortedCategories.map(([categoryId, count]) => {
        const pct = data.skills.length > 0 ? (count / data.skills.length * 100).toFixed(1) : '0.0';
        return `<div class="stats-row">
          <span class="stats-label">${hub.state.getCategoryLabel(categoryId)}</span>
          <div class="stats-bar-bg">
            <div class="stats-bar-fill" style="width:${pct}%"></div>
          </div>
          <span class="stats-count">${count} (${pct}%)</span>
        </div>`;
      }).join('');
    }

    const repoMap = new Map();
    (data.skills || []).forEach((skill) => {
      if (!skill.repo) return;
      repoMap.set(skill.repo, (repoMap.get(skill.repo) || 0) + 1);
    });

    const topRepos = Array.from(repoMap.entries()).sort((left, right) => right[1] - left[1]).slice(0, 10);
    const maxCount = topRepos.length ? topRepos[0][1] : 1;
    const bars = document.getElementById('stats-bars');
    if (bars) {
      bars.innerHTML = topRepos.map(([repo, count]) => {
        const pct = (count / maxCount * 100).toFixed(1);
        return `<div class="stats-row">
          <a class="stats-label link" href="https://github.com/${repo}" target="_blank" rel="noopener noreferrer">${repo}</a>
          <div class="stats-bar-bg">
            <div class="stats-bar-fill" style="width:${pct}%"></div>
          </div>
          <span class="stats-count">${count}</span>
        </div>`;
      }).join('');
    }
  }

  function renderLoadedData(data) {
    if (!data) return;
    renderSummary(data);
    renderStatsTable(data);
    renderPlatformCards(data);
  }

  function loadStatsData() {
    const directData = window.SKILL_DATA || window.SKILLS_DATA;
    if (directData) {
      return Promise.resolve(directData);
    }

    if (window.SKILL_DATA_PROMISE && typeof window.SKILL_DATA_PROMISE.then === 'function') {
      return window.SKILL_DATA_PROMISE;
    }

    if (hub.data && typeof hub.data.loadForSelection === 'function') {
      return hub.data.loadForSelection({
        category: 'all',
      });
    }

    return Promise.resolve(null);
  }

  function init() {
    hub.i18n.applyI18n(hub.i18n.getLang());
    applyPageI18n();

    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        hub.i18n.setLang(hub.i18n.getLang() === 'zh' ? 'en' : 'zh');
        applyPageI18n();
      });
    }

    window.addEventListener('langchange', applyPageI18n);

    loadStatsData()
      .then(renderLoadedData)
      .catch((error) => console.error('Failed to load stats data', error));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
