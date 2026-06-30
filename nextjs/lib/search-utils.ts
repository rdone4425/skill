/* Semantic keyword mapping for multi-language search */
export const SEMANTIC_MAP: Record<string, string[]> = {
  // 中文 → 英文语义扩展
  图片: ['image', 'image-gen', 'design', 'stable diffusion', 'dalle', 'midjourney'],
  图像: ['image', 'image-gen', 'design', 'stable diffusion', 'dalle'],
  生成: ['generation', 'gen', 'create', 'image-gen', 'video-gen', 'text-to'],
  视频: ['video', 'video-gen', 'video-multimedia', 'generation'],
  音频: ['audio', 'audio-speech', 'speech', 'music', 'sound'],
  语音: ['voice', 'speech', 'audio-speech', 'tts', 'stt'],
  代码: ['code', 'dev-tools', 'programming', 'developer', 'coding'],
  编程: ['code', 'coding', 'programming', 'dev-tools'],
  开发: ['dev', 'development', 'developer', 'dev-tools', 'devops'],
  自动化: ['automation', 'automation-productivity', 'autonomous', 'workflow'],
  搜索: ['search', 'retrieval', 'rag', 'find', 'lookup'],
  聊天: ['chat', 'conversation', 'llm', 'dialogue', 'chatbot'],
  对话: ['chat', 'conversation', 'dialogue', 'llm'],
  翻译: ['translation', 'translate', 'i18n', 'language', 'text'],
  文档: ['docs', 'documentation', 'docs-content', 'writing'],
  写作: ['writing', 'content', 'docs-content', 'copywriting'],
  分析: ['analytics', 'analysis', 'data-ai', 'data', 'insights'],
  数据: ['data', 'data-ai', 'analytics', 'database'],
  安全: ['security', 'safe', 'vulnerability', 'pentest'],
  金融: ['finance', 'finance-crypto', 'crypto', 'trading', 'blockchain'],
  加密: ['crypto', 'encryption', 'blockchain', 'finance-crypto'],
  游戏: ['game', 'game-dev', 'gaming'],
  教育: ['education', 'learning', 'tutorial', 'teach'],
  测试: ['test', 'testing-qa', 'testing', 'qa'],
  部署: ['deploy', 'devops-deploy', 'devops', 'deployment', 'ci/cd'],
  后端: ['backend', 'backend-api', 'api', 'server'],
  前端: ['frontend', 'ui', 'design-ui', 'interface'],
  设计: ['design', 'design-ui', 'ui', 'ux', 'figma'],
  社交: ['social', 'social-media', 'twitter', 'discord', 'telegram'],
  营销: ['marketing', 'social-media', 'seo', 'growth'],
  音乐: ['music', 'audio', 'audio-speech', 'song'],
  医疗: ['health', 'medical', 'health-medical'],
  健康: ['health', 'medical', 'health-medical'],
  电商: ['ecommerce', 'shop', 'store', 'commerce'],
  购物: ['ecommerce', 'shop', 'shopping', 'commerce'],
  '3d': ['3d', 'threejs', 'modeling', 'rendering'],
  模型: ['model', 'llm', 'ai', 'ml', 'modeling'],
  推荐: ['recommendation', 'recommend', 'personalization', 'suggest'],
  爬虫: ['crawl', 'scraper', 'scraping', 'web', 'extract'],
  抓取: ['crawl', 'scraper', 'scraping', 'extract'],
  浏览器: ['browser', 'browser-automation', 'selenium', 'puppeteer'],
  代理: ['agent', 'agent-framework', 'proxy', 'autonomous'],
  智能体: ['agent', 'agent-framework', 'autonomous', 'ai agent'],
  插件: ['plugin', 'mcp', 'extension', 'mcp-server'],
  工具: ['tool', 'dev-tools', 'utility', 'cli'],
  监控: ['monitor', 'monitoring', 'observability', 'logging', 'alert'],
  日志: ['log', 'logging', 'monitoring'],
  // Common typos / alternative spellings
  claude: ['claude', 'anthropic', 'claude code'],
  codex: ['codex', 'openai codex', 'coding agent'],
  cursor: ['cursor', 'editor', 'ide'],
  vscode: ['vscode', 'code', 'editor', 'visual studio code'],
  stable: ['stable diffusion', 'image-gen', 'stability'],
  diffusion: ['stable diffusion', 'diffusion', 'image-gen'],
  gpt: ['gpt', 'openai', 'chatgpt', 'llm'],
  rag: ['rag', 'retrieval', 'vector', 'embedding'],
  mcp: ['mcp', 'mcp-server', 'protocol', 'tool'],
  langchain: ['langchain', 'langflow', 'llm', 'framework'],
  vector: ['vector', 'embedding', 'rag', 'database'],
  docker: ['docker', 'container', 'devops', 'deployment'],
  kubernetes: ['kubernetes', 'k8s', 'container', 'orchestration'],
  git: ['git', 'version control', 'github', 'dev-tools'],
  linux: ['linux', 'unix', 'bash', 'shell', 'terminal'],
  python: ['python', 'script', 'dev-tools', 'programming'],
  javascript: ['javascript', 'js', 'node', 'typescript', 'web'],
  typescript: ['typescript', 'js', 'javascript', 'node'],
  api: ['api', 'backend-api', 'rest', 'graphql', 'endpoint'],
  terminal: ['terminal', 'cli', 'shell', 'command'],
  tts: ['tts', 'text-to-speech', 'audio-speech', 'voice'],
  stt: ['stt', 'speech-to-text', 'audio-speech', 'transcription'],
  qa: ['qa', 'testing-qa', 'testing', 'quality'],
  framework: ['framework', 'agent-framework', 'library', 'sdk'],
}

/* Build reverse index for Chinese → English lookup */
const CHINESE_TERMS = new Map<string, string[]>()
for (const [key, values] of Object.entries(SEMANTIC_MAP)) {
  /* Chinese keys go into the reverse index */
  if (/[\u4e00-\u9fff]/.test(key)) {
    CHINESE_TERMS.set(key, values)
  }
}

/**
 * Expand a Chinese query with English semantic equivalents
 */
export function expandSemantic(query: string): string[] {
  const expansions: string[] = [query]
  for (const [cn, en] of CHINESE_TERMS) {
    if (query.includes(cn)) {
      expansions.push(...en)
    }
  }
  return [...new Set(expansions)]
}

/**
 * Generate auto-complete suggestions from a list of skill names
 */
export function getAutoComplete(query: string, skillNames: string[], max = 5): string[] {
  const q = query.toLowerCase().trim()
  if (!q || q.length < 1) return []

  const matched = new Set<string>()

  /* 1. Prefix match */
  for (const name of skillNames) {
    if (matched.size >= max) break
    if (name.toLowerCase().startsWith(q)) {
      matched.add(name)
    }
  }

  /* 2. Substring match (if prefix didn't fill) */
  if (matched.size < max) {
    for (const name of skillNames) {
      if (matched.size >= max) break
      if (name.toLowerCase().includes(q) && !matched.has(name)) {
        matched.add(name)
      }
    }
  }

  return [...matched]
}

/**
 * Find "did you mean" correction when results are poor or empty
 */
export function findDidYouMean(
  query: string,
  skillNames: string[],
  threshold = 2,
): string | null {
  const q = query.toLowerCase().trim()
  if (q.length < 2) return null

  let best: { name: string; dist: number } | null = null

  for (const name of skillNames) {
    const dist = levenshtein(q, name.toLowerCase())
    if (dist > 0 && dist <= threshold) {
      if (!best || dist < best.dist) {
        best = { name, dist }
      }
    }
  }

  return best?.name ?? null
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}