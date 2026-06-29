import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllCategories, getSkillsByCategory, getCategoryIndex } from '../../../lib/db'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const cats = getAllCategories()
  const category = cats.find((c) => c.id === id)
  if (!category) return { title: '分类未找到' }
  const { totalSkills } = getCategoryIndex()
  return {
    title: `${id} - Skill Hub（${category.count}个AI技能）`,
    description: `浏览 ${category.count} 个 ${id} 分类的 AI Agent Skills，含 Claude Code、Cursor、Codex 等平台兼容信息。`,
    keywords: [id, 'AI Skills', 'Agent Tools', 'MCP'],
    openGraph: {
      title: `${id} - Skill Hub`,
      description: `${category.count} 个 ${id} 相关 AI 技能工具`,
      type: 'website',
    },
  }
}

export function generateStaticParams() {
  const cats = getAllCategories()
  return cats.map((c) => ({ id: c.id }))
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params
  const cats = getAllCategories()
  const category = cats.find((c) => c.id === id)
  if (!category) return notFound()

  const skills = getSkillsByCategory(id)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/" className="text-slate-400 hover:text-white mb-4 block">← Home</Link>
          <h1 className="text-3xl font-bold">{id}</h1>
          <p className="text-slate-400">{skills.length} skills</p>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {skills.slice(0, 50).map((skill) => (
            <Link key={skill.name} href={`/skill/${encodeURIComponent(skill.name)}`}>
              <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                <h3 className="font-semibold">{skill.name}</h3>
                <p className="text-gray-600 text-sm">{skill.desc?.substring(0, 200)}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span>⭐ {skill.stars}</span>
                  <span>Source: {skill.source}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}