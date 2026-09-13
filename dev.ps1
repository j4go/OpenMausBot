<#
  OpenMausBot 开发辅助脚本（项目内 Node 24 环境）

  用法:
    .\dev.ps1 status        # 检查环境 + 官方版运行状态（默认动作）
    .\dev.ps1 install       # pnpm install
    .\dev.ps1 build         # tsc + vite 构建
    .\dev.ps1 typecheck     # 类型检查
    .\dev.ps1 lint          # oxlint
    .\dev.ps1 server        # 启动 harness server (8799)
    .\dev.ps1 web           # 启动 web 前端 (5199)
    .\dev.ps1 desktop       # 启动 Electron 壳
    .\dev.ps1 package       # 打包 Windows 安装包
    .\dev.ps1 stop          # 强制关闭已安装的 OpenMausBot（官方版，杀进程树）

  参数:
    -AutoStop   配合 server/web/desktop 使用：检测到官方版运行时先自动关闭再启动，
                不询问（适合无人值守/脚本调用）

  说明:
    - 使用项目内 Node 24 (.tools\node24)，不影响全局 Node 22
    - 官方版（已安装 OpenMausBot）占用 8799 端口和数据目录租约，开发前需关闭
    - 手动关闭: 托盘图标右键退出；或 .\dev.ps1 stop
    - 共存模式: $env:OMB_PORT=8801; $env:OMB_DATA_DIR="D:\OpenMausBot\.omb-dev-data"
#>
param(
  [ValidateSet("status","install","build","typecheck","lint","server","web","desktop","package","stop")]
  [string]$Action = "status",
  [switch]$AutoStop
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$node24 = Join-Path $root ".tools\node24"

if (Test-Path (Join-Path $node24 "node.exe")) {
  $env:PATH = "$node24;$env:PATH"
  Write-Host "[env] 项目 Node 24: $(& "$node24\node.exe" --version)" -ForegroundColor Green
} else {
  Write-Host "[env] .tools\node24 不存在，使用系统 Node" -ForegroundColor Yellow
}
Set-Location $root

# 检测官方版（已安装 OpenMausBot）是否在运行
$ombProcs = Get-Process OpenMausBot -ErrorAction SilentlyContinue
$ombRunning = $ombProcs.Count -gt 0

if ($Action -eq "stop") {
  if (-not $ombRunning) {
    Write-Host "[stop] 未检测到正在运行的 OpenMausBot" -ForegroundColor Green
  } else {
    Write-Host "[stop] 正在关闭 $($ombProcs.Count) 个 OpenMausBot 进程（含子进程树）..." -ForegroundColor Yellow
    taskkill /IM OpenMausBot.exe /T /F 2>&1 | ForEach-Object { Write-Host "  $_" }
    Start-Sleep -Seconds 2
    $left = Get-Process OpenMausBot -ErrorAction SilentlyContinue
    if ($left) {
      Write-Host "[stop] 仍有残留进程（$($left.Count) 个），尝试再次关闭..." -ForegroundColor Red
      $left | Stop-Process -Force
      Start-Sleep -Seconds 1
      $left2 = Get-Process OpenMausBot -ErrorAction SilentlyContinue
      Write-Host "[stop] $(if ($left2) { "仍有 $($left2.Count) 个进程，可能需手动结束" } else { "已全部关闭" })" -ForegroundColor $(if ($left2) { "Red" } else { "Green" })
    } else {
      Write-Host "[stop] 已全部关闭" -ForegroundColor Green
    }
  }
  exit 0
}

if ($Action -in @("server","web","desktop")) {
  if ($ombRunning) {
    Write-Host "[警告] 已安装的 OpenMausBot 正在运行（$($ombProcs.Count) 个进程）" -ForegroundColor Yellow
    Write-Host "        会占用 8799 端口和数据目录租约，建议先关闭。" -ForegroundColor Yellow
    if ($AutoStop) {
      Write-Host "[警告] -AutoStop 已指定，自动关闭官方版..." -ForegroundColor Yellow
      taskkill /IM OpenMausBot.exe /T /F 2>&1 | Out-Null
      Start-Sleep -Seconds 2
      Write-Host "[警告] 官方版已关闭，继续启动" -ForegroundColor Green
    } else {
      Write-Host "        关闭方式：托盘右键退出，或执行 .\dev.ps1 stop（强制关闭）" -ForegroundColor DarkGray
    }
  } else {
    Write-Host "[检查] 官方版未在运行，端口和数据目录可用" -ForegroundColor Green
  }
}

switch ($Action) {
  "status" {
    node --version
    pnpm --version
    Write-Host ("官方版 OpenMausBot: " + $(if ($ombRunning) { "在运行（$($ombProcs.Count) 个进程）→ 开发前用 .\dev.ps1 stop 关闭" } else { "未运行 ✓" }))
    Write-Host ("数据目录: " + $(if ($env:OMB_DATA_DIR) { $env:OMB_DATA_DIR } else { "~/.openmausbot（默认）" }))
    Write-Host ("端口: " + $(if ($env:OMB_PORT) { $env:OMB_PORT } else { "8799（默认）" }))
  }
  "install"  { pnpm install }
  "build"    { pnpm build }
  "typecheck" { pnpm typecheck }
  "lint"     { pnpm lint }
  "server"   { pnpm dev:server }
  "web"      { pnpm dev }
  "desktop"  { pnpm dev:desktop }
  "package"  { pnpm package:win }
}
