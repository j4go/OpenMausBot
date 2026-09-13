---
name: product-clarify
description: Use when the user explicitly names product:clarify for product workflow requirement clarification
---

# 产品问题澄清

## 命令

```text
$product:clarify <需求>
```

## 公共契约

执行本 skill 时必须遵守 `../product-workflow/references/common-contracts.md`。

## 项目初始化配置门禁

写澄清产物前，先按公共契约读取 `.product-workflow-config.json`（如存在）和 `docs/product-workflow/project-profile.md`（如存在）。如果配置存在，澄清阶段必须复用其中的项目阶段、交付目标、代码探查许可、仓库结构、知识库现状、原型偏好、测试/发布策略和 open questions，不得重复询问已经初始化确认的项目级问题。

澄清阶段必须继承 `workflow_policy.product_mode`、`clarification_style` 和 `mode_detection`。如果旧配置缺少 `product_mode`，按公共契约视为 `unknown`，并用一个问题确认模式或请求用户授权按假设继续；不得因为配置缺字段而重新问一整组项目级问题。

如果配置缺失，单独 `$product:clarify` 必须先询问是否运行 `$product:init` 建立项目级默认策略，或取得用户明确授权不带项目级配置继续；完整 `$product:workflow` 不得跳过 `$product:init`。如果配置的 `workflow_policy.code_exploration` 为 `user_declined`，本阶段不得静默搜索或读取代码。

## lite 推荐

完整 `$product:workflow` 的第一轮轻量探查若确认是已有产品上的单按钮、单字段、单接口或单规则小改，影响不超过一个模块且预计一天内完成，应明确推荐 `lite` 并说明依据，再只问用户是否确认。涉及新权限、敏感数据、schema/迁移、跨仓契约、架构边界或高风险发布时不得推荐 lite。用户确认后不生成 `clarify.md`，直接按 `run-mode.md` 写短 PRD；state 将 clarify 标为带原因的 `Not Applicable`。

## 目标

full 模式在写 PRD 前澄清产品问题，沉淀目标用户、用户任务、场景、约束、风险、成功指标、非目标和待确认问题。

## 输入

需要一个具体需求或业务问题。如果输入缺少目标用户、触发场景或成功指标，先问一个澄清问题，再写澄清产物。

使用用户消息、提供的链接、仓库文件、现有产物等上下文。必须区分已确认事实和假设。

## AI 不确定性澄清门禁

澄清阶段的目标不是替用户猜完整产品定义。写澄清产物前，先识别 AI 无法可靠确认的问题；如果这些问题会影响 PRD 范围、验收标准、用户旅程、成功指标、权限/安全/数据边界或实现方向，必须先问用户。

澄清前必须先形成“不确定性队列”，区分当前澄清必须确认的问题、可进入 PRD 但必须追踪的问题、以及非阻断假设。当前澄清必须确认的问题不能只写进产物后继续推进。

不确定性队列必须按 `product_mode` 排序：

- `zero_to_one` 优先确认目标用户、核心痛点、触发场景、MVP 边界、验证指标。
- `one_to_n` 优先确认现有流程、影响范围、兼容性、数据和权限边界、回归风险。
- `unknown` 优先确认产品模式；若用户授权按假设继续，必须记录模式假设会影响哪些 PRD、原型、测试和技术方案判断。

询问用户时必须遵守单问题澄清协议：每轮只问不确定性队列中最高优先级的一个决策点。问的必须是**决策**，不是能查的事实：仓库结构、现有命令、已有页面/接口、配置值和 git 历史先自己查；查得到就写进产物，不要问用户“现在有没有这个接口”。每个问题必须给出推荐答案和依据（现有代码、同类页面或风险更低的默认）。用户可以改推荐，但不能只抛问题。只有用户明确回答，或明确授权“先按假设继续”，才能继续写完整澄清产物。用户授权按假设继续时，必须把相关内容标为“阻断假设与后续确认”，不得写成已确认事实。

请求进入 PRD 前，必须再次列出所有未解决问题及其影响，并要求用户确认是否接受这些假设。`unknown` 或按假设继续只能生成 `Draft`；只有用户明确接受模式假设、风险、受影响范围，并明确允许本 Clarify 阶段按该假设批准为 `Reviewed`，才能标记为 `Reviewed`。

## 项目上下文使用门禁

代码探查门禁（含 `code_exploration` 为 `user_declined` 时的处理）见公共契约 § Project Init Config Gate。

如果需求涉及既有产品、仓库、工具、页面、API、CLI、业务流程或历史产物，写澄清产物前必须先探索相关项目上下文。除非用户明确要求“不要看项目/不要看代码”，否则必须确认项目根目录；如果当前产品工作流目录已有 `project-wiki.md`，先读取其仓库/包地图、Repo Wiki 状态矩阵、系统边界和待确认问题，再提取 3-8 个关键词，用 `rg` 搜索相关文档、代码、脚本、测试、配置和历史产物，并在澄清产物中区分 Project Wiki 事实、repo wiki 导航事实、源码回查事实、假设和待确认问题。

**搜索证据要求（完成标准）**：完成项目探索时必须实际执行一次 `rg` 或等价搜索；只写“应执行”不算完成。输出或澄清产物必须记录：3-8 个关键词、实际命令、命中路径摘要（无命中也要明确记录）、由命中确认的事实，以及仍需用户确认的线索。若当前代码探查权限、项目根目录或白名单不足以执行搜索，先停止并问用户，不得用计划中的命令冒充已执行。

如果 `docs/repo-wiki/index.md` 存在，澄清前必须先检查已有 `project-wiki.md` 是否指定该 repo wiki 的生成/引用路径，再读 `index.md`、`catalogue.json`、`_meta/status.md`、`shared-language.md`，并优先读取 `workflows.md` 和 `onboarding/product.md`。澄清产物中的“项目上下文事实和假设”必须区分 Project Wiki 事实、repo wiki 导航事实、用户输入、源码回查事实和仍未确认假设。

如果搜索为空、项目根目录不明确、或事实与用户表述冲突，先问一个澄清问题，不得把假设写成事实。

## 输出

创建或更新产品工作流目录。把澄清结果写入 `clarify.md` 和 `.workflow-state.json`，并在生成 `prd.md` 前请求明确确认。源头有更新就必须刷新看板 HTML：运行 `render_review_board.mjs`，确认 `.review-board/index.html` 存在。

澄清产物必须包含：

- 原始需求和业务背景
- 产品模式与澄清方式：当前 `product_mode`、`clarification_style`、`mode_detection`、模式来源、本阶段问题排序依据和仍未解决的模式假设
- 项目上下文事实和假设
- 目标用户和用户任务
- 当前流程和痛点
- 至少 3 个触发场景，除非该功能确实只有单一场景
- 目标、非目标、约束、假设、风险、成功指标、待确认问题
- 进入 PRD 前必须确认的评审清单

把可评审内容写入 `clarify.md`，状态只写 `.workflow-state.json`。AI 只写 `Draft`；`Reviewed` 等用户明确确认后再写。改过源头后运行 `render_review_board.mjs`。

本步骤不得写实现代码。

## 请求批准前自检

- 已执行公共契约中的批准前通用自检。
- Clarify：问题表格包含原始需求、事实、假设、风险、成功指标、待确认问题。
