# haitian-pw

海天现场产品工作流套件。给 Codex 用的 `product-workflow-suite` 源码仓。

## 回滚点

- 标签 **`haitian-pw-0.2.0`**：2026-08-25 现场安装包。
- 标签 **`haitian-pw-0.3.0`**：2026-08-27 现场安装包。
- 标签 **`haitian-pw-0.4.0`**：2026-08-31 非 UI 批次。
- 标签 **`haitian-pw-0.4.1`**：2026-09-01 安装校验补丁。
- 标签 **`haitian-pw-0.4.2`**：2026-09-01 看板收进 `.review-board/`。
- 标签 **`haitian-pw-0.5.0`**：2026-09-04 lite、迁移、看板补全、impeccable 按需接入。
- 标签 **`haitian-pw-0.6.0`**：2026-09-08 当前现场安装包（Ask/连跑人触发、对抗审查、plan/kickoff、Limix 门户）。

若优化跑偏：

```bash
git switch -c recover-0.6.0 haitian-pw-0.6.0
# 或
git reset --hard haitian-pw-0.6.0
```

现场装 haitian-pw-0.6.0。装完到客户项目根跑一次 `migrate_suite.mjs`。切片产物改短名、把 code-wiki 接到工作流、安全扫描进开发门禁，放到 0.7.0。这一版 zip 不含 `code-wiki/`。

## 安装

解压或复制本仓库到 Codex skills 目录中的 `product-workflow-suite/`，整夹替换后重启 Codex。
