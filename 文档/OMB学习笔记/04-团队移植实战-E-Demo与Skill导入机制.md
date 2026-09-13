# 04-团队移植实战：E:\Demo 工作区与 OMB Skill 导入机制

> 场景：把 OpenMetadata 的 SDD 团队移植到新项目 `E:\Demo`（脱离 OpenMetadata，改用 Matt 工程 skills + 海天 product-workflow-suite）。
> 结论：团队模板 + 项目技能库分离；skill 进 OMB 有三条通道，项目技能库最佳实践是 cwd 直读而非导入。

## 1. 核心机制回顾（承接笔记 03）

- 团队"角色定义"（名字/标题/描述/SOUL/外观）全局存储；真正指向项目的只是每个 bot 的 `cwd` 指针。
- 团队包（BotMRR）是纯定义：不含 cwd、记忆、历史、凭据、模型选择。
- 换项目 = 导入团队副本 + 设 cwd + 对技能库，三步。

## 2. OMB Skill 导入：三条通道（本次源码核实）

| 通道 | 机制 | 上限/限制 | 适用 |
|---|---|---|---|
| **团队包内联** | BotMRR 的 `package.skills.entries`（完整 SKILL.md 文本），agent 用 `skills: [...]` 引用 | **≤20 个/包**；每个 ≤256KB；source 拒绝绝对路径；instructions 必须完整 frontmatter；包内 skill 必须被某 agent 引用；导入后**默认 disabled**，review 后启用 | 把少量"开箱即用"纪律 skill 随团队走 |
| **GitHub 导入** | bot 设置页 Import，只接受 `owner/repo`、github.com URL、raw SKILL.md | 发现顺序：路径本身 → `skills/` → `.claude/skills/`、`.agents/skills/` → 子目录；每包 ≤30 个；仅 markdown | 从公开仓库按需拉取 |
| **skill_manage 创建** | 指挥官用工具创建 → 用户批准卡 → workspace skills → bot imported skills | — | 沉淀 OMB 级通用纪律（如 QA 验证 skill） |

关键事实（源码 `server/skill-fetch.ts`、`server/bot-package.ts`、`server/team-package-skills.e2e.test.ts`、`SkillsSection.tsx`）：

1. **UI 导入只接受 GitHub 来源**，不接受本地路径——`parseSkillSource` 对非 GitHub 输入"loudly refused"；
2. **团队包携带 skills 是官方能力**（e2e 测试证实：导出用 `skillIds` 显式选择，导入后默认 disabled 需 review，失败回滚）；
3. **包内 skills ≤ 20 个**（`BOT_PACKAGE_MAX_SKILLS`）——E:\Demo 的 49 个 skills（Matt 30 + 海天 19）超上限，不能全内联；
4. 海天套件依赖非 md 资源（`scripts/`、`agents/openai.yaml`、`migrate_suite.mjs`），团队包只带 markdown，整体内联会破坏它。

## 3. E:\Demo 场景的落地决策

**项目技能库（Matt + 海天）不进 OMB，靠 cwd 直读**：

- bot 的 cwd 指向 `E:\Demo`，其文件工具可直接读 `.agents/skills/` 与 `.agents/product-workflow-suite/`——这正是 Matt/海天 skill 的设计用法（项目内技能）；
- 模板（`demo-team.botmrr.md`）SOUL 只写"技能取用规则 + 映射表位置"，不内联 skills；
- 角色↔skill 映射表放协作机制（`协作机制/02-场景决策表.md` §3，原适配清单 2026-09-13 迁入）；
- 需要 OMB 级通用纪律时再走通道 1/3（GitHub 导入或 skill_manage 创建）。

**流程统一口径**：产物命名用海天（clarify.md / prd.md / technical-solution.md / development-plan.md / test-cases.md），门禁用 SDD（Reviewed 人批、QA 判定）——两套状态机同构（Draft/Reviewed/Blocked/Not Applicable），不搞两套流程打架。

## 4. 本次交付物

| 文件 | 内容 |
|---|---|
| `文档/团队模板/demo-team.botmrr.md` | 团队模板 v2（8 角色 + demo-status-board + error-log-watch routine 示例，默认 paused） |
| `协作机制/README.md`（原 `demo-team-适配清单.md`） | 占位符实值、落地 6 步、角色↔skill 映射表、SDD↔海天工作流对照、日志/部署实值（2026-09-13 机制分离迁入） |
| `README.md` | 工作区结构 + 三步落地 + M1-M5 验证里程碑 |
| `切片/` `.scratch/` `backend/` `frontend/` | 需求切片、本地 issue tracker、前后端占位目录 |

## 5. 看板广播边界（2026-09-11 用户裁定，同步固化）

状态看板只广播**真正的项目需求**（改后端/改前端/修 bug 等业务逻辑任务）的阶段状态；
对话型/文档型/咨询型任务一律不推，不发初始化/元消息。看板消息必须是需求状态行。
