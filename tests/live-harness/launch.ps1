param([string]$Classes, [int]$Copies = 1, [int]$Speed = 1)
$h = $PSScriptRoot; $env:ELECTRON_RUN_AS_NODE = $null; $env:H_SPEED = "$Speed"; $env:H_BOT = "D:\D2倖存者\helper\autobot.js"
foreach ($c in $Classes.Split(",")) { foreach ($i in 1..$Copies) {
  $out = if ($Copies -gt 1) { "$h\run-$c-$i" } else { "$h\run-$c" }
  if (Test-Path "$out\pid") { Stop-Process -Id (Get-Content "$out\pid") -Force -ErrorAction SilentlyContinue; Start-Sleep 2 }
  Remove-Item -Recurse -Force $out -ErrorAction SilentlyContinue
  $env:H_OUT = $out; $env:H_CLASS = $c
  Start-Process -FilePath "D:\D2倖存者\editor\node_modules\electron\dist\electron.exe" -ArgumentList "`"$h`"" -WindowStyle Hidden
  Start-Sleep 3
} }
