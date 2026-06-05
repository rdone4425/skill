/* ==========================================
   data loader
   ========================================== */
(function () {
  'use strict';

  const AGENTS_INDEX_URL = 'agents/index.json';

  function fetchJson(url) {
    return fetch(url, { cache: 'no-store' }).then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }
      return response.json();
    });
  }

  function createCategoryMap(index) {
    const map = new Map();

    (index.buckets || []).forEach(bucket => {
      const agentId = bucket.agent || 'other';
      const groupId = bucket.functionCategory || 'general';

      if (!map.has(agentId)) {
        map.set(agentId, {
          id: agentId,
          groups: new Map()
        });
      }

      const category = map.get(agentId);
      if (!category.groups.has(groupId)) {
        category.groups.set(groupId, {
          id: groupId,
          label: groupId
        });
      }
    });

    return Array.from(map.values()).map(category => ({
      id: category.id,
      groups: Array.from(category.groups.values()).sort((a, b) => a.id.localeCompare(b.id))
    }));
  }

  async function loadSkillData() {
    const index = await fetchJson(AGENTS_INDEX_URL);
    const categories = createCategoryMap(index);

    const bucketFiles = (index.buckets || []).map(bucket => ({
      agent: bucket.agent || 'other',
      functionCategory: bucket.functionCategory || 'general',
      url: `agents/${bucket.agent}/${bucket.functionCategory}/skills.json`
    }));

    const bucketPayloads = await Promise.all(
      bucketFiles.map(bucket =>
        fetchJson(bucket.url).then(payload => ({
          agent: bucket.agent,
          functionCategory: bucket.functionCategory,
          payload
        }))
      )
    );

    const skills = [];
    bucketPayloads.forEach(({ agent, functionCategory, payload }) => {
      (payload.skills || []).forEach(skill => {
        skills.push({
          ...skill,
          agent: skill.agent || agent,
          group: functionCategory
        });
      });
    });

    const meta = {
      title: 'Skill Hub',
      description: 'AI Agent Skills 导航站',
      lastUpdated: index.generatedAt || '',
      totalCount: skills.length,
      sources: new Set(skills.map(skill => skill.repo)).size
    };

    return {
      meta,
      categories,
      skills
    };
  }

  window.SKILL_DATA_PROMISE = loadSkillData()
    .then(data => {
      window.SKILL_DATA = data;
      return data;
    })
    .catch(error => {
      console.error('Failed to load agent data:', error);
      window.SKILL_DATA = {
        meta: {
          title: 'Skill Hub',
          description: 'AI Agent Skills 导航站',
          lastUpdated: '',
          totalCount: 0,
          sources: 0
        },
        categories: [],
        skills: []
      };
      return window.SKILL_DATA;
    });
})();
