import { NextRequest, NextResponse } from 'next/server'
import { searchSkills } from '@/lib/db'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')
  const sort = req.nextUrl.searchParams.get('sort') || 'relevance' // relevance | stars | name

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total: 0 })
  }

  let results = await searchSkills(q)
  if (sort === 'stars') {
    results = results.sort((a, b) => b.stars - a.stars)
  } else if (sort === 'name') {
    results = results.sort((a, b) => a.name.localeCompare(b.name))
  }
  results = results.slice(0, limit)
  return NextResponse.json({ results, total: results.length })
}