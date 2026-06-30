'use client'

import { useState } from 'react'
import Link from 'next/link'

interface NavProps {
  categories: { id: string; count: number }[]
}

export default function MobileNav({ categories }: NavProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 text-white p-2.5 rounded-xl shadow-lg hover:bg-slate-700 transition-colors"
        aria-label="Menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm" onClick={() => setOpen(false)} />
          <nav className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-40 md:hidden overflow-y-auto animate-slide-in">
            <div className="p-4 border-b bg-slate-900 text-white">
              <h2 className="text-lg font-bold">Skill Hub</h2>
              <p className="text-sm text-slate-400">{categories.reduce((a, c) => a + c.count, 0).toLocaleString()} skills</p>
            </div>
            <div className="p-2">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2.5 rounded hover:bg-gray-100 font-medium text-gray-900"
                onClick={() => setOpen(false)}
              >
                🏠 Home
              </Link>
              <Link
                href="/trending"
                className="flex items-center gap-2 px-3 py-2.5 rounded hover:bg-gray-100 font-medium text-gray-900"
                onClick={() => setOpen(false)}
              >
                🔥 Trending
              </Link>
              <Link
                href="/search"
                className="flex items-center gap-2 px-3 py-2.5 rounded hover:bg-gray-100 text-gray-700"
                onClick={() => setOpen(false)}
              >
                🔍 Search
              </Link>
              <div className="mt-2 mb-1 px-3 text-xs text-gray-400 font-medium uppercase tracking-wider">Categories</div>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm"
                  onClick={() => setOpen(false)}
                >
                  <span className="truncate">{cat.id.replace(/-/g, ' ')}</span>
                  <span className="text-xs text-gray-400 ml-2 shrink-0">({cat.count})</span>
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </>
  )
}