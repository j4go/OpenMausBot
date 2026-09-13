# OMB 学习笔记

OpenMausBot（OMB）使用与协作方式的学习笔记。每篇笔记对应一次与指挥官Grill 的实际讨论，整理时附官方文档出处、指挥官解读与可操作结论。

## 笔记列表

| 编号 | 主题 | 内容 | 状态 |
|---|---|---|---|
| [01](01-机器人-群组-团队.md) | 机器人 / 群组 / 团队 | 三种协作形态的区别、使用场景、操作教程、官方机制解读 | 已整理 |
| [02](02-委派机制与需求分级.md) | 委派机制与需求分级 | 指挥官如何派活、需求轻重分级、跳过指挥官后各节点 bot 的直派流程、业界最佳实践对照 | 已整理 |
| [03](03-团队模板BotMRR-制作与移植.md) | 团队模板 BotMRR：制作、导出与跨项目移植 | OMB 高级用法：团队定义全局存储机制、三层分离提炼法、BotMRR 格式与校验规则、导出入口版本差异、新项目导入三步走 | 已整理 |
| [04](04-团队移植实战-E-Demo与Skill导入机制.md) | 团队移植实战：E:\Demo 与 Skill 导入机制 | Demo 团队落地实录：botmrr 模板校验、49 个 skill 的导入通道与直读方案、协作机制（原适配清单） | 已整理 |
| [05](05-SectionContext公共规则与多入口归一.md) | Section Context 公共规则与多入口归一 | OMB 官方分区级共享指令机制（配置入口/agent 禁写）、多入口归一四层设计、能力边界矩阵（协作机制 §8，原适配清单）、度量复盘 | 已整理 |
| [06](06-竞品对比-OMB-vs-Rakazo.md) | 竞品对比：OMB vs Rakazo | 同赛道独立实现、理念/实现对比、Windows 分水岭、装不装结论，附图 `06-附图-OMB-vs-Rakazo对比.html` | 已整理 |
| [07](07-createBot工具设计缺口-soul与blurb.md) | create_bot 工具设计缺口：soul 与 blurb | 源码级核实：create_bot 无 soul 入参、instructions 原样写进 description、soul 恒空是确定性行为；正确路径（propose_team_setup / propose_profile）与补 soul 分批纪律；产品侧反馈建议 | 已整理 |

> 注：`openmausbot-字体修改笔记.md` 为 OMB 客户端本地定制记录（2026-09-12 随 01-03 从 E:\OpenMetadata 迁移至此，OM 仓库不再保留 OMB 学习笔记）。
