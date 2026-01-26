# ASCA PWA - Phase 1 Build Initialization Script
# Run this script to scaffold Phase 1 foundation

param(
    [switch]$SkipInstall,
    [string]$ProjectPath = "$PWD"
)

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ASCA PWA - Phase 1 Build Initialization             ║" -ForegroundColor Cyan
Write-Host "║   Foundation Setup: Weeks 1-2                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verify Node.js
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "  ✓ Node.js $nodeVersion"

# 1. Initialize Git
Write-Host "🔧 Step 1/6: Git initialization..." -ForegroundColor Green
if (-not (Test-Path ".git")) {
    git init
    git config user.name "ASCA Development"
    git config user.email "dev@atlantasaddleclub.com"
    Write-Host "  ✓ Git initialized"
} else {
    Write-Host "  ✓ Git already initialized"
}

# 2. Create folder structure
Write-Host "🔧 Step 2/6: Creating folder structure..." -ForegroundColor Green
$folders = @(
    "src/app/(public)",
    "src/app/(admin)/admin",
    "src/app/api",
    "src/components/layout",
    "src/components/pages",
    "src/components/admin",
    "src/components/ui",
    "src/lib",
    "src/hooks",
    "src/types",
    "src/styles",
    "src/public",
    "strapi/config",
    "strapi/src/api",
    "db/migrations",
    "tests/e2e",
    "tests/unit",
    "docs"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "  ✓ Created $folder"
    }
}

# 3. Create .gitignore
Write-Host "🔧 Step 3/6: Creating .gitignore..." -ForegroundColor Green
$gitignore = @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Next.js
.next/
out/
.swc/
.turbo/

# Production
build/
dist/

# Environment
.env
.env.local
.env.*.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
.coverage/
.nyc_output/

# Misc
.cache/
.vercel/
.previewmode/

# Strapi
strapi/.env
strapi/node_modules/
strapi/.strapi/
strapi/build/
"@

Set-Content -Path ".gitignore" -Value $gitignore
Write-Host "  ✓ .gitignore created"

# 4. Create .env.example
Write-Host "🔧 Step 4/6: Creating environment template..." -ForegroundColor Green
$envExample = @"
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Strapi CMS
NEXT_PUBLIC_STRAPI_API_URL=https://strapi-api.railroad.app
NEXT_PUBLIC_STRAPI_API_TOKEN=your_strapi_token_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Firebase Cloud Messaging
NEXT_PUBLIC_FCM_API_KEY=your_fcm_api_key_here
NEXT_PUBLIC_FCM_PROJECT_ID=your_fcm_project_id_here
NEXT_PUBLIC_FCM_SENDER_ID=your_fcm_sender_id_here
NEXT_PUBLIC_FCM_APP_ID=your_fcm_app_id_here
NEXT_PUBLIC_FCM_VAPID_KEY=your_fcm_vapid_key_here

# Admin
ADMIN_EMAIL=admin@atlantasaddleclub.com
NODE_ENV=development
"@

Set-Content -Path ".env.example" -Value $envExample
Write-Host "  ✓ .env.example created"

# 5. Create package.json basics if not exists
Write-Host "🔧 Step 5/6: Setting up package configuration..." -ForegroundColor Green
if (-not (Test-Path "package.json")) {
    $packageJson = @"
{
  "name": "atlantasaddleclub-pwa",
  "version": "0.1.0",
  "description": "Atlanta Saddle Club Association PWA with Admin System",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lighthouse": "lighthouse http://localhost:3000 --view",
    "analyze": "ANALYZE=true next build"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "next-auth": "^4.24.0",
    "next-pwa": "^5.6.0",
    "firebase": "^10.0.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "idb": "^8.0.0",
    "swr": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.2.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.52.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "playwright": "^1.40.0"
  }
}
"@

    Set-Content -Path "package.json" -Value $packageJson
    Write-Host "  ✓ package.json created"
} else {
    Write-Host "  ✓ package.json already exists"
}

# 6. Create Initial Commit
Write-Host "🔧 Step 6/6: Creating initial commit..." -ForegroundColor Green
git add .gitignore .env.example package.json
foreach ($folder in $folders) {
    git add "$folder/.gitkeep" -ErrorAction SilentlyContinue
}

# Create .gitkeep files in empty directories
foreach ($folder in $folders) {
    if (-not (Test-Path "$folder/.gitkeep")) {
        New-Item -ItemType File -Path "$folder/.gitkeep" -Force | Out-Null
    }
}

git add .
git commit -m "Phase 1 Init: Foundation scaffolding - folder structure, configs, dependencies" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Phase 1 Scaffolding Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Create .env.local from .env.example"
Write-Host "  2. Add your Supabase credentials to .env.local"
Write-Host "  3. Run: npm install"
Write-Host "  4. Run: npx create-next-app . --typescript --tailwind --app"
Write-Host "  5. Follow IMPLEMENTATION_CHECKLIST.md Phase 1"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  • README.md - Project overview"
Write-Host "  • ARCHITECTURE_COMPLETE.md - Technical blueprint"
Write-Host "  • IMPLEMENTATION_CHECKLIST.md - Phase 1 tasks"
Write-Host ""
Write-Host "🚀 Ready to build! Follow IMPLEMENTATION_CHECKLIST.md Phase 1" -ForegroundColor Green
