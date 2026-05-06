param(
  [int]$DebugPort = 9333
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$edgeCandidates = @(
  $env:BUDDY_CHROME_PATH,
  (Join-Path $root ".playwright-browsers\chromium-headless-shell-1217\chrome-headless-shell-win64\chrome-headless-shell.exe"),
  (Join-Path $root ".playwright-browsers\chromium-1217\chrome-win64\chrome.exe"),
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
)
$browserExe = $edgeCandidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $browserExe) {
  throw "No Chrome or Edge executable found."
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
$profile = Join-Path $profileRoot "buddy-cdp-smoke-$PID"
$stdoutLog = Join-Path $profileRoot "buddy-cdp-smoke.stdout.log"
$stderrLog = Join-Path $profileRoot "buddy-cdp-smoke.stderr.log"
Remove-Item $stdoutLog, $stderrLog -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $profile | Out-Null
$browserProcess = $null

try {
  $arguments = @()
  if ($env:BUDDY_BROWSER_HEADED -ne "1") {
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
    RedirectStandardOutput = $stdoutLog
    RedirectStandardError = $stderrLog
    PassThru = $true
  }
  if ($IsWindows -or $env:OS -eq "Windows_NT") {
    $startProcessArgs.WindowStyle = "Hidden"
  }
  $browserProcess = Start-Process @startProcessArgs
  Start-Sleep -Milliseconds 500
  if ($browserProcess.HasExited) {
    if (Test-Path $stderrLog) {
      Get-Content $stderrLog -Tail 60 | ForEach-Object { Write-Warning $_ }
    }
    throw "Browser exited before CDP smoke could connect. Exit code: $($browserProcess.ExitCode). If this is running inside Codex sandbox, launch CDP from normal Windows PowerShell with tests/launch-cdp-browser.ps1 and then run test:browser-smoke:external."
  }
  $env:BUDDY_EXTERNAL_CDP = "1"
  $env:BUDDY_CHROME_DEBUG_PORT = "$DebugPort"
  & node (Join-Path $root "tests/browser-smoke-cdp.mjs")
  if ($LASTEXITCODE -ne 0) {
    if (Test-Path $stderrLog) {
      Get-Content $stderrLog -Tail 60 | ForEach-Object { Write-Warning $_ }
    }
    Write-Warning "If this is running inside Codex sandbox, launch CDP from normal Windows PowerShell with tests/launch-cdp-browser.ps1 and then run test:browser-smoke:external."
    exit $LASTEXITCODE
  }
} finally {
  Remove-Item Env:\BUDDY_EXTERNAL_CDP -ErrorAction SilentlyContinue
  Remove-Item Env:\BUDDY_CHROME_DEBUG_PORT -ErrorAction SilentlyContinue
  if ($browserProcess -and -not $browserProcess.HasExited) {
    Stop-Process -Id $browserProcess.Id -Force
  }
  Remove-Item $profile -Recurse -Force -ErrorAction SilentlyContinue
}
