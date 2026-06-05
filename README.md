# Skill Hub

一个按 Agent 平台和功能分类组织的静态导航站，用来浏览、筛选和统计 AI Agent Skills。

当前站点的数据来源已经收敛为仓库内已提交的 `agents/` 目录产物。前端运行时不会再读取 `config/repos.json` 之类的上游配置文件。

## 功能

- 按 Agent 平台浏览：Codex、Claude、Cursor、Copilot、Hermes、OpenCode、OpenClaw、Multi-Agent、Other
- 按功能分类筛选：Design UI、Dev Tools、Docs Content、DevOps Deploy、Data AI、Testing QA 等
- 搜索、排序、分页、视图切换
- 中英文切换
- 独立统计页
- 纯静态前端：HTML + CSS + JavaScript

## 在线访问

- 主站：[https://skill.442595.xyz/](https://skill.442595.xyz/)

## 本地运行

这是一个纯静态站点，直接起一个本地 HTTP 服务即可：

```bash
git clone https://github.com/rdone4425/skill.git
cd skill
python -m http.server 8000
```

然后访问 [http://127.0.0.1:8000/](http://127.0.0.1:8000/)。

## 部署

项目使用 Cloudflare Pages 资产部署，配置见 [wrangler.jsonc](./wrangler.jsonc)。

手动部署示例：

```bash
npx wrangler pages deploy . --project-name=skill-hub
```

## 当前数据结构

```text
skill/
├─ index.html
├─ stats.html
├─ css/
│  └─ style.css
├─ js/
│  ├─ app.js
│  ├─ data.js
│  ├─ events.js
│  ├─ i18n.js
│  ├─ render.js
│  ├─ state.js
│  └─ stats-page.js
├─ agents/
│  ├─ index.json
│  ├─ health-report.json
│  └─ <agent>/
│     ├─ stats.js
│     └─ <functionCategory>/
│        └─ skills.json
├─ .github/
│  ├─ scripts/
│  │  └─ refresh_skill_hub_data.py
│  └─ workflows/
│     └─ update-skill-hub-content.yml
├─ assets/
├─ LICENSE
├─ README.md
├─ wrangler.jsonc
└─ _headers
```

## 运行时数据链路

页面运行时的数据链路如下：

```text
agents/index.json
        +
agents/<agent>/<functionCategory>/skills.json
        +
agents/<agent>/stats.js
        ↓
js/data.js / js/state.js / js/render.js / js/stats-page.js
        ↓
index.html / stats.html
```

也就是说：

- 首页和统计页依赖的是 `agents/` 目录里的生成产物
- 修改 `agents/` 数据会直接影响页面展示
- 当前仓库不再通过 `config/repos.json` 驱动前端

## 数据维护

当前仓库保留了一条“维护已存在数据”的 GitHub Actions 流程：

- 工作流：[.github/workflows/update-skill-hub-content.yml](./.github/workflows/update-skill-hub-content.yml)
- 脚本：[.github/scripts/refresh_skill_hub_data.py](./.github/scripts/refresh_skill_hub_data.py)

这条流程当前主要负责：

- 刷新已收录仓库的 GitHub stars
- 检查仓库或链接是否失效
- 更新 `agents/health-report.json`
- 重写各 Agent 的 `stats.js`

注意：它现在不是“自动发现新仓库”的管线，而是“维护现有数据”的管线。

## 如何新增或修改 skill

当前推荐直接编辑 `agents/` 目录里的数据文件，而不是改某个上游配置表。

### 1. 新增一个 skill

把 skill 写入对应 bucket：

```text
agents/<agent>/<functionCategory>/skills.json
```

每条 skill 至少应包含这些字段：

```json
{
  "name": "example-skill",
  "source": "general",
  "agent": "codex",
  "group": "dev-tools",
  "repo": "owner/repo",
  "stars": 1234,
  "desc": "Short description",
  "url": "https://github.com/owner/repo",
  "install": "git clone https://github.com/owner/repo.git",
  "functionCategory": "dev-tools"
}
```

### 2. 同步目录索引

新增或移动 bucket 后，需要同步更新：

```text
agents/index.json
```

它至少要反映：

- `totalSkills`
- 各个 `agent + functionCategory` bucket 的 `count`

### 3. 可选：刷新 stars 和健康报告

本地执行：

```bash
python .github/scripts/refresh_skill_hub_data.py --root . --verbose
```

如果只想检查不落盘，可以加：

```bash
python .github/scripts/refresh_skill_hub_data.py --root . --dry-run
```

## 维护建议

- 改动 `agents/**/skills.json` 后，顺手检查 `agents/index.json` 是否仍然匹配
- 如果首页总数、分类总数、分页不对，先检查 `agents/index.json`
- 如果统计页空白或缺数据，先检查 `js/stats-page.js` 和 `agents/health-report.json`

## License

MIT
