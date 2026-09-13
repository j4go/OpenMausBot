# OpenMausBot 本地开发笔记

> **⚠️ 重要：开发前先关闭官方构建版本（已安装的 OpenMausBot）**
>
> 通过开始菜单/桌面快捷方式启动的 OpenMausBot（安装版）会占用：
> - **数据目录租约**：`~/.openmausbot`
> - **harness server 端口**：`8799`
>
> 不退出会导致本地 `dev:server` 报 `DataDirLeaseError`，或端口冲突。
> 退出方式：系统托盘 OpenMausBot 图标 → 右键 → 退出。
> 若不想退出，可用文末"共存模式"隔离运行。

---

## 环境说明

| 项 | 值 | 说明 |
|---|---|---|
| 项目专用 Node | **v24.21.0**（`.tools\node24\node.exe`） | 免安装 zip，**全局 Node 22.19 不受影响** |
| 包管理器 | pnpm 10.33.0（corepack 自动按 `packageManager` 使用） | |
| 官方要求 | Node 24+、pnpm、至少一个 agent CLI（claude/codex/grok） | claude、codex 本机已装 |

> 推荐通过 `.\dev.ps1` 进入环境（自动把 `.tools\node24` 加到 PATH 前缀，所有 pnpm 命令都用 Node 24 跑）。

---

## 常用命令速查

```powershell
.\dev.ps1 status        # 检查环境 + 官方版运行状态（默认动作）
.\dev.ps1 install       # 安装依赖（pnpm install）
.\dev.ps1 build         # 构建前端+类型编译（tsc + vite → dist/）
.\dev.ps1 typecheck     # 仅类型检查
.\dev.ps1 lint          # oxlint 代码检查
.\dev.ps1 server        # 启动 harness server → 127.0.0.1:8799
.\dev.ps1 web           # 启动 web 前端 → http://127.0.0.1:5199
.\dev.ps1 desktop       # 启动 Electron 桌面壳
.\dev.ps1 package       # 打包 Windows 安装包（pnpm package:win）
.\dev.ps1 stop          # 强制关闭已安装的 OpenMausBot（杀进程树，含子进程）

# server/web/desktop 检测到官方版在运行时会黄色警告；加 -AutoStop 则自动关闭后再启动：
.\dev.ps1 server -AutoStop
```

## 启动开发环境（三个终端，推荐）

```powershell
# 终端 1：harness server
cd D:\OpenMausBot
.\dev.ps1 server

# 终端 2：web 前端（Vite 热更新）
cd D:\OpenMausBot
.\dev.ps1 web

# 终端 3：Electron 桌面壳（首次会自动下载 cloudflared）
cd D:\OpenMausBot
.\dev.ps1 desktop
```

> `desktop` 壳依赖前两个终端在跑。浏览器调试可只用终端 1 + 2，打开 `http://127.0.0.1:5199`。

## 构建与打包

```powershell
.\dev.ps1 build         # 日常编译验证（已验证通过）
.\dev.ps1 typecheck     # 类型检查（CI 级别）
.\dev.ps1 lint          # lint
.\dev.ps1 package       # 完整 Windows 安装包（electron-builder，耗时长）
```

---

## 共存模式（不想退出已安装版时）

用独立数据目录 + 独立端口，与已安装版并行：

```powershell
cd D:\OpenMausBot
$env:OMB_DATA_DIR = "D:\OpenMausBot\.omb-dev-data"   # 独立数据目录（已 gitignore）
$env:OMB_PORT = 8801                                  # 独立端口
.\dev.ps1 server        # 监听 8801
```

> 注意：`desktop`（Electron 壳）默认连 8799，共存模式下会连到已安装版，所以**桌面壳调试仍需退出已装版**。共存模式适合单独调 server / web。

## 常见问题

| 现象 | 原因 | 解决 |
|---|---|---|
| `DataDirLeaseError: previous server process ... still shutting down` | 已安装版 OpenMausBot 占用数据目录租约 | 退出已装版（`\dev.ps1 stop`），或用共存模式（`OMB_DATA_DIR`） |
| 端口 8799 被占用 | 已装版在跑 | `\dev.ps1 stop` 关闭，或用共存模式（`OMB_PORT`） |
| 想自动关闭官方版再启动开发 | - | `\dev.ps1 server -AutoStop`（web/desktop 同理） |
| pnpm 提示 `Ignored build scripts: core-js, workerd` | pnpm 默认拦截依赖 postinstall | 目前无影响；跑 Cloudflare broker 报 workerd 缺失时执行 `pnpm approve-builds` |
| `Unsupported engine: wanted node >=24` | 没通过 dev.ps1 进入环境 | 用 `.\dev.ps1` 或手动 `$env:PATH = "D:\OpenMausBot\.tools\node24;$env:PATH"` |

## Git 约定

- 本仓库 `origin` = 你的 fork（`j4go/OpenMausBot`），`upstream` = 官方
- 开发请开分支：`git checkout -b my-feature`
- 官方更新：`git fetch upstream && git merge upstream/main && git push origin main`
- `.tools/`、`.omb-dev-data/` 已加入 `.gitignore`，不会进版本库
