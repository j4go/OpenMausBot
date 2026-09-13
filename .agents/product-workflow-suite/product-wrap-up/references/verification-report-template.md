# 收尾验证报告：<阶段或切片>

- 日期：YYYY-MM-DD
- 触发场景：阶段完成 / 切片切换 / 修改完成（删去不适用项）
- 状态文件：`.workflow-state.json`（current_stage、各阶段 status 摘要）

## 检查项结果

| 检查项 | 结果 | 证据（命令 / 文件 / 退出码） |
|---|---|---|
| A. 状态一致性：状态文件可解析、无 BOM、current_stage 与实际一致 | pass / fail / skipped | |
| A. 未批准阶段未标记 Reviewed | pass / fail / skipped | |
| B. 产物完整：当前阶段产物达标（编号/上下文/无占位） | pass / fail / skipped | |
| B. 看板已重建：`.review-board/index.html` tab 齐全、双视图、图示、标题一致 | pass / fail / skipped | |
| B. 历史：非首次则有 `.review-board/index.prev.html` 与 `.review-board/history/` 快照 | pass / fail / skipped | |
| B. 产物位于标准目录 | pass / fail / skipped | |
| C. 受影响文档已同步 | pass / fail / 人工确认 | |
| C. 切片总览表已更新（若涉及） | pass / fail / skipped | |
| D. 验证命令已本轮执行 | pass / fail / not-run | |
| D. 验证报告已落盘 | pass / fail | |

## 未通过 / 豁免项

- 项：...
- 原因：...
- 处置：补跑时间 / 负责人 / 豁免记录位置

## 收尾汇报

- 文件变更：...
- 依据编号：...（J- / US- / AC- / TC- / TASK-）
- 验证命令与结果：...
- 遗留风险：...
