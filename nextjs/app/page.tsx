import Link from 'next/link'
import { getAllCategories, getSkillCount } from '../lib/db'
import SearchBox from './searchbox'
import MobileNav from './mobilenav'

const CATEGORY_CONFIG: Record<string, { icon: string; gradient: string }> = {
  'dev-tools': { icon: '🔧', gradient: 'from-blue-500 to-cyan-500' },
  'general': { icon: '🌐', gradient: 'from-gray-500 to-slate-500' },
  'data-ai': { icon: '🤖', gradient: 'from-purple-500 to-pink-500' },
  'design-ui': { icon: '🎨', gradient: 'from-pink-500 to-rose-500' },
  'agent-framework': { icon: '🧠', gradient: 'from-indigo-500 to-purple-500' },
  'docs-content': { icon: '📝', gradient: 'from-amber-500 to-orange-500' },
  'automation-productivity': { icon: '⚡', gradient: 'from-yellow-500 to-amber-500' },
  'security': { icon: '🔒', gradient: 'from-red-500 to-orange-500' },
  'social-media': { icon: '📱', gradient: 'from-pink-500 to-fuchsia-500' },
  'finance-crypto': { icon: '💰', gradient: 'from-green-500 to-emerald-500' },
  'devops-deploy': { icon: '☁️', gradient: 'from-cyan-500 to-blue-500' },
  'backend-api': { icon: '⚙️', gradient: 'from-orange-500 to-red-500' },
  'game-dev': { icon: '🎮', gradient: 'from-violet-500 to-purple-500' },
  'testing-qa': { icon: '🧪', gradient: 'from-lime-500 to-green-500' },
  'education': { icon: '📚', gradient: 'from-yellow-500 to-orange-500' },
  'health-medical': { icon: '🏥', gradient: 'from-red-500 to-pink-500' },
  '3d': { icon: '🎲', gradient: 'from-indigo-500 to-blue-500' },
  'ecommerce': { icon: '🛒', gradient: 'from-orange-500 to-amber-500' },
  'video-multimedia': { icon: '🎬', gradient: 'from-teal-500 to-cyan-500' },
  'audio': { icon: '🔊', gradient: 'from-purple-500 to-violet-500' },
  'video-gen': { icon: '📹', gradient: 'from-rose-500 to-pink-500' },
  'audio-speech': { icon: '🎙️', gradient: 'from-cyan-500 to-teal-500' },
}

export default function HomePage() {
  const cats = getAllCategories()
  const total = getSkillCount()

  return (
    <div className="min-h-screen">
      <MobileNav categories={cats} />
      {/* Hero */}
      <section className="relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Live · {total.toLocaleString()} AI Skills Indexed</span>
              <a href="/trending" className="ml-2 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs hover:bg-amber-500/30 transition-colors">🔥 Trending</a>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight">Skill Hub</h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-2">AI Agent Skills Directory</p>
            <p className="text-base text-slate-500 mb-12 max-w-2xl mx-auto">一站式 AI 技能导航站 · Find the best AI agent tools, MCP servers &amp; skills</p>
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBox />
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">{total.toLocaleString()}</div>
                <div className="text-sm text-slate-500 mt-1">Skills</div>
              </div>
              <div className="hidden md:block w-px h-12 bg-slate-700/50" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">{cats.length}</div>
                <div className="text-sm text-slate-500 mt-1">Categories</div>
              </div>
              <div className="hidden md:block w-px h-12 bg-slate-700/50" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">500+</div>
                <div className="text-sm text-slate-500 mt-1">Weekly Updates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Browse Categories</h2>
            <p className="text-gray-500 text-lg">浏览分类 · Discover AI tools by category</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {cats.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat.id] || { icon: '📂', gradient: 'from-gray-500 to-slate-500' }
              return (
                <Link key={cat.id} href={`/categories/${cat.id}`} className="group">
                  <div className="relative bg-white rounded-2xl p-6 h-full border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                    <div className={`absolute top-0 left-6 right-6 h-1 rounded-full bg-gradient-to-r ${cfg.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{cfg.icon}</div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">{cat.count}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors capitalize">{cat.id.replace(/-/g, ' ')}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cat.count} skills</p>
                    <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-indigo-600 transition-colors">
                      <span>Explore →</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Promo / Ad Section */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">🤝 Partners &amp; Sponsors</h2>
            <p className="text-gray-500 mt-1">合作推广 · 广告位开放中</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-dashed border-gray-300 text-center">
              <span className="text-3xl">📢</span>
              <h3 className="font-semibold mt-2 text-gray-700">广告位</h3>
              <p className="text-sm text-gray-400 mt-1">您的产品可在此展示</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-dashed border-gray-300 text-center">
              <span className="text-3xl">🤝</span>
              <h3 className="font-semibold mt-2 text-gray-700">联盟合作</h3>
              <p className="text-sm text-gray-400 mt-1">成为 Skill Hub 合作伙伴</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-dashed border-gray-300 text-center">
              <span className="text-3xl">⭐</span>
              <h3 className="font-semibold mt-2 text-gray-700">赞助商位</h3>
              <p className="text-sm text-gray-400 mt-1">品牌露出与流量支持</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm">
        <p>Skill Hub &copy; {new Date().getFullYear()} — AI Agent Skills Directory</p>
        <p className="mt-1"><a href="/sitemap.xml" className="hover:text-white">Sitemap</a> · <a href="/robots.txt" className="hover:text-white">Robots.txt</a></p>
      </footer>
    </div>
  )
}
