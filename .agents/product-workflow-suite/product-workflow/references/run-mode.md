# Run mode

`$product:workflow` 开工前选定 **run mode**，写入 `.workflow-state.json` 的 `run_mode`。

| 值 | 做什么 | 完成标准 |
|---|---|---|
| `stage-gated` | 做完**当前一阶段**产物后停下，等人批准再进下一阶段 | 本阶段 md + state 已写；已问「是否进入下一阶段」 |
| `through-run` | 按顺序把**本切片范围内**各阶段产物写完 | 范围内每阶段都有文件；**PRD 和开发计划一定有** |
| `lite` | 一天内完成的单模块小改，只写短 PRD、短开发计划与开发证据 | 两道批准门：短 PRD 已批；`develop.md` 新鲜验证证据已批 |

## 怎么选

**through-run**：用户点名「一次跑完」「连跑」「全流程做完」「一口气做到开发」。

**lite**：同时满足以下条件时，由 clarify 第一轮给出推荐，用户一句话确认后采用：

- 已有产品/页面/接口/规则上的增量小改，不是从 0 到 1 探索。
- 只改一个按钮、字段、接口或业务规则。
- 影响范围不超过一个模块，预计一天内可完成。
- 不涉及新权限模型、敏感数据、schema/迁移、跨仓契约、架构边界或高风险发布。
- 项目级 profile/config 已存在，相关代码位置和验证命令可通过轻量探查确认。

有任一条件不满足就不选 `lite`。用户未确认 lite 时仍用 `stage-gated`。初始化配置 `workflow_policy.test_automation=required` 时，采用 lite 前还必须取得本次 `explicit_override`，写明原因、风险和回收点。

**stage-gated**：用户没点名 through-run，且未确认 lite。

**fog**（不确定高）时保持谨慎：缺目标用户或触发场景、`product_mode` 为 unknown 且未授权按假设、问题表已有 blocker。此时不能选 lite；即使用户点了 through-run，也先问一个问题：继续 through-run，还是改 stage-gated。按回答执行。

## lite 文件与两道门禁

lite 不引入新文件。切片只生成：

- `prd.md`：短版，必须有「范围 / 验收 / 验证 / 不做」。用户批准后才能实现。
- `development-plan.md`：短版，必须有 `TASK` 清单、文件范围和验证命令；它是已批 PRD 的执行拆解，不单独请求批准。
- `develop.md`：修改文件、验证证据、结果、风险与回滚。新鲜验证证据由用户批准后才完成切片。
- `.workflow-state.json`：状态唯一源头，`run_mode` 为 `lite`。

`clarify`、`project-wiki`、两种原型、`test-cases`、`test-automation`、`technical-solution`、`start-implement` 在 state 中标 `Not Applicable` 并逐项写原因，不生成同名空壳文件。`test-automation` 的裁剪原因还要写进短 `prd.md`；配置要求自动化测试时必须同时记录 `explicit_override`。

lite 的开发计划状态由 AI 写 `Draft`，不伪造 `Reviewed`；PRD 批准后可直接按短计划执行。实现后运行：

```bash
node product-workflow/scripts/validate_lite_slice.mjs <工作流目录>
node product-workflow/scripts/render_review_board.mjs <工作流目录>
```

校验失败、验证未执行或失败时，不得把 `develop` 标为 `Reviewed`，也不得宣称切片完成。

小切片未采用 lite、但未点名原型/单测/技术方案时，这些阶段仍可标 `Not Applicable` 并写原因；不要为凑步骤生成空壳。through-run 也遵守这一条。

三种 mode 都遵守单一源头：只改阶段源头文件和 state，看板由生成器派生。
