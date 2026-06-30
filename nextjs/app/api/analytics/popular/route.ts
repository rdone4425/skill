import { NextResponse } from 'next/server'
import { existsSync, readFileSync } from 'fs'

export const dynamic = 'force-dynamic'

export async function GET() {
  const LOG_FILE = '/var/log/skill-hub/events.jsonl'
  if (!existsSync(LOG_FILE)) {
    return NextResponse.json({ searches: [], clicks: [] })
  }

  const lines = readFileSync(LOG_FILE, 'utf-8').trim().split('\n').slice(-5000)
  const searches: Record<string, number> = {}
  const clicks: Record<string, number> = {}

  for (const line of lines) {
    try {
      const ev = JSON.parse(line)
      if (ev.type === 'search' && ev.query) {
        searches[ev.query] = (searches[ev.query] || 0) + 1
      }
      if (ev.type === 'click_skill' && ev.skill) {
        clicks[ev.skill] = (clicks[ev.skill] || 0) + 1
      }
    } catch { /* skip bad lines */ }
  }

  const topSearches = Object.entries(searches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([query, count]) => ({ query, count }))

  const topClicks = Object.entries(clicks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([skill, count]) => ({ skill, count }))

  return NextResponse.json({ searches: topSearches, clicks: topClicks })
}