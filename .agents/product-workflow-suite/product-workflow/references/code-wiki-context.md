# 代码知识库接入

product-workflow 探测到 code-wiki（或其它满足同一契约的 provider）时才接入。未命中不报错、不提示安装、不建空图谱。

```bash
node product-workflow/scripts/detect_code_wiki.mjs <项目根目录>
```

命中条件（任一）：

- `workflow_policy.code_wiki_provider` 已设。
- 项目根或用户目录存在 `.cursor/skills/code-wiki/SKILL.md`、`.codex/skills/code-wiki/SKILL.md`、`.claude/skills/code-wiki/SKILL.md`、`.agents/skills/code-wiki/SKILL.md`（或 `code_wiki_provider` 指向的 skill 名）。
- 已有 `docs/project-wiki/code-wiki-repos.json`、`.code-review-graph/graph.db` 或 `graphify-out/graph.json`。

`workflow_policy.code_wiki` 默认 `optional`。`not_applicable` 或未命中：走 Wiki Context Gate + 源码回查。`code_exploration=user_declined` 时不得 `init`/`cite`/`impact` 探源码。

动词、字段和错误模式以套件内 `code-wiki/references/provider-contract.md` 为准。调用方只写动词，不写引擎 CLI。

## 阶段接入

| 阶段 | 动词 | 约束 |
|---|---|---|
| `product-init` | 工作区就绪后再 `init`（含章程）+ `practices` | 空目录先 `prepare_workspace.mjs` clone；已有 git 跳过拉取。建库可选：用户点名或 `code_wiki=required` 才跑 `$code-wiki init`。拒绝探查或 `not_applicable` 则跳过 |
| Wiki Context Gate | `query` | 需要代码事实时先 query，再 wiki，再源码 |
| `product-prd` | `query` | 理解现有实现；不生成 repo-wiki |
| `product-technical-solution` / `product-kickoff` | `cite` + `impact` | 旧实现指针与 blast radius |
| `product-develop` | 改前 `cite`，改后 `impact` | 对齐旧代码；影响面走确定边 |
| `lite` | 不强制 `init` | 已有库可 query/cite |

未命中时按现有 Wiki Context Gate 继续。
