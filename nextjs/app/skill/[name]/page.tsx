import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllSkills, getAllCategories } from '../../../lib/db'
import type { Metadata } from 'next'
import { SoftwareApplicationSchema, BreadcrumbSchema } from '../../jsonld'
import MobileNav from '../../mobilenav'

interface Props {
  params: Promise<{ name: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params
  const decodedName = decodeURIComponent(name)
  const skills = getAllSkills()
  const skill = skills.find(s => s.name === decodedName)
  if (!skill) return { title: 'Skill 未找到' }
  const url = `https://skill.442595.xyz/skill/${encodeURIComponent(skill.name)}`
  return {
    title: `${skill.name} - AI Agent Skill`,
    description: skill.desc?.substring(0, 160) || `${skill.name} - AI Agent Skill for ${skill.source || 'AI coding'}`,
    keywords: [skill.name, skill.functionCategory, skill.source || '', 'AI Skill', 'Claude Code', 'Codex', 'Cursor'],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${skill.name} - AI Agent Skill`,
      description: skill.desc?.substring(0, 200),
      url,
      type: 'website',
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${skill.name} - AI Agent Skill`,
      description: skill.desc?.substring(0, 200),
      images: ['/og-image.png'],
    },
  }
}

function getPricingBadge(pricing?: string) {
  if (!pricing) return null
  const label = pricing === 'free' ? 'Free' : pricing === 'freemium' ? 'Freemium' : 'Paid'
  const cls = pricing === 'free' ? 'bg-green-100 text-green-800' : pricing === 'freemium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{label}</span>
}

export default async function SkillPage({ params }: Props) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)
  const skills = getAllSkills()
  const skill = skills.find(s => s.name === decodedName)
  if (!skill) return notFound()
  const cats = getAllCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      <SoftwareApplicationSchema skill={skill} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://skill.442595.xyz/' },
        { name: skill.functionCategory, url: `https://skill.442595.xyz/categories/${skill.functionCategory}` },
        { name: skill.name, url: `https://skill.442595.xyz/skill/${encodeURIComponent(skill.name)}` },
      ]} />
      <MobileNav categories={cats} />
      <header className="bg-slate-900 text-white py-8 pt-16 md:pt-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link href={`/categories/${skill.functionCategory}`} className="text-slate-400 hover:text-white mb-4 block">← Back</Link>
          <h1 className="text-3xl font-bold">{skill.name}</h1>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-700 mb-4">{skill.desc}</p>

          {/* Tags row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {getPricingBadge((skill as any).pricing)}
            {(skill as any).affiliateUrl && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                ★ 推荐
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            <span>⭐ {skill.stars?.toLocaleString() || 0}</span>
            <span>Source: {skill.source}</span>
            <span>Category: {skill.functionCategory}</span>
            <span>Compatible with: {skill.functionCategory}</span>
          </div>
          <div className="space-y-2">
            {skill.repo && <p>Repo: <a href={`https://github.com/${skill.repo}`} target="_blank" rel="noopener" className="text-blue-600 hover:underline">{skill.repo}</a></p>}
            {skill.url && <p>URL: <a href={skill.url} target="_blank" rel="noopener" className="text-blue-600 hover:underline">{skill.url}</a></p>}
            {skill.install && <p>Install: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{skill.install}</code></p>}
          </div>
        </div>
      </main>
    </div>
  )
}
