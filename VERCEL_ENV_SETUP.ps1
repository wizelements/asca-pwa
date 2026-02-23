#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Vercel Environment Variables Setup Script
    
.DESCRIPTION
    Adds all required environment variables to Vercel for ASCA PWA production deployment
    
.EXAMPLE
    .\VERCEL_ENV_SETUP.ps1
    
.NOTES
    Requires: Vercel CLI installed and logged in
    Run from: asca-pwa project directory
#>

param(
    [switch]$DryRun = $false,
    [switch]$Staging = $false
)

# Configuration
$ProjectName = "asca-pwa"
$Environment = if ($Staging) { "staging" } else { "production" }

Write-Host "`n=== ASCA PWA - Vercel Environment Setup ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectName" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Dry Run: $DryRun`n" -ForegroundColor Yellow

# Check Vercel CLI is installed
try {
    $null = vercel --version
}
catch {
    Write-Host "ERROR: Vercel CLI not installed. Install with: npm i -g vercel" -ForegroundColor Red
    exit 1
}

# Environment variables to add
$EnvVars = @{
    "MONGODB_URI" = "mongodb+srv://asca-admin:AsCA2024@asca-cluster.mongodb.net/asca-pwa?retryWrites=true&w=majority"
    "NEXTAUTH_SECRET" = "FrRj1ewPpAiB1TIKdOVORdEVdWFdTDo2nmaiOG9t0ds="
    "NEXTAUTH_URL" = "https://asca-pwa.vercel.app"
    "RESEND_API_KEY" = "re_ENTER_YOUR_API_KEY_HERE"
    "RESEND_FROM_EMAIL" = "noreply@asca-pwa.org"
    "RESEND_FROM_NAME" = "ASCA PWA"
    "NEXT_PUBLIC_SITE_URL" = "https://asca-pwa.vercel.app"
    "NEXT_PUBLIC_SITE_NAME" = "Atlanta Saddle Club Association"
    "NEXT_PUBLIC_APP_VERSION" = "2.0.0"
    "NEXT_PUBLIC_BUILD_DATE" = "2026-02-22"
    "ADMIN_EMAIL" = "admin@ascapwa.org"
    "ADMIN_PASSWORD" = "AsCA2024!Secure"
}

# Add each variable
Write-Host "Adding environment variables to Vercel..." -ForegroundColor Cyan
$SuccessCount = 0
$ErrorCount = 0

foreach ($Var in $EnvVars.GetEnumerator()) {
    $VarName = $Var.Key
    $VarValue = $Var.Value
    
    Write-Host "  → $VarName" -ForegroundColor Gray -NoNewline
    
    if ($DryRun) {
        Write-Host " (DRY RUN)" -ForegroundColor Yellow
        $SuccessCount++
    }
    else {
        try {
            # Add via Vercel env add (requires interactive prompt)
            Write-Host ""
            Write-Host "    Enter value for $VarName (default: hidden):"
            $SecureValue = Read-Host "    " -AsSecureString
            $PlainValue = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($SecureValue))
            
            # For non-sensitive vars, use actual value
            if ($VarName.StartsWith("NEXT_PUBLIC_")) {
                $ActualValue = $VarValue
            }
            elseif ($VarName -eq "RESEND_API_KEY" -and $PlainValue -ne "") {
                $ActualValue = $PlainValue
            }
            else {
                $ActualValue = if ($PlainValue) { $PlainValue } else { $VarValue }
            }
            
            # Add to Vercel
            echo $ActualValue | vercel env add $VarName --yes
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✓ Added" -ForegroundColor Green
                $SuccessCount++
            }
            else {
                Write-Host "    ✗ Failed" -ForegroundColor Red
                $ErrorCount++
            }
        }
        catch {
            Write-Host "    ✗ Error: $_" -ForegroundColor Red
            $ErrorCount++
        }
    }
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Variables Added: $SuccessCount" -ForegroundColor Green
Write-Host "Errors: $ErrorCount" -ForegroundColor $(if ($ErrorCount -gt 0) { "Red" } else { "Green" })

if ($DryRun) {
    Write-Host "`nDry run completed. Run without -DryRun to actually add variables." -ForegroundColor Yellow
}

# Final steps
Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. ✓ Environment variables added to Vercel" -ForegroundColor Green
Write-Host "2. ⏳ Get Resend API key from https://resend.com/api-keys"
Write-Host "3. ⏳ Update RESEND_API_KEY in Vercel dashboard"
Write-Host "4. ⏳ Verify MongoDB connection"
Write-Host "5. ⏳ Test auth endpoint"
Write-Host "6. ⏳ Run Lighthouse audit"
Write-Host ""

exit $(if ($ErrorCount -eq 0) { 0 } else { 1 })
