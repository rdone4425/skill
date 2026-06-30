'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface Skill {
  name: string
  desc: string
  stars: number
  source: string
  repo?: string
  supportedAgents?: string[]
}

const STOP_WORDS = new Set([
  'the','a','an','of','in','for','to','and','or','on','with','is','it','at','by',
  'as','be','no','de','la','en','el','da','di','et','le','per','con','su','un',
  'se','al','del','lo','&','api','cli','ui','sdk','tool','tools','lib','library',
  'use','your','you','from','using','that','this','not','are','has','its','all',
  'one','can','new','more','code','data','app','web','js','ts','py','go','rs',
  'http','https','git','hub','ai','agent','mcp','open','source','node','npm',
])

export default function TrendingTags({ skills }: { skills: Skill[] }) {
  const router = useRouter()

  const tags = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of skills) {
      const words = (s.name || '').split(/[\s/-]+/)
      for (const w of words) {
        const k = w.toLowerCase().trim()
        if (k.length >= 3 && !STOP_WORDS.has(k)) {
          counts[k] = (counts[k] || 0) + 1
        }
      }
      ;(s.supportedAgents || []).forEach((a: string) => {
        const k = a.toLowerCase()
        counts[k] = (counts[k] || 0) + 1
      })
    }
    return Object.entries(counts)
      .map(([key, count]) => ({ key, count }))
      .filter(e => e.count >= 5)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  }, [skills])

  if (tags.length === 0) return null

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🏷️ 热门标签</h2>
          <p className="text-gray-500 text-sm mt-1">Popular tags · 点击搜索相关技能</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {tags.map(t => {
            // Size based on frequency
            const size = t.count > 100 ? 'text-lg' : t.count > 50 ? 'text-base' : 'text-sm'
            return (
              <button
                key={t.key}
                onClick={() => router.push(`/search?q=${encodeURIComponent(t.key)}`)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all ${size} text-gray-600 font-medium`}
              >
                {t.key}
                <span className="text-xs text-gray-400 font-normal">({t.count})</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}