---
name: product-review
description: >-
  对抗审查。prd.md 或 development-plan.md 已是 Draft 时，过规格 / 可判定 / 事实。用户点名 product:review、对抗审查时使用。
---

# Product Review

## 命令

```text
$product:review
```

写完的人不能自己放行。清单在 `references/checklist.md`，本 skill 只定步骤。

## 何时

- `$product:prd` 把 `prd.md` 写成 `Draft` 之后、请求人批之前。lite 短 PRD 同样过。
- `$product:plan` 把 `development-plan.md` 写成 `Draft` 之后。full 请人批之前过；lite 计划不单独请批，过不了不得进入实现。

其他阶段本版不做。

## 步骤

1. 钉死当前切片源头：`prd.md` 或 `development-plan.md`。结论写进同一份的 `## 对抗审查`，不另开文件。
2. 读 `references/checklist.md`。
3. lite：主 agent 按清单自查。full：派 **fresh** reviewer，提示词贴全（本阶段全文、直接上游、清单）；reviewer 不继承写稿会话。
4. 先过人机两句，再填三轴。每条发现写：轴、原文位置、问题、建议。
5. 完成标准以清单为准。有阻断：保持 `Draft`，先改或问。无阻断：仍是 `Draft`，等人批才写 `Reviewed`。
6. 改过源头则跑 `render_review_board.mjs`。`portal_sync=bound_project` 时按公共契约上传 snapshot。

## 完成

源头已有 `## 对抗审查`；阻断时未请人按已通过批准。
