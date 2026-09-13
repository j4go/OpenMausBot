---
name: product-init
description: Use when the user names product:init, asks to initialize or refresh product workflow project setup, or the workspace has no .product-workflow-config.json
---

# 产品工作流项目初始化

## 命令

```text
$product:init
$product:init --refresh
```

## 定位

本 skill 是产品工作流的项目级前置初始化。它在 `$product:clarify` 之前运行，负责工作区就绪、问询客户项目现状、轻量验证关键事实，并生成后续 product skill 必须优先读取的项目画像和工作流配置。

本 skill 不替代 `$product:clarify`、`$product:project-wiki`、`repo-wiki`、PRD、原型、测试、技术方案或开发计划。它只决定后续阶段的默认策略、门禁强度和需要复用的项目级事实。若配置确认 `workflow_policy.project_wiki=required`，且项目级 `docs/project-wiki/project-wiki.md` 尚不存在，初始化产物完成后立即转 `$product:project-wiki` 的通用项目模式做首次生成；已有时只读复用，不为每个切片重跑。

`$product:init --refresh` 时，若项目里已有 `docs/product-development/` 切片，运行：

```bash
node "${CODEX_HOME:-$HOME/.codex}/skills/product-workflow/scripts/migrate_suite.mjs" .
```

迁移器按顺序升级 state schema、修正原型回链、重建缺失看板、迁走根目录旧 `index.html`，并按套件 `VERSION` 刷新章程托管块。块外用户内容不动；检测到块内人工改动时停止并请用户裁决。

默认输出位于活跃项目根目录：

- `docs/product-workflow/project-profile.md`
- `.product-workflow-config.json`

配置强度为 `strong_with_explicit_override`：后续阶段必须默认遵守；只有用户明确说本次覆盖时才可偏离，并且必须在当前阶段产物中记录覆盖原因、风险和受影响阶段。

## 公共契约

执行本 skill 时必须遵守 `../product-workflow/references/common-contracts.md` 的语言、贯穿式不懂就问门禁、批准前通用自检和软件门户默认不上传规则。本阶段默认只写入两个项目级初始化产物：`docs/product-workflow/project-profile.md` 和 `.product-workflow-config.json`；不得写入按需求或功能维度生成的 product-development 工作流产物，也默认不同步软件门户。

## 输入

读取：

- 用户关于客户、项目、交付目标、代码、团队、测试、发布和设计路线的回答。
- 当前工作目录、用户指定项目根目录和已有 `docs/product-workflow/project-profile.md` / `.product-workflow-config.json`。
- 若用户允许轻量探查，读取项目根目录下的顶层文件、配置、文档、CI、测试入口和 wiki 入口。

领域角色：初始化问询中收集本项目/本系统的领域角色（如「财务系统专家」「mes 领域专家」），写入 profile 并生成到章程托管块的领域段，让后续阶段以该角色理解业务术语和验收口径。用户没给时写 `未确认`，不编造。

如果项目根目录不清楚，先询问项目根目录，不得写 profile 或 config。

## 工作区就绪（clone 或跳过）

写 profile 之前，先让工作区有一份可探查的项目根。产品经理不必自己会 Git。脚本：

```bash
node "${CODEX_HOME:-$HOME/.codex}/skills/product-workflow/scripts/prepare_workspace.mjs" <工作区> [--repo <git-url>] [--branch <name>] [--dir <subdir>]
```

1. 工作区已有 `.git`：跳过拉取，把该目录当项目根。
2. 工作区非空但不是 git 根：不要覆盖；问用户项目根是当前目录还是要在子目录 clone。
3. 工作区空（或不存在）：问仓库地址（可向开发要 https/ssh URL，可选分支、子目录名）。拿到后让脚本 clone。`--dir` 只允许工作区下的相对路径。
4. clone 失败：把 git 报错原文给用户，不要改成 elevated、不要改远程。
5. 不装依赖、不跑构建、不在这一步建图谱。

完成后 `project_root` 必须指向带 `.git` 的目录（或用户确认的现成项目根），再进入初始化问询和轻量探查。

## 软件门户（Limix CLI）

工作区就绪之后、写 profile 之前，发现本机有没有 `limix`，问用户要不要用它同步软件门户。和 Matt 的 issue tracker 一样：Setup 选定，命令写进项目配置，阶段 skill 只读配置。细则模板：`references/portal.md`。落盘到项目 `docs/product-workflow/portal.md`。

先跑 `command -v limix` / `limix --version`。每轮只问一个决策：

1. **没装**：要不要装 Limix CLI？推荐装。用户同意 → 打开软件门户 `/portals/software/downloads`，让用户把页面上「发给 AI 的安装提示词」贴回本会话，然后按那段提示词完成安装（含 `limix init` 和 AI Track 钩子）。不要自己编安装脚本顶替页面提示词。用户说本次不用：`portal_sync=off`，初始化继续，不得声称已同步门户。
2. **已装**：交付件怎么管？推荐：**代码仓 + 软件门户都用**。选门户（可与 git 并用）→ `portal_sync=bound_project`，把 `references/portal.md` 写入 `docs/product-workflow/portal.md`，记下 `limix --version`。选只要代码仓 → `portal_sync=off`，不调用 `limix`。两者都用时，开工核对 git 提交和门户 upload 必须对同一批 Reviewed 源头。

`bound_project` 且 CLI 已可用时，init 收尾按 `portal.md` 做 (a)(b)：`limix doctor`、`limix project onboard`（评估当前工作区；没有门户项目就创建并绑定）。没有 `.limix/project.json` 时 `limix project bind <项目key或名称>`。需求绑定和交付上传等当前切片出现后再做，见 `portal.md` 的 (c)(d)。不要在 init 里猜切片目录。

## 初始化问询

首次运行 `$product:init` 时，若项目根目录和探查许可不清楚，这是前置阻断，必须先在公共契约的单问题澄清协议下询问并解决；项目根目录和探查许可明确后，再按单问题澄清协议确认产品模式，并围绕以下七组事实逐步收集项目级配置。每轮只问一个需要用户作答的决策点；不得把多个互相独立的决策点合并成一轮问题、表格或批量确认。

产品模式优先级：

1. 用户显式说明从 0 到 1、MVP、想法验证、新产品探索时，默认 `product_mode` 为 `zero_to_one`，但如果轻量探查发现已有生产系统或既有用户流程，必须用一个冲突确认问题请用户确认。
2. 用户显式说明已有产品迭代、生产系统改造、维护、重构、迁移或扩展时，默认 `product_mode` 为 `one_to_n`。
3. 用户未说明时，根据项目阶段、已有代码/用户/流程/配置、交付目标和轻量探查证据推断，并用一个问题确认。确认前 `workflow_policy.product_mode` 写入 `unknown`；如果已有推断但尚未确认，`workflow_policy.mode_detection` 写入 `inferred_unconfirmed`；两者都不得在用户确认前写成已确认事实。

七组事实仍必须收集，但按模式调整顺序：

1. 产品模式：`zero_to_one`、`one_to_n` 或暂时 `unknown`。
2. 项目阶段：想法验证、MVP、已有生产系统、维护/重构、迁移或多仓整合。
3. 交付目标：只做文档、PRD/方案、实现、测试、发布或长期维护。
4. 代码可用性：是否已有代码、是否允许代码/文件探查、项目根目录在哪里。
5. 仓库结构：单仓、多包 workspace、多仓，或前端/后端/worker/infra/admin 分离。多仓时记成同一工作目录下的兄弟仓，保持分仓。切片默认按 1～2 天、用户可感知的独立交付来切。
6. 知识库现状：README、架构文档、Repo Wiki、Project Wiki、runbook、ADR、onboarding 或缺失。
7. 设计、测试与发布策略：原型路线、单测、E2E/API/contract、CI、报告产物、发布门禁，以及是否默认要求自动化测试计划。
8. 领域角色：本项目/本系统面向什么领域（如财务、MES、供应链），用户希望助手以什么领域角色理解业务；未给出时记 `未确认`。

`$product:init --refresh` 必须先读取旧 profile/config，只问变更、冲突、缺失或仍未解决的问题，并继续遵守单问题澄清协议；不得无差别重问全部项目背景。

## 轻量探查

除非用户明确拒绝看代码或文件，本 skill 必须在项目根目录执行轻量探查，用于验证配置策略，而不是生成完整 Project Wiki。

建议探查：

```bash
pwd
git rev-parse HEAD
rg --files
find . -maxdepth 3 -name .git -type d
```

重点查看：

- `AGENTS.md`、`CLAUDE.md`、`README.md`
- `docs/`、`docs/repo-wiki/`、`docs/project-wiki/`
- `package.json`、`pnpm-workspace.yaml`、`bun.lockb`
- `go.work`、`Cargo.toml`、`pyproject.toml`
- `.github/workflows/`、CI 配置、测试配置、脚本目录
- 常见测试目录和报告配置

轻量探查只记录项目级证据、明显冲突和关键文件指纹。不得在本阶段无差别阅读全仓源码，也不得生成完整 Project Wiki 或 Repo Wiki。

## 项目章程 AGENTS.md

轻量探查后、写 profile 之前，必须处理仓库根目录的章程文件。规则放章程里，不要把同一套规则复制进每个 product skill。

随后运行 `detect_design_context.mjs <项目根目录>`。仅当返回 `detected: true` 时，按 `../product-workflow/references/design-context.md` 接入 impeccable `init`：项目根缺 `PRODUCT.md` 时生成，已有时只补缺。profile 写 `design_context: impeccable` 并引用 `PRODUCT.md`；用户、任务、平台、约束以 `PRODUCT.md` 为源头，不在 profile 复制。未命中时静默按现行流程继续，不提示安装。

0.6.0 不探测、不调用 `code-wiki`。代码事实走 Wiki Context Gate 与源码回查。工作流接入进 0.7.0。

### 章程托管块

套件规则以**单一集中托管块**写入客户项目 `AGENTS.md`（或 `CLAUDE.md`）：

1. 块界与版本：`<!-- BEGIN product-workflow charter suite=v<当前 VERSION> -->` ... `<!-- END product-workflow charter -->`。版本只在块级，块内不打逐条标签。块外是用户内容，套件不触碰。
2. 规则源头：块内容从 `references/charter-rules.md` 渲染；块里只放短句，命令细节（BOM/GBK 探测、PS5.1 无 BOM 写法、GBK 严格解码）留在 charter-rules.md，不占每轮上下文。
3. 查重优先：写入前先逐条语义比对用户既有 `AGENTS.md`（含客户自己写的原文）——已覆盖的跳过并记录「已由用户条款覆盖」；通用智慧（怎么做事、先读再写等）一律不注入。原模板的通用段落整段撤出，不与客户原文重复。
4. 升级（`--refresh`）：从 charter-rules.md 整块重渲染刷新 `suite=vX.Y.Z`，不做块内逐条合并；用户改过块内内容则报冲突，等用户裁决，不得静默覆盖。
5. 块顶部带举一反三元规则：规则按类别适用，示例不穷尽，同类工具/依赖/构建脚本/wrapper 一律同一原则。

### 处理顺序

1. 已有 `AGENTS.md`（Codex）或 `CLAUDE.md`（Claude Code）：只追加或刷新托管块，不覆盖用户原文。
2. 没有章程：若当前是 Codex 且能跑 `/init`，或当前是 Claude Code 且能跑 `/init`，先用官方命令生成骨架，再写入托管块。
3. 没有 `/init`：用 `references/agents-charter-template.md` 在仓库根目录创建 `AGENTS.md`。不要因此中断初始化。
4. 「代码知识库」一节只保留状态 / 用哪套 / 怎么查的空位，本版不填 `$code-wiki` 命令。

后续 product skill 先读项目 `AGENTS.md`，再读本阶段 SKILL。

如果用户拒绝探查，必须写入：

```json
"code_exploration": "user_declined"
```

后续 product 阶段不得静默探查代码，除非用户明确修改该设置。

## 输出：project-profile.md

写入或修订 `docs/product-workflow/project-profile.md`。必须包含：

- 阅读上下文：这份项目画像为什么存在、谁应评审、后续 skill 如何引用。
- 客户回答：按七组问题记录。
- 项目根目录和探查模式。
- 项目阶段和交付目标。
- 领域角色：`workflow_policy.domain_role` 的取值、来源（用户回答/未确认），以及本模式下对术语和验收口径的影响。
- 仓库、包、部署单元和团队边界。
- 知识库现状和 Project Wiki / Repo Wiki 策略。
- 原型路线默认值和依据。
- 测试、自动化、CI、报告和发布现状。
- 软件门户同步偏好。
- 设计上下文：探测结果、`PRODUCT.md` / `DESIGN.md` 路径与生成时 git commit；命中 impeccable 时重叠的用户/任务/平台/约束只引用 `PRODUCT.md`，不复制。
- 工作流策略摘要。
- 产品模式与澄清方式：当前 `product_mode`、模式来源、判断依据、`clarification_style`、`mode_detection`、本模式下的工作流侧重点和未解决问题。
- freshness 证据：生成时间、`git rev-parse HEAD` 的 git commit 或 non-git 状态。旧版关键文件指纹可保留，但不再用于过期判定。
- 用户回答与轻量探查冲突。
- 未解决问题和显式假设。
- 每次需求覆盖项目默认配置的记录规则。

必须区分客户已确认事实、文件证据、合理推断、冲突和待确认假设。

## 输出：.product-workflow-config.json

写入或修订 `.product-workflow-config.json`，schema version 为 `1`。必须是有效 JSON。

推荐结构：

```json
{
  "schema_version": 1,
  "project_root": "/absolute/project/root",
  "profile_path": "docs/product-workflow/project-profile.md",
  "freshness": {
    "generated_at": "2026-07-05T00:00:00Z",
    "git_commit": "commit-sha-or-non-git"
  },
  "workflow_policy": {
    "config_strength": "strong_with_explicit_override",
    "domain_role": "财务系统专家",
    "product_mode": "unknown",
    "clarification_style": "single_question",
    "mode_detection": "inferred_unconfirmed",
    "project_wiki": "required",
    "repo_wiki": "prefer_existing_or_generate_missing",
    "code_exploration": "required",
    "prototype_route": "auto",
    "test_automation": "required",
    "unit_test_infra_check": "required",
    "portal_sync": "off"
  },
  "stage_defaults": {
    "clarify": {
      "must_read_config": true
    },
    "project_wiki": {
      "default": "required"
    },
    "test_automation": {
      "default": "required_if_implementation"
    }
  },
  "open_questions": []
}
```

允许值：

- `workflow_policy.config_strength`: `strong_with_explicit_override`
- `workflow_policy.domain_role`: 字符串；用户未给出时写 `"未确认"`，不得编造领域
- `workflow_policy.product_mode`: `zero_to_one`、`one_to_n`、`unknown`
- `workflow_policy.clarification_style`: `single_question`
- `workflow_policy.mode_detection`: `explicit`、`inferred_confirmed`、`inferred_unconfirmed`
- `workflow_policy.project_wiki`: `required`、`optional`、`not_applicable`
- `workflow_policy.repo_wiki`: `prefer_existing_or_generate_missing`、`prefer_existing_only`、`not_applicable`
- `workflow_policy.code_exploration`: `required`、`allowed`、`user_declined`
- `workflow_policy.prototype_route`: `auto`、`html`、`stitch`、`not_applicable`
- `workflow_policy.test_automation`: `required`、`optional`、`not_applicable`
- `workflow_policy.unit_test_infra_check`: `required`、`optional`
- `workflow_policy.portal_sync`: `off`、`bound_project`。缺省视为 `off`。旧配置 `manual_only` 按 `off` 读。

如果某个策略会影响后续阶段但无法确认，必须先问用户，或写入 `open_questions` 并把 profile 状态标为草稿。不得静默发明会改变后续门禁的配置。

## Project Wiki 首次建仓

写完并确认 profile/config 后：

1. `workflow_policy.project_wiki=required` 且 `docs/project-wiki/project-wiki.md` 不存在：运行 `$product:project-wiki` 的通用项目提交，建立项目级 Wiki。
2. 已存在：记录入口并复用，不因初始化刷新或新切片全量重建。
3. 当前 `git rev-parse HEAD` 与 profile 记录值不同：只建议增量刷新；发现跨仓边界缺口或事实冲突时才必须刷新。
4. `run_mode=lite` 的切片不再生成自己的 `project-wiki.md`；若小改需要新增跨仓事实，退出 lite。

## freshness 门禁

配置必须记录生成时间、项目根目录，以及在项目根实际运行 `git rev-parse HEAD` 得到的 commit（非 git 项目写 `non-git`）。后续阶段只比较当前 HEAD 与记录值；不再计算关键文件指纹。commit 变化时应建议运行 `$product:init --refresh`。这不是硬阻断；用户明确继续时，当前阶段产物必须记录 `stale-config continuation`、继续原因、风险和需要额外回查的阶段。只有用户同时明确覆盖或偏离 `workflow_policy` / 项目默认配置时，才记录 `explicit_override`。

## 错误处理

- 项目根目录不明确：先问用户，不写文件。
- 用户拒绝探查：记录 `user_declined`，后续不探查代码。
- 用户回答与轻量探查冲突：profile 标为草稿并请求确认。
- 旧 JSON 不可解析：不要猜配置，要求 `$product:init --refresh`。
- config 存在但 profile 缺失：读取 config，但提示缺少依据，建议 refresh。
- profile 存在但 config 缺失：初始化不完整，建议 refresh。

## 请求批准前自检

- 已执行公共契约中的批准前通用自检。
- 已写入或修订 `docs/product-workflow/project-profile.md`。
- 已写入或修订 `.product-workflow-config.json`，且 JSON 可解析。
- 已记录客户回答、轻量探查证据、冲突、假设和 open questions。
- 已记录 `product_mode`、`clarification_style` 和 `mode_detection`；若 `workflow_policy.product_mode` 为 `unknown`，或 `workflow_policy.mode_detection` 为 `inferred_unconfirmed`，已说明阻断哪些后续批准或用户授权按假设继续的条件。
- 已明确 `workflow_policy` 每个关键字段的取值和依据。
- 若用户拒绝探查，已写明后续阶段不能静默查代码。
- 已处理仓库章程：`AGENTS.md` 或 `CLAUDE.md` 存在，或已用官方 `/init` / 套件模板创建；套件规则只以托管块（带 `suite=` 版本标记）写入，已做用户条款查重；未覆盖用户已有正文，块外内容未触碰。
- 若 profile/config 为草稿或存在冲突，已请求用户确认后再允许后续 workflow 使用。
