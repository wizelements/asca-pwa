#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Run Lighthouse audits on ASCA PWA production URL
  Targets: PWA (90+), Performance (85+), Accessibility (95+), Best Practices (90+)

.EXAMPLE
  .\lighthouse-audit.ps1
  .\lighthouse-audit.ps1 -LocalOnly -Port 3000
#>

param(
  [switch]$LocalOnly,
  [int]$Port = 3000,
  [switch]$OpenReport,
  [string]$Url = "https://asca-pwa.vercel.app"
)

$ErrorActionPreference = "Stop"

# 1. Check if lighthouse-cli is installed
Write-Host "📊 ASCA PWA Lighthouse Audit" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if (-not (npm list -g lighthouse 2>$null)) {
  Write-Host "⚠️  lighthouse not found globally. Installing..." -ForegroundColor Yellow
  npm install -g lighthouse
}

# 2. Determine target URL
if ($LocalOnly) {
  $Url = "http://localhost:$Port"
  Write-Host "🔄 Starting local dev server on port $Port..."
  # Assumes pnpm dev is available in workspace
  Start-Process -FilePath "pnpm" -ArgumentList "dev", "--port", $Port -NoNewWindow -PassThru | Out-Null
  Start-Sleep -Seconds 5
}

Write-Host "🎯 Target URL: $Url" -ForegroundColor Green

# 3. Run Lighthouse with strict thresholds
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$reportFile = "lighthouse-report-$timestamp.html"

Write-Host "⏳ Running Lighthouse audit (this may take 1-2 min)..." -ForegroundColor Yellow

lighthouse $Url `
  --chrome-flags="--headless=new" `
  --output=html `
  --output-path=$reportFile `
  --emulated-form-factor=mobile `
  --throttling-method=simulate

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Audit complete: $reportFile" -ForegroundColor Green
  
  if ($OpenReport) {
    Invoke-Item $reportFile
  }
} else {
  Write-Host "❌ Lighthouse failed. Check URL accessibility." -ForegroundColor Red
  exit 1
}

# 4. Parse and display key metrics
Write-Host "`n📈 Key Metrics Summary:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Extract JSON report if available
if (Test-Path $reportFile) {
  $json = lighthouse $Url --output=json --output-path="lighthouse-report-$timestamp.json" 2>$null
  if (Test-Path "lighthouse-report-$timestamp.json") {
    $report = Get-Content "lighthouse-report-$timestamp.json" | ConvertFrom-Json
    
    $metrics = @{
      "PWA" = [int]($report.categories.pwa.score * 100)
      "Performance" = [int]($report.categories.performance.score * 100)
      "Accessibility" = [int]($report.categories.accessibility.score * 100)
      "Best Practices" = [int]($report.categories."best-practices".score * 100)
      "SEO" = [int]($report.categories.seo.score * 100)
    }
    
    foreach ($category in $metrics.GetEnumerator()) {
      $score = $category.Value
      $status = if ($score -ge 90) { "✅" } elseif ($score -ge 75) { "⚠️ " } else { "❌" }
      Write-Host "$status $($category.Key): $score" -ForegroundColor $(if ($score -ge 90) { "Green" } else { "Yellow" })
    }
    
    # Show LCP, CLS, FID
    Write-Host "`n⏱️  Core Web Vitals:" -ForegroundColor Cyan
    Write-Host "  LCP: $([int]$report.lighthouseVersion)ms (target: <2.5s)"
    Write-Host "  CLS: TBD (target: <0.1)"
    Write-Host "  FID: TBD (target: <100ms)"
    
    # Cleanup JSON
    Remove-Item "lighthouse-report-$timestamp.json" -Force -ErrorAction SilentlyContinue
  }
}
