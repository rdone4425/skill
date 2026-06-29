import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllSkills } from '../../../lib/db'
import type { Metadata } from 'next'
import { SoftwareApplicationSchema, BreadcrumbSchema } from '../../jsonld'

interface Props {
  params: Promise<{ name: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params
  const decodedName = decodeURIComponent(name)
  const skills = getAllSkills()
  const skill = skills.find((s) => s.name === decodedName)
  if (!skill) return { title: 'Skill 未找到' }
  return {
    title: `${skill.name} - Skill Hub`,
    description: skill.desc?.substring(0, 160) || `${skill.name} - AI Agent Skill`,
    keywords: [skill.name, skill.functionCategory, skill.source || '', 'AI Skill'],
    openGraph: {
      title: skill.name,
      description: skill.desc?.substring(0, 200),
      type: 'website',
    },
  }
}

export default async function SkillPage({ params }: Props) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)
  const skills = getAllSkills()
  const skill = skills.find((s) => s.name === decodedName)
  if (!skill) return notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <SoftwareApplicationSchema skill={skill} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://skill.442595.xyz/' },
        { name: skill.functionCategory, url: `https://skill.442595.xyz/categories/${skill.functionCategory}` },
        { name: skill.name, url: `https://skill.442595.xyz/skill/${encodeURIComponent(skill.name)}` },
      ]} />
      <header className="bg-slate-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link href={`/categories/${skill.functionCategory}`} className="text-slate-400 hover:text-white mb-4 block">← Back</Link>
          <h1 className="text-3xl font-bold">{skill.name}</h1>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-700 mb-4">{skill.desc}</p>
          <div className="flex gap-4 text-sm text-gray-500 mb-4">
            <span>⭐ {skill.stars}</span>
            <span>Source: {skill.source}</span>
            <span>Category: {skill.functionCategory}</span>
          </div>
          <div className="space-y-2">
            {skill.repo && <p>Repo: <a href={`https://github.com/${skill.repo}`} target="_blank" rel="noopener" className="text-blue-600">{skill.repo}</a></p>}
            {skill.url && <p>URL: <a href={skill.url} target="_blank" rel="noopener" className="text-blue-600">{skill.url}</a></p>}
            {skill.install && <p>Install: <code className="bg-gray-100 px-2 py-1 rounded">{skill.install}</code></p>}
          </div>
        </div>
      </main>
    </div>
  )
}