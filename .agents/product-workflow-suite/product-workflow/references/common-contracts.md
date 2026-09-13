# 产品工作流公共契约

各 `product-*` 阶段 skill 必须遵守本文件；阶段 `SKILL.md` 只保留阶段差异。`$product:workflow` 的 stage-gated / through-run 见 `run-mode.md`。

## 单一源头（skill 优化原则）

每类事实只允许一份可写源头。只更新那一份，所有展示必须跟着变。禁止把同一事实再抄进 HTML、另一份摘要或 agent 记忆。

| 事实 | 唯一源头 | 不是源头 |
|---|---|---|
| 阶段状态 / 当前阶段 | `.workflow-state.json` | 看板徽章、口头「已过」 |
| 澄清 / PRD / 用例 / 技术方案 / 计划 / 开工 / 开发记录 | 对应 `*.md` | 看板 HTML、聊天复述 |
| 给人看的简练层（评审要点、门禁、图） | **写在同一份阶段 Markdown 里**（如 `## 评审要点`、` ```mermaid `） | 生成器临时拼进 HTML 的第二份摘要 |
| 交互原型 | `prototype.html` 或 Stitch 记录 md | 评审看板 HTML |

简练层不是第二份文档：不要再写 `prd.review.md` 或只存在于 HTML 的「给人看」段落。要点和图必须进 `prd.md` / `clarify.md` 等源头；看板只渲染。

`.review-board/`（`index.html`、`review-board-live.js`、`mermaid.min.js`、`index.prev.html`、`history/`）和工作流根目录残留的 `index.html` **只是展示派生**：

- 不得提交进 git（工作流目录 `.gitignore` 必须排除 `.review-board/` 与旧壳文件）
- 不得作为阅读上下文、知识库/代码索引、批准依据
- 发现 HTML 与 md/状态不一致时，以 md 和 `.workflow-state.json` 为准，改源头后重建或刷新看板，不要改 HTML

## 语言和产物

- 默认用简体中文回复用户，并用简体中文编写产品工作流产物和评审说明。看板 HTML 只展示这些源头，不另写一份 tab 正文。
- 命令名、文件路径、API 路径、代码标识符、枚举值、测试编号、验收标准编号、验证命令保留原始技术形式。
- 只有用户明确要求其他语言时，才使用其他语言。
- 仓库根目录若有 `AGENTS.md` 或 `CLAUDE.md`，每个 product 阶段开始时先读它。项目硬规则以章程为准，本文件和各 SKILL 不重复抄写。

## Project Init Config Gate

> 本节定义读配置、配置强度、stale/不可读处理、`product_mode` 缺失、`code_exploration` 为 `user_declined` 等全部通用规则。各阶段 `SKILL.md` 的「项目初始化配置门禁」章节只列阶段独有的 `workflow_policy.<键>` 逻辑（例如 prototype_route、test_automation、project_wiki），其余读配置、stale、explicit_override、user_declined 规则一律继承本节，不必逐字复制。

所有产品工作流阶段在使用项目事实、仓库事实、设计路线、测试策略或实现门禁前，必须先检查活跃项目根目录的 `.product-workflow-config.json`。如果存在，必须读取并遵守其中的 `workflow_policy`；如果 `profile_path` 指向的 `docs/product-workflow/project-profile.md` 存在，必须在需要解释策略依据、open questions、freshness 或 override 时读取它。

配置强度为 `strong_with_explicit_override`：后续阶段默认必须遵守初始化配置。只有用户明确说明本次需求覆盖项目默认配置时，阶段才可偏离；偏离时必须在当前阶段产物中记录 `explicit_override`、覆盖原因、风险、受影响阶段和后续回收点。

如果 `.product-workflow-config.json` 缺失：

- 完整 `$product:workflow` 必须先运行 `$product:init`。
- 单阶段 product skill 可以询问用户是否先运行 `$product:init`，或要求用户明确授权本次不使用项目级配置继续。

如果 `.product-workflow-config.json` 不可读、不可解析、`schema_version` 不支持，或 `project_root` 与当前项目根冲突，不得猜测配置；必须请求 `$product:init --refresh`，或请求用户明确授权继续且记录风险。

freshness 的权威判断只比较当前项目根 `git rev-parse HEAD` 与 profile/config 记录的 `freshness.git_commit`；旧配置的关键文件指纹只作兼容参考，不参与过期判定。commit 变化时建议 `$product:init --refresh`，不是硬阻断；用户明确继续时，当前阶段产物必须记录 stale-config continuation 和额外源码/配置回查责任。

如果 `.product-workflow-config.json` 存在但 `workflow_policy.product_mode` 缺失，必须视为 `unknown`，不得报错或猜测为某个模式。`unknown` 不阻断 `$product:init --refresh`、项目初始化、信息收集或 Project Wiki 探索；但完成配置批准，或进入 `$product:workflow`、PRD、原型、测试、技术方案、开发计划等正式下游阶段前，必须按单问题澄清协议确认模式，或取得用户明确授权按假设继续并记录风险。

如果 `workflow_policy.code_exploration` 为 `user_declined`，任何阶段不得静默探查源码、测试、配置或 CI；只能使用用户提供信息、已有 profile/config、已有产品产物和用户允许的文档。需要查代码时必须先请求用户修改该配置或提供本次明确授权。

## UI 栈参考门禁

涉及界面、交互、前端测试或 UI 实现时先按目标文件/配置识别栈，只加载一份对应参考：

- Vue：`references/stacks/vue.md`
- WPF：`references/stacks/wpf-ui.md`
- 小程序：`references/stacks/miniprogram.md`

多端需求按端分别读取，不把 Web、XAML、小程序 API 或测试写法混用。参考文件只补端侧边界；版本、命令、框架和组件仍以目标仓实际文件为准。

## Wiki Context Gate

所有产品工作流阶段在使用项目或仓库事实前，必须先执行本门禁；阶段 `SKILL.md` 可以补充阶段专属页面，但不得绕过本门禁。

### 1. 边界判定

Project Wiki 是项目级长期事实：在 init / 首次建仓时生成，后续切片默认只读复用，不为每个切片重建。当前 git commit 与 profile 记录值不同时只建议增量刷新；只有需求暴露跨仓边界缺口、关键事实冲突或用户明确要求时才运行 `$product:project-wiki`。

lite 切片不生成切片级 `project-wiki.md`，但必须读取项目级 profile、已有 Project/Repo Wiki 和需求相关源码证据；需要新增跨仓事实时退出 lite。

先判断当前上下文属于哪一种：

- 单一代码仓库：优先使用目标 repo 内的 `docs/repo-wiki/`。
- 单仓多包或多部署单元：若包、服务、前端、worker、infra 或测试命令有不同 ownership，必须通过 `project-wiki.md` 或 `docs/project-wiki/` 建立路由。
- 多代码仓项目：必须先使用 Project Wiki 作为路由表，再下钻到对应 Repo Wiki。
- 产品工作流目录：先检查当前工作流目录是否存在 `project-wiki.md`。存在则读取其中的 Repo Wiki 状态矩阵和已有 repo wiki / `repo-wikis/<repo-slug>.md` 路由；缺失且当前阶段需要跨仓、跨包或跨部署上下文时，先回到 `$product:project-wiki` 或询问用户是否确认不适用。

Project Wiki 不替代 Repo Wiki；Repo Wiki 也不替代 Project Wiki。跨仓、跨包、跨部署或跨团队事实必须由 Project Wiki 先收敛边界。

### 2. 读取路径

存在或需要 Project Wiki 时，先读取其中的仓库/包地图、Repo Wiki 状态矩阵、生成/引用路径、系统边界和待确认问题。

Repo Wiki 基础页固定为：

- `docs/repo-wiki/index.md`
- `docs/repo-wiki/catalogue.json`
- `docs/repo-wiki/_meta/status.md`
- `docs/repo-wiki/shared-language.md`

阶段追加页面：

- 产品和 PRD：`workflows.md`、`contracts.md`、`onboarding/product.md`。
- 测试用例和自动化测试：`setup-and-testing.md`、`verification-gates.md`、`contracts.md` 和相关 `codemaps/*.md`。
- 技术方案、开发计划、开工和开发执行：`architecture.md`、`modules.md`、`boundaries-and-red-flags.md`、`verification-gates.md` 和相关 `codemaps/*.md`。

如果 Project Wiki 指向当前工作流目录下的 `repo-wikis/<repo-slug>.md`，该文件就是本次工作流的 repo 级上下文，必须读取。

### 3. 源码回查

Wiki 是导航和压缩上下文，不是实现事实的最终来源。涉及以下内容时，必须回查源码、测试、配置、脚本或 CI 文件：

- API 路由、schema、权限、鉴权、审计、隐私、多租户、数据保留。
- UI 路由、组件、状态、feature guard 或用户可见行为。
- 测试命令、fixture、mock、seed、报告路径、coverage、CI job、artifact。
- 环境变量、runtime 配置、部署、迁移、回滚、观测。

如果 wiki 与源码冲突，阶段产物必须说明冲突、采用的源码路径和影响范围；除非用户明确作出相反决策，否则以源码为准。

### 4. 证据记录

使用 wiki 上下文的阶段产物必须记录：

- 已读 Project Wiki 页面。
- 已读 Repo Wiki 页面或生成的 `repo-wikis/<repo-slug>.md`。
- 已回查源码、测试、配置、脚本或 CI 路径。
- wiki commit 与当前源码是否一致；无法判断时说明原因。
- wiki 缺口、过期风险、源码冲突和未解决假设。
- 本阶段采用哪些事实，哪些仍是待确认假设。

## Project Wiki 共享上下文

- `project-wiki.md` 是产品工作流的跨仓库/跨模块共享上下文，位于问题澄清和 PRD 之间。
- 当项目包含多个代码仓、多包 workspace、多个部署单元，或需求会跨前端/后端/worker/infra/admin 等边界时，必须先生成或刷新 `project-wiki.md`，再让 PRD、测试、技术方案、开发计划和实现引用其中的事实。
- Project Wiki 必须区分 repo wiki 状态：已有 repo wiki 的仓库以引用、摘要和冲突检查为主；没有 repo wiki 的仓库必须生成 repo wiki，并由 Project Wiki 引用。默认生成到当前产品工作流目录的 `repo-wikis/<repo-slug>.md`；只有用户明确允许写入目标 repo，才在目标 repo 内创建团队约定入口。生成内容必须区分文件证据、代码推断和待 owner 确认项。
- 单仓项目也可以生成轻量版 Project Wiki，明确当前仓库事实、系统边界、验证命令和未来拆分风险；不得把单仓项目误写成多仓。
- 后续阶段如果发现代码探索结果与 `project-wiki.md` 冲突，必须回到 Project Wiki 修正或询问用户，不得静默覆盖上下文。
- 除问题澄清和 Project Wiki 生成阶段外，任何阶段读取 repo wiki 或开始项目探索前，必须先检查当前产品工作流目录是否存在 `project-wiki.md`。存在则先读取 Project Wiki 中的仓库/包地图、Repo Wiki 状态矩阵、生成/引用路径、系统边界和待确认问题，再决定要读哪些 repo wiki 页面或生成物。
- 如果阶段需要跨仓上下文但 `project-wiki.md` 缺失，必须先回到 `$product:project-wiki` 或询问用户是否确认不适用；不得直接只读 repo wiki 后继续。
- 如果 `project-wiki.md` 指向生成的 `repo-wikis/<repo-slug>.md`，阶段必须读取该生成物；如果指向已有 repo wiki，阶段必须读取对应入口和相关页面。Project Wiki 是 repo wiki 的路由表和冲突检查入口，repo wiki 不能绕过 Project Wiki 单独作为跨仓事实来源。
- `automation-test-plan.md` 是测试用例和技术方案之间的自动化测试共享上下文。后续技术方案、开发计划、开工和开发执行阶段如果涉及实现、UI/API 行为、权限/数据风险、跨仓协作或回归风险，必须读取它；如果 `automation-test-plan.md` 或自动化测试阶段标记为 `Not Applicable`，后续阶段必须继承不适用原因，不得重新发明自动化测试范围。

## Repo Wiki 上下文契约

- 任何产品工作流阶段在执行项目/仓库上下文探索前，必须先按 Project Wiki 共享上下文契约检查 `project-wiki.md`，再检查 `docs/repo-wiki/index.md` 是否存在。
- 如果存在，先读取 `docs/repo-wiki/index.md`、`docs/repo-wiki/catalogue.json`、`docs/repo-wiki/_meta/status.md` 和 `docs/repo-wiki/shared-language.md`，再按阶段需要读取相关 wiki 页面。
- 使用 `catalogue.json` 定位阶段相关页面，避免每个阶段无差别重新理解全仓库。
- 如果 `_meta/status.md` 记录的源码 commit 与当前 `git rev-parse HEAD` 不一致，wiki 只能作为导航；涉及事实判断、接口、权限、数据模型、运行命令或实现细节时，必须回查相关源码或配置。
- 如果 `docs/repo-wiki/` 缺失、`catalogue.json` 无法解析、wiki 未覆盖目标区域，继续执行既有 `rg` 项目探索门禁，并在产物中说明 repo wiki 不可用、已过期或未覆盖。
- 如果 `docs/repo-wiki/_meta/status.md` 或 `docs/repo-wiki/shared-language.md` 缺失或不可读，repo wiki 仍可作为导航；但不得信任 freshness 或术语事实，必须回查相关源码或既有产物，并在阶段产物中说明缺失的元数据。
- 源码、测试和配置优先级高于 repo wiki；如果 wiki 与源码冲突，产物必须说明冲突、引用作为依据的源码路径/源码文件，并以源码为准。
- 使用 repo wiki 事实的阶段产物，应在阅读上下文、项目上下文探索、技术依据或评审门禁中记录：已读 wiki 页面、已回查源码路径、wiki 缺口或过期风险。
- 用户明确要求“不要看代码/不要探索项目”时，不回查源码；只能使用既有产物和 repo wiki 中已确认事实，并把未确认内容标为假设。

## 贯穿式不懂就问门禁

> 下方前两条是阻断与停止原则；第 3-6 条合称「§ 通用澄清收尾流程」：单问题澄清协议 → 不确定性队列排序 → 按假设继续授权 → 请求批准前附清单。各阶段 `SKILL.md` 只列本阶段独有的阻断项清单，其余收尾流程直接引用本节，不必逐字复制。

- 任何阶段在读取用户输入、前序产物（Markdown 与 `.workflow-state.json`，**不要读看板 HTML**）、代码/文档探索结果、测试/验证结果、工作树状态或当前任务时，只要发现 concern、blocker、关键步骤缺口、指令不清楚、事实冲突、验收不可判定、验证不可执行、无法按原文执行，就必须停止当前产物生成或实现。
- 停止后必须先问用户，或回到产生问题的前序阶段修正；不得边猜边写产物、边猜边批准、边猜边开工或边猜边实现。
- 询问用户必须遵守单问题澄清协议：每轮只提出一个需要用户作答的决策点。一个问题必须带必要上下文、**推荐答案（含依据）**和 2-4 个互斥选项；用户可以改推荐，但不能只抛问题。不得把多个互相独立的决策塞进同一轮。
- 能从仓库、配置、已有产物、git、命令或公开文档查到的事实，不得拿来问用户。先查；查不到或互相冲突时，才把冲突本身当成决策点来问。
- 如果当前阶段存在多个阻断问题，必须先建立不确定性队列，按对范围、验收、权限/数据、架构/API、发布/回滚和验证可执行性的影响排序；每轮只问最高优先级的一项。用户回答后，再根据剩余队列继续问下一项。
- 非阻断性不确定项可以标为假设或待确认问题，但不得静默省略；请求阶段批准时必须附上未解决不确定项清单。
- 只有用户明确回答，或明确授权“先按假设继续”并接受对应风险，才能继续。授权按假设继续时，必须在产物和评审请求中列出具体假设、影响范围、受影响编号和后续回收点；不得写成已确认事实。

## 产品模式协议

所有 product workflow 阶段必须识别并继承 `workflow_policy.product_mode`：

- `zero_to_one`：从 0 到 1，强调价值假设、目标用户、核心痛点、MVP 边界、原型验证、成功指标和学习闭环。
- `one_to_n`：从 1 到 n，强调现有系统事实、增量范围、兼容性、迁移路径、权限和数据边界、回归风险、发布与回滚。
- `unknown`：模式尚未确认。允许继续做项目初始化、信息收集、Project Wiki 探索，或在用户授权下按假设生成草稿；不得把 PRD、原型、测试、技术方案或开发计划标记为 `Reviewed`，除非用户明确接受模式假设、风险、受影响范围，并允许本阶段按该假设批准。

模式判断采用混合策略：

1. 用户显式指定优先，例如“这是从 0 到 1”“这是现有产品迭代”“按 1 到 n 做”。
2. 用户没有指定时，agent 根据项目阶段、是否已有生产系统、是否存在既有代码/用户/流程/配置、需求是否以新增还是改造为主进行推断。
3. 推断后必须用一个问题向用户确认，除非用户已经显式指定。
4. 用户可以通过自然语言或命令参数覆盖推断结果；如果用户表述和项目证据冲突，必须只问一个冲突确认问题，不得直接覆盖用户。

阶段产物在阅读上下文、项目上下文或等价章节中必须记录当前 `product_mode`、模式来源、采用依据、本阶段因此调整的范围/验收/技术约束，以及 `unknown` 或按假设继续时的风险。

## 看板

看板是派生展示。阶段 skill 只写源头文件和 `.workflow-state.json`，不要手写 tab 正文或徽章。

阶段完成标准：

1. 写入本阶段源头文件，并把该阶段状态写入 `.workflow-state.json`（AI 只写 `Draft` / `Blocked` / `Not Applicable`）。
2. 图和评审要点写在同一份源头文件里，用 mermaid 围栏；不要为填 tab 去改 HTML。
3. **源头有更新就必须刷新看板 HTML。** 本阶段改过 `*.md`、`prototype.html`、`stitch-prototype.md` 或 `.workflow-state.json` 后，在请求批准、宣布完成或进入下一阶段前，必须运行 `render_review_board.mjs <工作流目录>`。完成后 `.review-board/index.html` 必须存在。只说「刷新浏览器」不算完成。阻断停住、尚未写入源头时，不生成看板。
4. 日常打开用 `open_review_board.mjs`（缺壳时会先生成）。升级后在项目根运行 `migrate_suite.mjs`：统一升级 state schema、原型回链、评审看板和章程托管块。`migrate_review_board.mjs` 只保留为旧版看板迁移兼容入口。
5. 门户上传走 `limix requirement upload` 的整份 snapshot，源头文件进 CLI manifest；看板 HTML 不上传。

| 阶段 | 源头文件 |
|---|---|
| 澄清 | `clarify.md` |
| Project Wiki（产品工作流） | `project-wiki.md` |
| PRD | `prd.md` |
| HTML 原型 | `prototype.html` |
| Stitch 原型 | `stitch-prototype.md` |
| 测试用例 | `test-cases.md` |
| 自动化测试计划 | `automation-test-plan.md` |
| 技术方案 | `technical-solution.md` |
| 开发计划 | `development-plan.md` |
| 开工 | `start-implement.md` |
| 开发执行 | `develop.md` |

- 看板资源全部放在 `.review-board/`，不提交。装了 skill 后随时可重建。
- 打开 `.review-board/index.html` 即可查看当前看板。也可用 `open_review_board.mjs` 起本地服务。
- 不要手写整页 HTML。图用 `.review-board/mermaid.min.js` 绘制。
- 回到上一版看板：`node product-workflow/scripts/render_review_board.mjs <工作流目录> --restore prev`。重跑生成器不算回滚。保留 `.review-board/index.prev.html`。`--force` 仅在壳损坏时使用。
- 如果当前工作流目录存在 `.workflow-state.json`，看板必须使用其中的阶段状态；不得把 Clarify 默认写成 `Reviewed`，也不得把已批准阶段重新降级为 `Draft`。
- 页面标题、header 当前阶段提示和激活 tab 由实时脚本按状态与 hash 同步；请求评审前至少检查当前阶段 hash 和上一阶段 hash。
- 人类视图与源码视图都来自同一份阶段源头：人类视图渲染正文（含写在源头里的评审要点和图），源码视图展示原文。禁止在 HTML 里另写一套简练内容。
- 出图完成标准：用浏览器打开本地壳，图由随壳的 `mermaid.min.js` 绘制。

## 软件门户同步

`portal_sync=off`（缺省；旧值 `manual_only` 同）时交付件只走代码仓，不调用 `limix`。`bound_project` 时，阶段写成 Draft、人标成 Reviewed、或对抗审查改过源头之后，按项目 `docs/product-workflow/portal.md`（模板 `product-init/references/portal.md`）同步当前切片。命令以该文件和本机 `limix --help`（v0.6.1：`project` / `requirement`，`issue` 同义）为准。

完成标准：当前切片已绑定；本次源头已 `limix requirement upload`（草稿待门户确认）；失败已说明且本地文件仍在。切片未定、多切片或多份项目绑定时先问用户。鉴权失败或没有 `limix` 时停下，不加 `--force`。

两条轨道都开时（`bound_project` 且切片在 git 里）：git 已提交的 Reviewed 源头必须和最近一次 upload 对得上。

## 开工前交付物核对

进入 `$product:kickoff` / `$product:develop` 之前跑。lite 在 develop 内联合并时同样跑。过不了就停，不推荐执行方式、不写生产代码。

**1. 状态**

按 `run-mode.md`：lite 短 `prd.md` 必须 `Reviewed`，短计划允许 `Draft`；full 必填 `prd.md` 与 `development-plan.md` 为 `Reviewed`，其余方法产物 `Reviewed` 或带原因的 `Not Applicable`。任一适用阶段仍是 `Draft` / `Blocked` / 缺文件，或带 `revising`，停下来请人批或回前序阶段。

**2. 代码仓（切片在 git 工作树里才查）**

对每个状态为 `Reviewed` 的源头文件（上表，不含看板 HTML、`.workflow-state.json`）：

```bash
git status --short -- <源头文件>
git log -1 --oneline -- <源头文件>
```

未跟踪、已修改未提交、或根本没有 commit：列出文件，停下来请人提交。看板、state、portal 绑定文件按 ignore 不要求进仓。没有 `.git` 时跳过本步（只门户轨道）。

**3. 门户（仅 `portal_sync=bound_project`）**

```bash
limix requirement status <当前切片>
```

要看到当前切片的绑定，以及本次 Reviewed 源头已上传。没有绑定、status 对不上、或上次 upload 失败：先按 `docs/product-workflow/portal.md` 绑需求并 `limix requirement upload`，成功后再开工。`portal_sync=off` 跳过本步（只代码仓轨道）。

**4. 两轨道对齐（git 与门户都开时）**

同一批 Reviewed 源头：git 已提交，且 `requirement status` 显示已上传。一边新一边旧就停。

## 状态转移规则

权威表述见 `product-init/references/charter-rules.md` § 状态转移（含操作细则与来源）；本节只列套件执行口径，不重复展开：

- 阶段状态枚举：`Draft` / `Reviewed` / `Blocked` / `Not Generated` / `Not Applicable`。
- AI 只能写 `Draft` / `Blocked` / `Not Applicable`（含 `Not Generated`）；`Reviewed` 是**人专用**状态，只有用户明确批准后才能写入。
- 已批准产物（`Reviewed`）再次修改时：状态回 `Draft`，并在 `.workflow-state.json` 该阶段对象上加 `"revising": true`（看板据此渲染「已回改待复审」徽章）；复审通过后写回 `Reviewed` 并移除 `revising`。
- 写完 state 后运行 `node product-workflow/scripts/validate_workflow_state.mjs <工作流目录>`。枚举、`current_stage`、`run_mode`、`revising` 只挂 `Draft` 这些规则由脚本判定；报错就先修 state。`render_review_board.mjs` 遇到校验错误不出壳。写 `Reviewed` 时带 `reviewed_by` 与 `reviewed_at`。
- 用户明确豁免测试基建或 Git Hook 后，在 state 顶层 `waivers[]` 写 `{ "task": "TASK-000", "owner": "...", "reason": "...", "waived_at": "ISO-8601", "stage": "start-implement" }`；`stage` 可省略，省略时看板在开工与开发执行两处显示。豁免徽章固定写「已豁免 · 未完成」，不得把对应任务或测试状态改绿。

## 批准前通用自检

- 正文、评审说明、图表说明默认使用简体中文。
- 给人看的文字要好懂：先说结论，再用证据；同等元素字数接近、句式一致；换行不要留下一两个字的孤行。
- 产物开头说明本阶段为什么存在、谁来评审、评审人要做什么决定、依赖哪些前置事实或假设。
- 表格、图示或矩阵配有中文解释，说明它帮助评审什么。
- 产物足够厚，不依赖评审人要求“展开一下”。
- 编号和结论能被下游步骤引用。
- 请求批准时列出仍未解决的不确定项；用户未确认接受前，不得把阶段状态写成 `Reviewed`。
- 已遵守状态转移规则：AI 只写 `Draft`/`Blocked`/`Not Applicable`；已批准产物被本阶段回改的，已降回 `Draft` 并在该阶段对象上标 `revising: true`。
- 已记录本阶段采用的 `product_mode`；如果为 `unknown`，已说明仅允许草稿继续，或已记录用户明确允许按已接受假设批准为 `Reviewed` 的依据、风险和受影响范围。
- 不得使用未决占位词、空泛验证词或笼统边界处理表达作为正式内容。
- 本阶段改过源头文件或 `.workflow-state.json` 的，已运行 `render_review_board.mjs`，且 `.review-board/index.html` 存在。
- PRD 与开发计划：已跑 `$product:review`；源头有 `## 对抗审查`；有阻断发现时未请人按已通过批准。
- 已按本节 § 软件门户同步处理当前切片。
