---
name: product-test-cases
description: Use when the user explicitly names product:test-cases to generate or revise product workflow test cases
---

# 产品测试用例

## 命令

```text
$product:test-cases
```

## 前置条件

使用 PRD 和原型上下文。如果 PRD 缺少验收标准，先请求修订 PRD。

## 公共契约

执行本 skill 时必须遵守 `../product-workflow/references/common-contracts.md`。

## 输入

读取 `project-wiki.md`（如存在）、`prd.md`、`prototype.html`、`stitch-prototype.md`、PRD tab、Prototype tab 和用户反馈。写用例前，先建立 PRD 验收标准到测试区域的追踪关系；如果测试范围跨多个仓库或部署单元，必须先检查 Project Wiki 的仓库职责、Repo Wiki 状态矩阵、生成/引用路径和验证命令，再读取相关 repo wiki 或 `repo-wikis/<repo-slug>.md`。

下游测试用例必须区分 `stitch-prototype.md` 中已批准的 Stitch 事实和评审缺口，不得把缺口当作可验收事实写入 P0/P1/P2 用例。

## AI 不确定性澄清门禁

写 `test-cases.md` 前，先列出 AI 无法从 PRD、原型、用户反馈和项目测试上下文中可靠确认的测试问题，并判断是否阻断测试用例。阻断性不确定项不得仅写为“假设”或“待确认问题”后继续产出完整测试用例。

以下情况必须先问用户、回到 PRD/原型修正，或明确获得按假设继续授权：

- 验收标准含糊、互相冲突、缺少可观察结果，导致无法判定测试通过/失败。
- 原型状态、角色权限、数据边界、错误场景或兼容性要求不清楚，导致 P0/P1/P2 只能靠 AI 猜测。
- 自动化层级、测试环境、测试账号、测试数据、mock/fixture、外部集成或验证命令无法确认，并会影响用例可执行性。
- 安全、隐私、审计、数据保留、多租户隔离等风险测试边界未决。
- 项目测试体系探索结果与 PRD、原型或用户决策冲突。

澄清时一次覆盖当前测试用例继续所需的全部阻断问题，按验收可测性、数据/环境、权限/安全、自动化层级、项目测试约束分组。问题过多时，先问会影响 P0 覆盖和验收判定的决策组，并说明剩余阻断项会在下一轮确认。只有用户明确回答，或明确授权“先按假设继续”，才能继续生成完整测试用例。用户授权按假设继续时，`test-cases.md` 必须集中列出这些假设、影响的 `AC/TC` 和后续回收方式。

请求批准测试用例时必须附上仍未解决的不确定项清单；用户未确认接受前，不得把 Test Cases 状态写成 `Reviewed`。

## 项目测试上下文门禁

写测试用例前必须探索当前项目的测试体系和相似用例。涉及 Vue、WPF UI 或小程序时，按公共契约 § UI 栈参考门禁只加载对应 `references/stacks/*.md`，并让 TC 覆盖该端真实生命周期、权限/状态和验证方式；不得混用 Web DOM、XAML 或小程序平台 API。除非用户明确要求“只写业务测试，不看项目”，否则必须搜索相关测试目录、测试框架、e2e/单元/集成测试、测试数据、mock、fixture 和验证脚本。

如果 `docs/repo-wiki/index.md` 存在，测试用例设计前必须先检查 `project-wiki.md` 的仓库/包地图、Repo Wiki 状态矩阵、生成/引用路径、系统边界和待确认问题，再读取 `contracts.md`、`workflows.md`、`verification-gates.md`，并按影响范围读取相关 `codemaps/*.md`。测试用例必须优先用 Project Wiki 决定目标 repo 和 repo wiki 入口，再用 repo wiki 定位候选路由、API 家族、feature guard、验证层级和命令；涉及具体 contract、权限、命令或可执行性时，必须按公共契约回查源码、配置或既有测试后再写成确认事实。如果 wiki 未覆盖具体 contract，必须标出需要回查的源码或测试文件。

如需自动生成单元测试（把测试文件写入代码库或输出补丁），应调用 `product-unit-test-generator` 来为目标文件生成或修复测试用例。若在探测过程中发现项目缺少测试基础设施（无法产生 junit/coverage 报表），请先调用 `product-unit-test-init` 生成初始化脚本与配置（本 Skill 仅生成脚本/配置，不会自动执行任何测试或构建命令）。

`test-cases.md` 必须写明项目测试上下文：可复用的测试模式、现有覆盖、缺口和建议自动化层级。如果找不到测试体系或验证命令，先把它作为待确认问题；如果会导致测试设计不可执行，先问用户。

## 输出

写入或修订 `test-cases.md`。必须覆盖主流程、边界、错误状态、权限、数据边界、回归风险、准备、操作、期望结果、优先级、自动化/人工覆盖建议。为保证下游可执行性，建议将 `测试数据`、`自动化建议` 固定为每条 TC 的显式字段；若某条确实不适用，写明 `Not Applicable` 及原因，不留空。

测试用例产物必须包含：

- 阅读上下文：说明测试用例如何从 PRD 验收标准推导、谁来评审、P0/P1/P2 的含义、哪些风险必须重点看
- 项目测试上下文和可复用模式
- 每条 PRD 验收标准至少映射到一条用例
- P0/P1/P2 分组
- 准备、步骤/操作、期望结果、测试数据、自动化建议
- 主流程、替代流程、边界、错误、权限、数据边界、兼容性、可观测性、灰度、回归检查
- 普通产品需求至少 20 条用例，除非 PRD 明确说明范围更小

写入 `test-cases.md`，将状态设为 `Draft`，并请求明确批准。源头有更新就必须刷新看板 HTML：运行 `render_review_board.mjs`，确认 `.review-board/index.html` 存在。

请求批准前，检查是否有未覆盖的验收标准、重复用例或模糊用例。

## 请求批准前自检

- 已执行公共契约中的批准前通用自检。
- Test Cases：每条 `AC` 至少映射一条 `TC`，P0/P1/P2 含义清楚。
