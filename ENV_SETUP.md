# ASCA PWA - Environment Variables Setup Guide

**Date**: February 22, 2026  
**Status**: Production Configuration  
**Live URL**: https://asca-pwa.vercel.app/  

---

## Overview

The ASCA PWA requires environment variables for:
1. **Database**: MongoDB Atlas connection
2. **Authentication**: NextAuth JWT secret
3. **Email**: Resend API for transactional emails
4. **Firebase**: Push notifications (Phase 5+)
5. **Site Config**: Public URLs and metadata

---

## Current Status

### ✅ Local Configuration (.env.local)
- MongoDB URI: ✅ Configured (asca-cluster)
- NextAuth URL: ✅ Configured (https://asca-pwa.vercel.app)
- Resend API: ⏳ Needs API key
- Firebase: ⏳ Optional (Phase 5)

### ⏳ Vercel Production Secrets
Need to add all variables to Vercel dashboard

---

## 1. Generate NEXTAUTH_SECRET

Generate a cryptographically secure random secret:

```bash
# On Windows (PowerShell)
$secret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Write-Host $secret

# On macOS/Linux
openssl rand -base64 32

# Example output:
# 4gF9jK2mL5pQ8wX3bZ7cN9rV1mE6tY0aB5sD8fH2jK4=
```

---

## 2. Environment Variables Reference

### Required (Production)

| Variable | Value | Location | Example |
|----------|-------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | `.env.local` + Vercel | `mongodb+srv://asca-admin:AsCA2024@asca-cluster.mongodb.net/asca-pwa?retryWrites=true&w=majority` |
| `NEXTAUTH_SECRET` | Random 32-byte secret | `.env.local` + Vercel | `4gF9jK2mL5pQ8wX3bZ7cN9rV1mE6tY0aB5sD8fH2jK4=` |
| `NEXTAUTH_URL` | Deployment URL | `.env.local` + Vercel | `https://asca-pwa.vercel.app` |
| `RESEND_API_KEY` | Resend email service key | Vercel only | `re_xxxxxxxxxx...` |

### Optional (Phase 2+)

| Variable | Purpose | Status |
|----------|---------|--------|
| `RESEND_FROM_EMAIL` | Email sender address | ⏳ Get from Resend |
| `RESEND_FROM_NAME` | Email sender name | ✅ Configured |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | ✅ Configured |
| `NEXT_PUBLIC_SITE_NAME` | Site display name | ✅ Configured |

### Optional (Phase 5+)

| Variable | Purpose | Status |
|----------|---------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | ⏳ Phase 5 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ⏳ Phase 5 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | ⏳ Phase 5 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ⏳ Phase 5 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging ID | ⏳ Phase 5 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | ⏳ Phase 5 |

---

## 3. Setup Steps

### Step 1: Local Development (.env.local)

The `.env.local` file already exists with most values. Update only:

```bash
# Generate NEXTAUTH_SECRET (if not set)
openssl rand -base64 32

# Update .env.local with the generated secret
# NEXTAUTH_SECRET=<generated-value>
```

**Current .env.local** (already configured):
```
MONGODB_URI=mongodb+srv://asca-admin:AsCA2024@asca-cluster.mongodb.net/asca-pwa?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-secret-key-here  # UPDATE THIS
NEXTAUTH_URL=https://asca-pwa.vercel.app
RESEND_API_KEY=re_your_resend_api_key_here  # UPDATE THIS
```

### Step 2: Get Resend API Key

1. Go to https://resend.com/
2. Sign up or login
3. Navigate to API Keys section
4. Create new API key
5. Copy the key (format: `re_xxxxx...`)
6. Add to both `.env.local` and Vercel

### Step 3: Add Secrets to Vercel

#### Method 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select **asca-pwa** project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Name**: Variable name (e.g., `MONGODB_URI`)
   - **Value**: Variable value (e.g., MongoDB connection string)
   - **Production**: Check this box
   - Click **Save**

**Variables to add**:
```
MONGODB_URI → mongodb+srv://asca-admin:...
NEXTAUTH_SECRET → <generated-value>
NEXTAUTH_URL → https://asca-pwa.vercel.app
RESEND_API_KEY → re_xxxxx...
RESEND_FROM_EMAIL → noreply@asca-pwa.org (optional)
RESEND_FROM_NAME → ASCA PWA (optional)
NEXT_PUBLIC_SITE_URL → https://asca-pwa.vercel.app
NEXT_PUBLIC_SITE_NAME → Atlanta Saddle Club Association
```

#### Method 2: Vercel CLI

```bash
# Login to Vercel
vercel login

# Add environment variables
vercel env add MONGODB_URI
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
vercel env add RESEND_FROM_NAME
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add NEXT_PUBLIC_SITE_NAME
```

---

## 4. Verification

### Local Development

```bash
# Start development server
pnpm dev

# Test API endpoints
curl http://localhost:3000/api/events/crud
curl http://localhost:3000/api/blog/crud
curl http://localhost:3000/api/members/crud

# Test auth endpoint
curl -X POST http://localhost:3000/api/auth/[...nextauth] \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ascapwa.org",
    "password": "AsCA2024!Secure",
    "action": "login"
  }'
```

### Production (Vercel)

1. Check deployment logs: https://vercel.com/dashboard/asca-pwa → **Deployments**
2. Test live endpoints:
   ```bash
   curl https://asca-pwa.vercel.app/api/events/crud
   curl https://asca-pwa.vercel.app/api/blog/crud
   ```
3. Check database connection in Vercel logs

---

## 5. Default Credentials

### Admin Account

```
Email: admin@ascapwa.org
Password: AsCA2024!Secure
Role: admin
```

⚠️ **SECURITY**: Change this password after first login in production!

### Test Accounts (Coming Phase 3)

```
Email: editor@ascapwa.org
Password: EditorPassword123
Role: editor
```

---

## 6. MongoDB Connection Details

### Atlas Configuration

**Cluster**: asca-cluster  
**Database**: asca-pwa  
**Username**: asca-admin  
**Region**: (Check Atlas dashboard)

**Connection String**:
```
mongodb+srv://asca-admin:AsCA2024@asca-cluster.mongodb.net/asca-pwa?retryWrites=true&w=majority
```

### Collections (Created Automatically)

- `users` - Admin accounts
- `events` - Events with RSVP
- `blogposts` - Blog posts with view tracking
- `members` - Member profiles with dues
- `sessions` - NextAuth sessions (if using session strategy)

### Connection Pooling

For Vercel serverless, MongoDB Atlas automatically:
- Pools connections
- Handles timeouts
- Retries failed connections (via `retryWrites=true`)

---

## 7. Troubleshooting

### MongoDB Connection Fails

**Error**: `querySrv ENOTFOUND _mongodb._tcp.asca-cluster.mongodb.net`

**Solution**:
1. Check MongoDB URI in `.env.local`
2. Verify cluster is running: https://cloud.mongodb.com
3. Check IP whitelist: https://cloud.mongodb.com → Network Access
4. Vercel IP range needs to be whitelisted (0.0.0.0/0 for development, specific IPs for production)

### NEXTAUTH_SECRET Not Set

**Error**: `Error: NEXTAUTH_SECRET is required in production`

**Solution**:
1. Generate new secret: `openssl rand -base64 32`
2. Add to `.env.local`: `NEXTAUTH_SECRET=<generated-value>`
3. Add to Vercel: Settings → Environment Variables

### Resend API Key Invalid

**Error**: `Error: Invalid API key`

**Solution**:
1. Go to https://resend.com/api-keys
2. Generate new key (keys start with `re_`)
3. Update `.env.local` and Vercel

### Vercel Deployment Fails After Env Changes

**Error**: Build fails with env var warnings

**Solution**:
1. Redeploy: `git push origin main` (triggers auto-deploy)
2. Or manual redeploy: Vercel Dashboard → **Deployments** → **Redeploy**

---

## 8. Security Best Practices

### ✅ Do

- ✅ Use strong, random NEXTAUTH_SECRET (32+ bytes)
- ✅ Store MongoDB password securely (never commit to git)
- ✅ Restrict MongoDB IP whitelist in production
- ✅ Rotate API keys regularly
- ✅ Use environment variables for all secrets
- ✅ Keep `.env.local` in `.gitignore` ✅ (already configured)

### ❌ Don't

- ❌ Commit `.env.local` to git
- ❌ Use simple passwords (use strong passphrases)
- ❌ Share API keys via email/Slack
- ❌ Use same secrets across environments
- ❌ Leave debug flags in production
- ❌ Whitelist 0.0.0.0/0 MongoDB access in production

---

## 9. Environment Switching

### Development
```bash
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://asca-admin:AsCA2024@asca-cluster.mongodb.net/asca-pwa-dev
```

### Staging (if needed)
```bash
NEXTAUTH_URL=https://staging.asca-pwa.vercel.app
MONGODB_URI=mongodb+srv://asca-admin:AsCA2024@asca-cluster.mongodb.net/asca-pwa-staging
```

### Production
```bash
NEXTAUTH_URL=https://asca-pwa.vercel.app
MONGODB_URI=mongodb+srv://asca-admin:AsCA2024@asca-cluster.mongodb.net/asca-pwa
```

---

## 10. Next Steps

### Immediate (Phase 2)
- [ ] Generate NEXTAUTH_SECRET
- [ ] Add to `.env.local`
- [ ] Get Resend API key
- [ ] Add all vars to Vercel
- [ ] Test auth endpoints
- [ ] Verify MongoDB connection

### Phase 3
- [ ] Setup Firebase (push notifications)
- [ ] Test email delivery
- [ ] Setup backup MongoDB user
- [ ] Configure prod IP whitelist

### Phase 4+
- [ ] Implement env-specific configs
- [ ] Setup monitoring/alerting
- [ ] Rotate secrets periodically
- [ ] Document change log

---

## Quick Reference

### Test MongoDB Connection
```bash
mongosh "mongodb+srv://asca-admin:AsCA2024@asca-cluster.mongodb.net/asca-pwa"
```

### Test Resend Email
```bash
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer re_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "delivered@resend.dev",
    "subject": "Test Email",
    "html": "<p>Hello</p>"
  }'
```

### View Vercel Env Vars
```bash
vercel env ls
```

### Restart Vercel Deployment
```bash
git commit --allow-empty -m "chore: trigger rebuild"
git push origin main
```

---

**Setup Status**: ⏳ IN PROGRESS  
**Last Updated**: February 22, 2026  
**Next**: Add NEXTAUTH_SECRET and deploy to Vercel
