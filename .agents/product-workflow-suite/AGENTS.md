# AGENTS.md

改本仓 skill 时按这些规范写。细则在 `writing-for-agents`；这里只留动手时要用的轴。
客户项目章程模板在 `product-init/references/`，不要和本文件混。

## 写 skill

- **步骤**写进 `SKILL.md`，**参考**（栈事例、模板、分支）放 `references/`，用指针按需加载。
- 每一步要有能判断做完的标准。
- 用词要短、要反复出现（抽出、增量覆盖、工作区、对抗审查）。少写「不要…」，改写要做什么。
- 一种意思只放一处。环境里能查到的（`--help`、目录、配置）不要抄进正文。
- 删掉不改变行为的句子。企业差异进 `references/`，不进 skill 正文。

## 触发

- **模型触发**：写面向模型的 `description`，模型或其他 skill 可以自己点。阶段执行用这个。
- **人触发**：`disable-model-invocation: true`。只有人点名才跑。总入口、Ask、连跑用这个。
- 人触发的 skill 可以点模型触发的；不能点另一个人触发的。要人先跑 Setup 时，写成「请用户执行…」，不要写成调用 Skill 工具。
- 人触发的 skill 多了，用一个 Ask 当目录：只指路，不代为点名。

## 组装

- 可只装一部分。code-wiki、stitch、单测 generator 缺了，主流程仍能跑，缺的步骤标跳过或可选。Limix CLI 由 init 发现并写入 `portal_sync`，不是独立 skill。
- 共享参考放在拥有它的那个 skill 里；别人用 Skill 工具去调，不要跨目录深链。

## Agent skills

### Issue tracker

票和 spec 写在 `.scratch/<feature>/`。见 `docs/agents/issue-tracker.md`。

### Triage labels

用默认五套：needs-triage / needs-info / ready-for-agent / ready-for-human / wontfix。见 `docs/agents/triage-labels.md`。

### Domain docs

单上下文：根目录 `CONTEXT.md` + `docs/adr/`。见 `docs/agents/domain.md`。
