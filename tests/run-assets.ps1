$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

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

& $pythonExe (Join-Path $root "tests/validate-asset-packs.py") --root $root
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

& $pythonExe (Join-Path $root "tests/validate-asset-packs.py") --root $root --pack (Join-Path $root "assets/packs/template/pack.json")
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

& $pythonExe (Join-Path $root "tests/validate-asset-packs.py") --root $root --pack (Join-Path $root "assets/private/pack.example.json")
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
