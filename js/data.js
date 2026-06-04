/**
 * Skill Hub — dynamic data loader
 * 从 agents 目录动态汇总数据，避免在前端硬编码完整数据集。
 */

(function () {
  'use strict';

  const AGENT_META = {
    codex:    { icon: '🎯', color: '#6366f1', order: 1, label: 'Codex', description: '面向 Codex 生态的 skills、工具和资源' },
    claude:   { icon: '🟠', color: '#fb923c', order: 2, label: 'Claude Code', description: '面向 Claude Code 生态的 skills、工具和资源' },
    hermes:   { icon: '⚡', color: '#06b6d4', order: 3, label: 'Hermes Agent', description: '面向 Hermes Agent 生态的 skills、工具和资源' },
    opencode: { icon: '🟢', color: '#22c55e', order: 4, label: 'OpenCode', description: '面向 OpenCode 生态的 skills、工具和资源' },
    openclaw: { icon: '🐾', color: '#f97316', order: 5, label: 'OpenClaw', description: '面向 OpenClaw 生态的 skills、工具和资源' },
    cursor:   { icon: '🖱️', color: '#10b981', order: 6, label: 'Cursor', description: '面向 Cursor 生态的 skills、工具和资源' },
    copilot:  { icon: '🧭', color: '#0ea5e9', order: 7, label: 'GitHub Copilot', description: '面向 GitHub Copilot 生态的 skills、工具和资源' },
    gemini:   { icon: '💠', color: '#8b5cf6', order: 8, label: 'Gemini', description: '面向 Gemini 生态的 skills、工具和资源' },
    multi:    { icon: '🧩', color: '#a855f7', order: 90, label: 'Multi-Agent', description: '同时面向多个 Agent 生态的 skills、工具和资源' },
    other:    { icon: '📦', color: '#6b7280', order: 99, label: 'Other', description: '暂未识别到明确 Agent 名称的 skills、工具和资源' }
  };

  const AGENTS_INDEX_URL = 'agents/index.json';

  function ensureMeta(agentId) {
    return AGENT_META[agentId] || {
      icon: '📦',
      color: '#6b7280',
      order: 999,
      label: agentId,
      description: `面向 ${agentId} 生态的 skills、工具和资源`
    };
  }

  function buildCategories(skills) {
    const byAgent = new Map();

    skills.forEach(skill => {
      const agentId = skill.agent || 'other';
      const functionCategory = skill.functionCategory || 'general';
      if (!byAgent.has(agentId)) {
        byAgent.set(agentId, new Set());
      }
      byAgent.get(agentId).add(functionCategory);
    });

    return Array.from(byAgent.entries())
      .map(([agentId, groups]) => {
        const meta = ensureMeta(agentId);
        return {
          id: agentId,
          label: meta.label,
          description: meta.description,
          icon: meta.icon,
          color: meta.color,
          order: meta.order,
          groups: Array.from(groups)
            .sort((a, b) => a.localeCompare(b))
            .map(group => ({ id: group, label: group }))
        };
      })
      .sort((a, b) => (a.order || 999) - (b.order || 999) || a.label.localeCompare(b.label));
  }

  function normalizeSkill(skill) {
    return {
      ...skill,
      agent: skill.agent || 'other',
      rawGroup: skill.group || null,
      group: skill.functionCategory || skill.group || 'general'
    };
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`);
    }
    return response.json();
  }

  async function loadSkillData() {
    const index = await fetchJson(AGENTS_INDEX_URL);
    const bucketFiles = (index.buckets || []).map(bucket => `agents/${bucket.agent}/${bucket.functionCategory}/skills.json`);
    const skillPayloads = await Promise.all(bucketFiles.map(fetchJson));

    const skills = skillPayloads
      .flatMap(payload => payload.skills || [])
      .map(normalizeSkill);

    const repos = new Set(skills.map(skill => skill.repo));
    const data = {
      meta: {
        title: 'Skill Hub',
        description: 'AI Agent Skills 导航站 — 数据来自 agents 目录',
        lastUpdated: index.generatedAt ? index.generatedAt.slice(0, 10) : '',
        totalCount: skills.length,
        sources: repos.size
      },
      categories: buildCategories(skills),
      skills
    };

    window.SKILL_DATA = data;
    window.SKILLS_DATA = data;
    return data;
  }

  window.SKILL_DATA_PROMISE = loadSkillData()
    .then(data => {
      window.dispatchEvent(new CustomEvent('skilldataready', { detail: data }));
      return data;
    })
    .catch(error => {
      console.error('Failed to load skill data from agents directory.', error);
      window.dispatchEvent(new CustomEvent('skilldataerror', { detail: error }));
      throw error;
    });
})();
