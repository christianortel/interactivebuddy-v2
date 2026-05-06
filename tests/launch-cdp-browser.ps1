param(
  [int]$DebugPort = 9333,
  [string]$BrowserPath = "",
  [switch]$Headed
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$candidates = @()
if ($BrowserPath) {
  $candidates += $BrowserPath
}
$candidates += @(
  (Join-Path $root ".playwright-browsers\chromium-headless-shell-1217\chrome-headless-shell-win64\chrome-headless-shell.exe"),
  (Join-Path $root ".playwright-browsers\chromium-1217\chrome-win64\chrome.exe"),
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

$browserExe = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $browserExe) {
  throw "No Chromium-compatible browser executable found. Pass -BrowserPath or install Edge/Chrome/Playwright Chromium."
}

if ($env:BUDDY_BROWSER_PROFILE_ROOT) {
  $profileRoot = $env:BUDDY_BROWSER_PROFILE_ROOT
} elseif ($env:TEMP) {
  $profileRoot = $env:TEMP
} elseif (Test-Path "C:\tmp") {
  $profileRoot = "C:\tmp"
} else {
  $profileRoot = $root
}
$profile = Join-Path $profileRoot "buddy-cdp-profile-$PID"
New-Item -ItemType Directory -Force -Path $profile | Out-Null

$arguments = @()
if (-not $Headed) {
  $arguments += "--headless"
}
$arguments += @(
  "--disable-gpu",
  "--disable-gpu-sandbox",
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-crash-reporter",
  "--disable-breakpad",
  "--disable-features=RendererCodeIntegrity,Crashpad,NetworkServiceSandbox",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-background-networking",
  "--mute-audio",
  "--user-data-dir=$profile",
  "--remote-debugging-address=127.0.0.1",
  "--remote-debugging-port=$DebugPort",
  "about:blank"
)

$startProcessArgs = @{
  FilePath = $browserExe
  ArgumentList = $arguments
  WorkingDirectory = $root
  PassThru = $true
}
if (-not $Headed -and ($IsWindows -or $env:OS -eq "Windows_NT")) {
  $startProcessArgs.WindowStyle = "Hidden"
}
$process = Start-Process @startProcessArgs

Write-Host "Started CDP browser PID $($process.Id)"
Write-Host "Executable: $browserExe"
Write-Host "Debug port: $DebugPort"
Write-Host "Profile: $profile"
Write-Host ""
Write-Host "In another shell, run:"
Write-Host "  npm run build"
Write-Host "  powershell -ExecutionPolicy Bypass -File ./tests/run-browser-smoke-external.ps1 -DebugPort $DebugPort"
Write-Host ""
Write-Host "If this sandbox still kills Chromium, run this same command from a normal Windows PowerShell."
Write-Host ""
Write-Host "Stop it later with:"
Write-Host "  Stop-Process -Id $($process.Id)"
