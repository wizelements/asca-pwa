# ASCA PWA Deployment Guide

---

## Overview

**Production Stack:**
- **Frontend:** Vercel (Next.js)
- **CMS:** Railway (Strapi)
- **Database:** Supabase (PostgreSQL)
- **Push Notifications:** Firebase Cloud Messaging
- **Domain:** Custom domain via DNS

**Timeline:** ~2-3 hours end-to-end

---

## Phase 1: Pre-Deployment Setup

### 1.1 Prerequisites

```bash
# Ensure installed:
node --version          # v18+
npm --version          # v9+
git --version          # v2.38+
```

### 1.2 GitHub Repository

```bash
# Initialize repo
git init
git add .
git commit -m "Initial commit: ASCA PWA + Admin"
git branch -M main
git remote add origin https://github.com/asca/atlantasaddleclub-pwa.git
git push -u origin main
```

### 1.3 Environment Variables

Create `.env.production` in repo root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Strapi CMS
NEXT_PUBLIC_STRAPI_API_URL=https://strapi-api.railroad.app
NEXT_PUBLIC_STRAPI_API_TOKEN=your_api_token

# NextAuth.js
NEXTAUTH_URL=https://atlantasaddleclub.com
NEXTAUTH_SECRET=your_secret_key_here (generate with `openssl rand -base64 32`)

# Firebase Cloud Messaging
NEXT_PUBLIC_FCM_API_KEY=your_fcm_api_key
NEXT_PUBLIC_FCM_PROJECT_ID=your_fcm_project_id
NEXT_PUBLIC_FCM_SENDER_ID=your_fcm_sender_id
NEXT_PUBLIC_FCM_APP_ID=your_fcm_app_id
NEXT_PUBLIC_FCM_VAPID_KEY=your_fcm_vapid_key

# Admin email for alerts
ADMIN_EMAIL=admin@atlantasaddleclub.com
```

---

## Phase 2: Database Setup (Supabase)

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project in `us-east-1` region
3. Wait for provisioning (~3-5 minutes)
4. Copy credentials to `.env.production`

### 2.2 Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your_project_id

# Run all migrations
supabase db push

# Verify tables created
supabase db list
```

### 2.3 Enable RLS & Auth

```sql
-- In Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

-- Create policies (examples)
CREATE POLICY "Public posts visible to all"
  ON blog_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

### 2.4 Create Admin User

```sql
-- Create first admin in auth.users
-- Go to Supabase Dashboard > Auth > Add User
-- Email: admin@atlantasaddleclub.com
-- Password: (auto-generated)

-- Then set role in profiles table
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, 'Admin', 'admin'
FROM auth.users
WHERE email = 'admin@atlantasaddleclub.com';
```

---

## Phase 3: CMS Setup (Railway + Strapi)

### 3.1 Deploy Strapi on Railway

```bash
# 1. Go to railway.app
# 2. Create new project
# 3. Select "Deploy from GitHub"
# 4. Connect your GitHub repo

# OR deploy via CLI
npm install -g @railway/cli
railway login
railway init

# Set up environment variables in Railway dashboard:
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host/db
JWT_SECRET=your_secret_key
ADMIN_JWT_SECRET=your_admin_secret
DATABASE_SSL=true
```

### 3.2 Configure Strapi

```bash
# In strapi/ directory
cd strapi

# Install dependencies
npm install

# Create .env
cat > .env << EOF
NODE_ENV=production
DATABASE_CLIENT=postgres
DATABASE_URL=${{ secrets.DATABASE_URL }}
JWT_SECRET=${{ secrets.JWT_SECRET }}
ADMIN_JWT_SECRET=${{ secrets.ADMIN_JWT_SECRET }}
STRAPI_ADMIN_PATH=/cms-admin
STRAPI_DISABLE_CONCURRENT_BOOTSTRAP=true
EOF

# Build
npm run build

# Start
npm start
```

### 3.3 Create Strapi API Token

1. Login to `https://your-strapi-url/cms-admin`
2. Go to Settings > API Tokens
3. Create "Public API" token with read/write access
4. Copy token to `.env.production`

### 3.4 Seed Initial Content

```javascript
// strapi/scripts/seed.js
const content = {
  posts: [
    { title: "Welcome to ASCA", excerpt: "...", content: "..." }
  ],
  events: [
    { title: "Spring Training", date: "2026-03-15", ... }
  ],
};

// Execute seed script on deployment
```

---

## Phase 4: Firebase Cloud Messaging Setup

### 4.1 Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create new project: "atlanta-saddle-club"
3. Enable Cloud Messaging

### 4.2 Get Credentials

1. Settings > Project Settings > Service Accounts
2. Generate private key (JSON)
3. Copy VAPID key from Cloud Messaging settings
4. Add all keys to `.env.production`

### 4.3 Test FCM

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Authenticate
firebase login

# Deploy
firebase deploy --only messaging
```

---

## Phase 5: Frontend Deployment (Vercel)

### 5.1 Connect Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_STRAPI_API_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
# ... all other env vars
```

### 5.2 Deploy

```bash
# Production deploy
vercel deploy --prod

# Vercel will:
# ✓ Run linter
# ✓ Run tests
# ✓ Build Next.js app
# ✓ Deploy to CDN
# ✓ Generate preview URL
```

### 5.3 Verify Deployment

```bash
# Test endpoints
curl https://atlantasaddleclub.vercel.app/api/health

# Test PWA manifest
curl https://atlantasaddleclub.vercel.app/manifest.json

# Test service worker
curl https://atlantasaddleclub.vercel.app/sw.js
```

---

## Phase 6: Domain & SSL

### 6.1 Update DNS

1. Login to domain registrar (GoDaddy, Namecheap, etc.)
2. Update DNS records:

```
Type    Name    Value
─────────────────────────────
A       @       76.76.19.165  (Vercel IP)
CNAME   www     cname.vercel-dns.com
```

3. Go to Vercel Dashboard > Domains
4. Add `atlantasaddleclub.com`
5. Wait for DNS propagation (5-15 min)

### 6.2 SSL Certificate

Vercel automatically provisions Let's Encrypt SSL.

Verify in Vercel Dashboard:
- ✓ Domain configured
- ✓ SSL certificate active
- ✓ Redirect from www → non-www (or vice versa)

### 6.3 Test HTTPS

```bash
curl -I https://atlantasaddleclub.com

# Should return:
# HTTP/2 200
# x-vercel-cache: HIT
# age: 300
```

---

## Phase 7: Third-Party Integrations

### 7.1 Analytics

```typescript
// src/app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 7.2 Error Monitoring (Optional)

```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in next.config.js
```

### 7.3 Email Service

For contact form / admin notifications:
- SendGrid (free tier: 100 emails/day)
- Mailgun (free tier: 5,000 emails/month)
- AWS SES (cheapest at scale)

```bash
npm install @sendgrid/mail

# .env
SENDGRID_API_KEY=your_key
```

---

## Phase 8: Performance & Monitoring

### 8.1 Lighthouse Audit

```bash
# Run locally
npm run build
npm run lighthouse

# Should report:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 90+
# SEO: 90+
# PWA: Installable
```

### 8.2 Web Vitals Monitoring

```typescript
// Vercel automatically tracks via Analytics
// Custom tracking:
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics backend
}
```

### 8.3 Uptime Monitoring

Setup in Vercel Dashboard:
- Alerts > Add Alert
- Endpoint: `https://atlantasaddleclub.com/api/health`
- Frequency: Every 5 minutes
- Notify: admin@atlantasaddleclub.com

---

## Phase 9: Post-Launch

### 9.1 Admin Onboarding

```markdown
# ASCA Admin Setup Checklist

1. Login to /admin
   - Email: admin@atlantasaddleclub.com
   - Password: (from Supabase invite)

2. Update Branding
   - [ ] Upload logo
   - [ ] Set brand colors
   - [ ] Choose fonts
   - [ ] Set tagline

3. Add Initial Content
   - [ ] Create 3+ blog posts
   - [ ] Add upcoming events
   - [ ] Add team members
   - [ ] Upload gallery images

4. Configure Features
   - [ ] Enable push notifications
   - [ ] Set Venmo username
   - [ ] Configure donation presets
   - [ ] Enable feature toggles

5. Test Features
   - [ ] Send test push notification
   - [ ] Submit membership form
   - [ ] Test Venmo donation link
   - [ ] Test offline functionality
```

### 9.2 Launch Checklist

```bash
# Final checks before going live
- [ ] All pages tested in mobile + desktop
- [ ] Forms tested offline
- [ ] Push notifications working
- [ ] Admin can manage all content
- [ ] Analytics configured
- [ ] Error monitoring active
- [ ] Backups enabled (Supabase)
- [ ] SSL certificate active
- [ ] Speed test passes (Lighthouse 90+)
- [ ] A11y audit passed
- [ ] Social media links correct
- [ ] Contact email monitored
- [ ] Support email setup
```

### 9.3 Post-Launch Monitoring

**Week 1:**
- Monitor error rates (should be ~0%)
- Check performance (Lighthouse trending)
- Verify push notifications deliver
- Monitor form submissions

**Month 1:**
- Analyze user behavior (Vercel Analytics)
- Optimize slow pages
- Gather feedback from admins
- Plan Phase 2 features

---

## Troubleshooting

### Issue: 500 Error on Deploy
```bash
# Check build logs
vercel logs --tail

# Common causes:
# 1. Missing env vars → Add in Vercel dashboard
# 2. Database connection → Check Supabase credentials
# 3. API endpoint wrong → Verify NEXT_PUBLIC_STRAPI_API_URL
```

### Issue: CSS/Images Not Loading
```bash
# Vercel caching issue
vercel env pull  # Sync env vars
vercel deploy --prod  # Redeploy

# Check service worker cache
# DevTools > Application > Cache Storage > Clear
```

### Issue: Service Worker Not Updating
```typescript
// Force skip waiting in app
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(reg => {
    reg.installing?.postMessage({ type: 'SKIP_WAITING' });
  });
}
```

### Issue: Push Notifications Not Working
```bash
# Check Firebase credentials
# Verify NEXT_PUBLIC_FCM_VAPID_KEY set
# Check browser permissions: Settings > Notifications
# Test manually: /admin/notifications > Send Test
```

---

## Rollback Procedure

If critical issues emerge:

```bash
# Revert to previous deployment
vercel rollback

# OR manually redeploy previous commit
git revert <commit-hash>
git push
vercel deploy --prod
```

---

## Maintenance & Updates

### Weekly
- Review error logs
- Check admin activity
- Monitor form submissions

### Monthly
- Update dependencies: `npm outdated`
- Run security audit: `npm audit`
- Backup database: Supabase Dashboard > Backups

### Quarterly
- Performance review (Lighthouse)
- A11y re-audit
- User feedback session
- Plan next features

---

**Deployment Complete!**

Next steps:
1. Monitor production for 48 hours
2. Gather admin feedback
3. Plan Phase 2 features
4. Document learnings in Second Brain

---

**Support & Questions:**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Railway Docs: https://railway.app/docs
- Firebase Docs: https://firebase.google.com/docs
