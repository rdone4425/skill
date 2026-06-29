import Link from 'next/link'
import { getAllCategories, getSkillCount } from '../lib/db'

export default function HomePage() {
  const cats = getAllCategories()
  const total = getSkillCount()

  return (
    <div className="min-h-screen">
      <header className="bg-slate-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Skill Hub</h1>
          <p className="text-slate-400">{total} skills across {cats.length} categories</p>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cats.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.id}`}>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h2 className="text-xl font-semibold mb-2">{cat.id}</h2>
                <p className="text-gray-600">{cat.count} skills</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
