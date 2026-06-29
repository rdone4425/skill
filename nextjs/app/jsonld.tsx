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