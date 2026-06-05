# 🎯 Skill Hub — AI Agent Skills 导航站

> 一个按 Agent 平台和功能分类组织的静态导航站，展示并聚合各类 AI Agent Skills。

Skill Hub 现在采用“生成数据 + 动态目录加载”的结构：
- 首页从 `agents/index.json` 动态加载平台菜单和功能分类
- 具体 skill 数据存放在 `agents/<agent>/<functionCategory>/skills.json`
- `js/data.js` 不再硬编码全量数据，而是负责读取 `agents/` 目录产物
- 统计页已拆分到独立的 `stats.html`
- 页面刷新后会保留当前分类、子分类、搜索词、排序、视图和分页状态

**特点**：
- 按 Agent 平台浏览：Codex、Claude、Cursor、Copilot、Hermes、OpenCode、OpenClaw 等
- 按功能分类浏览：设计 UI、开发工具、部署运维、测试质检、自动化效率等
- 动态菜单、客户端搜索、分页和排序
- 中英文切换
- 零依赖前端（纯 HTML + CSS + JS）
- SEO 优化（JSON-LD、Open Graph、Twitter Card）

## 🖥 在线访问

**https://skill.pages.dev** — 部署在 Cloudflare Pages

## 🚀 本地运行

```bash
git clone https://github.com/rdone4425/skill.git
cd skill
python3 -m http.server 8000
# 访问 http://localhost:8000
```

或者用任何静态服务器（Nginx、Surge、Netlify 都可以）。

## ☁️ 部署到 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选择 `rdone4425/skill` 仓库
4. 配置：
   - **Build command**：留空
   - **Build output directory**：`/`（项目根目录）
5. 点击 **Save and Deploy**
6. 等 1-2 分钟，CF 会自动分配 `skill.pages.dev` 域名

> 💡 也可以用 `wrangler` CLI：`wrangler pages deploy .`

## 📁 项目结构

```
skill/
├── index.html              # 主页面（平台菜单、分类筛选、搜索、分页）
├── stats.html              # 独立统计页
├── css/
│   └── style.css           # 页面样式
├── js/
│   ├── data.js             # 动态加载 agents 目录数据
│   ├── i18n.js             # 中英文翻译
│   ├── state.js            # 页面状态与 URL/本地缓存同步
│   ├── render.js           # 首页渲染
│   ├── events.js           # 首页交互事件
│   ├── app.js              # 首页 bootstrap
│   └── stats-page.js       # 统计页逻辑
├── agents/
│   ├── index.json          # Agent 平台与功能分类索引
│   └── <agent>/
│       ├── stats.js        # 当前 agent 的统计信息
│       └── <functionCategory>/
│           └── skills.json # 当前平台 + 功能分类下的 skills
├── config/
│   └── repos.json          # 仓库来源配置
├── scripts/
│   ├── fetch-skills.py              # 拉取原始 skill 数据，写入 js/data.js
│   ├── discover-skills.py           # 搜索 GitHub 发现新仓库，写入 config/repos.json
│   ├── export-agent-function-data.js # 按 Agent/功能分类导出 agents 目录
│   ├── run-data-pipeline.sh         # fetch + export 流水线
│   └── lib/common.sh                # shell 公共函数
├── .github/
│   └── workflows/
│       ├── update-generated-data.yml # 更新 js/data.js 和 agents/
│       └── discover-skill-repos.yml  # 自动发现新仓库
├── LICENSE                 # MIT
└── README.md               # 本文件
```

**数据流**：
```
GitHub / config/repos.json
          ↓
  scripts/fetch-skills.py
          ↓
       js/data.js
          ↓
scripts/export-agent-function-data.js
          ↓
agents/index.json + agents/<agent>/<functionCategory>/skills.json + stats.js
          ↓
 index.html / stats.html 动态加载
```

## ✏️ 添加新 Skill

### 方式 A：编辑 `config/repos.json`（推荐）✅

编辑 `config/repos.json`，在 `repos` 字典中添加：

```json
{
  "repos": {
    "owner/repo-name": {
      "source": "general",
      "name": "my-skill",
      "install": "git clone https://github.com/owner/repo-name.git"
    }
  }
}
```

然后 `git commit -am "add my-skill" && git push`，CI 自动更新数据并部署。

### 方式 B：自动发现（零操作）🤖

`discover-skills.py` 会自动搜索 GitHub，发现新的高星 skill 仓库并写入 `config/repos.json`。

由 `.github/workflows/discover-skill-repos.yml` 定时运行，也可以手动触发。

### 方式 C：自动更新生成数据（CI）✅

更新链路分为两步：

1. `discover-skill-repos.yml`
   - 定时发现新仓库
   - 只更新 `config/repos.json`

2. `update-generated-data.yml`
   - 执行 `scripts/run-data-pipeline.sh`
   - 生成最新的 `js/data.js`
   - 导出 `agents/` 目录结构
   - 有变化时直接提交到 `main`

默认调度：
- `discover-skill-repos.yml`：每 6 小时
- `update-generated-data.yml`：每天 UTC 00:00

**手动触发**：
1. 打开 https://github.com/rdone4425/skill/actions
2. 选择对应 workflow
3. 点 **Run workflow**
4. `update-generated-data.yml` 可选勾选 `dry_run`

**调整更新频率**：编辑对应 workflow 里的 `cron` 字段
- `0 0 * * *` — 每天
- `0 */6 * * *` — 每 6 小时

**添加新仓库**：编辑 `config/repos.json` 的 `repos` 字典即可，无需改 Python 代码。

**回滚一次更新**：
```bash
git revert HEAD    # 创建反向 commit
git push
```

## 📊 数据来源

| 来源 | 数量 | 链接 |
|---|---:|---|
| `openai/skills` (.curated) | 39 | https://github.com/openai/skills |
| `anthropics/skills` | 17 | https://github.com/anthropics/skills |
| `ComposioHQ/awesome-codex-skills` | 1 | https://github.com/ComposioHQ/awesome-codex-skills |
| `VoltAgent/awesome-codex-subagents` | 1 | https://github.com/VoltAgent/awesome-codex-subagents |
| `hashgraph-online/awesome-codex-plugins` | 1 | https://github.com/hashgraph-online/awesome-codex-plugins |
| `RoggeOhta/awesome-codex-cli` | 1 | https://github.com/RoggeOhta/awesome-codex-cli |
| `JackyST0/awesome-agent-skills` | 1 | https://github.com/JackyST0/awesome-agent-skills |
| `router-for-me/CLIProxyAPI` | 1 | https://github.com/router-for-me/CLIProxyAPI |
| `decolua/9router` | 1 | https://github.com/decolua/9router |
| `openai/codex` | 1 | https://github.com/openai/codex |
| `nousresearch/hermes-agent` | 1 | https://github.com/NousResearch/hermes-agent |
| `openclaw/openclaw` | 1 | https://github.com/openclaw/openclaw |
| `opencode-ai/opencode` | 1 | https://github.com/opencode-ai/opencode |
| 其他通用 skills | 10 | — |

最后更新：**2026-06-04**

## 📜 License

MIT
