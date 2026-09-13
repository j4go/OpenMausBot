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

## Git 工作流：合并官方更新 & 给官方提 PR

仓库结构：`origin` = 你的 fork（`j4go/OpenMausBot`），`upstream` = 官方（`milind-soni/OpenMausBot`）。
当前 fork main 在官方基线 `536b7893` 之上有 3 个本地 commit：

| Commit | 内容 | 归属 |
|---|---|---|
| `72363b70` | fix(electron)：窗口图标 ICO | 可提 PR |
| `d560455d` | fix(scripts)：prepare-browser Defender 修复 | 可提 PR |
| `db1fe57a` | chore：DEV-NOTES.md / dev.ps1 / .gitignore | **个人工具，勿进 PR** |

---

### 一、合并官方更新（日常维护，推荐 merge）

```powershell
cd D:\OpenMausBot

# 1. 拉取官方最新到本地（不会自动改工作区）
git fetch upstream

# 2. 合并到本地 main（保留分叉历史，简单安全）
git checkout main
git merge upstream/main

# 3. 若提示冲突（本地改动与官方改到同一处）
git status                # 查看冲突文件
# 手动编辑解决后：
git add <冲突文件> && git commit
# 或放弃本次合并：git merge --abort

# 4. 推送到自己的 fork
git push origin main
```

要点：
- 用 **merge** 而不是 rebase：rebase 会改写历史，冲突更难解，且别对已推送的分支做。
- 合并后本地 3 个自定义 commit 会保留在历史上，之后照常开发。
- 若官方也改了 `electron/main.mjs`（如升级窗口代码），解决冲突时**注意保留 `WINDOW_ICON` 修复**（官方版本没有这段）。

---

### 二、给官方提 PR（只提交相关修复，别带个人工具）

**原则**：PR 只含该改动相关的 commit。当前 fork main 上有个人 commit（`db1fe57a`），所以**不要**直接从 main 建 PR，用单独分支：

```powershell
# 1. 先同步官方最新（避免 PR 里带无关差异）
git fetch upstream

# 2. 从官方最新开新分支
git checkout -b fix/win-window-icon upstream/main

# 3. 只挑选相关修复 commit（按需 cherry-pick）
git cherry-pick 72363b70   # 窗口图标 ICO
# 若同一 PR 还想带 browser 修复：
# git cherry-pick d560455d
# cherry-pick 冲突时：解决后 git add <文件> && git cherry-pick --continue

# 4. 推到 fork
git push origin fix/win-window-icon

# 5. 建 PR（二选一）
#    网页：GitHub 自动提示 "Compare & pull request"，或直接访问
#    https://github.com/milind-soni/OpenMausBot/compare/main...j4go:fix/win-window-icon
#    （base = milind-soni:main，head = j4go:fix/win-window-icon）
#
#    gh CLI（需先 gh auth login）：
#    gh pr create --repo milind-soni/OpenMausBot --base main --head j4go:fix/win-window-icon `
#      --title "fix(electron): use multi-size ICO for Windows window icon" `
#      --body "描述根因 + 验证结果"
```

PR 描述建议包含：
- **根因**：Windows 任务栏渲染单张 PNG 窗口图标会出现白块；项目已有 `build/icon.ico`（多尺寸 32-bit）却未使用。
- **验证**：本地构建后窗口图标非白像素占比 ~79%（修复前接近 0%）。
- 改动文件：`electron/main.mjs`、`electron/resources/app-icon.ico`。

注意事项：
- `db1fe57a`（DEV-NOTES.md、dev.ps1、.gitignore）是本地个人工具，**不要** cherry-pick 进 PR 分支。
- 官方合并新代码后，**先做第一节的 merge 同步**，再开新 PR 分支，避免 cherry-pick 冲突。
- 一个 PR 尽量只解决一个问题（图标修复 / browser 脚本修复分开提更易被采纳）。
