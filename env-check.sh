#!/bin/bash

# ASCA PWA - Environment Variables Validation

echo ""
echo "=== ASCA PWA - Environment Variables Validation ==="
echo "File: .env.local"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "ERROR: .env.local not found!"
    exit 1
fi

# Check required variables
echo "Checking Required Variables:"
echo ""

check_var() {
    var_name=$1
    var_value=$(grep "^$var_name=" .env.local | cut -d'=' -f2)
    
    if [ -z "$var_value" ]; then
        echo "  ✗ $var_name - MISSING"
        return 1
    elif echo "$var_value" | grep -q "your-\|ENTER_YOUR"; then
        echo "  ⚠ $var_name - PLACEHOLDER"
        return 1
    else
        echo "  ✓ $var_name - OK"
        return 0
    fi
}

# Required variables
check_var "TURSO_DATABASE_URL"
check_var "TURSO_AUTH_TOKEN"
check_var "NEXTAUTH_SECRET"
check_var "NEXTAUTH_URL"

echo ""
echo "Checking NEXTAUTH_SECRET strength:"
secret=$(grep "^NEXTAUTH_SECRET=" .env.local | cut -d'=' -f2)
if [ ${#secret} -lt 16 ]; then
    echo "  ⚠ NEXTAUTH_SECRET - TOO SHORT (${#secret} chars, min 16)"
elif [ ${#secret} -ge 32 ]; then
    echo "  ✓ NEXTAUTH_SECRET - STRONG (${#secret} chars)"
else
    echo "  ✓ NEXTAUTH_SECRET - OK (${#secret} chars)"
fi

echo ""
echo "Checking Optional Variables:"
echo ""

check_optional_var() {
    var_name=$1
    var_value=$(grep "^$var_name=" .env.local | cut -d'=' -f2)
    
    if [ -z "$var_value" ]; then
        echo "  ○ $var_name - Not set (optional)"
    else
        echo "  ✓ $var_name - Configured"
    fi
}

check_optional_var "RESEND_API_KEY"
check_optional_var "RESEND_FROM_EMAIL"
check_optional_var "RESEND_FROM_NAME"
check_optional_var "NEXT_PUBLIC_SITE_URL"
check_optional_var "NEXT_PUBLIC_SITE_NAME"

echo ""
echo "Checking File Security:"
if grep -q "\.env\.local" ".gitignore"; then
    echo "  ✓ .env.local - In .gitignore (safe)"
else
    echo "  ✗ .env.local - NOT in .gitignore (security risk!)"
fi

echo ""
echo "=== Next Steps ==="
echo "1. Verify all variables are set"
echo "2. Get Resend API key from https://resend.com/api-keys"
echo "3. Update RESEND_API_KEY in .env.local"
echo "4. Test local development: pnpm dev"
echo "5. Add variables to Vercel dashboard"
echo ""
