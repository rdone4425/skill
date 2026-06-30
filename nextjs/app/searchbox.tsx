'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface SearchResult {
  name: string
  desc: string
  functionCategory: string
  stars: number
  source: string
  repo?: string
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-yellow-200 font-medium">{p}</mark>
      : p
  )
}

export default function SearchBox({ autoFocus }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(-1)
  const [sort, setSort] = useState('relevance')
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const initDone = useRef(false)

  // Read ?q= from URL on mount + autoFocus
  useEffect(() => {
    if (initDone.current) return
    initDone.current = true
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) {
      setQuery(q)
      doSearch(q, 'relevance')
    }
    if (autoFocus) inputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus])

  const doSearch = useCallback(async (q: string, s: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=10&sort=${s}`)
      const data = await res.json()
      setResults(data.results)
      setOpen(data.results.length > 0)
      setSelected(-1)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(e.target.value, sort), 250)
  }

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value)
    if (query.length >= 2) doSearch(query, e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, -1))
    } else if (e.key === 'Enter' && selected >= 0) {
      e.preventDefault()
      const skill = results[selected]
      window.location.href = `/skill/${encodeURIComponent(skill.name)}`
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative w-full max-w-xl mx-auto mb-8">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="search"
          placeholder="Search skills (name, description, repo)..."
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900"
          aria-label="Search skills"
        />
        <select
          value={sort}
          onChange={handleSort}
          className="px-3 py-3 rounded-lg border border-gray-300 text-gray-700 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          aria-label="Sort results"
        >
          <option value="relevance">相关性</option>
          <option value="stars">热度 ⭐</option>
          <option value="name">名称 A-Z</option>
        </select>
      </div>
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          {results.map((skill, i) => (
            <Link
              key={skill.name}
              href={`/skill/${encodeURIComponent(skill.name)}`}
              className={`block px-4 py-3 hover:bg-gray-50 border-b last:border-0 ${i === selected ? 'bg-blue-50' : ''}`}
              onClick={() => setOpen(false)}
            >
              <div className="font-semibold text-gray-900">{highlight(skill.name, query)}</div>
              <div className="text-sm text-gray-500 mt-1 line-clamp-2">{highlight(skill.desc, query)}</div>
              <div className="flex gap-3 text-xs text-gray-400 mt-1">
                <span>{skill.functionCategory}</span>
                <span>⭐ {skill.stars.toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
