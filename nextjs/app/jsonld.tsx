export function WebSiteSchema() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Skill Hub',
    url: 'https://skill.442595.xyz',
    description: 'Skill Hub 收录 AI Agent Skills & MCP Tools，按功能分类浏览。支持 Claude Code、Codex、Cursor、OpenCode、Hermes Agent 等平台。',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://skill.442595.xyz/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  )
}

interface BreadcrumbItem {
  name: string
  url: string
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  )
}

interface Skill {
  name: string
  desc?: string
  repo?: string
  url?: string
  install?: string
  stars?: number
  functionCategory?: string
  source?: string
}

export function SoftwareApplicationSchema({ skill }: { skill: Skill }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: skill.name,
    description: skill.desc?.substring(0, 500) || `AI Agent Skill: ${skill.name}`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    ...(skill.url ? { url: skill.url } : {}),
    ...(skill.repo ? { codeRepository: `https://github.com/${skill.repo}` } : {}),
    ...(skill.stars ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: skill.stars, bestRating: 100000 } } : {}),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  )
}

interface ItemListItem {
  name: string
  url: string
  description?: string
}

export function ItemListSchema({ items }: { items: ItemListItem[] }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: item.name,
        url: item.url,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  )
}