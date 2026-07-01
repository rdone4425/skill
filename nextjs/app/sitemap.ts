import { MetadataRoute } from 'next'
import { getAllCategories, getAllSkills } from '@/lib/db'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://skill.442595.xyz'
  const today = new Date().toISOString().split('T')[0]

  const entries: MetadataRoute.Sitemap = [
    { 
      url: siteUrl, 
      lastModified: today, 
      changeFrequency: 'daily', 
      priority: 1.0,
    },
  ]

  // Category pages - high priority for SEO
  const categories = getAllCategories()
  for (const cat of categories) {
    const catCount = cat.count || 0
    // Prioritize high-count categories (agent-framework, dev-tools, data-ai)
    let priority = 0.8
    if (catCount > 500) priority = 0.9
    else if (catCount < 30) priority = 0.6
    
    entries.push({
      url: `${siteUrl}/categories/${cat.id}`,
      lastModified: today,
      changeFrequency: 'weekly' as const,
      priority: priority,
    })
  }

  // Skill pages - include up to top 500 by stars for SEO juice
  const skills = getAllSkills()
  // Sort by stars descending and take top 500
  const topSkills = skills
    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
    .slice(0, 500)
  
  for (const skill of topSkills) {
    entries.push({
      url: `${siteUrl}/skill/${encodeURIComponent(skill.name)}`,
      lastModified: today,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })
  }

  return entries
}
