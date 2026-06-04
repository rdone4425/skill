/* ==========================================
   stats page
   ========================================== */
(function () {
  'use strict';

  const hub = window.SkillHub = window.SkillHub || {};
  const statsDictionary = {
    zh: {
      title: 'Skill Hub — 统计页',
      summary: '总览',
      distribution: '平台分布',
      distributionByAgent: '按 Agent 分布',
      topRepos: '热门仓库 Top 10',
      details: '平台详情',
      heroSub: '平台与功能分类统计',
      heroDesc: '数据来自 agents 目录的动态聚合结果。',
      home: '← 首页'
    },
    en: {
      title: 'Skill Hub — Stats',
      summary: 'Overview',
      distribution: 'Platform Distribution',
      distributionByAgent: 'By Agent',
      topRepos: 'Top 10 Repos',
      details: 'Platform Details',
      heroSub: 'Platform and functional category statistics',
      heroDesc: 'Data is aggregated dynamically from the agents directory.',
      home: '← Home'
    }
  };

  function applyPageI18n() {
    const lang = hub.i18n.getLang();
    const dict = statsDictionary[lang] || statsDictionary.zh;

    document.title = dict.title;

    const heroSub = document.querySelector('.hero-sub');
    const heroDesc = document.querySelector('.hero-desc');
    const summaryTitle = document.getElementById('stats-summary-title');
    const distributionTitle = document.getElementById('stats-distribution-title');
    const agentTitle = document.getElementById('stats-agent-title');
    const distributionByAgent = document.querySelector('.stats-chart-wrap h3');
    const topRepos = document.querySelector('.stats-bars-wrap h3');
    const homeLink = document.querySelector('.main-nav a[href="index.html"]');

    if (heroSub) heroSub.textContent = dict.heroSub;
    if (heroDesc) heroDesc.textContent = dict.heroDesc;
    if (summaryTitle) summaryTitle.textContent = dict.summary;
    if (distributionTitle) distributionTitle.textContent = dict.distribution;
    if (agentTitle) agentTitle.textContent = dict.details;
    if (distributionByAgent) distributionByAgent.textContent = dict.distributionByAgent;
    if (topRepos) topRepos.textContent = dict.topRepos;
    if (homeLink) homeLink.textContent = dict.home;
  }

  function renderSummary(data) {
    const wrap = document.getElementById('stats-summary');
    if (!wrap) return;

    const repos = new Set((data.skills || []).map(skill => skill.repo));
    const agents = new Set((data.skills || []).map(skill => skill.agent || 'other'));
    const categories = new Set((data.skills || []).map(skill => skill.group || 'general'));

    const cards = [
      ['Skills', data.skills.length],
      ['Agents', agents.size],
      ['Repos', repos.size],
      ['Categories', categories.size]
    ];

    wrap.innerHTML = cards.map(([label, value]) => `
      <article class="stats-summary-card">
        <div class="stats-summary-label">${label}</div>
        <div class="stats-summary-value">${value}</div>
      </article>
    `).join('');
  }

  function renderAgentCards(data) {
    const wrap = document.getElementById('stats-agent-grid');
    if (!wrap) return;

    const map = new Map();
    (data.skills || []).forEach(skill => {
      const agent = skill.agent || 'other';
      if (!map.has(agent)) {
        map.set(agent, {
          count: 0,
          stars: 0,
          categories: new Set()
        });
      }
      const item = map.get(agent);
      item.count += 1;
      item.stars += skill.stars || 0;
      item.categories.add(skill.group || 'general');
    });

    wrap.innerHTML = Array.from(map.entries())
      .sort((a, b) => (hub.state.getAgentMeta(a[0]).order || 999) - (hub.state.getAgentMeta(b[0]).order || 999))
      .map(([agent, item]) => {
        const meta = hub.state.getAgentMeta(agent);
        return `
          <article class="stats-agent-card">
            <div class="stats-agent-title">
              <span>${meta.icon || '📦'} ${hub.state.getAgentLabel(agent)}</span>
              <span>${item.count}</span>
            </div>
            <div class="stats-agent-meta">
              <div class="stats-agent-line"><span>分类数</span><span>${item.categories.size}</span></div>
              <div class="stats-agent-line"><span>总 Stars</span><span>${hub.state.STAR_FMT(item.stars)}</span></div>
            </div>
          </article>
        `;
      }).join('');
  }

  function renderStatsTable(data) {
    const byAgent = {};
    (data.skills || []).forEach(skill => {
      const agent = skill.agent || 'other';
      byAgent[agent] = (byAgent[agent] || 0) + 1;
    });

    const sortedAgents = Object.entries(byAgent).sort((a, b) => b[1] - a[1]);
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

      table.innerHTML = sortedAgents.map(([agent, count]) => {
        const pct = (count / data.skills.length * 100).toFixed(1);
        const meta = hub.state.getAgentMeta(agent);
        return `<div class="stats-row">
          <span class="stats-label">${meta.icon || '📦'} ${hub.state.getAgentLabel(agent)}</span>
          <div class="stats-bar-bg">
            <div class="stats-bar-fill" style="width:${pct}%;background:${meta.color || '#6366f1'}"></div>
          </div>
          <span class="stats-count">${count} (${pct}%)</span>
        </div>`;
      }).join('');
    }

    const repoMap = {};
    (data.skills || []).forEach(skill => {
      repoMap[skill.repo] = (repoMap[skill.repo] || 0) + 1;
    });

    const topRepos = Object.entries(repoMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const maxCount = topRepos.length ? topRepos[0][1] : 1;
    const bars = document.getElementById('stats-bars');
    if (bars) {
      bars.innerHTML = topRepos.map(([repo, count]) => {
        const pct = (count / maxCount * 100).toFixed(1);
        return `<div class="stats-row">
          <a class="stats-label link" href="https://github.com/${repo}" target="_blank">${repo.split('/')[1] || repo}</a>
          <div class="stats-bar-bg">
            <div class="stats-bar-fill" style="width:${pct}%"></div>
          </div>
          <span class="stats-count">${count}</span>
        </div>`;
      }).join('');
    }
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

    const data = window.SKILL_DATA || window.SKILLS_DATA;
    if (data) {
      renderSummary(data);
      renderStatsTable(data);
      renderAgentCards(data);
      return;
    }

    if (window.SKILL_DATA_PROMISE && typeof window.SKILL_DATA_PROMISE.then === 'function') {
      window.SKILL_DATA_PROMISE.then(loaded => {
        renderSummary(loaded);
        renderStatsTable(loaded);
        renderAgentCards(loaded);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
