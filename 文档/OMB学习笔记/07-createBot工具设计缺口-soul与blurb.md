# 07 · create_bot 工具设计缺口：soul 恒空、blurb 塞满 instructions

> 整理自 2026-09-13 关于「字体管家 soul 为空、blurb 一堆」的核实（读自 OMB 应用代码 + `bots.json`，证据链完整，非 LLM 理解偏差）。
> 关联：`openmausbot-字体修改笔记.md`（字体管家诞生于 create_bot）、`01-机器人-群组-团队.md`、`05-SectionContext公共规则与多入口归一.md`。

## 一、症状

用 `create_bot` 创建的单个 specialist：**soul 恒为空、blurb（description）恒为塞满的 instructions**。观察到的"每次都这样"是**确定性行为**——从 API 层面这条路就根本写不了 soul，模型再聪明也填不进去。这是 OMB 实现层的工具设计缺口，不是 LLM 发挥问题。

## 二、根因（源码证据）

1. **`create_bot` 工具 schema 没有 soul 字段**：`server/drivers/agents-proxy.js` 里只有 `name / role / instructions` 三个入参，无 `soul`、无 `description`。
2. **服务端把 instructions 直接塞进 description**：`server/index.js` 的 `/api/internal/create-bot` 处理器——
   ```js
   const created = store.createBot({
     name: name2,
     title: role,               // role → title
     description: instructions, // ← instructions 原样写进 description
     modelSelection: { ...chief.modelSelection },
     section: chief.section
     // soul 根本不传
   });
   ```
3. **`store.createBot` 里 `soul: profile.soul ?? ""`**——不传就是空串。所以走 `create_bot` 创建：soul 恒空、blurb 恒满。
4. **附带限制**：create_bot 的 instructions 上限 **1000 字符**，完整规则本来就塞不下。
5. **正确路径存在**：`propose_team_setup` 有 `fields.soul`（schema 标注 required）；`propose_profile` 有 `soul` 参数，且服务端会把 SOUL.md 的 diff 展示在确认卡上。问题不在"OMB 没有 soul 概念"，而在**创建单 bot 的默认工具把它砍掉了**。

## 三、为什么"每次都这样"

- 系统提示引导 chief 创建单个 specialist 时用 `create_bot`（"Use create_bot only for a single specialist when no combined setup was requested"）——而这条路没 soul 入参；
- `create_bot` 是**即时创建、无确认卡**，创建出来的问题没人拦截，事后才发现；
- LLM 的次要责任：即便走 `propose_team_setup`，模型也可能习惯性把规则写进 `description` 而不是 `soul`（字段名叫 "description" 确实太像放描述的地方）。但这是第二层，不是根因。

## 四、正确姿势（使用侧）

- 创建单个 bot 后**立即用 `propose_profile` 补 soul**（现有各 bot 的完整 soul 应就是这么补出来的——soul 里有"2026-09-12 入口归一"这类后补痕迹）；
- 或干脆要求走 `propose_team_setup` 确认卡（带 `fields.soul`，一次性建全）；
- ⚠️ 补 soul 时注意：**批量 propose_profile 会整体失败**（实测单条回复 7 连发全量 SOUL 替换，全部返回 "response hit the output token limit, arguments may be truncated"，卡片 0 张生成）——多张必须分多轮逐张发，不能并行堆在同一回复。

## 五、产品侧反馈建议（可向 OMB 反馈）

- `create_bot` 应支持 `soul` 参数并走确认卡流程；
- 至少也应把 `instructions` 落到 `soul`、`description` 自动生成一行摘要，而不是反向映射。

## 六、顺带确认（2026-09-13 已核实）

此前批的补 soul 确认卡**已生效**：`bots.json` 里字体管家现在 `soul` 是完整规则（soulHash 已变）、blurb 是一行简介，本次对话开头注入的 SOUL.md 正是修复后的版本。
