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

interface SearchResponse {
  results: SearchResult[]
  total: number
  suggestions: string[]
  didYouMean: string | null
}

const RECENT_SEARCHES_KEY = 'skill-hub.recent-searches'
const MAX_RECENT = 8

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  try {
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
    return parts.map((p, i) =>
      p.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="bg-yellow-200 font-medium">{p}</mark>
        : p
    )
  } catch {
    return text
  }
}

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveRecentSearch(q: string) {
  try {
    const list = getRecentSearches().filter(s => s !== q)
    list.unshift(q)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list.slice(0, MAX_RECENT)))
  } catch { /* ignore */ }
}

function clearRecentSearches() {
  try { localStorage.removeItem(RECENT_SEARCHES_KEY) } catch { /* ignore */ }
}

export default function SearchBox({ autoFocus }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState('')
  const [data, setData] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showRecent, setShowRecent] = useState(false)
  const [selected, setSelected] = useState(-1)
  const [sort, setSort] = useState('relevance')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
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
    setRecentSearches(getRecentSearches())
    if (autoFocus) inputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus])

  const doSearch = useCallback(async (q: string, s: string) => {
    if (q.length < 1) {
      setData(null)
      setOpen(false)
      setShowSuggestions(false)
      return
    }
    if (q.length < 2) {
      /* Single char: show auto-complete suggestions only */
      setData(null)
      setShowSuggestions(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setShowSuggestions(false)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=10&sort=${s}`)
      const d: SearchResponse = await res.json()
      setData(d)
      setOpen(d.results.length > 0 || !!d.suggestions.length || !!d.didYouMean)
      setSelected(-1)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    setShowRecent(false)
    clearTimeout(debounceRef.current)
    if (val.length < 2) {
      setData(null)
      setShowSuggestions(val.length === 1)
      debounceRef.current = setTimeout(() => doSearch(val, sort), 100)
    } else {
      setShowSuggestions(false)
      debounceRef.current = setTimeout(() => doSearch(val, sort), 250)
    }
  }

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value)
    if (query.length >= 2) doSearch(query, e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open && !showSuggestions && !showRecent) return

    const totalItems = showSuggestions
      ? (data?.suggestions?.length || 0)
      : showRecent
        ? recentSearches.length
        : (data?.results?.length || 0) + (data?.suggestions?.length || 0) + (data?.didYouMean ? 1 : 0)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, totalItems - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, -1))
    } else if (e.key === 'Enter') {
      if (selected >= 0) {
        e.preventDefault()
        let target = ''
        if (showRecent) {
          target = recentSearches[selected]
          setQuery(target)
          doSearch(target, sort)
          setShowRecent(false)
          return
        }
        if (showSuggestions && data?.suggestions?.[selected]) {
          target = data.suggestions[selected]
        } else if (data?.didYouMean && selected === 0) {
          target = data.didYouMean
        } else {
          const idx = data?.didYouMean ? selected - 1 : selected
          const skill = data?.results?.[idx]
          if (skill) {
            saveRecentSearch(query)
            window.location.href = `/skill/${encodeURIComponent(skill.name)}`
            return
          }
        }
        if (target) {
          setQuery(target)
          saveRecentSearch(target)
          doSearch(target, sort)
        }
      } else if (data?.results?.length === 1) {
        /* Enter with no selection but single result — go directly */
        e.preventDefault()
        saveRecentSearch(query)
        window.location.href = `/skill/${encodeURIComponent(data.results[0].name)}`
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setShowSuggestions(false)
      setShowRecent(false)
      inputRef.current?.blur()
    }
  }

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false)
        setShowSuggestions(false)
        setShowRecent(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleFocus = () => {
    /* Show recent searches when input is empty/focused */
    if (!query && recentSearches.length > 0) {
      setShowRecent(true)
      setSelected(-1)
    } else if (data && (data.results.length > 0 || data.suggestions.length > 0)) {
      setOpen(true)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    saveRecentSearch(suggestion)
    doSearch(suggestion, sort)
    setShowSuggestions(false)
  }

  const handleRecentClick = (term: string) => {
    setQuery(term)
    saveRecentSearch(term)
    doSearch(term, sort)
    setShowRecent(false)
  }

  const suggestions = data?.suggestions || []
  const results = data?.results || []
  const didYouMean = data?.didYouMean

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
          onFocus={handleFocus}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900"
          aria-label="Search skills"
          autoComplete="off"
          spellCheck={false}
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
        <div className="absolute right-24 top-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Recent Searches */}
      {showRecent && recentSearches.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-gray-100">
            <span>Recent Searches</span>
            <button
              onClick={(e) => { e.stopPropagation(); clearRecentSearches(); setRecentSearches([]); setShowRecent(false) }}
              className="text-gray-300 hover:text-red-400 text-xs"
            >
              Clear
            </button>
          </div>
          {recentSearches.map((term, i) => (
            <button
              key={term}
              onClick={() => handleRecentClick(term)}
              className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 border-b last:border-0 text-sm ${i === selected ? 'bg-blue-50' : ''}`}
            >
              <span className="text-gray-400 text-xs">🕐</span>
              <span className="text-gray-700 truncate">{term}</span>
            </button>
          ))}
        </div>
      )}

      {/* Auto-complete Suggestions (when typing 1 char) */}
      {showSuggestions && query.length === 1 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            Auto-complete
          </div>
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-400">Loading...</div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {suggestions.length > 0 ? suggestions.map((s, i) => (
                <button
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 border-b last:border-0 text-sm ${i === selected ? 'bg-blue-50' : ''}`}
                >
                  <span className="text-blue-400 text-xs">🔍</span>
                  <span className="text-gray-700">{highlight(s, query)}</span>
                </button>
              )) : (
                <div className="px-4 py-3 text-sm text-gray-400">Type more to search...</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {open && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          {/* Did you mean? */}
          {didYouMean && (
            <button
              onClick={() => handleSuggestionClick(didYouMean)}
              className={`w-full text-left px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border-b border-amber-200 flex items-center gap-2 ${selected === 0 ? 'bg-amber-100' : ''}`}
            >
              <span className="text-amber-500 text-sm">💡</span>
              <span className="text-sm">
                <span className="text-gray-500">Did you mean: </span>
                <strong className="text-amber-700">{didYouMean}</strong>
              </span>
            </button>
          )}

          {/* Auto-complete suggestions for 2+ char queries */}
          {suggestions.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Suggestions
              </div>
              {suggestions.map((s, i) => {
                const idx = didYouMean ? i + 1 : i
                return (
                  <button
                    key={`sug-${s}`}
                    onClick={() => handleSuggestionClick(s)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm ${selected === idx ? 'bg-blue-50' : ''}`}
                  >
                    <span className="text-blue-400 text-xs">↗</span>
                    <span className="text-gray-700">{highlight(s, query)}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Results */}
          {results.length > 0 ? (
            results.map((skill, i) => {
              const suggestionOffset = (didYouMean ? 1 : 0) + suggestions.length
              const idx = suggestionOffset + i
              return (
                <Link
                  key={skill.name}
                  href={`/skill/${encodeURIComponent(skill.name)}`}
                  onClick={() => { setOpen(false); saveRecentSearch(query) }}
                  className={`block px-4 py-3 hover:bg-gray-50 border-b last:border-0 ${selected === idx ? 'bg-blue-50' : ''}`}
                >
                  <div className="font-semibold text-gray-900">{highlight(skill.name, query)}</div>
                  <div className="text-sm text-gray-500 mt-1 line-clamp-2">{highlight(skill.desc, query)}</div>
                  <div className="flex gap-3 text-xs text-gray-400 mt-1">
                    <span>{skill.functionCategory}</span>
                    <span>⭐ {skill.stars.toLocaleString()}</span>
                  </div>
                </Link>
              )
            })
          ) : (
            !didYouMean && !suggestions.length && (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                <div className="text-2xl mb-2">🔍</div>
                <div>No results found for &quot;{query}&quot;</div>
                <div className="text-xs text-gray-300 mt-1">Try a different keyword</div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}