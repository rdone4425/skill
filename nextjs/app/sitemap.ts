import { MetadataRoute } from 'next'
import { getAllCategories, getAllSkills } from '@/lib/db'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://skill.442595.xyz'
  const today = new Date().toISOString().split('T')[0]

  const entries: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: today, changeFrequency: 'daily', priority: 1 },
  ]

  // Category pages
  const categories = getAllCategories()
  for (const cat of categories) {
    entries.push({
      url: `${siteUrl}/categories/${cat.id}`,
      lastModified: today,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })
  }

  // Skill pages (limit to avoid huge sitemap)
  const skills = getAllSkills()
  for (const skill of skills) {
    entries.push({
      url: `${siteUrl}/skill/${encodeURIComponent(skill.name)}`,
      lastModified: today,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })
  }

  return entries
}