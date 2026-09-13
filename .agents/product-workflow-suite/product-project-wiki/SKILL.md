---
name: product-project-wiki
description: Use when the user asks for a project wiki for a folder containing multiple code repositories, cross-repo wiki, multi-repo context, repository map, or explicitly names product:project-wiki.
---

# Project Wiki

## 命令

```text
$product:project-wiki
```

## 前置条件

先判断客户的提交方式：

- 通用项目提交：用户说“生成 project wiki / 项目 wiki / 项目知识库 / cross-repo wiki / multi-repo context”，并把一个包含多个代码仓、多个包或多模块的文件夹作为当前工作目录。把当前工作目录视为项目根，默认输出到 `docs/project-wiki/`。
- 产品工作流提交：用户明确使用 `$product:project-wiki`，或当前目录是产品工作流目录并已有澄清、PRD、原型等阶段产物。使用当前产品工作流目录。

Project Wiki 用来沉淀跨仓库、跨模块、跨团队的项目级长期事实。默认在 init / 首次建仓时生成，后续切片只读复用；当前 `git rev-parse HEAD` 与 profile 的 `freshness.git_commit` 不同时只建议增量刷新，不因新切片重复生成。主标题、HTML `<title>`、catalogue title 和状态页必须使用 `Project Wiki`，不得写成 `Repo Wiki`。产品工作流提交如果缺少澄清上下文，先询问需求并运行澄清步骤；`run_mode=lite` 时不生成切片级 Project Wiki，改读项目级 profile/既有 Wiki，若需求需要新增跨仓事实则退出 lite；通用项目提交如果项目根目录或仓库边界不清楚，先问一个澄清问题。

## 公共契约

产品工作流提交必须遵守 `../product-workflow/references/common-contracts.md`；通用项目提交不要求产品门户契约；按本 skill 的探索门禁、输出要求和自检执行。

## 项目初始化配置门禁

执行产品工作流提交时，先读取 `.product-workflow-config.json` 和 `docs/product-workflow/project-profile.md`（如存在）。如果 `workflow_policy.project_wiki` 为 `required`，本阶段必须生成或刷新 Project Wiki，除非用户本次明确覆盖并记录 `explicit_override`。如果为 `not_applicable`，必须继承初始化原因并在产物中记录为什么本次不需要 Project Wiki。如果 `workflow_policy.code_exploration` 为 `user_declined`，不得静默探查代码，只能使用用户允许的文档和既有产物。

## 设计上下文

首次建项目级 Wiki 时运行 `detect_design_context.mjs <项目根目录>`。仅当返回 `detected: true`、项目有前端特征且根目录缺 `DESIGN.md` 时，按 `../product-workflow/references/design-context.md` 接入 impeccable `document`。已有 `DESIGN.md` 时只引用，不重跑；当前 git commit 比记录值新时只建议增量刷新。Project Wiki 记录路径、生成 commit 和缺口，不复制 token、组件规范或整份设计系统。未命中时不提示安装。

## 输入

读取问题澄清、现有 `project-wiki.md`、`.workflow-state.json`、用户提供的链接/文档、仓库文件和用户决策。如果项目根目录、仓库数量、仓库职责或关键系统边界不清楚，先问一个澄清问题，不要编造项目事实。

## 项目探索门禁

代码探查门禁（含 `code_exploration` 为 `user_declined` 时只能使用用户允许的文档、既有产物和用户提供信息）见公共契约 § Project Init Config Gate。

写 `project-wiki.md` 前必须探索项目真实上下文。除非用户明确要求“不要看代码/不要探索项目”，否则必须执行：

1. 确认当前模式、活跃项目根目录，以及是否存在多个代码仓或多包 workspace。`project` 默认表示一个文件夹下多代码仓；如果只有单个仓库，也要写成轻量 Project Wiki 并说明“单仓事实”。
2. 使用 `rg --files`、`find . -maxdepth 3 -name .git -type d`、`git remote -v`、`package.json`/`pnpm-workspace.yaml`/`go.work`/`Cargo.toml`/`pyproject.toml` 等证据识别仓库或包边界。
3. 对每个相关 repo 先判断 repo wiki 状态。repo wiki 可以是 `AGENTS.md`、`CLAUDE.md`、`README.md`、`docs/`、`docs/wiki/`、`architecture.md`、`adr/`、`runbook`、或团队约定的仓库说明入口。
4. 对已有 repo wiki 的仓库：读取入口和需求相关片段，提取可引用事实、过期风险、与代码探索/用户输入冲突的内容；Project Wiki 只做跨仓摘要和链接，不复制整份 repo wiki。
5. 对没有 repo wiki 的仓库：必须生成 repo wiki，而不是只在 Project Wiki 里记缺口。通用项目提交默认在 `docs/project-wiki/repo-wikis/<repo-slug>.md` 创建；产品工作流提交默认在当前产品工作流目录创建 `repo-wikis/<repo-slug>.md`。只有用户明确允许写入目标 repo，才在目标 repo 内创建团队约定入口，例如 `AGENTS.md`、`docs/wiki.md` 或 `docs/architecture.md`。生成内容必须来自代码、配置、脚本、测试和目录结构，并把推断标为假设。
6. 从澄清产物提取 3-8 个关键词，搜索相关代码、文档、脚本、测试、配置和历史产物。
7. 阅读最相关的文件片段，区分已确认事实、合理假设、未知项和与用户输入冲突的事实。
8. 如果搜索结果为空、项目根目录不明确、repo wiki 与代码事实冲突、或仓库职责冲突，先问用户，不得继续生成完整 wiki。

探索范围必须和需求相关。不要为了“完整”无差别读取所有仓库。

## 输出

写入或修订 Project Wiki，作为后续 PRD、测试用例、技术方案、开发计划、开工和开发执行的共享上下文。

- 通用项目提交：写入 `docs/project-wiki/index.md`、`docs/project-wiki/project-wiki.md`、`docs/project-wiki/index.html`、`docs/project-wiki/repo-wikis/*.md`。判断性 Markdown 写完后运行 `node product-workflow/scripts/generate_repo_wiki_meta.mjs <项目根目录>`，为 `docs/project-wiki/` 与（如存在）`docs/repo-wiki/` 派生 `catalogue.json` 与 `_meta/status.md`，不得手写这两个机械文件。`index.html` 必须是自包含单页索引，可直接用浏览器打开。
- 产品工作流提交：写入或修订当前产品工作流目录的 `project-wiki.md`，并更新 `.workflow-state.json`。源头有更新就必须刷新看板 HTML：运行 `render_review_board.mjs`。

Project Wiki 必须包含：

- 阅读上下文：说明这份 wiki 为什么存在、谁来评审、后续阶段如何引用它、哪些事实仍待确认
- 项目根目录和仓库/包地图：路径、职责、主要技术栈、入口、测试命令、部署单元、数据/API ownership
- Repo Wiki 状态矩阵：每个相关 repo 是否已有 repo wiki、入口文件、可信程度、最近证据、生成/引用方式和 Project Wiki 引用路径
- 系统边界：哪些能力属于当前项目，哪些属于外部系统、平台、三方服务或另一个仓库
- 跨仓流程：核心用户旅程、API 调用、事件、任务、数据流或发布链路如何跨仓协作
- 共享契约：API/schema、权限、状态机、环境变量、feature flag、迁移、审计、观测和回滚约定
- 本地开发和验证：每个相关仓库的启动、测试、构建、lint/typecheck 命令及证据来源
- 术语表：业务术语、技术名词、角色、状态、缩写和编号约定
- 风险、假设、待确认问题：标明影响的仓库、模块、后续阶段和回收点

如果项目实际只有一个仓库，也要写成轻量版 Project Wiki，明确“单仓事实”和未来可能拆分的边界；不要把单仓项目误写成多仓，也不要因为只有单仓就把主产物命名为 Repo Wiki。

## 缺失 repo wiki 的生成要求

为缺失 repo wiki 的仓库生成 `repo-wikis/<repo-slug>.md` 时，至少包含：

- repo 路径、remote、主要语言/框架、包管理器或构建工具
- 目录地图、主要入口、关键模块 ownership、数据/API/任务边界
- 本地启动、测试、lint/typecheck/build 命令及证据来源
- 与当前需求相关的已有能力、限制、风险和待确认问题
- 与其他 repo 的调用、事件、数据、环境变量、发布或回滚关系
- 明确标注：哪些是文件证据确认，哪些是根据代码结构推断，哪些需要 repo owner 确认

Project Wiki 必须引用这些生成的 repo wiki 文件，并在状态矩阵中把处理方式写为 `已生成 repo wiki`。不得把缺失 repo wiki 的仓库只写成空占位。这里的 repo wiki 是 Project Wiki 的子资料，不得覆盖主产物命名。

产品工作流提交写入 `project-wiki.md`，将状态设为 `Draft`，并在继续 PRD 前请求明确确认。改过源头后运行 `render_review_board.mjs`，确认 `.review-board/index.html` 存在。通用项目提交更新 `docs/project-wiki/index.html`，页面标题和首屏 H1 必须是 Project Wiki。

## 请求批准前自检

- 已执行公共契约中的批准前通用自检。
- 仓库/包地图来自真实文件、git remote、workspace 配置、脚本或用户确认，未把猜测写成事实。
- 已区分“有 repo wiki”和“没有 repo wiki”的仓库：前者引用/摘要/冲突检查，后者已经生成 repo wiki 并被 Project Wiki 引用。
- 已按客户提交方式选择输出位置：通用项目提交使用 `docs/project-wiki/`；产品工作流提交使用当前产品工作流目录。
- 主产物路径和标题符合用户意图：project wiki 使用 `Project Wiki`；repo wiki 只作为单仓请求或子资料。
- 每个相关仓库都有职责、边界、验证命令或“未知原因”。
- 跨仓流程、共享契约、风险和待确认问题能被 PRD、技术方案和开发计划引用。
- 如果存在影响范围、接口、权限、数据或发布的阻断问题，已经先问用户，或明确获得按假设继续授权。
