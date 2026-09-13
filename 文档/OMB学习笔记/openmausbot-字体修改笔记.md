# OpenMausBot 字体自定义笔记（Maple Mono NF CN）

> 修改日期：2026-09-11
> 目的：把 OpenMausBot 的界面字体和代码块字体统一改为 **Maple Mono NF CN**。
> 注意：**应用一更新，此改动会被覆盖**，需按文末指令重新执行。

---

## 一、现状速查

| 项 | 值 |
|---|---|
| 安装位置 | `C:\Users\lingf2\AppData\Local\Programs\openmausbot` |
| 样式文件 | `resources\ui\assets\index-ByLQ7a3F.css`（打包后的全部样式，**更新后文件名中的哈希可能变化**，以 `index-*.css` 为准） |
| 修改内容 | `--font-sans` 全部 9 处 + `--font-mono` 1 处，均把 `"Maple Mono NF CN"` 提到第一位 |
| 字体是否已装 | ✅ `Maple Mono NF CN` 已安装在系统字体列表 |
| 生效条件 | **完全退出并重启 OpenMausBot** |

---

## 二、改了什么

### 1. 界面字体 `--font-sans`（共 9 处定义）
- 根样式 `:root,:host` 1 处 + 8 套皮肤（midnight / atelier / foundry / lagoon / graphite / linen / dusk / daylight）各 1 处
- 其中 daylight 皮肤是小写变体（`blinkmacsystemfont`），替换时要单独匹配
- 改动前后（以根样式为例）：

```css
/* 改前 */
--font-sans:"Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif;
/* 改后 */
--font-sans:"Maple Mono NF CN", "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif;
```

### 2. 代码块字体 `--font-mono`（共 1 处定义）
- 只在根样式 `:root,:host` 定义，被 2 处 `var(--font-mono)` 引用

```css
/* 改前 */
--font-mono:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
/* 改后 */
--font-mono:"Maple Mono NF CN", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
```

> 原字体保留在回退栈第二位：机器上若没有 Maple Mono NF CN，会自动回退到 Inter / ui-monospace 等，不会报错。

---

## 三、备份情况

样式文件同目录下有两个备份：

| 备份 | 内容 |
|---|---|
| `index-ByLQ7a3F.css.bak-20260911` | **纯净原始版**（未做任何修改） |
| `index-ByLQ7a3F.css.bak-mono-20260911` | 已改 font-sans、未改 font-mono 的中间版 |

> ⚠️ 备份在应用目录内，**应用更新时备份也会被新版本覆盖删除**，无法跨版本使用。

---

## 四、给 Sprout 的修复指令（更新后直接复制这条发给我）

应用更新后字体恢复默认时，把下面整段复制发给 Sprout 即可：

```
OpenMausBot 更新后字体被覆盖了，请按笔记《openmausbot-字体修改笔记.md》（E:\TMP\sprout\）重新修改字体：

1. 确认应用安装目录 C:\Users\lingf2\AppData\Local\Programs\openmausbot 存在；用通配符找到当前样式文件：resources\ui\assets\index-*.css（更新后哈希可能变了，不要用旧文件名）。
2. 先备份该 CSS 到同目录，命名为 index-*.css.bak-<当天日期>。
3. 在文件里把 --font-sans 的**全部定义**（根样式 + 8 套皮肤，注意 daylight 皮肤是小写变体）改为 "Maple Mono NF CN" 打头；把 --font-mono 的唯一定义也改为 "Maple Mono NF CN" 打头。用 PowerShell 的字符串替换，替换前先统计匹配次数，确认数量再写回。
4. 改完读回验证：--font-sans:"Maple Mono NF CN" 应出现 9 次，--font-mono:"Maple Mono NF CN" 应出现 1 次，且旧定义无残留。
5. 告诉用户重启 OpenMausBot 生效。
```

---

## 五、验证方法（改动后自查用）

PowerShell 检查脚本：

```powershell
$css = Get-ChildItem "C:\Users\lingf2\AppData\Local\Programs\openmausbot\resources\ui\assets\index-*.css" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$c = [System.IO.File]::ReadAllText($css.FullName)
"font-sans Maple 次数: " + ([regex]::Matches($c, '--font-sans:"Maple Mono NF CN"')).Count   # 期望 9
"font-mono Maple 次数: " + ([regex]::Matches($c, '--font-mono:"Maple Mono NF CN"')).Count   # 期望 1
"旧 mono 残留: " + ([regex]::Matches($c, '--font-mono:ui-monospace')).Count                    # 期望 0
```

---

## 六、注意事项

1. **必须完全退出 OpenMausBot 再重启**，否则改动不生效（运行中文件被占用）。
2. 应用每次更新都会重置样式文件，届时按第四节指令重新执行。
3. 官方不提供字体设置项（皮肤只能改颜色），这是唯一的可行路径；改的是打包资源，属于非官方做法，不影响功能但更新会覆盖。
