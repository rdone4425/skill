'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface SearchResult {
  name: string
  desc: string
  functionCategory: string
  stars: number
  source: string
}

export default function SearchBox() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=10`)
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
    debounceRef.current = setTimeout(() => doSearch(e.target.value), 250)
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
      <input
        ref={inputRef}
        type="search"
        placeholder="Search skills (name, description, repo)..."
        value={query}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900"
        aria-label="Search skills"
      />
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
              <div className="font-semibold text-gray-900">{skill.name}</div>
              <div className="text-sm text-gray-500 mt-1 line-clamp-2">{skill.desc}</div>
              <div className="flex gap-3 text-xs text-gray-400 mt-1">
                <span>{skill.functionCategory}</span>
                <span>⭐ {skill.stars}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}