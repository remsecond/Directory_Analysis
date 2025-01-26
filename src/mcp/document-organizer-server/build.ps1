$ErrorActionPreference = "Stop"
$tscPath = Join-Path $PSScriptRoot "node_modules\.bin\tsc"
& $tscPath --project (Join-Path $PSScriptRoot "tsconfig.json")
