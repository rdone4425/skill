import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API 文档 - Skill Hub',
  description: 'Skill Hub 搜索 API 文档，支持模糊搜索、排序、分页。',
  openGraph: {
    title: 'API 文档 - Skill Hub',
    description: '搜索 API 文档，模糊匹配、热度排序、名称排序。',
    type: 'website',
  },
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <a href="/" className="text-slate-400 hover:text-white mb-4 block">← Home</a>
          <h1 className="text-3xl font-bold">API 文档</h1>
          <p className="text-slate-400 mt-2">Skill Hub 公开 API 参考</p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">搜索接口</h2>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-mono mr-2">GET</span>
              <code className="text-blue-700 font-mono">/api/search</code>
            </div>
            <p className="text-gray-600 text-sm">模糊搜索 Skills，支持 Fuse.js 引擎。</p>

            <h3 className="font-medium mt-4 mb-2">参数</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">参数</th>
                    <th className="py-2 pr-4">类型</th>
                    <th className="py-2 pr-4">默认值</th>
                    <th className="py-2">说明</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b"><td className="py-2 font-mono text-blue-700">q</td><td className="py-2 pr-4 font-mono">string</td><td className="py-2 pr-4">—</td><td>搜索关键词（≥2字符）</td></tr>
                  <tr className="border-b"><td className="py-2 font-mono text-blue-700">limit</td><td className="py-2 pr-4 font-mono">number</td><td className="py-2 pr-4">20</td><td>返回结果数量上限</td></tr>
                  <tr><td className="py-2 font-mono text-blue-700">sort</td><td className="py-2 pr-4 font-mono">string</td><td className="py-2 pr-4">relevance</td><td>relevance / stars / name</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-medium mt-4 mb-2">示例请求</h3>
            <pre className="bg-slate-900 text-green-400 rounded p-4 text-sm overflow-x-auto">
{`GET /api/search?q=claude&limit=10&sort=stars`}
            </pre>

            <h3 className="font-medium mt-4 mb-2">响应格式</h3>
            <pre className="bg-slate-900 text-green-400 rounded p-4 text-sm overflow-x-auto">
{`{
  "results": [
    {
      "name": "claude-code",
      "desc": "...",
      "functionCategory": "agent-framework",
      "stars": 5000,
      "source": "github",
      "repo": "..."
    }
  ],
  "total": 10
}`}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">响应码</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">状态码</th>
                  <th className="py-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b"><td className="py-2 font-mono">200</td><td>成功返回 JSON</td></tr>
                <tr className="border-b"><td className="py-2 font-mono">400</td><td>缺少必需参数</td></tr>
                <tr><td className="py-2 font-mono">500</td><td>服务器内部错误</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
