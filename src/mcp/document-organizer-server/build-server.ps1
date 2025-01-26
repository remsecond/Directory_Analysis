$ErrorActionPreference = "Stop"

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}

# Run TypeScript compiler
Write-Host "Building TypeScript files..."
$tscPath = Join-Path $PSScriptRoot "node_modules\.bin\tsc"
& $tscPath --project (Join-Path $PSScriptRoot "tsconfig.json")

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build completed successfully"
} else {
    Write-Error "Build failed with exit code $LASTEXITCODE"
    exit 1
}
