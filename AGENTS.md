# OpenMausBot agent notes

Before claiming a server or conversation change works, follow
[`docs/verification/README.md`](docs/verification/README.md). Always launch an
isolated fixture; never verify mutations against the user's live app or data.

More specific `AGENTS.md` files override this note within their directories.

---

## 团队协作机制（OMB 团队 · 2026-09-13 迁移）

本仓库同时是 OMB 研发流程团队的工作目录（团队泛化自 Demo 团队模板复制而来）。团队协作机制、角色映射与门禁见 `协作机制/README.md`（机制库索引）与 `协作机制/section-context.md`（Section Context 留档）；团队角色清单见 `文档/团队模板/omb-team.botmrr.md`。

- 收到业务需求（改代码 / 修 bug / 新增功能 / 任何要写本仓库的工作）→ 上报团队指挥官（OMB-指挥官），由其走 SDD 流程分级分派；只读咨询可直接回答，不用上报。
- 需求流程：澄清 → 规格 → 任务计划 → 对抗审查 → Reviewed（人批）→ TDD 实现 → 代码审查 → 构建 → QA 判定 → 部署（dry-run）；分级规则见 `协作机制/01-需求分级.md`。
- 状态机：`.workflow-state.json` 中 AI 只写 Draft / Blocked / Not Applicable；Reviewed 只能指挥官写；QA 取值 QA-Pending → QA-Passed / QA-Blocked。
- 产物命名（`切片/<需求短名>/`）：clarify.md / prd.md / technical-solution.md / development-plan.md / test-cases.md。
- `/.local-credentials.env`（沿用 Demo 约定占位，实际凭据文件模式待回填 `协作机制/09-项目事实表.md`）为禁读边界：不得打开、读取、搜索、索引、摘要或展示内容，仅允许元数据检查。
- 部署、发布、push、持久化迁移默认需要明确批准；测试环境部署默认 dry-run。
- 上游开发规范仍以上方内容与 `docs/verification/README.md` 为准（fork 二开叠加团队协作机制，不覆盖上游指令）。