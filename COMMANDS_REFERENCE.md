# ASCA PWA - Commands Reference

## Development

```bash
pnpm dev              # Start local server (http://localhost:3000)
pnpm build            # Production build
pnpm start            # Run production build locally
pnpm lint             # Check code quality
pnpm type-check       # TypeScript validation
```

## Database

```bash
pnpm db:check          # Validate Drizzle schema
pnpm db:generate       # Generate Drizzle migration SQL if using checked-in migrations
pnpm db:migrate        # Push current Drizzle schema to Turso/libSQL
pnpm db:migrate-media  # Dry-run extraction of inline images into media_assets
```

Run `pnpm db:migrate` against the target Turso database after pulling changes that add or alter database fields. The admin-managed events/gallery implementation requires the latest `events` and `gallery_images` columns before public pages can read the new fields.

For the media-bloat rollout: back up the target database, apply the additive `drizzle/0002_add_media_assets.sql` table, deploy the media routes, then run `pnpm db:migrate-media -- --apply`. The data migration is idempotent: each image is copied to `media_assets` before its original record is replaced by a versioned media URL.

## Testing

```bash
# Manual testing
pnpm dev
# Visit: http://localhost:3000/get-involved
# Fill and submit form
# Check console for logs

# Email testing
node scripts/test-email.js

# Lighthouse audit
pnpm build && pnpm start
# F12 → Lighthouse → Generate report
```

## Git & Deployment

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Phase 4: Content migration and email setup"

# Push (auto-deploys to Vercel)
git push origin main

# View deployment
# https://vercel.com/projects/asca-pwa
```

## Environment Setup

```bash
# 1. Create/update .env.local
RESEND_API_KEY=re_your_key_here
ADMIN_EMAIL=admin@atlantasaddleclub.org
NEXTAUTH_SECRET=generate-random-string
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# 2. Install packages
pnpm install

# 3. Apply schema changes
pnpm db:migrate

# 4. Start development
pnpm dev
```

## Admin Dashboard Access

```
URL: http://localhost:3000/admin (dev)
     https://asca-pwa.vercel.app/admin (production)
Email: admin@ascapwa.org
Password: AsCA2024!Secure (CHANGE AFTER FIRST LOGIN)
```

## Form Testing Endpoints

```
Contact Form:     /get-involved#contact
Membership App:   /get-involved#membership
Volunteer Signup: /get-involved#volunteer
Donation:         /donate
```

## Cloudflare DNS Configuration

```bash
# Add to your Cloudflare DNS records:

Type: MX
Name: asca-pwa.org
Value: feedback-dsn.com

Type: TXT
Name: asca-pwa.org
Value: v=spf1 include:sendmail.resend.com ~all

Type: CNAME
Name: default._domainkey.asca-pwa.org
Value: default.dkim.asca-pwa.org
```

## Resend Email Verification

```bash
# Check API connection
node scripts/test-email.js

# Verify domain in Resend Dashboard
# https://resend.com/domains

# Monitor email delivery
# https://resend.com/emails
```

## Production Deployment Checklist

```bash
# Before deploying to production
npm run lint
npm run type-check
npm run build

# Add environment variables to Vercel
# - RESEND_API_KEY
# - MONGODB_URI
# - NEXTAUTH_SECRET
# - ADMIN_EMAIL

# Deploy
git push origin main

# Verify
# https://asca-pwa.vercel.app
# Test forms
# Check Resend delivery
```

## Common Issues & Fixes

```bash
# TypeScript errors
npm run type-check

# Build failures
npm run build --verbose

# Email not sending
# 1. Check RESEND_API_KEY in .env.local
# 2. Verify domain in Resend dashboard
# 3. Check console logs
# 4. Review Resend email dashboard

# Form not submitting
# Check browser console (F12)
# Verify API route exists
# Test network request in DevTools

# MongoDB connection
# Verify MONGODB_URI is correct
# Check IP whitelist in MongoDB Atlas
# Verify network connectivity

# Cache issues
# npm run dev -- --experimental-skip-turbopack
# Clear .next folder: rm -r .next
```

## File Locations

```
/app/page.tsx               HOME page
/app/about/page.tsx         ABOUT page
/app/members/page.tsx       MEMBERS page
/app/calendar/page.tsx      CALENDAR page
/app/blog/page.tsx          BLOG page
/app/donate/page.tsx        DONATE page
/app/get-involved/page.tsx  GET-INVOLVED page

/app/admin/                 Admin dashboard
/app/api/forms/route.ts     Form handler
/lib/email.ts               Email templates
/lib/models/                Database schemas
/lib/db.ts                  MongoDB connection
/public/images/             Images directory

/scripts/seed.js            Database seeding
/RESEND_SETUP.md            Email setup
/CONTENT_MIGRATION_GUIDE.md  Content guide
/PHASE_4_EXECUTION.md       Execution plan
```

## Environment Variables Summary

```
Development (.env.local):
- MONGODB_URI
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- RESEND_API_KEY
- RESEND_FROM_EMAIL
- RESEND_FROM_NAME
- ADMIN_EMAIL
- NEXT_PUBLIC_SITE_URL
- NEXT_PUBLIC_SITE_NAME

Production (Vercel):
- All of the above
- Set to production values
```

## Monitoring

```bash
# Vercel logs
vercel logs --tail

# Resend emails
# https://resend.com/emails

# MongoDB operations
# https://cloud.mongodb.com

# Google Analytics (future)
# TBD when configured
```

## Quick Commands Recap

```bash
# Setup
npm install && npm run db:seed && npm run dev

# Test form
# Visit http://localhost:3000/get-involved

# Test email
node scripts/test-email.js

# Check types
npm run type-check

# Build for production
npm run build

# Deploy
git add . && git commit -m "..." && git push origin main
```

---

**Print this page and keep nearby during Phase 4 execution!**
