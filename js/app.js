/**
 * app.js — Codex Skills Hub 渲染逻辑
 * 1. 渲染分类 Tab + 子分组 Tab
 * 2. 渲染 Skill 卡片
 * 3. 搜索过滤
 * 4. 复制 install 命令
 * 5. 切换分类
 */

(function () {
  "use strict";

  const data = window.SKILL_DATA;
  if (!data) {
    console.error("SKILL_DATA not loaded");
    return;
  }

  // 源 → 颜色的映射
  const sourceColor = {
    official: "#6366f1",
    community: "#10b981",
    tools: "#f59e0b",
    general: "#ec4899",
  };

  // 源 → 图标
  const sourceIcon = {
    official: "🎯",
    community: "🌟",
    tools: "🛠",
    general: "🤖",
  };

  // 分组 → 中文标签
  const groupLabel = {
    figma: "Figma",
    github: "GitHub",
    notion: "Notion",
    playwright: "Playwright",
    deploy: "Deploy",
    security: "Security",
    other: "Other",
  };

  // 状态
  const state = {
    currentSource: "all",
    currentGroup: null, // 仅 official 下的子分组
    keyword: "",
  };

  // DOM
  const $results = document.getElementById("results");
  const $empty = document.getElementById("empty");
  const $search = document.getElementById("search");
  const $searchClear = document.getElementById("search-clear");
  const $subgroupTabs = document.getElementById("subgroup-tabs");
  const $lastUpdated = document.getElementById("last-updated");
  const $statSkills = document.getElementById("stat-skills");
  const $statSources = document.getElementById("stat-sources");
  const $statStars = document.getElementById("stat-stars");

  // ========== 工具 ==========

  function formatStars(n) {
    if (!n) return "—";
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return String(n);
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) {}
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  // ========== 渲染 ==========

  function renderSkillCard(skill) {
    const color = sourceColor[skill.source] || "var(--accent)";
    const icon = sourceIcon[skill.source] || "📦";
    const card = document.createElement("article");
    card.className = "skill-card";
    card.style.setProperty("--card-accent", color);

    const groupBadge = skill.group
      ? `<span class="card-group">${escapeHtml(groupLabel[skill.group] || skill.group)}</span>`
      : "";

    card.innerHTML = `
      <div class="card-head">
        <span class="card-icon">${icon}</span>
        <div class="card-title-wrap">
          <div class="card-name">${escapeHtml(skill.name)}</div>
          <div class="card-repo">
            <a href="${escapeHtml(skill.url)}" target="_blank" rel="noopener">${escapeHtml(skill.repo)}</a>
            <span class="card-stars">⭐ ${formatStars(skill.stars)}</span>
          </div>
        </div>
      </div>
      <p class="card-desc">${escapeHtml(skill.desc)}</p>
      <div class="card-install" title="${escapeHtml(skill.install)}">
        <code>${escapeHtml(skill.install)}</code>
        <button class="copy-btn" data-install="${escapeHtml(skill.install)}" title="复制">⧉</button>
      </div>
      <div class="card-footer">
        <a class="card-link" href="${escapeHtml(skill.url)}" target="_blank" rel="noopener">
          查看仓库 →
        </a>
        ${groupBadge}
      </div>
    `;
    return card;
  }

  function renderResults() {
    const filtered = data.skills.filter((s) => {
      if (state.currentSource !== "all" && s.source !== state.currentSource) return false;
      if (state.currentGroup && s.group !== state.currentGroup) return false;
      if (state.keyword) {
        const k = state.keyword.toLowerCase();
        const haystack = [
          s.name,
          s.repo,
          s.desc,
          s.group || "",
        ].join(" ").toLowerCase();
        if (!haystack.includes(k)) return false;
      }
      return true;
    });

    $results.innerHTML = "";
    if (filtered.length === 0) {
      $empty.hidden = false;
      return;
    }
    $empty.hidden = true;

    filtered.forEach((s) => {
      $results.appendChild(renderSkillCard(s));
    });
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
      <button class="subgroup-tab ${allActive}" data-group="">全部</button>
      ${groups
        .map(
          (g) =>
            `<button class="subgroup-tab ${state.currentGroup === g.id ? "active" : ""}" data-group="${g.id}">${escapeHtml(g.label)}</button>`
        )
        .join("")}
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

  // ========== 事件绑定 ==========

  function bindCategoryTabs() {
    document.getElementById("category-tabs").addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;
      document.querySelectorAll("#category-tabs .tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      state.currentSource = tab.dataset.source;
      state.currentGroup = null;
      renderSubgroupTabs();
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
      renderResults();
    });
  }

  function bindSearch() {
    $search.addEventListener("input", (e) => {
      state.keyword = e.target.value.trim();
      $searchClear.classList.toggle("visible", state.keyword.length > 0);
      renderResults();
    });
    $searchClear.addEventListener("click", () => {
      $search.value = "";
      state.keyword = "";
      $searchClear.classList.remove("visible");
      $search.focus();
      renderResults();
    });
    // Esc 清空
    $search.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.keyword) {
        $searchClear.click();
      }
    });
  }

  function bindCopy() {
    $results.addEventListener("click", (e) => {
      const btn = e.target.closest(".copy-btn");
      if (!btn) return;
      const text = btn.dataset.install;
      copyToClipboard(text).then(() => {
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

  // 键盘快捷键
  function bindShortcuts() {
    document.addEventListener("keydown", (e) => {
      // "/" 聚焦搜索
      if (e.key === "/" && document.activeElement !== $search) {
        e.preventDefault();
        $search.focus();
        $search.select();
      }
    });
  }

  // ========== 启动 ==========

  function init() {
    renderStats();
    renderSubgroupTabs();
    renderResults();
    bindCategoryTabs();
    bindSubgroupTabs();
    bindSearch();
    bindCopy();
    bindShortcuts();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
