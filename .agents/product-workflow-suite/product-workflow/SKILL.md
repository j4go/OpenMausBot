---
name: product-workflow
description: 人点名后连跑完整产品工作流。不知道该点哪条时用 $product:ask。
disable-model-invocation: true
---

# 产品工作流

## 命令

```text
$product:workflow <需求>
```

## 使用门禁

只在用户点名 `$product:workflow`，或明确要求运行完整产品工作流套件时进入。

进入第一阶段前先读 `references/run-mode.md`，选择 `stage-gated`、`through-run` 或 `lite` 并写入 `.workflow-state.json`。`lite` 只能在符合小改判定且用户明确确认后采用。

## 公共契约和语言

执行本 skill 时，默认使用简体中文回复用户，并默认使用简体中文编写所有产品工作流产物（Markdown 与状态文件）。看板是派生展示，落在 `.review-board/`，不在其中另写 tab 正文。单一源头原则见 `references/common-contracts.md`。

命令名、文件路径、API 路径、代码标识符、枚举值、测试编号、验收标准编号保留原始技术形式。只有用户明确要求其他语言时，才使用其他语言。

单步阶段 skill 的共享规则集中在 `references/common-contracts.md`；完整流程执行也必须遵守其中的 Project Init Config Gate、Wiki Context Gate、语言、单问题澄清协议、产品模式协议、贯穿式不懂就问门禁、看板、软件门户同步、对抗审查和批准前通用自检契约。

## 输入契约

运行完整 `$product:workflow` 前，先检查活跃项目根目录是否存在 `.product-workflow-config.json` 和 `docs/product-workflow/project-profile.md`。如果 config 缺失，必须先执行 `$product:init`，生成项目级配置后再进入问题澄清。如果 config 存在但 `profile_path` 指向的 profile 缺失或不可读，必须请求 `$product:init --refresh`；只有用户明确授权继续时才可继续，并记录风险。如果 config 存在但 freshness 明显过期，必须建议 `$product:init --refresh`；用户明确要求继续时，后续产物必须记录 stale-config continuation、风险和额外回查责任。`explicit_override` 只用于用户明确覆盖或偏离 `workflow_policy` 或项目默认配置的情况。

完整 `$product:workflow` 必须继承 `workflow_policy.product_mode`、`clarification_style` 和 `mode_detection`。如果配置缺少 `product_mode`，视为 `unknown`；进入 PRD、原型、测试、技术方案或开发计划前，必须用一个问题确认模式，或取得用户明确授权按假设继续。按假设继续只允许下游阶段以 `Draft` 继续；不得标记为 `Reviewed`，除非用户明确接受模式假设、风险和受影响范围，并允许批准。用户显式说明从 0 到 1或从 1 到 n时优先采用用户指定；若项目证据冲突，只问一个冲突确认问题。

先把用户输入规范化为问题表格，再写任何产物。问题表格必须包含：

- 原始需求
- 目标用户
- 业务背景
- 触发场景
- 约束
- 假设
- 成功指标
- 风险
- 待确认问题

如果输入缺少领域、目标用户、触发场景或成功指标，先问一个澄清问题，再生成 PRD 内容。未知信息必须显式标为假设或待确认问题，不要编造成事实。

## AI 不确定性澄清门禁

写任何正式产物前，先判断哪些内容是 AI 无法从用户输入、既有产物或项目上下文中可靠确认的。阻断性不确定项不得只写进“假设”或“待确认问题”后继续生成完整产物，必须先问用户。

本门禁贯穿项目初始化、问题澄清、Project Wiki、PRD、原型、测试用例、自动化测试计划、技术方案、开发计划、开工和开发执行；任一阶段遇到 concern、blocker、关键步骤缺口、指令不清楚、事实冲突、验收不可判定、验证不可执行或无法按原文执行，都必须停下来问用户或回前序阶段修正。

阻断性不确定项包括会改变以下内容的未知信息：

- 目标用户、业务目标、成功指标、范围边界或非目标
- 核心用户旅程、触发场景、验收标准或优先级
- 权限、安全、隐私、合规、数据保留或审计要求
- 系统边界、集成方、数据模型、状态机、接口契约或发布/回滚策略
- 项目事实与用户表述、既有产物或代码探索结果冲突

如果存在阻断性不确定项，必须停止生成正式产物并询问用户。询问必须遵守单问题澄清协议：先建立不确定性队列，按对范围、验收、权限/数据、系统边界、发布/回滚和验证可执行性的影响排序；每轮只问最高优先级的一个决策点。只有用户明确回答，或明确授权“先按假设继续”，才能继续生成完整产物。非阻断性不确定项可以标为假设或待确认问题，但不得静默省略；请求阶段批准时必须附上未解决不确定项清单。

## 项目上下文探索门禁

写 PRD 或后续技术产物前必须探索当前项目/仓库上下文，不得只依赖用户一句需求或澄清产物。项目包含多个代码仓、多包 workspace、多个部署单元，或需求跨前端/后端/worker/infra/admin 等边界时，必须先生成或刷新 `project-wiki.md`。所有项目上下文探索必须先满足 Project Init Config Gate；当 `workflow_policy.code_exploration` 为 `user_declined` 时，跳过源码、测试、配置和 CI 探查，只能使用用户提供信息、profile/config、已有产品产物和用户允许的文档。需要查代码时必须先请求本次明确授权，或请求 `$product:init --refresh` 修改配置。除非用户明确要求“不要看代码/不要探索项目”，否则必须：

1. 确认当前产品工作流目录和活跃项目根目录。
2. 判断当前是单仓、多仓，还是多包 workspace；逐个 repo 判断是否已有 repo wiki。有 repo wiki 就按公共契约读取 `index.md`、`catalogue.json`、`_meta/status.md`、`shared-language.md` 和需求相关页面，引用、摘要并做冲突检查；没有 repo wiki 就生成 `repo-wikis/<repo-slug>.md`，再把仓库/包边界、repo wiki 状态和处理方式写入 `project-wiki.md`，或说明为什么本期不需要独立 Project Wiki。
3. 后续阶段读取任何 repo wiki 前，必须先检查当前工作流目录的 `project-wiki.md`，使用其中的仓库/包地图、Repo Wiki 状态矩阵和生成/引用路径决定读取哪些 repo wiki 或 `repo-wikis/<repo-slug>.md`。
4. 如果活跃项目根目录存在 `docs/repo-wiki/index.md`，优先用 `catalogue.json` 选择需求相关页面。repo wiki 只作为导航和压缩上下文；涉及接口、权限、数据、命令或实现细节时仍必须回查源码。
5. 从需求/澄清产物提取 3-8 个关键词，用 `rg` 搜索相关代码、文档、脚本、测试、配置和历史产物。
6. 阅读最相关的文件片段，区分已存在能力、可复用模块、已知限制、安全/权限/测试约束、与澄清假设冲突的事实。
7. 在 `project-wiki.md` 和 PRD 中写入项目上下文探索结果，并让后续测试用例、自动化测试计划、技术方案和开发计划继承这些事实；项目上下文探索必须记录 Project Wiki 和 repo wiki 依据：已读 Project Wiki 章节、已读 wiki 页面、已回查源码路径、wiki 缺口或过期风险。
8. 如果项目根目录不明确、搜索结果为空、仓库职责冲突、或探索结果与用户决策冲突，先问一个澄清问题，不得直接继续生成完整产物。

示例：

```bash
rg -n "CLI|cli|命令行|doctor|workflow|render|validate|token|audit" .
rg --files | rg "(cli|workflow|doctor|workspace|token|audit|scripts|docs)"
```

## 流程

在以下目录创建产物：

```text
docs/product-development/YYYY-MM-DD-<topic>/
```

必需文件：

项目根目录必需初始化文件：

- `docs/product-workflow/project-profile.md`
- `.product-workflow-config.json`

产品工作流目录必需文件：

- full（`stage-gated` / `through-run`）：`clarify.md`、`project-wiki.md`、`prd.md`、`prototype.html`、`test-cases.md`、`automation-test-plan.md`、`technical-solution.md`、`development-plan.md`、`.workflow-state.json`。
- `lite`：只生成 `prd.md`、`development-plan.md`、`develop.md`、`.workflow-state.json`；其余阶段在 state 标 `Not Applicable` 并写原因，不生成空壳。
- `.workflow-state.json` 是阶段状态的唯一源头。

看板资源放在 `.review-board/`，不列入必交产物，不提交。每个阶段写完源头后必须运行 `render_review_board.mjs` 或 `open_review_board.mjs`。升级安装后在项目根运行：

```bash
node "${CODEX_HOME:-$HOME/.codex}/skills/product-workflow/scripts/migrate_suite.mjs" .
```

条件文件/目录：

- `stitch-prototype.md`：当采用 Stitch 路线时生成，用于记录 Stitch MCP/SDK 能力检查、项目链接、screen/frame 清单、PRD 覆盖矩阵、状态覆盖、评审缺口和恢复路径。
- `repo-wikis/<repo-slug>.md`：当 Project Wiki 发现相关 repo 缺少 repo wiki 时生成。
- `.workflow-state.json` 已是必交源头（见上），状态枚举：`Draft` / `Reviewed` / `Blocked` / `Not Generated` / `Not Applicable`。禁止把状态写进 HTML。

## 阶段委托硬门禁

完整 `$product:workflow` 是编排器，不是单步 skill 的替代品。每个阶段的核心产物必须委托或等价执行对应阶段 skill 的规则；不得在完整 workflow 内用简略 bullet 直接替代阶段产物。

阶段映射：

| 阶段 | 必须遵守的 skill |
| --- | --- |
| 项目初始化 | `$product:init` |
| 问题澄清 | `$product:clarify` |
| Project Wiki | `$product:project-wiki` |
| PRD | `$product:prd` |
| 对抗审查 | `$product:review`（`prd.md` / `development-plan.md` 写成 Draft 之后） |
| HTML 原型 | `$product:prototype` |
| Stitch 原型 | `$product:stitch-prototype` |
| 测试用例 | `$product:test-cases` |
| 自动化测试计划 | `$product:test-automation` |
| 技术方案 | `$product:technical-solution` |
| 开发计划 | `$product:plan` |
| 开工检查 | `$product:kickoff` 或 `$product:开工` |
| Git Hook 质量门禁 | `product-git-hook-init/SKILL.md` |
| 开发执行 | `$product:develop` |

如果当前会话无法调用某个阶段 skill，必须停止并说明缺失，不得自行生成低配替代物。若单阶段 skill 与本总流程发生冲突，以更具体的单阶段 skill 为准；只有跨阶段顺序、审批门禁和产物目录由 `$product:workflow` 统一控制。

full 阶段顺序：项目初始化、问题澄清、Project Wiki、PRD、**review**、原型、测试用例、自动化测试计划、技术方案、开发计划、**review**、开工、开发执行。`prd.md` / `development-plan.md` 写成 Draft 之后、请人批之前各跑一次 `$product:review`。`stage-gated` 时做完当前阶段即停；`through-run` 时按顺序写完范围内阶段，PRD 与开发计划必有，两份 Draft 都要过 review。

`lite` 顺序：轻量探查并推荐模式 → 用户确认 lite → 短 `prd.md` → `$product:review` → 用户批准短 PRD → 短 `development-plan.md`（可并进 develop，仍过 review）→ `$product:develop` → `develop.md` 验证证据 → 用户批准证据。无需单独运行 clarify / Project Wiki / 原型 / 测试用例 / 自动化测试计划 / 技术方案 / 开工阶段 skill。

自动化测试计划阶段条件必跑：当需求涉及真实实现、UI/API 行为、数据或权限风险、跨仓协作、回归风险或发布信心要求时，必须使用 `$product:test-automation` 生成 `automation-test-plan.md`。纯文档、纯探索、无实现交付，或用户明确确认不需要自动化测试时，可以将本阶段标记为 `Not Applicable`，但必须在 `automation-test-plan.md` 写明原因；如果初始化配置的 `workflow_policy.test_automation` 为 `required`，本次标记不适用必须记录 `explicit_override`、原因、风险和后续回收点。

原型阶段必须按用户目标和 PRD 选择路线：

- HTML 路线：使用 `$product:prototype` 产出自包含 `prototype.html`。
- Stitch 路线：使用 `$product:stitch-prototype` 通过 Stitch MCP/SDK 产出 `stitch-prototype.md`；若不需要 HTML 原型，将 `prototype.html` 标记为 `Not Applicable`；若 MCP/SDK、认证、项目写入或 metadata 读取不可用，将原型阶段标记为 `Blocked`，等待用户修复或明确批准切换 HTML 路线。

所有原型路线都必须读取 `project-wiki.md`、repo wiki 导航和 PRD 中的 `原型约束契约`。若 PRD 没有该契约，必须回到 `$product:prd` 补齐后再进入原型。Stitch 路线不得在失败时自动 fallback 到 HTML。

## 看板元信息契约

全局看板元信息的定义和通用要求（`<title>`、`header h1`、当前阶段提示、导航状态、hash/tab 激活脚本、标题随激活阶段变化、新增/批准阶段后更新 nav 等）见公共契约 § 看板。本 skill 作为编排器补充以下跨阶段要求：

- 页面初始 `<title>` 不得长期停留在“问题澄清”或旧阶段；应体现需求主题和当前最新阶段，例如 `CLI 端价值判断 - 开发计划 Draft`。
- 顶部 `header` 应展示稳定主题标题，例如 `CLI 端价值判断 - 产品工作流评审看板`，并展示当前阶段/最新进度，例如 `当前阶段：开发计划 Draft`。
- 点击顶部 tab 或通过 `#clarify`、`#project-wiki`、`#prd`、`#prototype`、`#test-cases`、`#test-automation`、`#technical-solution`、`#development-plan`、`#start-implement`、`#develop` 激活阶段时，脚本必须同步更新 `document.title` 和当前阶段提示。项目画像在 `docs/product-workflow/project-profile.md`，不是看板 tab。
- 请求评审前自检至少两个 hash：当前阶段 hash 和上一阶段 hash，确认 tab、标题、header 当前阶段提示一致。

不要手写整份 HTML。每个阶段写完或改过源头后，必须运行 `render_review_board.mjs`，确认 `.review-board/index.html` 存在，再请求批准或进入下一阶段。日常打开用：

```bash
node "${CODEX_HOME:-$HOME/.codex}/skills/product-workflow/scripts/open_review_board.mjs" docs/product-development/YYYY-MM-DD-<topic>
```

也可直接打开 `.review-board/index.html`。改 Markdown 或状态后重新运行生成器更新快照。不要为同步「已评审」手写 HTML。

## 软件门户

同步时机和完成标准见公共契约 § 软件门户同步。命令见 `docs/product-workflow/portal.md`。

## 审批规则

full 模式下，项目初始化配置、Project Wiki、PRD、原型或用户确认不适用的原型、测试用例、自动化测试计划或用户确认不适用的自动化测试计划、技术方案、开发计划全部明确批准或确认可用前，不得开始实现。若用户明确确认当前单仓需求不需要独立 Project Wiki，必须在 `project-wiki.md` 或后续产物中记录“不适用”原因。如果 `product_mode` 为 `unknown`，PRD、原型、测试用例、自动化测试计划、技术方案和开发计划不得标记为 `Reviewed`，除非用户明确接受模式假设、风险和受影响范围，并允许相关阶段按该假设批准。

`lite` 只保留两道批准门：短 `prd.md` 的范围/验收/验证/不做已批准，才能实现；`develop.md` 的本轮新鲜验证证据由用户批准，切片才完成。短 `development-plan.md` 不单独请求批准，其状态保持 `Draft`。

开工前必须按公共契约 § 开工前交付物核对，并批判性审查 `development-plan.md`。只要计划存在 concern、blocker、关键步骤缺口、指令不清楚或无法按原文执行的任务，就必须停下来问用户或回前序阶段修正，不能边猜边开工。

full 模式开工时先使用 `$product:kickoff` 或 `$product:开工` 做执行方式推荐和门禁检查。除非用户已经在同一句中明确批准执行方式，否则不得直接进入实现。lite 的开工检查内联合并到 develop，默认 single，不增加第三道批准门。

## 输出契约

full 模式下，薄摘要是失败产物。`lite` 例外：按 run-mode 契约使用短 PRD 和短开发计划，但范围、验收、验证命令、非目标、文件范围和回滚仍不得省略。

每个产物开头必须提供足够上下文，帮助第一次阅读的人理解：这个阶段为什么存在、谁应该评审、评审人需要做什么决策、依赖哪些前置事实或假设、关键术语/编号/角色/状态是什么意思、哪些内容尚未确认。不要让产物一开始就进入表格、编号或接口细节。

- 项目初始化：项目级画像、客户/项目现状、仓库结构、知识库现状、设计/原型默认路线、测试与发布策略、freshness、open questions、`.product-workflow-config.json` 强配置和显式覆盖规则。
- 问题澄清：目标用户、用户任务、当前流程、痛点、目标、约束、假设、风险、成功指标、非目标、待确认问题。
- Project Wiki：项目根目录、仓库/包地图、repo wiki 状态矩阵、生成或引用的 repo wiki 路径、系统边界、跨仓流程、共享契约、本地开发/验证命令、术语表、风险和待确认问题。
- PRD：完整产品背景、至少 5 条用户故事、至少 8 条验收标准、指标、范围、非目标、风险、待确认问题；必须包含“用户旅程 → 用户故事 → 验收标准”的追踪矩阵，确保旅程、故事和 AC 不脱节；涉及多角色交互或状态变化时，必须补充时序图和状态机图。面向 UI/交互的需求还必须包含“原型约束契约”，明确页面清单、入口位置、主流程、状态、字段、文案、组件/设计系统依据和禁止发挥项。
- 原型：HTML 路线产出自包含、独立、可交互的 `prototype.html`，包含代表性页面、真实操作控件、可切换状态、真实领域数据和主流程体验；不得把 PRD 背景、用户故事、验收标准、技术方案或测试用例搬进原型页。Prototype tab 负责评审上下文和追踪摘要，`prototype.html` 负责像产品一样可操作的体验。Stitch 路线产出 `stitch-prototype.md`，记录 Stitch 项目链接、screen/frame 清单、PRD 覆盖矩阵、状态覆盖、评审缺口和恢复路径；非 UI 需求也应做成交互式流程模拟器、状态机沙盒、CLI/API 控制台或等价原型。
- 测试用例：覆盖每条验收标准；普通产品需求至少 20 条 P0/P1/P2 用例，包含准备、操作、期望结果、自动化建议。
- 自动化测试计划：根据 `AC/TC` 判断 E2E、API、contract、integration、visual/a11y、smoke、regression 或人工覆盖层级；必须包含目标 repo/package、测试入口、测试数据、账号/租户/fixture/mock/seed、CI/local 命令、报告产物、阻断项、降级策略和 `AUTO-TASK-xxx`；本阶段不直接生成测试代码，单元测试仍由 `product-unit-test-init` 和 `product-unit-test-generator` 负责。
- 技术方案：架构、模块、接口字段、数据和状态变化、ER 图、API 汇总表、状态流转、错误处理、权限、可观测性、发布、回滚、备选方案、单元测试基建现状、自动化测试环境/报告要求和 Git Hook 质量门禁现状；必须标明测试框架、测试命令、报告产物、hook manager、hook stages、质量命令覆盖，以及是否需要 `product-unit-test-init` 或 `product-git-hook-init`。
- 开发计划：有序任务、可用文件/模块范围、TDD 检查点、自动化测试 `AUTO-TASK-xxx`、验证命令、期望证据、顺序边界和禁止并行实现说明；若技术方案标记测试基建缺口，必须把 `product-unit-test-init` 准备任务列为开工前置任务；若标记 Git Hook 质量门禁缺口，必须把 `product-git-hook-init` 准备任务列为开工前置任务。
- full 开工：读取批准产物和开发计划，检查 concern/blocker/关键步骤缺口/指令不清楚/无法按原文执行的问题，检查工作树、任务独立性、文件 ownership、TDD 门禁、单元测试基建前置任务和 Git Hook 质量门禁前置任务，推荐 `single` 或 `multi-subagent` 执行方式，并等待用户批准。lite 不生成开工产物或单独批准门。
- 看板：壳 + 源文件投影，规则见 common-contracts § 看板。

## 可读性和追踪门禁

产物给人评审、给 AI 续写：Markdown 里先上下文再结论；图用 mermaid 围栏。看板只渲染源头。

每个阶段请求用户批准前，必须完成以下自检：

- 中文检查：面向用户和评审人的正文、说明、评审点、图表说明默认使用简体中文。
- 上下文检查：产物开头说明本阶段为什么存在、谁来评审、评审人要做什么决定、依赖哪些前置事实或假设。
- 厚度检查：不得只给标题和少量 bullet；必须说明业务场景、角色、触发条件、约束、规则、边界、风险和下游影响。
- 追踪检查：PRD、测试、技术方案、开发计划之间必须使用 `J-001`、`US-001`、`AC-001`、`TC-001`、`API-001`、`TASK-001` 或同等稳定编号串联。
- 图表检查：流程、状态、架构、ER、API、任务依赖、验收覆盖等复杂内容必须有可读图示或矩阵，不能只贴源码或宽表。
- 评审检查：每个 tab 必须有当前结论、风险、待确认问题和建议决策。

不接受以下产物：

- “提升体验”“降低风险”“优化流程”等没有业务上下文的空泛描述。
- PRD、测试、技术方案、开发计划各写各的，无法互相追踪。
- Mermaid 源码、宽表格或过细子 tab 直接作为人类视图主体。
- 使用未决占位词、空泛验证词或笼统边界处理表达作为正式内容。

## 看板

规则只看 `references/common-contracts.md` § 看板与套件生成器。改内容只改源头文件和 state。**源头有更新就必须刷新看板 HTML**：每个委托阶段写完后运行 `render_review_board.mjs`，确认 `.review-board/index.html` 存在，再请求批准或进入下一阶段。图写在阶段源头的 mermaid 围栏里。回到上一版：`node product-workflow/scripts/render_review_board.mjs <工作流目录> --restore prev`。

## 单步命令

- `$product:init`
- `$product:clarify <需求>`
- `$product:project-wiki`
- `$product:prd`
- `$product:plan`
- `$product:review`（`prd.md` / `development-plan.md` 写成 Draft 之后）
- `$product:prototype`（HTML 路线）
- `$product:stitch-prototype`（Stitch 原型）
- `$product:test-cases`
- `$product:test-automation`
- `$product:technical-solution`
- `$product:kickoff` / `$product:开工`
- `$product:develop`

`$superpowers:product-development-workflow` 是兼容的旧入口。
