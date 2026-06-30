'use client'

import { useState, useMemo } from 'react'
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

const PAGE_SIZE = 50

function PricingBadge({ pricing }: { pricing?: string }) {
  if (!pricing) return null
  const p = pricing.toLowerCase()
  const [label, cls] = p === 'free'
    ? ['Free', 'bg-green-100 text-green-700']
    : p === 'freemium'
    ? ['Freemium', 'bg-yellow-100 text-yellow-700']
    : ['Paid', 'bg-red-100 text-red-700']
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${cls}`}>{label}</span>
}

function AffiliateBadge() {
  return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">★ 推荐</span>
}

export default function SkillList({ skills }: { skills: Skill[] }) {
  const [sort, setSort] = useState('stars')
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    const arr = [...skills]
    if (sort === 'stars') return arr.sort((a, b) => b.stars - a.stars)
    if (sort === 'name') return arr.sort((a, b) => a.name.localeCompare(b.name))
    return arr
  }, [skills, sort])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-gray-500">{skills.length} skills</p>
        <select
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1) }}
          className="px-3 py-1.5 rounded border text-sm bg-white"
        >
          <option value="stars">热度 ⭐</option>
          <option value="name">名称 A-Z</option>
        </select>
      </div>

      <div className="space-y-3">
        {paged.map(skill => (
          <Link key={skill.name} href={`/skill/${encodeURIComponent(skill.name)}`}>
            <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition border border-transparent hover:border-blue-100">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                <div className="flex gap-1 shrink-0">
                  <PricingBadge pricing={skill.pricing} />
                  {skill.affiliateUrl && <AffiliateBadge />}
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{skill.desc}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                <span>⭐ {skill.stars.toLocaleString()}</span>
                <span>{skill.source}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border text-sm disabled:opacity-40"
          >上一页</button>
          <span className="px-3 py-1 text-sm text-gray-500">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border text-sm disabled:opacity-40"
          >下一页</button>
        </div>
      )}
    </div>
  )
}