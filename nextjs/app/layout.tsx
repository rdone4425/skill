import type { Metadata } from 'next'
import './globals.css'
import { WebSiteSchema } from './jsonld'

export const metadata: Metadata = {
  title: {
    default: 'Skill Hub - AI Agent Skills 导航站 | Claude / Codex / Hermes / Cursor',
    template: '%s | Skill Hub',
  },
  description: 'Skill Hub 收录 4000+ AI Agent Skills & MCP Tools，按22个功能分类浏览。支持 Claude Code、Codex、Cursor、OpenCode、Hermes Agent 等平台。',
  keywords: ['AI Agent Skills', 'Claude Code', 'Codex', 'Cursor', 'OpenCode', 'Hermes Agent', 'MCP Server', 'MCP Tools', '技能分类', 'AI工具导航'],
  metadataBase: new URL('https://skill.442595.xyz'),
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: 'Skill Hub - AI Agent Skills 导航站',
    description: 'Skill Hub 收录 4000+ AI Agent Skills & MCP Tools，按22个功能分类浏览。',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skill Hub - AI Agent Skills 导航站',
    description: 'Skill Hub 收录 4000+ AI Agent Skills & MCP Tools',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        <WebSiteSchema />
      </head>
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}