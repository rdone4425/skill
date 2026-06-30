import { NextRequest, NextResponse } from 'next/server'
import { appendFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// ponytail: simple JSONL log — no DB, no deps, just append
const LOG_DIR = process.env.ANALYTICS_LOG_DIR || '/var/log/skill-hub'
const LOG_FILE = join(LOG_DIR, 'events.jsonl')

function ensureLogDir() {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, query, skill, category, referrer } = body
    // type: 'search' | 'click_skill' | 'click_category' | 'click_affiliate'

    const event = {
      ts: new Date().toISOString(),
      type,
      query: query?.substring(0, 200),
      skill: skill?.substring(0, 200),
      category: category?.substring(0, 100),
      referrer: referrer?.substring(0, 500),
      ua: req.headers.get('user-agent')?.substring(0, 200) || '',
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
    }

    ensureLogDir()
    appendFileSync(LOG_FILE, JSON.stringify(event) + '\n')

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}