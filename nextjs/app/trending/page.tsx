import Link from 'next/link'
import { getAllCategories, getAllSkills } from '../../lib/db'
import type { Metadata } from 'next'
import { ItemListSchema, BreadcrumbSchema } from '../jsonld'
import MobileNav from '../mobilenav'

export const metadata: Metadata = {
  title: 'Trending - Skill Hub 热门 AI Agent Skills 排行',
  description: '浏览 Skill Hub 上最热门的 AI Agent Skills & MCP Tools，按 GitHub Stars 排序。发现社区最受欢迎的 AI 开发工具。',
  keywords: ['trending', 'popular', 'AI Skills', 'top AI tools', 'most starred', 'GitHub Stars'],
  robots: { index: true, follow: true },
}

export default function TrendingPage() {
  const cats = getAllCategories()
  const all = getAllSkills()
  const top100 = [...all].sort((a, b) => b.stars - a.stars).slice(0, 100)

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://skill.442595.xyz/' },
        { name: 'Trending', url: 'https://skill.442595.xyz/trending' },
      ]} />
      <ItemListSchema items={top100.slice(0, 50).map(s => ({
        name: s.name,
        url: `https://skill.442595.xyz/skill/${encodeURIComponent(s.name)}`,
      }))} />
      <MobileNav categories={cats} />
      <header className="bg-slate-900 text-white py-8 pt-16 md:pt-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/" className="text-slate-400 hover:text-white mb-4 block">← Home</Link>
          <h1 className="text-3xl font-bold">🔥 Trending Skills</h1>
          <p className="text-slate-400 mt-2">
            Top 100 most popular AI Agent Skills & MCP tools by GitHub Stars · 
            共 {all.length.toLocaleString()} 个技能
          </p>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b">
                <th className="text-left px-4 py-3 font-medium w-12">#</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Stars</th>
                <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Source</th>
              </tr>
            </thead>
            <tbody>
              {top100.map((skill, i) => (
                <tr key={skill.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/skill/${encodeURIComponent(skill.name)}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      {skill.name}
                    </Link>
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{skill.desc?.substring(0, 80)}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm hidden sm:table-cell">
                    ⭐ {skill.stars.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 hidden md:table-cell">
                    {skill.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}