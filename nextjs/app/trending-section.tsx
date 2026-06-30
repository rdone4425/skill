'use client'

import Link from 'next/link'

interface Skill {
  name: string
  desc: string
  stars: number
  source: string
  repo?: string
  url?: string
  install?: string
  pricing?: string
  affiliateUrl?: string
}

export default function TrendingSection({ skills }: { skills: Skill[] }) {
  if (!skills || skills.length === 0) return null
  const top = skills.slice().sort((a, b) => b.stars - a.stars).slice(0, 8)

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-4">
            <span className="text-lg">🔥</span>
            Trending
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">最热门的 AI Skills</h2>
          <p className="text-gray-500 text-lg">Highest starred · 社区最受欢迎</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {top.map((skill, i) => (
            <Link key={skill.name} href={`/skill/${encodeURIComponent(skill.name)}`}>
              <div className="relative bg-white rounded-xl p-5 border border-amber-100 hover:border-amber-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-amber-500 font-mono text-xs font-bold shrink-0 w-5 text-right">#{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{skill.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{skill.desc?.substring(0, 80)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 pl-8">
                  <span>⭐ {skill.stars.toLocaleString()}</span>
                  <span className="truncate">{skill.source}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/trending"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            查看全部 Top 100 →
          </Link>
        </div>
      </div>
    </section>
  )
}