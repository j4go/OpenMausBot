# 软件门户：Limix CLI

本仓库用 Limix CLI 做就绪检查、项目绑定、需求绑定和交付上传。命令以本机 `limix --help` 为准。套件按 **limix-cli v0.6.1** 写：`project` / `requirement`（`issue` 是 `requirement` 的同义命令）。已删除 `limix workflow` 和顶级 `limix onboard`。

`workflow_policy.portal_sync` 为 `bound_project` 时，阶段 skill 按下面四步走。为 `off` 时只写本地产物，不调用 `limix`。

## 交付轨道

init 选定，阶段 skill 只读配置。两条轨道可单开、可并用。

| 用户怎么管交付件 | 配置 | 开工核对 |
|---|---|---|
| 只代码仓 | `portal_sync=off` | 只查 git（切片在 git 工作树里才查） |
| 只软件门户 | `portal_sync=bound_project`，工作区没有 `.git` | 只查 `limix requirement status` |
| 两者都用 | `portal_sync=bound_project`，切片在 git 里 | git 已提交 **且** 门户已上传；同一批 Reviewed 源头 |

两者都用时：`git log` 里那批 Reviewed 源头，必须和最近一次 `limix requirement upload` 对得上。一边新、一边旧就停，先提交或先 upload，不要猜哪边为准。

## 检测与安装

```bash
command -v limix
limix --version
```

没有二进制：打开软件门户 `/portals/software/downloads`。页面上有一段**发给 AI 的安装提示词**；请用户贴回本会话，按原文完成安装（含 `limix init` 和 AI Track 钩子）。token 只给用户填，不写进仓库。未装好不得跑 upload。钩子装上之后，后续编码才会进 AI 代码量统计。

本机至少 **0.6.1**。`limix --help` 里若还有顶级 `workflow` / `onboard`，是旧二进制，先换安装包。

## 四步

当前目录默认就是目标。需求绑定和上传必须在**当前切片目录**里跑，或把切片路径当作位置参数。不要对仓库根或 `docs/product-development/` 父目录跑 `requirement upload`。

### (a) 就绪检查

```bash
limix doctor
limix project onboard
```

`project onboard` 评估当前工作区；没有门户项目就创建并绑定。只要本地评估、不要上传时加 `--dry-run`。

### (b) 项目绑定

```bash
limix project status
limix project bind <项目key或名称>
```

不传 key 时，交互终端会弹出项目列表。绑在放切片的工作区 `.limix/project.json`，不是 frontend/backend 某一个 git 根。多个工作区、id 不同时问用户。不要猜，不要传原始 `project-id` 长串。

### (c) 需求绑定

一次绑定 = 一个切片目录 = 一条 requirement。先进入当前切片，或把切片路径当作位置参数：

```bash
limix requirement create "<本切片标题>" <当前切片>
limix requirement bind <需求编号或标题> <当前切片>
limix requirement status <当前切片>
```

`limix issue …` 与 `limix requirement …` 相同。已有绑定就沿用（看 `requirement status`）。要换需求必须用户明确说，再 `bind`。不要把 A 切片的 `.product-workflow-portal.json` 拷到 B。无参 `bind` 只在交互终端弹列表。

当前切片按这个顺序，命中就停：用户给出的路径 → 当前目录自己就是切片 → `docs/product-development/` 下恰好一个切片 → 否则列出路径问用户。不要用最近日期。

### (d) 交付上传

已绑定，并且本切片刚写成 Draft、人刚标成 Reviewed、或对抗审查刚改过源头：

```bash
limix requirement upload <当前切片>
```

已在切片目录里时，`limix requirement upload` 即可。跑之前写出三行：切片路径、项目 key、需求编号或标题。对不上就停。成功后 CLI 提示「已上传草稿，待门户确认」。开工前再跑 `limix requirement status <当前切片>`。

多仓地图写在本切片 `project-wiki.md`，跟这次 snapshot 走当前 requirement。不要按 git 仓各传一份。

## 上传哪些文件

CLI 只扫**切片目录根下的文件名**（不读套件 `workflow-manifest.json`，不读 `.gitignore`，不进 `.review-board/`）。有文件才进 snapshot；空文件当缺失。

### 开工必需（Markdown）

套件开工门禁认这两份（full：`Reviewed`；lite：短 `prd.md` 为 `Reviewed`，短计划允许 `Draft`）：

| 文件 | 作用 |
|---|---|
| `prd.md` | 规格 |
| `development-plan.md` | 计划 |

这两份缺了，CLI 提示「缺少开工必需产物」，无 `--force` 会拦住 upload。

### 补充（有则传，没有不要造空壳）

| 文件 | CLI 行为 | 套件口径 |
|---|---|---|
| `clarify.md` | required；缺了无 `--force` 会拦 | full 常有；lite 标 N/A 则没有，upload 时说明后 `--force` |
| `technical-solution.md` | required；同上 | 同上 |
| `test-cases.md` | required；同上 | 同上 |
| `prototype.html` | 可选 HTML 预览 | 有 HTML 原型才有 |
| `design-review.md` | 与 `prototype.html` 二选一，先扫到谁用谁 | 套件几乎不写这份 |

### 不要上传（即使文件在切片根）

| 文件 | 原因 |
|---|---|
| `index.html` | 审查板 HTML。无论在切片根还是 `.review-board/`，都不是门户交付件 |
| `.review-board/` | 本地看板壳、历史、脚本 |
| `.workflow-state.json` | 本地状态 |
| 生成器脚本 | 不是产物 |

审查板只写 `.review-board/index.html`。生成器刷新看板时，若切片根还留着旧 `index.html` / `review-board.js`，会迁到 `.review-board/legacy/`（与 `migrate_suite.mjs` 同一口径）。不要为了迁就 CLI 把看板再拷回切片根。

### HTML 预览（0.6.1）

只认切片根的 `prototype.html`。`text/html` **不把正文塞进 JSON**。snapshot 只带 `contentType`、`contentHash`、`byteSize` 和从 `<h1>` 抽出的标题。门户用 hash 对预览，不靠内联 HTML。

审查板在 `.review-board/index.html`，留给本地打开。不是 `prototype.html` 的替代品。

### 现行 CLI 不会扫到（有也不要改名硬塞）

`project-wiki.md`、`automation-test-plan.md`、`start-implement.md`、`develop.md`、`stitch-prototype.md`。这些继续留在 git / 本地看板。缺它们不叫少传；改名去迁就 CLI 才叫多造文件。

`api-contract.md` 与 `technical-solution.md` 不要两份都放：CLI 会先命中前者，技术方案正文可能传不上去。

lite 缺 clarify / 技术方案 / 用例时：向用户说明后 `limix requirement upload --force`。鉴权失败、未绑定、切片未定、没有 `limix`、后端不可达：说明原因，不加 `--force`。

## ignore

切片 `.gitignore` 补生成物（已有相同行跳过）：

```gitignore
# product-workflow generated
.review-board/
index.html
index.prev.html
review-board.js
review-board-live.js
mermaid.min.js
history/
.workflow-state.json
.product-workflow-portal.json
```

## 失败

鉴权失败、未绑定、切片未定、没有 `limix`、后端不可达：说明原因，不加 `--force`，不删本地源头，不直写数据库。
