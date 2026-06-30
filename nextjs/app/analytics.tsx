'use client'
import { useEffect } from 'react'

// ponytail: minimal page view + click tracking via sendBeacon
export function TrackPageView({ skill, category }: { skill?: string; category?: string }) {
  useEffect(() => {
    try {
      const blob = new Blob([JSON.stringify({ type: 'page_view', skill, category })], {
        type: 'application/json',
      })
      navigator.sendBeacon('/api/analytics/track', blob)
    } catch { /* no-op */ }
  }, [skill, category])
  return null
}

export function trackAffiliateClick(url: string) {
  try {
    const blob = new Blob([JSON.stringify({ type: 'click_affiliate', url })], {
      type: 'application/json',
    })
    navigator.sendBeacon('/api/analytics/track', blob)
  } catch { /* no-op */ }
}