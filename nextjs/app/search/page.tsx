import Link from 'next/link'
import { getAllCategories } from '../../lib/db'
import type { Metadata } from 'next'
import SearchBox from '../searchbox'
import MobileNav from '../mobilenav'

export const metadata: Metadata = {
  title: '搜索 - Skill Hub',
  description: 'Search AI Agent Skills, MCP Tools, and developer tools across all categories.',
  keywords: ['search', 'AI Skills', 'MCP Tools', 'Agent Skills', 'developer tools'],
  robots: { index: true, follow: true },
}

export default function SearchPage() {
  const cats = getAllCategories()
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav categories={cats} />
      <header className="bg-slate-900 text-white py-8 pt-16 md:pt-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="text-slate-400 hover:text-white mb-4 block">← Home</Link>
          <h1 className="text-3xl font-bold">Search Skills</h1>
          <p className="text-slate-400 mt-2">Search across {cats.reduce((a, c) => a + c.count, 0).toLocaleString()} AI agent skills & MCP tools</p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <SearchBox />
      </main>
    </div>
  )
}