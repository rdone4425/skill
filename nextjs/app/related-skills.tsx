'use client'

import Link from 'next/link'

interface Skill {
  name: string
  desc: string
  stars: number
  source: string
  repo?: string
  url?: string
}

export default function RelatedSkills({ skills, excludeName, categoryName }: {
  skills: Skill[]
  excludeName?: string
  categoryName: string
}) {
  if (!skills || skills.length < 2) return null

  // Filter out the current skill and take top 6 by stars
  const filtered = skills
    .filter(s => s.name !== excludeName)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 6)

  if (filtered.length === 0) return null

  return (
    <section className="mt-10 pt-8 border-t border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          <span className="mr-2">🔗</span>
          更多 {categoryName} 相关技能
        </h2>
        <p className="text-gray-500 text-sm mt-1">Related skills you might also like</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(skill => (
          <Link key={skill.name} href={`/skill/${encodeURIComponent(skill.name)}`}>
            <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{skill.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{skill.desc?.substring(0, 80)}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                <span>⭐ {skill.stars.toLocaleString()}</span>
                <span>{skill.source}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}