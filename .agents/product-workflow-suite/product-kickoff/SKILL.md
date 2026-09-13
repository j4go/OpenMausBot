---
name: product-kickoff
description: >-
  开工门禁。用户点名 product:kickoff、product:开工、product:start-implement，或产物已批、要选执行方式再写代码时使用。
---

# 产品开工

## 命令

```text
$product:kickoff
$product:开工
$product:start-implement
$product:kickoff --mode=auto
$product:kickoff --mode=single
$product:kickoff --mode=multi-subagent
```

## 目的

在进入 `$product:develop` 前做开工门禁和执行方式选择。本 skill 做到：门禁过了、方式批了。编码、TDD、subagent 实现和 review 协议由 `$product:develop` 执行。

## 公共契约

执行本 skill 时必须遵守 `../product-workflow/references/common-contracts.md`。实现证据由 `$product:develop` 写入 `develop.md`。

## 硬门禁

与 `../product-workflow/references/run-mode.md` 同一张表：

- **lite：** 只要求短 `prd.md` 为 `Reviewed`；`development-plan.md` 必须存在、状态为 `Draft`，且含任务与验证命令。开工检查内联合并执行，不生成 `start-implement.md`，也不再请求一次执行方式批准；小改默认 `single`。
- **full 必填：** `prd.md` 与 `development-plan.md` 均为 `Reviewed`。缺则停止并请求评审。
- **full 其余方法产物：** `Reviewed` 或 `Not Applicable`（state 里有原因）。`Draft` 或缺文件则停止。lite 的裁剪阶段只查 state 中带原因的 `Not Applicable`，不要求对应文件。
- **测试基建与 Git Hook：** 建议先做，不是硬挡。先读 `../product-workflow/references/add-not-upgrade.md`，按现有架构出脚本或说明 hook 建议。用户要先写业务时记下责任人后继续编码；TASK-000 / hook 任务保持未完成，不得标成已通过。用户明确豁免后，按公共契约在 `.workflow-state.json` 顶层 `waivers[]` 写任务、责任人、原因、豁免时间和当前阶段，再刷新看板；看板显示「已豁免 · 未完成」，后续状态不因豁免变绿。
原型产物门禁必须按路线判断：Stitch-only 路线要求 `stitch-prototype.md` 状态为 `Reviewed` 或 `Not Applicable`，且 `prototype.html` 状态为 `Not Applicable` 或用户已明确批准切换到 HTML 路线；组合路线才要求对应路线产物都达到 `Reviewed` 或 `Not Applicable` 状态。

自动化测试计划门禁必须按条件判断：涉及真实实现、UI/API 行为、数据或权限风险、跨仓协作、回归风险或发布信心要求时，`automation-test-plan.md` 必须为 `Reviewed`；纯文档、纯探索或用户明确确认不需要自动化测试时，必须为 `Not Applicable` 并写明原因。

## 项目初始化配置门禁

读配置、stale、open questions、`explicit_override`、`code_exploration` 为 `user_declined` 等通用规则见公共契约 § Project Init Config Gate。本阶段额外要求：配置里的单测基建检查和 Git Hook 是建议项。缺了先告诉用户并建议补；用户要先写业务则记下后继续，不得因此停死开工。

## 开工前检查

读取 `project-wiki.md`（如存在）、`development-plan.md`、`test-cases.md`、`automation-test-plan.md`、`technical-solution.md`、`.workflow-state.json` 和 `git status --short`。必须检查：

- 开工前交付物核对见公共契约同名节。过不了就停。
- 代码探查门禁（含 `code_exploration` 为 `user_declined` 时不执行本检查项）见公共契约 § Project Init Config Gate。
- 如果 `docs/repo-wiki/index.md` 存在，开工检查必须先读取 `project-wiki.md` 的仓库/包地图、Repo Wiki 状态矩阵、生成/引用路径、系统边界和待确认问题，再按公共契约读取 repo wiki 基础页面，并读取 `boundaries-and-red-flags.md`、`verification-gates.md`、`_meta/status.md` 和开发计划中涉及的相关 `codemaps/*.md`。开发计划中的关键模块用 wiki + 源码回查。如果 Project Wiki 与 repo wiki 或源码冲突，必须先回到 Project Wiki/开发计划修正或询问用户。如果 repo wiki commit 已过期、wiki 未覆盖关键模块或元数据缺失，不得把 wiki 当事实依据；必须先用源码、配置或测试回查开发计划中的关键假设。只有关键假设无法确认，或开发计划缺少必要回查证据时，才停止开工并要求回到 `$product:technical-solution` 或 `$product:plan` 修正，不得推荐或启动实现。
- 批判性审查 `development-plan.md`：如果计划存在 concern、blocker、关键步骤缺口、指令不清楚或无法按原文执行的任务，必须停止并询问用户或回到前序阶段修正，不得边猜边开工。
- 开发计划是否有明确任务编号、文件范围、依赖、验证命令、回滚说明。
- 每个任务是否有 TDD 检查点，且能映射到 `TC-xxx`。
- 如果自动化测试计划适用，检查 `AUTO-TASK-xxx` 是否已经进入开发计划，且每个任务有目标 repo、测试入口、验证命令和报告证据。
- 技术方案是否包含单元测试基建现状；如果标记需要 `product-unit-test-init`，开发计划是否把它列为实现前置任务。
- 若计划里有测试基建建议任务：建议先 `$product:unit-test-init` 只出脚本交人跑。用户说先编码时，将 TASK-000、责任人、原因、ISO-8601 时间和 `stage: start-implement` 写进 state 的 `waivers[]` 后继续；TASK-000 保持未完成，并刷新看板。
- 若计划里有 Git Hook 建议任务：建议跑 `product-git-hook-init` 做诊断。用户说先编码时记下后继续，不挡派发实现。
- **依赖安装卡死时主动提示豁免**：开工检查或前置任务执行中发现依赖安装长时间卡死（网络受限、私有源不可达、构建文件冲突等），不等用户开口，主动说明卡点并给出选项：(a) 继续等或换源重试，(b) 走豁免——记责任人后先写业务代码，TASK-000 保持未完成并上看板。默认推荐 (b)，避免开工空转；豁免后不得标已通过，发布前必须补跑。
- 是否存在用户未提交或无关改动；无关改动不得纳入本次实现。
- 当前分支是否允许实现；在 `main`/`master` 上开始实现前必须有用户明确批准。
- 任务之间是否有重叠写入文件或强顺序依赖。

## AI 不确定性开工门禁

推荐执行方式或进入实现前，必须列出仍无法从批准产物、代码探索和工作树状态中可靠确认的开工问题，并判断是否阻断开工。

以下情况必须先问用户或回到前序阶段修正，不得靠假设开始实现：

- 任一产物审批状态、剩余不确定项接受状态或“不适用”确认不明确。
- Project Wiki 缺失或与开发计划中的仓库 ownership、文件范围、验证命令冲突，且用户未确认不适用。
- 开发计划中的任务范围、文件 ownership、依赖、验证命令、回滚说明或 TDD 检查点不清楚。
- 是否允许在当前分支实现、是否允许使用 subagent、是否需要避开用户未提交改动不清楚。
- 代码探索或工作树状态与开发计划冲突。

询问用户时一次覆盖当前开工继续所需的全部阻断问题，按审批、执行模式、文件 ownership、验证/TDD、工作树风险分组。只有用户明确回答，或明确授权“先按假设继续”并接受对应风险，才能推荐或启动执行方式。授权按假设继续时，Develop tab 必须记录这些假设、风险和哪些任务在确认前不得执行。

## 执行方式推荐

默认 `--mode=auto`。先给用户一个明确推荐，再等用户批准执行方式。

推荐多 subagent TDD，除非任务明显简单。以下情况优先推荐 `multi-subagent`，然后等待用户批准：

- 开发计划中有 2 个以上任务，即使任务有文件重叠或先后依赖。
- 任务涉及多个模块、角色、状态、测试层级、迁移/发布/回滚或较高风险。
- 任务写入范围需要拆出 ownership 和顺序边界。
- 当前运行环境支持 subagent。
- 任务需要隔离上下文、逐任务 fresh implementer，或需要独立 reviewer 检查规格符合度/代码质量。

推荐单 agent TDD，当出现任一情况：

- 任务明显简单：单一小改动、单一文件或少量相邻文件、验证命令明确、风险低。
- 当前环境完全不支持 subagent。
- 当前阶段只适合由主 agent 直接完成一个关键路径任务，再决定是否切换为多 subagent 顺序执行。

推荐文案必须包含：

- 推荐方式：`multi-subagent` 或 `single`
- 原因：基于任务数量、独立性、写入范围、风险和工具可用性
- 替代方式：另一种模式的代价
- 等待用户确认：不得在推荐后直接写代码，除非用户在同一句里已经明确批准模式和开工

编码、TDD、任务包和两阶段 review 以 `$product:develop` 为准。开工只提醒：批准方式之后才写代码。

## 方式批了之后

用户批准 `single` 或 `multi-subagent` 后，交给 `$product:develop --mode=…`。编码、TDD、任务包、规格符合 review 和代码质量 review 以 develop 为准。本 skill 不在推荐阶段写生产代码。

适用命令：

```text
$product:kickoff --mode=single
$product:kickoff --mode=multi-subagent
```

多 subagent 须用户明确批准。没有批准时只推荐，不派发。任务包、状态协议、规格符合 review、代码质量 review 见 `$product:develop`。

## 完成

门禁已核对；已推荐 `single` 或 `multi-subagent`；等人批准方式。批准后请用户执行 `$product:develop --mode=…`。本回合不写生产代码。

## 输出

回复：

- 当前门禁是否满足
- 推荐模式和理由
- 可选模式
- 下一步：批准后执行 `$product:develop --mode=…`（TDD / review 见该 skill）

写过 `start-implement.md` 或 state 后，运行 `render_review_board.mjs`，确认 `.review-board/index.html` 存在。只推荐方式、尚未写入切片文件时，不生成看板。

## 请求批准前自检

- 已执行公共契约中的批准前通用自检。
- 已读取全部前序产物、Project Wiki、repo wiki 状态和审批状态。
- 如 repo wiki 存在或 Project Wiki 指向 `repo-wikis/<repo-slug>.md`，已读取开工相关页面；若 wiki 过期、缺失关键模块或元数据缺失，已用源码、配置或测试回查关键假设，且只在关键假设无法确认或缺少必要回查证据时停止并回到前序阶段。
- 已检查任务独立性、文件 ownership、验证命令和工作树风险。
- 已检查单元测试基建现状；如需 `product-unit-test-init`，已把它作为开工前置任务处理。
- 已明确推荐 single 或 multi-subagent，并说明原因。
- 已提醒用户多 subagent 需要明确批准。
