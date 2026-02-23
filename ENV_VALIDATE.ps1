#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Validate environment variables configuration
    
.DESCRIPTION
    Checks that all required environment variables are properly configured
    for local development and production deployment
    
.EXAMPLE
    .\ENV_VALIDATE.ps1
    
.EXAMPLE
    .\ENV_VALIDATE.ps1 -CheckProduction
#>

param(
    [switch]$CheckProduction = $false
)

Write-Host "`n=== ASCA PWA - Environment Variables Validation ===" -ForegroundColor Cyan
Write-Host "File: .env.local" -ForegroundColor Cyan
Write-Host "Check Production: $CheckProduction`n" -ForegroundColor Yellow

# Load .env.local
$EnvFile = ".env.local"
if (-not (Test-Path $EnvFile)) {
    Write-Host "ERROR: $EnvFile not found!" -ForegroundColor Red
    exit 1
}

$EnvContent = Get-Content $EnvFile -Raw
$Vars = @{}

# Parse env file
foreach ($line in $EnvContent -split "`n") {
    $line = $line.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2
        if ($parts.Count -eq 2) {
            $Vars[$parts[0]] = $parts[1]
        }
    }
}

# Required variables (all environments)
$RequiredVars = @(
    "MONGODB_URI"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
)

# Production-specific
$ProductionVars = @(
    "RESEND_API_KEY"
)

# All checks
$Checks = @()

Write-Host "Checking Required Variables:" -ForegroundColor Cyan
foreach ($Var in $RequiredVars) {
    $Value = $Vars[$Var]
    
    if (-not $Value) {
        Write-Host "  ✗ $Var - MISSING" -ForegroundColor Red
        $Checks += @{Var=$Var; Status="MISSING"; Result=$false}
    }
    elseif ($Value -like "*your-*" -or $Value -like "*ENTER_YOUR*") {
        Write-Host "  ⚠ $Var - PLACEHOLDER" -ForegroundColor Yellow
        $Checks += @{Var=$Var; Status="PLACEHOLDER"; Result=$false}
    }
    else {
        Write-Host "  ✓ $Var - OK" -ForegroundColor Green
        $Checks += @{Var=$Var; Status="OK"; Result=$true}
    }
}

if ($CheckProduction) {
    Write-Host "`nChecking Production Variables:" -ForegroundColor Cyan
    foreach ($Var in $ProductionVars) {
        $Value = $Vars[$Var]
        
        if (-not $Value) {
            Write-Host "  ✗ $Var - MISSING" -ForegroundColor Red
            $Checks += @{Var=$Var; Status="MISSING"; Result=$false}
        }
        elseif ($Value -like "*your-*" -or $Value -like "*ENTER_YOUR*") {
            Write-Host "  ⚠ $Var - PLACEHOLDER" -ForegroundColor Yellow
            $Checks += @{Var=$Var; Status="PLACEHOLDER"; Result=$false}
        }
        else {
            Write-Host "  ✓ $Var - OK" -ForegroundColor Green
            $Checks += @{Var=$Var; Status="OK"; Result=$true}
        }
    }
}

# Check NEXTAUTH_SECRET strength
Write-Host "`nChecking NEXTAUTH_SECRET:" -ForegroundColor Cyan
$Secret = $Vars["NEXTAUTH_SECRET"]
if (-not $Secret) {
    Write-Host "  ✗ NEXTAUTH_SECRET - MISSING" -ForegroundColor Red
}
elseif ($Secret.Length -lt 16) {
    Write-Host "  ⚠ NEXTAUTH_SECRET - TOO SHORT (min 16 chars)" -ForegroundColor Yellow
}
elseif ($Secret.Length -ge 32) {
    Write-Host "  ✓ NEXTAUTH_SECRET - STRONG ($($Secret.Length) chars)" -ForegroundColor Green
}
else {
    Write-Host "  ✓ NEXTAUTH_SECRET - OK ($($Secret.Length) chars)" -ForegroundColor Green
}


# Check MongoDB URI
Write-Host "`nChecking MONGODB_URI:" -ForegroundColor Cyan
$MongUri = $Vars["MONGODB_URI"]
if (-not $MongUri) {
    Write-Host "  ✗ MONGODB_URI - MISSING" -ForegroundColor Red
}
elseif ($MongUri -notmatch "^mongodb\+srv://") {
    Write-Host "  ⚠ MONGODB_URI - Invalid format (should start with mongodb+srv://)" -ForegroundColor Yellow
}
elseif ($MongUri -like "*password*" -and $MongUri -notlike "*AsCA*") {
    Write-Host "  ⚠ MONGODB_URI - Contains literal 'password' (check credentials)" -ForegroundColor Yellow
}
else {
    Write-Host "  ✓ MONGODB_URI - Valid format" -ForegroundColor Green
}

# Check NEXTAUTH_URL
Write-Host "`nChecking NEXTAUTH_URL:" -ForegroundColor Cyan
$AuthUrl = $Vars["NEXTAUTH_URL"]
if (-not $AuthUrl) {
    Write-Host "  ✗ NEXTAUTH_URL - MISSING" -ForegroundColor Red
}
elseif ($AuthUrl -like "http://*" -and -not $AuthUrl -like "*localhost*") {
    Write-Host "  ⚠ NEXTAUTH_URL - Using HTTP (should be HTTPS in production)" -ForegroundColor Yellow
}
elseif ($AuthUrl -match "https://asca-pwa\.vercel\.app" -or $AuthUrl -match "localhost") {
    Write-Host "  ✓ NEXTAUTH_URL - Valid" -ForegroundColor Green
}

# Optional checks
Write-Host "`nChecking Optional Variables:" -ForegroundColor Cyan
$OptionalVars = @(
    "RESEND_FROM_EMAIL"
    "RESEND_FROM_NAME"
    "NEXT_PUBLIC_SITE_URL"
    "NEXT_PUBLIC_SITE_NAME"
)

foreach ($Var in $OptionalVars) {
    $Value = $Vars[$Var]
    if ($Value) {
        Write-Host "  ✓ $Var - Configured" -ForegroundColor Green
    }
    else {
        Write-Host "  ○ $Var - Not set (optional)" -ForegroundColor Gray
    }
}

# File security check
Write-Host "`nChecking File Security:" -ForegroundColor Cyan
$GitIgnore = Get-Content ".gitignore" -Raw -ErrorAction SilentlyContinue
if ($GitIgnore -match "\.env\.local") {
    Write-Host "  ✓ .env.local - In .gitignore (safe)" -ForegroundColor Green
}
else {
    Write-Host "  ✗ .env.local - NOT in .gitignore (security risk!)" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
$PassedChecks = ($Checks | Where-Object { $_.Result } | Measure-Object).Count
$TotalChecks = $Checks.Count

if ($PassedChecks -eq $TotalChecks) {
    Write-Host "Status: ✓ ALL CHECKS PASSED" -ForegroundColor Green
}
elseif ($PassedChecks -gt ($TotalChecks / 2)) {
    Write-Host "Status: ⚠ SOME CHECKS FAILED" -ForegroundColor Yellow
}
else {
    Write-Host "Status: ✗ CRITICAL ISSUES" -ForegroundColor Red
}

Write-Host "Passed: $PassedChecks/$TotalChecks" -ForegroundColor $(if ($PassedChecks -eq $TotalChecks) { "Green" } else { "Yellow" })

# Recommendations
Write-Host "`n=== Recommendations ===" -ForegroundColor Cyan
if ($Vars["RESEND_API_KEY"] -like "*your-*" -or -not $Vars["RESEND_API_KEY"]) {
    Write-Host "1. Get Resend API key: https://resend.com/api-keys" -ForegroundColor Yellow
    Write-Host "   Then update RESEND_API_KEY in .env.local" -ForegroundColor Yellow
}
else {
    Write-Host "1. ✓ Resend API configured" -ForegroundColor Green
}

if ($CheckProduction) {
    Write-Host "2. Add all variables to Vercel:" -ForegroundColor Yellow
    Write-Host "   .\VERCEL_ENV_SETUP.ps1" -ForegroundColor Yellow
}

Write-Host "3. Test local development:" -ForegroundColor Yellow
Write-Host "   pnpm dev" -ForegroundColor Yellow

Write-Host "4. Verify MongoDB connection:" -ForegroundColor Yellow
Write-Host "   Check Vercel logs after deployment" -ForegroundColor Yellow

Write-Host ""
exit $(if ($PassedChecks -eq $TotalChecks) { 0 } else { 1 })
