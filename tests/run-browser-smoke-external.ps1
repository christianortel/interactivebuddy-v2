param(
  [int]$DebugPort = 9333
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$oldExternal = $env:BUDDY_EXTERNAL_CDP
$oldPort = $env:BUDDY_CHROME_DEBUG_PORT

try {
  $env:BUDDY_EXTERNAL_CDP = "1"
  $env:BUDDY_CHROME_DEBUG_PORT = "$DebugPort"
  & node (Join-Path $root "tests/browser-smoke-cdp.mjs")
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  if ($null -eq $oldExternal) {
    Remove-Item Env:\BUDDY_EXTERNAL_CDP -ErrorAction SilentlyContinue
  } else {
    $env:BUDDY_EXTERNAL_CDP = $oldExternal
  }

  if ($null -eq $oldPort) {
    Remove-Item Env:\BUDDY_CHROME_DEBUG_PORT -ErrorAction SilentlyContinue
  } else {
    $env:BUDDY_CHROME_DEBUG_PORT = $oldPort
  }
}
