import Link from 'next/link'
import { getAllCategories, getSkillCount } from '../lib/db'
import SearchBox from './searchbox'
import MobileNav from './mobilenav'

export default function HomePage() {
  const cats = getAllCategories()
  const total = getSkillCount()

  return (
    <div className="min-h-screen">
      <MobileNav categories={cats} />
      <header className="bg-slate-900 text-white py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Skill Hub</h1>
          <p className="text-slate-400 text-sm sm:text-base">{total} skills across {cats.length} categories</p>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Find the best AI Agent skills for Claude, Codex, Cursor & more</p>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <SearchBox />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {cats.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.id}`}>
              <div className="bg-white rounded-lg shadow p-5 sm:p-6 hover:shadow-lg transition">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">{cat.id}</h2>
                <p className="text-gray-600 text-sm">{cat.count} skills</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <footer className="bg-slate-900 text-slate-400 py-6 mt-12 text-center text-sm">
        <p>Skill Hub &copy; {new Date().getFullYear()} — AI Agent Skills Directory</p>
      </footer>
    </div>
  )
}