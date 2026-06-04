/**
 * app.js — Skill Hub 渲染逻辑
 * 1. 渲染分类 Tab + 子分组 Tab + 分类描述
 * 2. 渲染 Skill 卡片
 * 3. 搜索过滤 + 排序
 * 4. 分页
 * 5. 复制 install 命令
 * 6. 统计图表
 * 7. 中英文 UI 切换（via i18n.js）
 */

(function () {
  "use strict";

  const data = window.SKILL_DATA;
  const I18N = window.I18N;
  if (!data) { console.error("SKILL_DATA not loaded"); return; }
  if (!I18N) { console.error("I18N not loaded"); return; }

  const idToI18nKey = (id) => id[0].toUpperCase() + id.slice(1);

  // ========== 状态 ==========
  const state = {
    currentSource: "all",
    currentGroup: null,
    keyword: "",
    sortBy: "stars-desc",
    page: 1,
    perPage: 24,
  };

  // ========== DOM ==========
  const $ = (id) => document.getElementById(id);
  const $results = $("results");
  const $empty = $("empty");
  const $search = $("search");
  const $searchClear = $("search-clear");
  const $subgroupTabs = $("subgroup-tabs");
  const $lastUpdated = $("last-updated");
  const $statSkills = $("stat-skills");
  const $statSources = $("stat-sources");
  const $statStars = $("stat-stars");
  const $categoryDesc = $("category-desc");
  const $sortSelect = $("sort-select");
  const $resultsCount = $("results-count");
  const $pagination = $("pagination");
  const $pagePrev = $("page-prev");
  const $pageNext = $("page-next");
  const $pageInfo = $("page-info");

  // ========== 工具 ==========

  function formatStars(n) {
    if (!n) return "—";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return String(n);
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  // ========== 渲染 ==========

  function getCategory(id) {
    return data.categories.find((c) => c.id === id);
  }

  function groupI18nKey(groupId) {
    return "group" + groupId[0].toUpperCase() + groupId.slice(1);
  }

  function renderCategoryTabs() {
    const nav = $("category-tabs");
    if (!nav) return;
    const allTab = '<button class="tab active" data-source="all" role="tab">' +
      '<span class="tab-icon">◉</span><span data-i18n="tabAll">' + I18N.t("tabAll") + '</span>' +
      '</button>';
    const catTabs = data.categories.map((c) => {
      const key = idToI18nKey(c.id);
      const isActive = state.currentSource === c.id;
      return `<button class="tab ${isActive ? "active" : ""}" data-source="${c.id}" role="tab">` +
        `<span class="tab-icon">${c.icon}</span>` +
        `<span data-i18n="tab${key}">${I18N.t("tab" + key) || c.label}</span>` +
        '</button>';
    }).join('');
    nav.innerHTML = allTab + catTabs;
  }

  function renderSkillCard(skill) {
    const cat = getCategory(skill.source);
    const color = (cat && cat.color) || "var(--accent)";
    const icon = (cat && cat.icon) || "📦";
    const card = document.createElement("article");
    card.className = "skill-card";
    card.style.setProperty("--card-accent", color);

    const groupLabel = skill.group
      ? `<span class="card-group">${escapeHtml(I18N.t(groupI18nKey(skill.group)) || skill.group)}</span>`
      : "";

    card.innerHTML = `
      <div class="card-head">
        <span class="card-icon">${icon}</span>
        <div class="card-title-wrap">
          <div class="card-name">${escapeHtml(skill.name)}</div>
          <div class="card-repo">
            <a href="${escapeHtml(skill.url)}" target="_blank" rel="noopener">${escapeHtml(skill.repo)}</a>
            <span class="card-stars" title="${I18N.t("starsTitle")}">⭐ ${formatStars(skill.stars)}</span>
          </div>
        </div>
      </div>
      <p class="card-desc">${escapeHtml(skill.desc)}</p>
      <div class="card-install" title="${escapeHtml(skill.install)}">
        <code>${escapeHtml(skill.install)}</code>
        <button class="copy-btn" data-install="${escapeHtml(skill.install)}" title="${I18N.t("copy")}">⧉</button>
      </div>
      <div class="card-footer">
        <a class="card-link" href="${escapeHtml(skill.url)}" target="_blank" rel="noopener">
          ${escapeHtml(I18N.t("viewRepo"))}
        </a>
        ${groupLabel}
      </div>
    `;
    return card;
  }

  function renderCategoryDesc() {
    if (state.currentSource === "all") {
      $categoryDesc.hidden = true;
      $categoryDesc.innerHTML = "";
      return;
    }
    const key = "cat" + idToI18nKey(state.currentSource);
    $categoryDesc.hidden = false;
    $categoryDesc.textContent = I18N.t(key);
  }

  function getFilteredSkills() {
    return data.skills.filter((s) => {
      if (state.currentSource !== "all" && s.source !== state.currentSource) return false;
      if (state.currentGroup && s.group !== state.currentGroup) return false;
      if (state.keyword) {
        const k = state.keyword.toLowerCase();
        const haystack = [s.name, s.repo, s.desc, s.group || ""].join(" ").toLowerCase();
        if (!haystack.includes(k)) return false;
      }
      return true;
    });
  }

  function sortSkills(skills) {
    const sorted = [...skills];
    switch (state.sortBy) {
      case "stars-desc":
        sorted.sort((a, b) => (b.stars || 0) - (a.stars || 0));
        break;
      case "stars-asc":
        sorted.sort((a, b) => (a.stars || 0) - (b.stars || 0));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    return sorted;
  }

  function renderResults() {
    const filtered = sortSkills(getFilteredSkills());
    const total = filtered.length;
    const totalPages = Math.ceil(total / state.perPage);
    if (state.page > totalPages) state.page = Math.max(1, totalPages);

    const start = (state.page - 1) * state.perPage;
    const pageItems = filtered.slice(start, start + state.perPage);

    $results.innerHTML = "";

    if (total === 0) {
      $empty.hidden = false;
      $pagination.hidden = true;
      $resultsCount.textContent = "";
      return;
    }
    $empty.hidden = true;

    // 结果计数
    $resultsCount.textContent = I18N.get() === "zh"
      ? `共 ${total} 个 skill`
      : `${total} skills total`;

    pageItems.forEach((s) => {
      $results.appendChild(renderSkillCard(s));
    });

    // 分页
    if (totalPages > 1) {
      $pagination.hidden = false;
      $pageInfo.textContent = `${state.page} / ${totalPages}`;
      $pagePrev.disabled = state.page <= 1;
      $pageNext.disabled = state.page >= totalPages;
    } else {
      $pagination.hidden = true;
    }
  }

  function renderSubgroupTabs() {
    if (state.currentSource !== "official") {
      $subgroupTabs.hidden = true;
      $subgroupTabs.innerHTML = "";
      state.currentGroup = null;
      return;
    }
    const groups = data.categories.find((c) => c.id === "official").groups;
    if (!groups || groups.length === 0) {
      $subgroupTabs.hidden = true;
      return;
    }
    $subgroupTabs.hidden = false;
    const allActive = state.currentGroup === null ? "active" : "";
    $subgroupTabs.innerHTML = `
      <button class="subgroup-tab ${allActive}" data-group="">${escapeHtml(I18N.t("subgroupAll"))}</button>
      ${groups.map((g) =>
        `<button class="subgroup-tab ${state.currentGroup === g.id ? "active" : ""}" data-group="${g.id}">${escapeHtml(I18N.t(groupI18nKey(g.id)) || g.label)}</button>`
      ).join("")}
    `;
  }

  function renderStats() {
    $statSkills.textContent = data.skills.length;
    const sources = new Set(data.skills.map((s) => s.repo));
    $statSources.textContent = sources.size;
    const totalStars = data.skills.reduce((sum, s) => sum + (s.stars || 0), 0);
    $statStars.textContent = formatStars(totalStars);
    $lastUpdated.textContent = data.meta.lastUpdated;
  }

  // ========== 统计图表（纯 CSS/HTML 实现，无需 Chart.js） ==========

  function renderStatsCharts() {
    renderSourceChart();
    renderTopReposBars();
  }

  function renderSourceChart() {
    const canvas = $("stats-chart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // 按 source 统计
    const counts = {};
    data.skills.forEach((s) => {
      counts[s.source] = (counts[s.source] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total = data.skills.length;

    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444", "#f97316", "#84cc16", "#a855f7"];

    // 饼图
    const cx = W * 0.35;
    const cy = H * 0.5;
    const r = Math.min(cx, cy) - 20;
    let startAngle = -Math.PI / 2;

    entries.forEach(([source, count], i) => {
      const slice = (count / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      startAngle += slice;
    });

    // 中心白圆（甜甜圈效果）
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#0a0a0c";
    ctx.fill();

    // 中心文字
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#fafafa";
    ctx.font = "bold 22px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total, cx, cy - 8);
    ctx.font = "12px -apple-system, sans-serif";
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text-3").trim() || "#71717a";
    ctx.fillText("skills", cx, cy + 12);

    // 图例
    const legendX = W * 0.65;
    let legendY = 30;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    entries.slice(0, 8).forEach(([source, count], i) => {
      const cat = getCategory(source);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(legendX, legendY - 5, 12, 12);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text-2").trim() || "#a1a1aa";
      ctx.font = "12px -apple-system, sans-serif";
      const label = (cat && cat.label) || source;
      ctx.fillText(`${label} (${count})`, legendX + 18, legendY + 1);
      legendY += 22;
    });
  }

  function renderTopReposBars() {
    const container = $("stats-bars");
    if (!container) return;

    // 按 repo 统计 skills 数量
    const repoCounts = {};
    const repoStars = {};
    data.skills.forEach((s) => {
      repoCounts[s.repo] = (repoCounts[s.repo] || 0) + 1;
      repoStars[s.repo] = s.stars || 0;
    });
    const entries = Object.entries(repoCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const maxCount = entries[0] ? entries[0][1] : 1;

    container.innerHTML = entries.map(([repo, count], i) => `
      <div class="bar-item">
        <div class="bar-label">
          <span class="bar-rank">#${i + 1}</span>
          <a href="https://github.com/${repo}" target="_blank" rel="noopener" class="bar-repo">${repo}</a>
          <span class="bar-count">${count} skills · ${formatStars(repoStars[repo])} ⭐</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${(count / maxCount * 100)}%"></div>
        </div>
      </div>
    `).join('');
  }

  // ========== 事件绑定 ==========

  function bindCategoryTabs() {
    $("category-tabs").addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;
      document.querySelectorAll("#category-tabs .tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      state.currentSource = tab.dataset.source;
      state.currentGroup = null;
      state.page = 1;
      renderSubgroupTabs();
      renderCategoryDesc();
      renderResults();
    });
  }

  function bindSubgroupTabs() {
    $subgroupTabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".subgroup-tab");
      if (!tab) return;
      document.querySelectorAll(".subgroup-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      state.currentGroup = tab.dataset.group || null;
      state.page = 1;
      renderResults();
    });
  }

  function bindSearch() {
    $search.addEventListener("input", (e) => {
      state.keyword = e.target.value.trim();
      state.page = 1;
      $searchClear.classList.toggle("visible", state.keyword.length > 0);
      renderResults();
    });
    $searchClear.addEventListener("click", () => {
      $search.value = "";
      state.keyword = "";
      state.page = 1;
      $searchClear.classList.remove("visible");
      $search.focus();
      renderResults();
    });
    $search.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.keyword) {
        $searchClear.click();
      }
    });
  }

  function bindSort() {
    $sortSelect.addEventListener("change", (e) => {
      state.sortBy = e.target.value;
      state.page = 1;
      renderResults();
    });
  }

  function bindPagination() {
    $pagePrev.addEventListener("click", () => {
      if (state.page > 1) {
        state.page--;
        renderResults();
        $("results").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    $pageNext.addEventListener("click", () => {
      state.page++;
      renderResults();
      $("results").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function bindCopy() {
    $results.addEventListener("click", (e) => {
      const btn = e.target.closest(".copy-btn");
      if (!btn) return;
      copyToClipboard(btn.dataset.install).then(() => {
        const orig = btn.textContent;
        btn.textContent = "✓";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = orig;
          btn.classList.remove("copied");
        }, 1200);
      });
    });
  }

  function bindLanguage() {
    document.querySelector(".lang-switcher").addEventListener("click", (e) => {
      const btn = e.target.closest(".lang-btn");
      if (!btn) return;
      I18N.set(btn.dataset.lang);
    });
  }

  function bindLanguageChange() {
    window.addEventListener("languagechange", () => {
      renderCategoryTabs();
      renderSubgroupTabs();
      renderCategoryDesc();
      renderResults();
    });
  }

  function bindShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== $search) {
        e.preventDefault();
        $search.focus();
        $search.select();
      }
    });
  }

  // ========== 启动 ==========

  function init() {
    I18N.apply();
    renderCategoryTabs();
    renderStats();
    renderCategoryDesc();
    renderSubgroupTabs();
    renderResults();
    renderStatsCharts();
    bindCategoryTabs();
    bindSubgroupTabs();
    bindSearch();
    bindSort();
    bindPagination();
    bindCopy();
    bindLanguage();
    bindLanguageChange();
    bindShortcuts();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
