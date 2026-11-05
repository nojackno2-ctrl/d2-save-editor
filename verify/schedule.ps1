# 註冊／移除 Windows 排程：每 2 小時檢查官方遊戲是否更新，有新版就全自動相容並發布（verify/auto.cjs）。
#   powershell -File verify/schedule.ps1            註冊（預設每 2 小時）
#   powershell -File verify/schedule.ps1 -Hours 1   改成每小時
#   powershell -File verify/schedule.ps1 -Remove    移除
param([int]$Hours = 2, [switch]$Remove)
$name = "D2SurvivorsToolkitAutoUpdate"
if ($Remove) { Unregister-ScheduledTask -TaskName $name -Confirm:$false -ErrorAction SilentlyContinue; "已移除排程 $name"; return }
$root = Split-Path $PSScriptRoot -Parent
$nodeExe = (Get-Command node).Source
$action = New-ScheduledTaskAction -Execute $nodeExe -Argument "`"$root\verify\auto.cjs`"" -WorkingDirectory $root
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(5) -RepetitionInterval (New-TimeSpan -Hours $Hours)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 2) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $name -Action $action -Trigger $trigger -Settings $settings -Description "D2 倖存者工具包：偵測官方新版並自動相容發布（verify/auto.cjs）" -Force | Out-Null
"已註冊排程 $name：每 $Hours 小時執行 node verify/auto.cjs（紀錄：verify/reports/auto-log.md）"
