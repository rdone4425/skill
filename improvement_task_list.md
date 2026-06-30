# Skill Hub 改进任务清单

## 执行日期
2026-06-30

## 一、分类体系问题与改进建议

### 1.1 分布严重不均

| 指标 | 数值 |
|---------|---------|
| **总技能数** | 5562 |
| **Top 3 分类占比** | 45.1% (dev-tools + agent-framework + general) |
| **Bottom 3 分类占比** | 3.3% (video-gen + audio-speech + ecommerce) |
| **最大最小比** | 21.6x (dev-tools:1143 vs video-gen:53) |
| **分类数** | 22 |

### 1.2 分类分布现状

```
dev-tools                   1143 (20.6%) ██████████
agent-framework              761 (13.7%) ██████
general                      628 (11.3%) █████
data-ai                      546 ( 9.8%) ████
design-ui                    420 ( 7.6%) ███
security                     234 ( 4.2%) ██
automation-productivity      223 ( 4.0%) ██
docs-content                 199 ( 3.6%) █
backend-api                  173 ( 3.1%) █
social-media                 142 ( 2.6%) █
finance-crypto               139 ( 2.5%) █
devops-deploy                128 ( 2.3%) █
testing-qa                   103 ( 1.9%)
game-dev                     101 ( 1.8%)
education                    100 ( 1.8%)
video-multimedia              96 ( 1.7%)
health-medical                87 ( 1.6%)
3d                            81 ( 1.5%)
ecommerce                     77 ( 1.4%)
audio                         73 ( 1.3%)
audio-speech                  55 ( 1.0%)
video-gen                     53 ( 1.0%)
```

### 1.3 已发现的分类问题

1. **`general` 过大 (628个, 11.3%)** — 成为“垃圾桶”分类，降低了分类体系的可发现性
2. **Bottom 5 分类合计仅 393个 (7.1%)** — video-gen(53), audio-speech(55), audio(73), ecommerce(77), 3d(81) 数量过少
3. **存在功能重叠的分类**:
   - `video-multimedia`(96) 与 `video-gen`(53) 可合并
   - `audio`(73) 与 `audio-speech`(55) 可合并
   - `game-dev`(101) 是否属于 media-creation 待确认
4. **groups 顶层设计与实际分类不匹配** — `groups` 只有4个且与22个分类关联混乱

### 1.4 改进任务

- [ ] **TASK-001**: 将 `video-multimedia` (96) 和 `video-gen` (53) 合并为新的 `video` 分类，共 **149 skills**
- [ ] **TASK-002**: 将 `audio` (73) 和 `audio-speech` (55) 合并为 `audio-speech` 分类，共 **128 skills**
- [ ] **TASK-003**: 拆分过大的 `general` 分类 (628)，根据关键词重新归类到现有分类或新建子分类
- [ ] **TASK-004**: 将 `ecommerce` (77) 合并入 `backend-api` 或 `automation-productivity`
- [ ] **TASK-005**: 重新设计 `groups` 体系，使4个group能更好覆盖22个分类
- [ ] **TASK-006**: 为每个分类定义更清晰的纳入标准文档，防止general持续膨胀
- [ ] **TASK-007**: 新增 `mcp-server` 和 `browser-automation` 独立分类(当前在 `LEGACY_CATEGORY_HIERARCHY` 中存在但未实际使用)
- [ ] **TASK-008**: 将 `health-medical` (87) 和 `education` (100) 数量少的分类评估是否合并到 `docs-content` 或保持独立

---

## 二、SEO Metadata 问题

### 2.1 当前状态

- ✅ 首页有基本的 meta description/keywords
- ✅ sitemap.xml 包含22个分类页面
- ✅ robots.txt 基本配置
- ✅ 各分类有 schema.org ItemList 结构化数据
- ✅ RSS feed 存在 (rss.xml)

### 2.2 发现的问题

1. **首页 meta description 数字过期**: `4258+` → 实际已 `5562`
   ```html
   <!-- 当前 -->
   <meta name="description" content="Skill Hub 收录 4258+ AI Agent Skills...">
   ```
2. **缺少分类独立页面的 meta 标签** — 分类页面是静态生成还是动态加载？如果是静态，需为每个分类设置独立的 `<title>` 和 `description`
3. **structured data 中 `itemListElement` 可能包含过多条目** — 影响SEO爬虫效率
4. **缺少 Open Graph image 的实际生成** — `og-image.png` 是否泛用？
5. **缺少 canonical URL 处理** — `?lang=en` 和 `?search=xxx` 参数未做 canonical 规范
6. **缺少 `BreadcrumbList` 结构化数据** — 分类层级无法被搜索引擎理解

### 2.3 改进任务

- [ ] **TASK-009**: 将首页 meta description 中的 `4258+` 更新为 `5562+`
- [ ] **TASK-010**: 为每个分类独立页面生成唯一的 `<title>` 和 `<meta name="description">`（如不能SSR，使用JS动态更新）
- [ ] **TASK-011**: 添加 `BreadcrumbList` schema.org 结构化数据到分类页面
- [ ] **TASK-012**: 实现动态 canonical URL，过滤掉 `?search=`, `?page=` 等参数
- [ ] **TASK-013**: 生成各分类的独立 Open Graph 图片
- [ ] **TASK-014**: 为分页、搜索页面添加 `noindex` 或正确的 canonical
- [ ] **TASK-015**: 在 `category_metadata.json` 中为每个分类添加 `updatedAt` 字段并更新至 sitemap

---

## 三、移动端体验问题

### 3.1 当前响应式策略

已存在的媒体查询：
- `@media (max-width: 400px)` — 小手机
- `@media (max-width: 640px)` — 推荐区
- `@media (max-width: 768px)` — 平板/大手机 (共5处)
- `@media (max-width: 980px)` — header网格
- `@media (max-width: 1100px)` — 侧边栏收缩
- `@media (max-width: 1180px)` — 工具栏
- `@media (prefers-color-scheme: dark)` — 暗色模式

### 3.2 发现的问题

1. **header 在 768px-980px 可能文字换行** — inconsistent 的空间处理
2. **controls 侧边栏在移动端变为 static (非sticky)** — 但仍有 `max-height: calc(100vh - 104px)`，会导致小屏幕上内容被截断
3. **trending-tags 未在 mobile 做水平滚动** — 标签会换行成多行，占据过多空间
4. **search-suggest 在移动端 `max-height: 320px`** — 在小屏幕上可能显得过大
5. **暗色模式 hardcoded colors 太多** — 第3214行的 `prefers-color-scheme: dark` 使用 `!important` override 大量样式，可能导致未来维护困难
6. **分类页面的 `category-search-form` 在 768px 以下变为 `flex-direction: column`** — 但 search-input 和 search-btn 的 gap 未做适当调整
7. **缺少 touch-friendly 的 hover 态处理** — 移动端 hover 状态不会自动解除
8. **View-toggle 按钮在移动端的 `min-width: 96px`** — 在小屏幕上占用过多空间

### 3.3 改进任务

- [ ] **TASK-016**: 修复 controls 在 mobile 的 max-height 问题（去掉或改用动态计算）
- [ ] **TASK-017**: 为 trending-tags 添加 `overflow-x: auto` 实现水平滚动
- [ ] **TASK-018**: 优化 search-suggest 在移动端的 max-height 为 `min(320px, 50vh)`
- [ ] **TASK-019**: 重构暗色模式 CSS，减少对 `!important` 的依赖
- [ ] **TASK-020**: 为所有 hover 样式添加 `@media (hover: hover)` 包裹，避免移动端误触
- [ ] **TASK-021**: 在 768px 以下将 view-toggle 改为 icon-only 模式
- [ ] **TASK-022**: 添加 `-webkit-tap-highlight-color: transparent` 消除移动端点击高亮
- [ ] **TASK-023**: 检查所有 `min-width`, `min-height` 在移动端是否造成溢出

---

## 四、其他问题

### 4.1 代码层面

- `css/style.css` 3367行过大，建议拆分
- JS文件按功能加载，但 `data.js` 的 `LEGACY_CATEGORY_HIERARCHY` 中有未在22个分类中使用的条目（`multi-modal`, `browser-automation`, `mcp-server`, `llm`, `rag`, `image-gen`）
- 部分分类页面（如 `dev-tools/index.html`）大小78KB，包含大量硬编码JS

### 4.2 改进任务

- [ ] **TASK-024**: 将 `css/style.css` 拆分为 `variables.css`, `layout.css`, `components.css`, `responsive.css`
- [ ] **TASK-025**: 清理 `LEGACY_CATEGORY_HIERARCHY` 中未使用的分类映射
- [ ] **TASK-026**: 分类统计页面的 `<script>` 引用版本号不一致（`v=25` vs `v=31` vs `v=32`）
