import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllCategories, getSkillsByCategory } from '../../../lib/db'
import type { Metadata } from 'next'
import { ItemListSchema, BreadcrumbSchema } from '../../jsonld'
import SkillList from '../../skill-list'
import MobileNav from '../../mobilenav'

interface Props {
  params: Promise<{ id: string }>
}

const CATEGORY_NAMES: Record<string, { zh: string; en: string; icon: string }> = {
  'dev-tools': { zh: '开发工具', en: 'Developer Tools', icon: '🔧' },
  'data-ai': { zh: '数据与AI', en: 'Data & AI', icon: '🤖' },
  'design-ui': { zh: '设计与UI', en: 'Design & UI', icon: '🎨' },
  'agent-framework': { zh: 'Agent框架', en: 'Agent Framework', icon: '🧠' },
  'general': { zh: '通用技能', en: 'General', icon: '🌐' },
  'docs-content': { zh: '文档与内容', en: 'Docs & Content', icon: '📝' },
  'automation-productivity': { zh: '自动化与效率', en: 'Automation', icon: '⚡' },
  'security': { zh: '安全', en: 'Security', icon: '🔒' },
  'social-media': { zh: '社交媒体', en: 'Social Media', icon: '📱' },
  'finance-crypto': { zh: '金融与加密', en: 'Finance & Crypto', icon: '💰' },
  'devops-deploy': { zh: 'DevOps部署', en: 'DevOps & Deploy', icon: '☁️' },
  'backend-api': { zh: '后端API', en: 'Backend & API', icon: '⚙️' },
  'game-dev': { zh: '游戏开发', en: 'Game Dev', icon: '🎮' },
  'testing-qa': { zh: '测试与QA', en: 'Testing & QA', icon: '🧪' },
  'education': { zh: '教育', en: 'Education', icon: '📚' },
  'health-medical': { zh: '健康医疗', en: 'Health & Medical', icon: '🏥' },
  '3d': { zh: '3D技术', en: '3D', icon: '🎲' },
  'ecommerce': { zh: '电商', en: 'E-commerce', icon: '🛒' },
  'video-multimedia': { zh: '视频多媒体', en: 'Video & Multimedia', icon: '🎬' },
  'audio': { zh: '音频', en: 'Audio', icon: '🔊' },
  'video-gen': { zh: '视频生成', en: 'Video Gen', icon: '📹' },
  'audio-speech': { zh: '语音技术', en: 'Speech Tech', icon: '🎙️' },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const cats = getAllCategories()
  const category = cats.find(c => c.id === id)
  if (!category) return { title: '分类未找到' }
  const name = CATEGORY_NAMES[id] || { zh: id, en: id, icon: '📂' }
  const url = `https://skill.442595.xyz/categories/${id}`
  return {
    title: `${name.zh} · ${name.en} - ${category.count}个AI技能`,
    description: `浏览 ${category.count} 个 ${name.zh}（${name.en}）分类的 AI Agent Skills & MCP Tools，含 Claude Code、Cursor、Codex、OpenCode、Hermes Agent 平台兼容信息。`,
    keywords: [id, name.zh, name.en, 'AI Skills', 'Agent Tools', 'MCP', 'AI工具'],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${name.zh} · ${name.en} - Skill Hub`,
      description: `${category.count} 个 ${name.zh} 分类的 AI Agent 技能与 MCP 工具`,
      url,
      type: 'website',
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name.zh} · ${name.en} - Skill Hub`,
      description: `${category.count} 个 ${name.zh} 分类的 AI Agent 技能与 MCP 工具`,
      images: ['/og-image.png'],
    },
  }
}

export function generateStaticParams() {
  const cats = getAllCategories()
  return cats.map(c => ({ id: c.id }))
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params
  const cats = getAllCategories()
  const category = cats.find(c => c.id === id)
  if (!category) return notFound()

  const skills = getSkillsByCategory(id)
  const name = CATEGORY_NAMES[id] || { zh: id, en: id, icon: '📂' }

  // ponytail: related category cross-links for SEO + UX
  const RELATED: Record<string, { id: string; label: string }[]> = {
    'agent-framework': [{ id: 'automation-productivity', label: '⚡ Automation' }],
    'automation-productivity': [{ id: 'agent-framework', label: '🧠 Agent Framework' }],
    'dev-tools': [{ id: 'backend-api', label: '⚙️ Backend & API' }],
    'backend-api': [{ id: 'dev-tools', label: '🔧 Developer Tools' }],
    'data-ai': [{ id: 'general', label: '🌐 General Tools' }],
    'design-ui': [{ id: 'video-multimedia', label: '🎬 Video & Multimedia' }],
  }
  const related = RELATED[id] || []

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://skill.442595.xyz/' },
        { name: name.en, url: `https://skill.442595.xyz/categories/${id}` },
      ]} />
      <ItemListSchema items={skills.slice(0, 50).map(s => ({
        name: s.name,
        url: `https://skill.442595.xyz/skill/${encodeURIComponent(s.name)}`,
      }))} />
      <MobileNav categories={cats} />
      <header className="bg-slate-900 text-white py-8 pt-16 md:pt-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/" className="text-slate-400 hover:text-white mb-4 block">← Home</Link>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{name.icon}</span>
            <h1 className="text-3xl font-bold">{name.en}</h1>
          </div>
          <p className="text-slate-400 text-sm">{name.zh} · {skills.length} skills</p>
          {related.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-slate-500">Related:</span>
              {related.map(r => (
                <Link key={r.id} href={`/categories/${r.id}`}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors">
                  {r.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <SkillList skills={skills} />
      </main>
    </div>
  )
}
