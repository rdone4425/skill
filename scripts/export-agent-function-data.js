#!/usr/bin/env node
/**
 * 将 js/data.js 按 agent 平台 + 功能分类拆分到 agents 目录。
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'js', 'data.js');
const AGENTS_DIR = path.join(ROOT, 'agents');

const FUNCTION_CATEGORIES = [
  ['design-ui', ['figma', 'design', 'ui', 'ux', 'frontend', 'component', 'visual', 'style', 'css', 'html', 'layout']],
  ['docs-content', ['document', 'docs', 'pdf', 'word', 'excel', 'powerpoint', 'slides', 'notion', 'obsidian', 'content', 'writing', 'report', 'presentation']],
  ['dev-tools', ['cli', 'tool', 'plugin', 'mcp', 'wrapper', 'installer', 'editor', 'workspace', 'terminal', 'command']],
  ['devops-deploy', ['deploy', 'deployment', 'cloudflare', 'vercel', 'netlify', 'docker', 'infra', 'infrastructure', 'kubernetes', 'ci', 'cd', 'workflow', 'ops']],
  ['backend-api', ['api', 'backend', 'server', 'grpc', 'database', 'sql', 'auth', 'asp.net', 'mvc', 'microservice']],
  ['testing-qa', ['test', 'testing', 'qa', 'debug', 'bug', 'e2e', 'playwright', 'verify', 'validation']],
  ['security', ['security', 'secure', 'auth', 'privacy', 'guard', 'cyber', 'vulnerability', 'ctf']],
  ['data-ai', ['ai', 'llm', 'model', 'agent', 'rag', 'research', 'analysis', 'prompt', 'memory', 'vector', 'dataset']],
  ['automation-productivity', ['automation', 'automate', 'productivity', 'sync', 'manage', 'manager', 'organize', 'planner', 'planning', 'task']],
];

function loadSkillData() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(raw, sandbox);
  const data = sandbox.window.SKILL_DATA;
  if (!data || !Array.isArray(data.skills)) {
    throw new Error('SKILL_DATA 或 skills 缺失');
  }
  return data;
}

function classifyFunction(skill) {
  const text = [skill.name, skill.desc, skill.repo]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const [category, keywords] of FUNCTION_CATEGORIES) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return 'general';
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function writeJs(filePath, variableName, payload) {
  fs.writeFileSync(
    filePath,
    `window.${variableName} = ${JSON.stringify(payload, null, 2)};\n`,
    'utf8'
  );
}

function main() {
  const data = loadSkillData();
  const buckets = new Map();
  const agentStats = new Map();

  for (const skill of data.skills) {
    const agent = skill.agent || 'other';
    const functionCategory = classifyFunction(skill);
    const key = `${agent}::${functionCategory}`;

    if (!buckets.has(key)) {
      buckets.set(key, {
        agent,
        functionCategory,
        skills: [],
      });
    }

    buckets.get(key).skills.push({
      ...skill,
      functionCategory,
    });

    if (!agentStats.has(agent)) {
      agentStats.set(agent, {
        agent,
        totalSkills: 0,
        functionCategories: {},
        sources: {},
        repos: {},
        topSkills: [],
      });
    }

    const stats = agentStats.get(agent);
    stats.totalSkills += 1;
    stats.functionCategories[functionCategory] = (stats.functionCategories[functionCategory] || 0) + 1;
    stats.sources[skill.source || 'unknown'] = (stats.sources[skill.source || 'unknown'] || 0) + 1;
    stats.repos[skill.repo] = (stats.repos[skill.repo] || 0) + 1;
    stats.topSkills.push({
      name: skill.name,
      repo: skill.repo,
      stars: skill.stars,
      functionCategory,
      source: skill.source,
      url: skill.url,
    });
  }

  for (const bucket of buckets.values()) {
    const dirPath = path.join(AGENTS_DIR, bucket.agent, bucket.functionCategory);
    ensureDir(dirPath);

    writeJson(path.join(dirPath, 'skills.json'), {
      meta: {
        agent: bucket.agent,
        functionCategory: bucket.functionCategory,
        count: bucket.skills.length,
        sourceData: 'js/data.js',
      },
      skills: bucket.skills.sort((a, b) => a.name.localeCompare(b.name)),
    });
  }

  for (const stats of agentStats.values()) {
    const agentDir = path.join(AGENTS_DIR, stats.agent);
    ensureDir(agentDir);

    const payload = {
      generatedAt: new Date().toISOString(),
      sourceData: 'js/data.js',
      agent: stats.agent,
      totalSkills: stats.totalSkills,
      functionCategoryCount: Object.keys(stats.functionCategories).length,
      functionCategories: Object.entries(stats.functionCategories)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      sources: Object.entries(stats.sources)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      repos: Object.entries(stats.repos)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      topSkills: stats.topSkills
        .sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name))
        .slice(0, 10),
    };

    writeJs(path.join(agentDir, 'stats.js'), 'AGENT_STATS', payload);
  }

  const summary = Array.from(buckets.values())
    .map(bucket => ({
      agent: bucket.agent,
      functionCategory: bucket.functionCategory,
      count: bucket.skills.length,
    }))
    .sort((a, b) => a.agent.localeCompare(b.agent) || a.functionCategory.localeCompare(b.functionCategory));

  writeJson(path.join(AGENTS_DIR, 'index.json'), {
    generatedAt: new Date().toISOString(),
    sourceData: 'js/data.js',
    totalSkills: data.skills.length,
    buckets: summary,
  });

  console.log(`Exported ${data.skills.length} skills into ${buckets.size} directories.`);
}

main();
