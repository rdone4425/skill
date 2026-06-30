import { NextRequest, NextResponse } from 'next/server'
import { searchSkills } from '@/lib/db'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total: 0 })
  }

  const results = (await searchSkills(q)).slice(0, limit)
  return NextResponse.json({ results, total: results.length })
}