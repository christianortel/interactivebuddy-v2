param(
  [int]$Port = 5173,
  [string]$HostName = "127.0.0.1",
  [switch]$Visual,
  [switch]$NoServer
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$url = "http://$HostName`:$Port"
$serverProcess = $null

function Invoke-Checked {
  param([string]$FilePath, [string[]]$Arguments)

  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code $LASTEXITCODE`: $FilePath $($Arguments -join ' ')"
  }
}

function Resolve-Executable {
  param(
    [string]$Name,
    [string[]]$Fallbacks
  )

  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }
  foreach ($fallback in $Fallbacks) {
    if ($fallback -and (Test-Path $fallback)) {
      return $fallback
    }
  }
  throw "Unable to resolve executable: $Name"
}

$pythonExe = Resolve-Executable -Name "python" -Fallbacks @(
  (Join-Path $env:USERPROFILE ".cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe")
)
$nodeExe = Resolve-Executable -Name "node" -Fallbacks @(
  (Join-Path $env:USERPROFILE ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe")
)
$localBrowserPath = Join-Path $root ".playwright-browsers"
if (Test-Path $localBrowserPath) {
  $env:PLAYWRIGHT_BROWSERS_PATH = $localBrowserPath
}
$localPythonPackages = Join-Path $root ".python-packages"
if (Test-Path $localPythonPackages) {
  if ($env:PYTHONPATH) {
    $env:PYTHONPATH = "$localPythonPackages$([IO.Path]::PathSeparator)$env:PYTHONPATH"
  } else {
    $env:PYTHONPATH = $localPythonPackages
  }
}

function Wait-ForServer {
  param([string]$TargetUrl)

  $deadline = (Get-Date).AddSeconds(20)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $TargetUrl -TimeoutSec 2
      if ($response.StatusCode -eq 200) {
        return
      }
    } catch {
      Start-Sleep -Milliseconds 300
    }
  }
  throw "Server did not become ready at $TargetUrl"
}

try {
  if (-not $NoServer) {
    $viteScript = Join-Path $root "node_modules/vite/bin/vite.js"
    $arguments = @($viteScript, "preview", "--configLoader", "native", "--host", $HostName, "--port", "$Port")
    $serverFile = $nodeExe
    if (-not (Test-Path $viteScript)) {
      $arguments = @("-m", "http.server", "$Port", "--bind", $HostName)
      $serverFile = $pythonExe
    }
    if ($IsWindows -or $env:OS -eq "Windows_NT") {
      $serverProcess = Start-Process -FilePath $serverFile -ArgumentList $arguments -WorkingDirectory $root -WindowStyle Hidden -PassThru
    } else {
      $serverProcess = Start-Process -FilePath $serverFile -ArgumentList $arguments -WorkingDirectory $root -PassThru
    }
  }

  Wait-ForServer -TargetUrl $url
  Invoke-Checked -FilePath $nodeExe -Arguments @((Join-Path $root "tests/unit-modules.mjs"))
  Invoke-Checked -FilePath $pythonExe -Arguments @((Join-Path $root "tests/validate-asset-packs.py"), "--root", $root)
  Invoke-Checked -FilePath $pythonExe -Arguments @((Join-Path $root "tests/validate-asset-packs.py"), "--root", $root, "--pack", "assets/packs/template/pack.json")
  Invoke-Checked -FilePath $pythonExe -Arguments @("-c", "import playwright.sync_api")
  Invoke-Checked -FilePath $pythonExe -Arguments @((Join-Path $root "tests/browser-regression.py"), "--url", $url)
  if ($Visual) {
    Invoke-Checked -FilePath $pythonExe -Arguments @("-c", "import PIL; import playwright.sync_api")
    Invoke-Checked -FilePath $pythonExe -Arguments @(
      (Join-Path $root "tests/visual-regression.py"),
      "--url",
      $url,
      "--output",
      (Join-Path $root "tests/artifacts/visual"),
      "--baseline",
      (Join-Path $root "tests/baselines/visual"),
      "--diff-output",
      (Join-Path $root "tests/artifacts/visual-diff")
    )
  }
} finally {
  if ($serverProcess -and -not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id -Force
  }
}
