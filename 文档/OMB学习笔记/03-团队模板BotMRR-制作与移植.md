# 团队模板 BotMRR：制作、导出与跨项目移植（OMB 高级用法）

> 整理自 2026-09-11 与指挥官Grill 的讨论。起因：SDD 团队的 8 个角色全部把工作目录（cwd）指向 `E:\OpenMetadata`，用户问"换一个项目目录开发时，是不是要重新创建 7 个 agent？最佳实践是什么？"。官方事实出处为 OpenMausBot 源码（`server/bot-package.ts`、`server/package-export.ts`、`src/components/TeamLibraryPanel.tsx`，main 分支）与 PR #316，链接见文末。

## 0. 一句话结论

> **换项目不用重建团队。** 把当前团队提炼成一份"与项目解耦"的 BotMRR 团队模板（`.md`，随仓库版本化），新项目用 `Teams → Import`（项目模式）导入副本、重设 cwd 即可，几分钟落地一套完整 SDD 流水线。**备份（.ombbackup）和移植（BotMRR 模板）是两个不同的东西，别搞混。**

## 1. 核心机制：团队定义是全局的，项目只是"指针"

先说清楚 OMB 的数据模型，这是理解一切的前提：

- **bot 定义全局存储**：每个 bot 的名字、标题、描述、SOUL、外观（颜色/身体）、playbook 都存在 `~/.openmausbot/bots.json` + `bots/<id>/SOUL.md`，**不在项目目录里**。
- **cwd 只是一个字段**：每个 bot 有一个 `cwd` 指针字段指向项目目录。我们的 8 个角色全部指向 `E:\OpenMetadata`——换项目要改的只是这个指针。
- **所以"团队移植"的本质**：让同一份团队定义落到新目录，而不是从零再写 8 个 SOUL。

## 2. 三个可选做法对比

| 方案 | 做法 | 适合 | 代价 |
|---|---|---|---|
| **A. 团队模板 + 导入（推荐）** | 团队固化成 BotMRR `.md` 存进仓库 → 新项目 `Teams → Import`（或 `From a folder` 项目模式）→ 重设 cwd | 多项目并行、每项目要独立记忆/历史 | 一次性模板成本；导入后重设 cwd/模型 |
| **B. 同一团队切 cwd** | 团队就一套，换项目时改 8 个 bot 的 working folder | 同一时间只做一个项目、切换不频繁 | 记忆/历史全局混在一起，项目间会串；无法并行 |
| **C. From a folder（scout）** | 选新目录 → OMB 自动分析并**提议**团队 | 从零的新项目，不要求复用角色配置 | 提议的是它生成的团队，不是你的模板 |

**推荐 A**，本仓库已落地：模板 `文档/流程与机制/sdd-team.botmrr.md` + 适配清单 `文档/流程与机制/sdd-team-适配清单.md`。

## 3. 导出路径：为什么 UI 里找不到"导出团队"按钮

这是本轮踩过的大坑，务必记住版本差异：

| 版本 | 导出入口 | 现状 |
|---|---|---|
| 旧版（commit `677538eb` 及之前） | 侧边栏 `+` 菜单 → **Export all bots**（下载 BotMRR `.md` playbook） | **已移除** |
| 新版（当前 main） | `+` 菜单只剩 New Channel / Teams（纯导入）/ Archived bots；TeamLibraryPanel 三个 tab（Explore/Import/From a folder）全是导入 | **没有导出按钮** |
| 官方文档（DeepWiki 10.2）+ 官网首页 | 只写导入，没写导出 | 文档滞后于代码 |

**新版"备份"入口在设置里**：`Settings → Workspace Backup`——设 ≥12 位密码 → 导出**加密 `.ombbackup`**（含 bots、群组、对话、消息、文件，是整工作区快照）。但这是**备份**，不是团队移植。

**团队级导出能力仍然存在**：服务端 `server/package-export.ts` 的 `createBotPackageExport()` 生成 BotMRR 包（纯定义，不含 cwd/记忆/凭据/模型选择），但**没有对应 UI 按钮**——这解释了为什么新版怎么都找不到"导出团队"。所以制作模板的两种方式：

1. **手工编写 BotMRR Markdown**（本仓库采用，见 §5）——完全可控、可审阅、随仓库版本化；
2. 通过 API 调用导出能力（适合自动化，需命令行/脚本环境）。

## 4. 提炼方法论：三层分离，模板必须与项目解耦

直接导出当前 SOUL 会带进一堆项目/机器硬编码，**必须提炼**。把每个角色 SOUL 的内容按生命周期分成三层：

| 层 | 占比（实测） | 内容 | 模板处理 |
|---|---|---|---|
| ① 通用核心 | ~60% | SDD 流程骨架、状态机约定（Draft/Blocked/Reviewed/QA-*）、单一写入者纪律、Gate Function、三轴审查、TDD、缺陷 triage | **原样保留** |
| ② 项目规范 | ~25% | `AGENTS.md` 等规范文件引用、`openspec/changes/<change>/` 路径、schema-first、checkstyle skill 引用 | **改成占位符**（`{{PROJECT_NAME}}`、`{{PROJECT_DIR}}`、`{{VERIFY_SKILL}}`…），实值外置到《适配清单》 |
| ③ 机器/环境硬编码 | ~15% | `E:\OpenMetadata\打包.bat`、`D:\*.bat`、`blj.haday.cn:2222`、tag 格式、`/.local-credentials.env` 禁读路径 | **全部删除**，只保留"见 {{ADAPT_FILE}}"式引用 |

**判断标准**：模板里不允许出现任何"这台机器 / 这个仓库"才有的字符串；新项目导入后，用户照着适配清单填自己的实值即可，不用读懂原项目。

## 5. 如何制作一份合法 BotMRR 模板

### 5.1 文件结构

BotMRR 是一个 Markdown 文件，**两部分缺一不可**：

```
---
botmrr: 1            ← YAML frontmatter：版本标记 + 完整包定义（扁平字段）
id: sdd-team          ← 小写 slug，^[a-z0-9][a-z0-9-]*$
release: 1.0.0        ← 语义化版本
name / tagline / summary / category / author / license
outcomes: [...]       ← 1-12 条
setupMinutes: 15
requirements: { apps: [], capabilities: [...] }
agents:               ← 1-200 个，每个含 key/name/title/description/soul/appearance
  - key: commander    ← key 规则 ^[a-z0-9][a-z0-9_-]*$（小写字母数字 + -_）
    name: 指挥官
    title: Chief of Staff · SDD 指挥官
    description: ...
    soul: |           ← 块标量，≤24000 字节（实测每角色 0.5-1.6KB 足够）
      （SOUL 全文，提炼版）
    appearance:
      color: pink     ← 限 10 色：green/blue/red/orange/purple/cyan/pink/yellow/teal/coral
      mascotBody: drop
chiefOfStaff: commander  ← 必须是某个 agent 的 key
rooms:                ← 可选，最多 30
  - key: sdd-status-board
    name: SDD 状态看板
    members: [commander]
    bulletin: |
      （房间公告，≤12000）
    defaultResponder: { kind: mentions }  ← agent(须是成员)/everyone/mentions
---
（空行）
# SDD 流程团队          ← Markdown 正文，必须含 7 个节（缺一不可）：
                        ## Activation / ## Mission / ## Outcomes / ## Connections
                        ## Team / ## Chief of Staff / ## Completion rule
```

### 5.2 解析校验规则（导入时强制执行）

源码 `bot-package.ts` 用 zod 严格校验，手工写模板时对照这些规则自检：

- **frontmatter 必须是合法 YAML**，`botmrr: 1` 为版本标记；
- **正文必须含 7 个必需节**（`## Activation`、`## Mission`、`## Outcomes`、`## Connections`、`## Team`、`## Chief of Staff`、`## Completion rule`），否则报 "missing its X section"；
- agent/room/routine 的 **key 唯一**且匹配 `^[a-z0-9][a-z0-9_-]*$`；
- **引用完整性**：chiefOfStaff 必须是 agent key；room 成员必须是 agent key；defaultResponder 为 agent 时必须是该 room 成员；routine 的 agent 必须是 agent key；
- **soul ≤ 24000 字节**、description ≤ 4000、name ≤ 100、title ≤ 200；
- 颜色限 10 枚举色（见上）；
- routines 的 `enabledAfterInstall` 必须为 `false`（导入后一律暂停，需用户手动启用）；
- **权限字段被剥离**：`approvalMode`、`autoApprove` 等 authority 字段不会进入包（防 privilege smuggling）；ids、grants、credentials、**paths（含 cwd）**、model selections、runtime state 一律不过包边界。

> 本仓库的模板已通过自写校验脚本模拟 `parseBotPackage` 全部规则（`VALIDATION PASSED`）。新写模板时建议同样验证一遍再导入。

### 5.3 提炼后的团队模板（本仓库交付物）

| 文件 | 内容 |
|---|---|
| `文档/流程与机制/sdd-team.botmrr.md` | 可导入的团队模板：8 角色（指挥官 + Spec/Tickets/Implement/CodeReview/Build/QA/Deploy）+ SDD 状态看板房间；SOUL 全部提炼为通用核心 + 占位符 |
| `文档/流程与机制/sdd-team-适配清单.md` | 占位符实值表、导入后必做 5 项配置、OpenMetadata 特有约定、移植标准流程 |
| `文档/流程与机制/原始SOUL快照/` | 8 份原始 SOUL 原样存档（提炼前的完整版本，防丢细节） |

## 6. 如何导入使用（新项目落地三步）

1. **导入**：侧边栏 `+` → Teams → **Import**（选本地 `.md` 文件）或 **From a folder**（项目模式：团队包 + 指定目录 + 自动开房间，一步到位）。同名角色自动显示为 "New copy of X"，**不会覆盖**你现有的角色。
2. **适配**：按《适配清单》§1 把占位符替换成新项目实值；逐角色设置 **cwd（工作目录）** 和 **模型选择**（包不带这两项）。
3. **开工**：指挥官自动成为 Chief of Staff，流程照常（澄清 → 规格 → 计划 → 对抗审查 → Reviewed → 实现 → 审查 → 构建 → QA → 部署 dry-run）。

## 7. 注意事项

1. **版本前提**：项目模式导入（`mode=project`）需要 OpenMausBot >= 2026-08-21（PR #316 合入）。UI 能看到 Teams 面板的 **From a folder** tab 就是新版；看到 "Export all bots" 按钮反而是旧版（且旧版无项目模式）。
2. **导入副本是干净的**：没有记忆、历史、已连接的 app 授权——这是特性（模板纯净），也意味着每个新 bot 要重设 cwd 和模型。
3. **备份 ≠ 移植**：`.ombbackup`（设置 → Workspace Backup）用于还原整机（含对话/凭据，恢复覆盖）；BotMRR 模板用于把团队定义搬到新项目（不含隐私运行时状态）。
4. **模板是纯定义**：任何凭据、密钥、内部地址都不要写进模板；公司特有的主机/脚本/tag 规则只进适配清单，不进模板。

## 8. 给同事的分享要点（OMB 高级用法）

- **团队可移植**：全局定义 + cwd 指针 = 一份团队模板通吃所有项目，别再手工建 8 个 agent；
- **三层分离**：通用流程 / 项目规范（占位符）/ 机器硬编码（删除），模板才干净；
- **BotMRR 是开放格式**：Markdown + YAML frontmatter，文档和机器可读蓝图放一起，任何 agent 系统都能读（body 里那句 *"Give this file to your Chief of Staff"* 就是给人/机器看的入口）；
- **导入有安全设计**：权限字段剥离、凭据不过包、routine 默认暂停——放心分享，不会泄露你的运行时状态。

## 参考来源

- OpenMausBot 源码（main 分支）：`server/bot-package.ts`（格式 schema + 校验 + Markdown 渲染）、`server/package-export.ts`（`createBotPackageExport`，导出不含 paths/credentials/model selections）、`src/components/TeamLibraryPanel.tsx`（Explore/Import/From a folder）、`server/workspace-backup-http.ts`（.ombbackup 工作区备份）
- PR #316（2026-08-21 合入 main）：import a team as a project — one room, on a folder（`mode=project`）
- DeepWiki 10.2 Team Library & Import（官方文档，仅覆盖导入，导出已滞后于代码）
- 仓库内：`文档/流程与机制/sdd-team.botmrr.md`、`sdd-team-适配清单.md`、`原始SOUL快照/`（本仓库实践产物）
