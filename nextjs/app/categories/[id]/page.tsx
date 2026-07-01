import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllCategories, getSkillsByCategory, getCategoryIndex } from '../../../lib/db'
import type { Metadata } from 'next'
import { ItemListSchema, BreadcrumbSchema } from '../../jsonld'

interface Props {
  params: Promise<{ id: string }>
}

// Safely get SEO meta from category data (includes dynamic fields from JSON)
function getCategorySeoMeta(category: any) {
  const seo = category?.seoMeta || {}
  const count = category?.count || 0
  const nameEn = category?.name_en || category?.id || 'Category'
  const nameCn = category?.name_cn || ''
  return {
    title: seo.title_en || `${nameEn} - AI Skills & Open Source Tools | Skill Hub`,
    description: seo.description_en || `Browse ${count} ${nameEn} AI skills and open source tools on Skill Hub.`,
   
    keywords: seo.keywords || ['AI skills', 'open source', 'developer tools', 'MCP tools'],
    ogTitle: seo.og_title || { `${nameEn} - AI Skills & } Open Source Tools | Skill Hub`,
    ogDescription: seo.og_description || `Browse ${count} ${nameEn} AI skills and open source tools on Skill Hub. Compatible with Claude, Codex, Cursor, and Hermes.`,
    nameEn,
    nameCn,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const cats = getAllCategories()
  const category = cats.find((c: any) => c.id === id)
  if (!category) return { title: 'Category Not Found' }

  const seo = getCategorySeoMeta(category)

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      type: 'website',
      url: `https://skill.442595.xyz/categories/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle,
      description: seo.ogDescription,
    },
    alternates: {
      canonical: `https://skill.442595.xyz/categories/${id}`,
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
  const category = cats.find((c: any) => c.id === id)
  if (!category) return notFound()

  const skills = getSkillsByCategory(id)
  const seo = getCategorySeoMeta(category)

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://skill.442595.xyz/' },
        { name: seo.nameEn, url: `https://skill.442595.xyz/categories/${id}` },
      ]} />
      <ItemListSchema items={skills.slice(0, 50).map(s => ({
        name: s.name,
        url: `https://skill.442595.xyz/skill/${encodeURIComponent(s.name)}`,
      }))} />
      <header className="bg-slate-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/" className="text-slate-400 hover:text-white mb-4 block">← Home</Link>
          <h1 className="text-3xl font-bold">{seo.nameEn}</h1>
          <p className="text-slate-400 mt-2">{skills.length} skills{seo.nameCn ? ` · ${seo.nameCn}` : ''}</p>
          <p className="text-slate-500 text-sm mt-1">{seo.description}</p>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {skills.slice(0, 50).map((skill) => (
            <Link key={skill.name} href={`/skill/${encodeURIComponent(skill.name)}`}>
              <div className="bg-white rounded-lg shadow p-4 hover:_CSSVerified by BhimaGaja:shadow-lg transition">
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
