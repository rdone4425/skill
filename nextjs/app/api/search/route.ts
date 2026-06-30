import { NextRequest, NextResponse } from 'next/server'
import { searchSkills } from '@/lib/db'
import {
  expandSemantic,
  getAutoComplete,
  findDidYouMean,
} from '@/lib/search-utils'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10')
  const sort = req.nextUrl.searchParams.get('sort') || 'relevance'

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [], total: 0, suggestions: [], didYouMean: null })
  }

  if (q.length === 1) {
    /* Single char: only return auto-complete suggestions */
    const { getAllSkills } = await import('@/lib/db')
    const allNames = getAllSkills().map(s => s.name)
    const suggestions = getAutoComplete(q, allNames, 5)
    return NextResponse.json({
      results: [],
      total: 0,
      suggestions,
      didYouMean: null,
    })
  }

  /* Semantic expansion: if query has Chinese, expand with English terms */
  const hasChinese = /[\u4e00-\u9fff]/.test(q)
  let results = await searchSkills(q)

  if (hasChinese && results.length < 5) {
    /* Expand query with semantic equivalents and merge results */
    const expansions = expandSemantic(q)
    const seen = new Set(results.map(r => r.name))
    for (const term of expansions.slice(1)) {
      if (term.length >= 2) {
        const extra = await searchSkills(term)
        for (const r of extra) {
          if (!seen.has(r.name)) {
            results.push(r)
            seen.add(r.name)
          }
        }
      }
    }
  }

  if (sort === 'stars') {
    results = results.sort((a, b) => b.stars - a.stars)
  } else if (sort === 'name') {
    results = results.sort((a, b) => a.name.localeCompare(b.name))
  }

  /* Auto-complete suggestions (prefix match on names) */
  const { getAllSkills } = await import('@/lib/db')
  const allNames = getAllSkills().map(s => s.name)
  let suggestions = getAutoComplete(q, allNames, 5)

  /* Filter out suggestions already in results */
  const resultNames = new Set(results.slice(0, limit).map(r => r.name))
  suggestions = suggestions.filter(s => !resultNames.has(s))

  /* Did-you-mean: when top results are weak, suggest a correction */
  let didYouMean: string | null = null
  const topNames = results.slice(0, 3).map(r => r.name.toLowerCase())
  const queryLower = q.toLowerCase().trim()
  const noDirectHit = !topNames.some(n => n === queryLower || n.startsWith(queryLower))

  if (noDirectHit || results.length === 0) {
    didYouMean = findDidYouMean(q, allNames)
  }

  results = results.slice(0, limit)
  return NextResponse.json({ results, total: results.length, suggestions, didYouMean })
}