# 06 · 竞品对比：OMB vs Rakazo

> 整理自 2026-09-12 调研：结论经 GitHub 仓库核实（README / VISION.md / 提交历史 / 发布资产），OMB 侧另核过本机安装源码（`resources\server\`、`app.asar`）。
> 关联：`02-委派机制与需求分级.md`（delegate_bot 背景）。
> 可视化信息图见本目录 `06-附图-OMB-vs-Rakazo对比.html`。

## 一、一句话结论

**暂不装 Rakazo。** 两个项目是同一赛道的独立实现（2026 年 8 月的开源 Grok Bot 替代品，Apache-2.0，互不为 fork），但架构理念相反：OMB 是"本地优先的桌面聊天应用"，Rakazo 是"可自托管的服务器平台"。对 Windows 桌面 + 已深度使用 OMB 的现状，迁移成本高、收益低。

## 二、同源确认

- 两者都是 2026 年 8 月独立开源：OMB 8/11 建仓，Rakazo 8/13。
- 互不为 fork；Rakazo 提交里吸收过 fork `millson1` 的基础设施代码——`millson1` 是瑞士的 Millson，**不是** milind-soni，两项目从零独立编写。

## 三、理念对比

| | OpenMausBot | Rakazo |
|---|---|---|
| 定位 | "Your own team of AI bots, in a chat app"——桌面聊天应用为产品中心 | "AI teammates you actually own"——持久化 AI 队友平台（VISION.md） |
| 数据主权 | 本地优先：harness 跑 `127.0.0.1`，数据存 `~/.openmausbot` 文件 | 服务端优先：bots 在服务器常驻，核心工作流全部可自托管 |
| 模型接入 | **BYO 本机 CLI**：复用本机 claude/codex/grok 的现成登录与订阅，无代理 | **BYO 凭据**：经 Pi 网关接入，服务端持凭据 |
| bot 形态 | 像联系人一样聊天（钉住/重命名/复制对话） | 持续身份 + 持久工作状态，反对退化成 prompt 预设 |
| 安全模型 | 权限代理把危险动作变成聊天内 Allow/Deny 卡片 | Spaces 授权边界；Team/Private Computer 区分；不确定就询问 |

Rakazo 的 VISION.md（"Calm on the surface, rigorous underneath"、"Computers are durable places"）理念文档成色更高；OMB 的理念浓缩在"聊天应用"这一个产品直觉。

## 四、实现对比

| 维度 | OpenMausBot（本机源码 + README 核实） | Rakazo（README/提交/发布物，未读源码） |
|---|---|---|
| 架构 | 双进程：React(:5199) + harness(:8799)，HTTP + 单路 SSE；**无数据库**，文件存储 + 进程内内存锁 | 客户端-服务端：**PostgreSQL + Prisma**、Better Auth、Graphile Worker 任务队列；web/Electron/Expo 全是同一 API 的瘦客户端 |
| 运行沙箱 | Box 云桌面 / 本地 VM / 宿主 CUA（opt-in） | **Docker / E2B / Daytona / Box** 容器沙箱 + supervisor 令牌 + 每 space 并发上限锁 |
| 集成 | Composio 市场（500+ 应用） | Composio + **Pipedream Connect** + 自装 Treg + 远程 MCP + OpenAPI 工具源 |
| 记忆 | 线程转录文件 + MEMORY.md 式文件记忆 | Markdown 记忆 + **Supermemory / Serenity 语义记忆**（按 space 选择，带 SSRF 防护） |
| 语音 | ElevenLabs 一种 | ElevenLabs / OpenAI / **Cartesia / Fish Audio** 四种 |
| bot 间协作 | delegate_bot / subagent | delegate to peer bots / short-lived subagents |
| 分发 | mac / **Windows** / Ubuntu 安装包 + `npx openmausbot` + Docker 栈 | Docker Compose 镜像（edge）；桌面端**只有 mac + Linux** |
| 成熟度 | 1691 commits、2.55k★、193 open issues | 828 commits、2.33k★、71 贡献者、**v0.1.6 beta**、9 open issues |

## 五、值得注意的事实

1. **Windows 是分水岭**：OMB 有成熟 Windows 安装器（本机在用）；Rakazo v0.1.6 发布资产实测只有 mac dmg/zip + Linux AppImage，**无 .exe**——Windows 用户只能浏览器端 + 自托管栈。
2. **本地体验差异**：OMB 装完即用（自带 harness）；Rakazo 本地跑也要 **Docker Engine + Postgres**（"本机模式"同样依赖 Docker Desktop/OrbStack）。
3. **社区体量**：stars 接近，但 OMB 提交数、fork 数、issue 流量明显更大——OMB 迭代更快也更"吵"，Rakazo 更收敛。

## 六、装不装？——按你的情况

| 你的情况 | 结论 |
|---|---|
| Windows 桌面主力 | ❌ 无桌面客户端，只能用浏览器 |
| 已深度使用 OMB（改字体、研究锁、多 bot 协作） | 迁移成本高，收益低 |
| 想要 24h 服务器常驻 bots + 手机/网页随时访问 | ✅ 这才是 Rakazo 的主场（OMB 的 `serve --tunnel` 也能做到） |
| 想要语义记忆、4 种语音、Team Computer 共享浏览器身份 | ✅ Rakazo 独有卖点，OMB 没有 |
| 纯粹好奇想比较 | 可以 Docker 拉 edge 镜像体验，**与 OMB 互不冲突**（独立端口/数据目录），随时可删 |

最低成本尝鲜路径：VPS 跑 `install-images.sh`（官方安装脚本，无需 clone），浏览器体验两天——但别指望它替代现有 OMB 工作流，等它出 Windows 桌面版（或上服务器架构）再重新评估。
