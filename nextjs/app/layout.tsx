import type { Metadata } from 'next'
import './globals.css'
import { WebSiteSchema } from './jsonld'

export const metadata: Metadata = {
  title: 'Skill Hub - AI Agent Skills Directory | 5000+ Open Source Tools',
  description: 'Skill Hub is the largest directory of 5000+ AI Agent Skills, MCP Tools, and Open Source developer tools. Browse by categories, platforms, and compatibility. Supports Claude, Codex, Cursor, Hermes, and more.',
  keywords: ['AI Agent Skills', 'AI skills', 'open source', 'developer tools', 'MCP Server', 'MCP Tools', 'Claude Code', 'Codex', 'Cursor', 'Hermes Agent', 'OpenCode', 'AI tool directory', 'autonomous agents', 'AI framework'],
  metadataBase: new URL('https://skill.442595.xyz'),
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: 'Skill Hub - AI Agent Skills Directory | 5000+ Open Source Tools',
    description: 'Skill Hub is the largest directory of 5000+ AI Agent Skills and MCP Tools. Browse by categories, platforms, and compatibility.',
    url: 'https://skill.442595.xyz/',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skill Hub - AI Agent Skills Directory',
    description: '5000+ AI Agent Skills & MCP Tools - Browse by category and platform.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://skill.442595.xyz/',
  },
  verification: {
    google: 'your-google-verification-code',
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
