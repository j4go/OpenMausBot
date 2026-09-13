---
name: repo-wiki
description: Use when the user asks to create, refresh, inspect, or query a repository wiki, DeepWiki-style docs, codemaps, code tours, or onboarding repo context in docs/repo-wiki/.
---

# Repo Wiki

把代码仓库转成可被人和 AI agent 复用的本地知识库。默认输出 Markdown，保存在仓库内 `docs/repo-wiki/`，用代码作为事实源，用 wiki 做压缩后的导航层。

## 使用时机

在这些场景使用本 skill：

- 用户说“生成 repo wiki / 代码仓库知识库 / deepwiki / 项目知识库 / 仓库文档”。
- 产品、PRD、开发、测试、架构、code review 类 skill 需要先了解仓库上下文。
- 接手陌生仓库，需要快速知道入口、模块、数据流、接口、测试和约束。
- 已经有 `docs/repo-wiki/`，用户要求“查 repo wiki 再做”。

## 核心原则

1. Wiki 是导航，不是代码替代品：`Wiki = overview, Code = details`。
2. 默认本地生成，不把私有仓库上传到外部服务；只有用户明确同意时才用外部 SaaS。
3. 每条关键结论都要能回到具体文件、命令或配置。
4. 先读已有文档和入口文件，再读代码；不要上来全仓库漫扫。
5. 记录生成时的 git commit，避免把过期 wiki 当成当前事实。
6. 跳过 secrets、依赖缓存、构建产物、minified bundle、锁定的大型生成文件。
7. 先生成目录/索引，再生成页面；后续查询永远先走索引，不要每次重新理解全仓。
8. Wiki 要帮助 agent 说项目自己的语言：显式记录领域词、缩写、模块别名和“不要误叫”的旧名称。
9. Wiki 要有边界和红旗：哪些地方可以直接改、哪些要先问、哪些必须验证。

## 借鉴模式

本 skill 合并六类成熟做法：

- **Codebase Onboarding**：先做 reconnaissance，再识别架构、约定、入口、测试，最后生成可持续的 onboarding 文档。
- **Code Tour**：当用户需要“走读路径”时，生成可选 `.tours/*.tour`，用真实文件和行号串成故事，而不是平铺文件列表。
- **Deep Wiki**：先生成 catalogue，再生成页面；每页包含引用、表格、图和相关页面，支持 `ask` 类查询。
- **Codemap**：为 agent 准备 token-lean 的模块索引，优先保存路径、职责、调用关系和验证命令，不复制大段实现。
- **Shared Language**：像 mature engineering skill packs 一样，提炼项目里的领域词、缩写、命名边界和 ADR 入口，减少 agent 的无谓解释和错误命名。
- **Lifecycle and Gates**：把 repo wiki 放进 spec/plan/build/test/review/ship 的生命周期里，记录 verification gates、anti-rationalization red flags 和 change boundaries。

## 产物边界

先判断用户要的是什么，不要把一个 skill 做成全家桶：

| 产物 | 适用场景 | repo-wiki 的默认策略 |
|---|---|---|
| `docs/repo-wiki/` | 可查询的仓库知识库 | 默认生成 |
| `docs/repo-wiki/index.html` | 人类可点击浏览的单页 wiki 索引 | 默认生成 |
| `codemaps/*.md` | 给 agent 快速读的压缩索引 | 默认生成 |
| `onboarding/*.md` | 给不同角色的上手材料 | 默认生成精简版 |
| `.tours/*.tour` | VS Code / CodeTour 式走读路径 | 用户要求走读时生成 |
| `AGENTS.md` / `CLAUDE.md` | 改变 agent 全局行为的规则文件 | 默认不写；用户明确要求或确认后再生成/更新 |
| `llms.txt` | 面向工具发现的 LLM 入口 | 可选增强，不默认生成 |
| VitePress / GitHub Pages | 发布型文档站点 | 可选增强，不默认生成 |

## 输出结构

默认生成：

```text
docs/repo-wiki/
├── index.md
├── index.html
├── catalogue.json
├── repo-map.md
├── architecture.md
├── modules.md
├── workflows.md
├── contracts.md
├── shared-language.md
├── boundaries-and-red-flags.md
├── verification-gates.md
├── setup-and-testing.md
├── decisions-and-gotchas.md
├── open-questions.md
├── onboarding/
│   ├── index.md
│   ├── contributor.md
│   ├── staff-engineer.md
│   └── product.md
├── codemaps/
│   ├── architecture.md
│   ├── frontend.md
│   ├── backend.md
│   ├── data.md
│   └── dependencies.md
└── _meta/
    ├── status.md
    └── refresh-log.md
```

可选生成：

```text
.tours/
└── <persona>-<focus>.tour
```

不要默认生成 VitePress、GitHub Pages、向量库或外部 SaaS 配置；只有用户明确要发布站点或搜索服务时才加。

## 工作模式

### A. 查询已有 Wiki

当任务是“查 wiki / 按 wiki 回答 / 产品或开发 skill 需要 repo 背景”：

1. 打开 `docs/repo-wiki/index.md`。
2. 打开 `docs/repo-wiki/catalogue.json`，用目录定位候选页面。
3. 查看 `_meta/status.md` 中的生成 commit、时间、覆盖范围和已知缺口。
4. 根据任务只打开相关页面，例如 `architecture.md`、`codemaps/backend.md`、`contracts.md`。
5. 在回答前看 `shared-language.md`，使用项目自己的术语；若用户或旧文档使用了历史名称，说明当前推荐名称。
6. 如果问题涉及事实判断、接口、命令、权限、安全、数据流或实现细节，必须回查源码关键文件。
7. 若 wiki 缺失或可能过期，直接到代码里核对，并在回答里说明“wiki 未覆盖/已过期，已回查代码”。
8. 回答时引用 wiki 页面和必要的源码路径。

### B. 初次生成 Wiki

当目标仓库还没有 `docs/repo-wiki/`：

1. 建立仓库快照：
   - `git rev-parse --show-toplevel`
   - `git rev-parse HEAD`
   - `git status --short`
   - `rg --files`
2. 扫描时排除噪音：
   - `.git/`、`node_modules/`、`vendor/`、`dist/`、`build/`、`.next/`、`target/`、`__pycache__/`
   - 大型锁文件、minified bundle、二进制、生成文件、测试 snapshot
3. 识别项目类型和事实源：
   - 说明文档：`README*`、`docs/**`、`AGENTS.md`、`CLAUDE.md`、`CONTRIBUTING*`
   - 包/构建：`package.json`、`pnpm-lock.yaml`、`Cargo.toml`、`pyproject.toml`、`go.mod`、`pom.xml`、`build.gradle*`
   - 运行入口：CLI、server、app、routes、main、bin、commands、workers
   - 测试入口：`tests/**`、`__tests__/**`、`*.test.*`、`*.spec.*`、CI workflow
4. 生成 `catalogue.json`，字段保持简单：
   - `title`
   - `path`
   - `purpose`
   - `source_files`
   - `children`
   - `confidence`: `verified | inferred | unknown`
5. 生成最小可用 wiki：
   - `docs/repo-wiki/index.md`
   - `docs/repo-wiki/index.html`
   - `docs/repo-wiki/catalogue.json`
   - `docs/repo-wiki/repo-map.md`
   - `docs/repo-wiki/architecture.md`
   - `docs/repo-wiki/modules.md`
   - `docs/repo-wiki/workflows.md`
   - `docs/repo-wiki/contracts.md`
   - `docs/repo-wiki/shared-language.md`
   - `docs/repo-wiki/boundaries-and-red-flags.md`
   - `docs/repo-wiki/verification-gates.md`
   - `docs/repo-wiki/setup-and-testing.md`
   - `docs/repo-wiki/decisions-and-gotchas.md`
   - `docs/repo-wiki/open-questions.md`
   - `docs/repo-wiki/_meta/status.md`
6. 生成 `shared-language.md`：
   - 领域名词、缩写、模块别名、产品词汇。
   - 已废弃/易混淆名称，以及推荐叫法。
   - 关键 ADR、设计文档或历史决策入口。
7. 生成 `boundaries-and-red-flags.md`：
   - `Always`：agent 可直接读取/更新的低风险区域。
   - `Ask first`：API contract、数据库 schema、权限、安全、发布流程、客户可见文案等。
   - `Never`：密钥、生产配置、未授权外传、无验证的大规模重写。
   - 红旗：wiki 与源码 commit 不一致、命令未验证、推断被写成事实、术语与项目约定冲突。
8. 生成 `verification-gates.md`：
   - 开发前要读哪些 wiki 页面。
   - 修改后要运行哪些测试/构建/静态检查。
   - 哪些变更需要同步 wiki。
9. 生成 `onboarding/`：
   - `contributor.md`：开发者启动、目录、第一处改动、测试方式。
   - `staff-engineer.md`：架构边界、关键抽象、风险、决策、深读顺序。
   - `product.md`：用户能力、业务流程、限制、数据/隐私视角，避免工程黑话。
10. 生成 `codemaps/`，每页控制在 1000 tokens 左右，服务 agent 快速检索。
11. 生成 `docs/repo-wiki/index.html` 单页索引：
   - 必须自包含，不依赖外部 CDN、VitePress、GitHub Pages 或本地 dev server。
   - 左侧或顶部目录使用同页 hash 导航，例如 `#architecture`，避免 Markdown 查看器无法打开相对链接。
   - 默认嵌入 `index.md`、`catalogue.json`、主 wiki 页面、`codemaps/` 和 `onboarding/` 的可读预览。
   - 至少覆盖 Catalogue、Repo Map、Architecture、Modules、Workflows、Contracts、Shared Language、Boundaries and Red Flags、Verification Gates、Setup and Testing、Decisions and Gotchas、Open Questions、onboarding 和存在的 `codemaps/` 页面；核心文件不存在时标注 `missing`，不要静默省略。
   - 保留每个 section 的源文件路径，方便用户或 agent 回到 Markdown 源。
   - 对 Markdown 内容可以先用 `<pre>` 安全转义展示；有余力时可渲染成 HTML，但不得为了渲染引入外部依赖。
12. 保持页面短而密：每页优先写“用途、入口文件、关键路径、如何验证、相关源码链接”。
13. 对不确定内容标记为 `待核实`，不要把推断写成事实。

### C. 刷新 Wiki

当代码变了或用户要求刷新：

1. 对比当前 commit 与 `_meta/status.md` 中记录的 commit。
2. 用 `git diff --name-only <old>...HEAD` 或 `git status --short` 找变化范围。
3. 只刷新受影响页面；除非用户要求，不重写整个 wiki。
4. 更新 `_meta/status.md`：
   - 当前 commit
   - 刷新时间
   - 变更文件范围
   - 刷新的 wiki 页面
   - 仍需人工确认的点
5. 对照 `verification-gates.md` 判断是否还要同步 shared language、boundaries 或 onboarding。
6. 只要刷新了任何 Markdown / JSON wiki 页面，同步重新生成 `docs/repo-wiki/index.html`，确保可点击单页索引不落后。

### D. 生成 Code Tour

当用户要求“code tour / onboarding tour / 架构走读 / PR tour / explain how X works 并想保留为可复用路径”：

1. 先读 `docs/repo-wiki/index.md` 和相关 `codemaps/`。
2. 推断读者角色：
   - `new-joiner`: 9-13 步
   - `vibecoder`: 5-8 步
   - `architect`: 14-18 步
   - `pr-reviewer`: 7-11 步
   - `security-reviewer`: 7-11 步
   - `feature-explainer`: 7-11 步
3. 每一步必须锚定真实文件、目录、行号、选择区间或模式；不能猜行号。
4. 写入 `.tours/<persona>-<focus>.tour`。
5. tour 要讲路径：orientation → module map → core path → gotcha → next move，不做平面文件清单。

### E. 回答 Repo 问题

当用户问“这个项目里 X 怎么工作 / Y 在哪里 / 产品或开发 skill 需要 repo 背景”：

1. 先查 `catalogue.json` 和相关 wiki 页面。
2. 读取 `shared-language.md`，保证命名和用户视角与项目一致。
3. 对照 `boundaries-and-red-flags.md` 判断回答是否涉及高风险边界。
4. 用 `rg` 搜索源码验证关键事实。
5. 输出：
   - 直接答案
   - 关键文件表：路径、角色、依据
   - 必要时给一个 Mermaid 流程图
   - 明确 wiki 覆盖不到或需要继续核实的点

## 页面模板

### `index.md`

```markdown
# Repo Wiki: [项目名]

生成时间：[ISO 时间]
源码 commit：[commit]
当前状态：[clean / dirty，简述]

## 快速入口
- 项目是什么：
- 主要技术栈：
- 本地启动：
- 测试命令：
- 主要入口文件：

## Wiki 页面
- [Catalogue](catalogue.json)
- [Repo Map](repo-map.md)
- [Architecture](architecture.md)
- [Modules](modules.md)
- [Workflows](workflows.md)
- [Contracts](contracts.md)
- [Shared Language](shared-language.md)
- [Boundaries and Red Flags](boundaries-and-red-flags.md)
- [Verification Gates](verification-gates.md)
- [Setup and Testing](setup-and-testing.md)
- [Decisions and Gotchas](decisions-and-gotchas.md)
- [Open Questions](open-questions.md)

## 给其他 skill 的读取规则
产品/开发/测试/架构 skill 在处理本仓库任务前，先读本页和任务相关页面；缺失细节时再回查源码。
```

### `index.html`

`index.html` 是给人类浏览的单页入口，不替代 Markdown 源文件。它解决很多本地 Markdown 查看器无法点击相对链接的问题。

最低要求：

- 自包含 HTML，写入 `docs/repo-wiki/index.html`。
- 左侧或顶部导航链接到同页 section，例如 `href="#repo-map"`。
- 至少包含 `catalogue.json`、全部主 wiki 页面、`codemaps/*.md`、`onboarding/*.md`；核心入口缺失时显示 `missing`。
- 明确覆盖 Catalogue、Repo Map、Architecture、Modules、Workflows、Contracts、Shared Language、Boundaries and Red Flags、Verification Gates、Setup and Testing、Decisions and Gotchas、Open Questions、Onboarding、Codemaps。
- 每个 section 标题显示页面名，旁边显示源文件路径。
- 用 HTML escaping 处理源文本，不能把 Markdown/JSON 里的 `<script>` 当作可执行 HTML 注入。
- 页面可直接用浏览器打开；不需要 dev server。

示意结构：

```html
<nav>
  <a href="#repo-map">Repo Map</a>
  <a href="#architecture">Architecture</a>
</nav>
<main>
  <section id="repo-map">
    <h2>Repo Map</h2>
    <code>repo-map.md</code>
    <pre>escaped markdown source</pre>
  </section>
</main>
```

### `catalogue.json`

```json
{
  "project": "[项目名]",
  "generated_at": "[ISO 时间]",
  "commit": "[commit]",
  "items": [
    {
      "title": "Architecture",
      "path": "architecture.md",
      "purpose": "系统边界、核心模块和数据流",
      "source_files": ["src/main.ts", "package.json"],
      "confidence": "verified",
      "children": []
    }
  ]
}
```

### 模块页写法

```markdown
## [模块名]

用途：

入口文件：
- `path/to/file`

关键流程：
1. ...

对外依赖：
- ...

验证方式：
- `command`

注意事项：
- ...
```

### `_meta/status.md`

```markdown
# Repo Wiki Status

生成时间：
刷新时间：
源码 commit：
工作区状态：
覆盖范围：
跳过范围：
已知缺口：
刷新规则：
```

### `codemaps/*.md`

```markdown
<!-- Generated: [ISO 时间] | Commit: [commit] | Files scanned: [n] | Token estimate: ~[n] -->

# [Area] Codemap

## Entry Points
- `path/to/file` — why it matters

## Flow
Request/Event/Command -> handler -> service -> storage/output

## Key Files
| Path | Role | Source |
|------|------|--------|
| `path/to/file` | ... | `path/to/file:line` |

## Dependencies
- ...

## Refresh Triggers
- Update this codemap when ...
```

### `shared-language.md`

```markdown
# Shared Language

## 推荐术语
| Term | Meaning | Use When | Source |
|------|---------|----------|--------|
| ... | ... | ... | `path:line` |

## 易混淆/废弃叫法
| Avoid | Use Instead | Why | Source |
|-------|-------------|-----|--------|
| ... | ... | ... | ... |

## 决策入口
- `docs/adr/...`
```

### `boundaries-and-red-flags.md`

```markdown
# Boundaries and Red Flags

## Always
- ...

## Ask First
- ...

## Never
- ...

## Red Flags
- Wiki commit 与当前源码不一致。
- 文档写了“可能/应该”，但没有源码或命令依据。
- 改动 public API、权限、安全、数据模型或部署流程却没有验证计划。
```

### `verification-gates.md`

```markdown
# Verification Gates

## Before Product/PRD Work
- Read: `index.md`, `shared-language.md`, `workflows.md`, `contracts.md`

## Before Development Work
- Read: `index.md`, `catalogue.json`, relevant `codemaps/*.md`, `boundaries-and-red-flags.md`

## After Changes
| Change Type | Commands | Wiki Pages To Refresh |
|-------------|----------|-----------------------|
| API contract | `...` | `contracts.md`, `codemaps/backend.md` |
```

## 外部工具选择

默认不需要外部工具。需要加速时按这个顺序判断：

- 本地、私有、要可提交：直接生成 `docs/repo-wiki/`。
- 只想把仓库喂给 LLM：可用 Repomix 或 Gitingest 生成 AI-friendly digest，再由 agent 写 wiki。
- 公开 GitHub 仓库、只想快速浏览：可用 DeepWiki 一类在线工具做参考，但最终结论仍要回查代码。
- 大型多语言仓库、要完整自动化：可评估 RepoWiki / CodeWiki / OpenDeepWiki 这类工具，但不要让工具输出未经核对就进入最终 wiki。

## 输出质量检查

完成前检查：

- `docs/repo-wiki/index.md` 能让新 agent 在 5 分钟内找到入口、模块、运行和测试方式。
- `docs/repo-wiki/index.html` 能在浏览器中作为可点击静态索引，覆盖 Catalogue、核心页面、onboarding 和存在的 codemaps。
- `catalogue.json` 可以作为其他 skill 的查询入口，且每个条目有 `path` 和 `source_files`。
- 每个关键模块至少有一个源码路径。
- `setup-and-testing.md` 中的命令来自真实配置或实际执行结果。
- `contracts.md` 区分真实 API/CLI/事件/数据模型与推断。
- `shared-language.md` 能帮助 agent 使用项目推荐术语，并指出易混淆旧名。
- `boundaries-and-red-flags.md` 明确 Always / Ask first / Never。
- `verification-gates.md` 把产品、开发、测试、review 前后的读取和验证动作写清楚。
- `codemaps/` 足够短，适合 agent 先读；长细节放正文页面。
- `onboarding/` 至少覆盖开发者和产品视角。
- `index.html` 能在不启动 dev server 的情况下打开；点击目录能跳到同页内容；内容与 Markdown / JSON 源同步。
- `_meta/status.md` 记录 commit 和 dirty 状态。
- 没有泄露 token、密钥、内部私密 URL 或用户本地路径中不该外发的内容。

## 和其他 skill 协作

当你是产品、PRD、开发、测试、架构或 review skill：

1. 先检查 `docs/repo-wiki/index.md` 是否存在。
2. 若存在，先读 wiki 再开始任务。
3. 若不存在，提醒用户可先生成 repo wiki；除非用户明确要求生成或刷新 repo wiki，否则继续按源码、配置、测试和既有产物回查，不得把缺失 wiki 作为产品、开发、测试、架构或 review 任务的硬阻断。
4. 如果你改动了架构、接口、模块边界、启动方式、测试方式或重要决策，同步更新对应 wiki 页面。
5. 对产品类输出，优先读 `shared-language.md`、`onboarding/product.md`、`workflows.md`、`contracts.md`。
6. 对开发类输出，优先读 `codemaps/`、`architecture.md`、`verification-gates.md`、`setup-and-testing.md` 和相关源码。
7. 对 review / security / release 类输出，优先读 `boundaries-and-red-flags.md` 和 `verification-gates.md`。
