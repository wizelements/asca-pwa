# Atlanta Saddle Club Association — PWA + Admin System

**Status:** Architecture Complete | Ready for Phase 1 Implementation  
**Build Start:** Week 1-2 of January 2026  
**Expected Launch:** 11-12 weeks

---

## 📋 Project Overview

Rebuild **atlantasaddleclub.com** as a modern **Progressive Web App** with a comprehensive **non-technical admin dashboard** that empowers staff to manage all aspects of the site without code.

**Mission:** "We Ride To Inspire"

### Key Requirements
✓ **100% Non-Technical Admin Control** — Colors, branding, content, features via UI  
✓ **Progressive Web App** — Works offline, installable, fast  
✓ **Headless CMS** — Strapi for content management  
✓ **Venmo Integration** — Admin-configurable donation links  
✓ **Push Notifications** — Firebase Cloud Messaging with admin compose panel  
✓ **Membership Forms** — Multi-step, offline-capable submissions  
✓ **Event Management** — Calendar with RSVP, export to .ics  
✓ **Accessibility** — WCAG 2.1 AA (target: Lighthouse 95+)  
✓ **Performance** — Lighthouse 90+ across all metrics

---

## 🏗️ Architecture

### Tech Stack (Locked)
```
Frontend:     Next.js 14 (App Router) + Tailwind CSS
Backend:      Strapi Headless CMS (Node.js)
Database:     PostgreSQL (Supabase)
Auth:         NextAuth.js + Supabase
Offline:      Service Workers + IndexedDB
Notifications: Firebase Cloud Messaging
Payments:     Venmo (link redirect) + Future Stripe
Hosting:      Vercel (Frontend) + Railway (CMS) + Supabase (DB)
```

### System Architecture
See `ARCHITECTURE_COMPLETE.md` for:
- Full folder structure (256 files)
- Database schema (15 tables)
- API routes (40+ endpoints)
- Admin UI wireframes
- PWA configuration
- Service worker logic
- Push notification flow
- Venmo integration

---

## 📁 Documentation Files

| Document | Purpose |
|----------|---------|
| **ARCHITECTURE_COMPLETE.md** | Full technical architecture, schemas, folder structure |
| **ADMIN_UX_WIREFRAMES.md** | Admin dashboard layouts, mockups, interaction patterns |
| **PWA_CONFIGURATION.md** | Service worker setup, manifest, caching strategies, offline |
| **DEPLOYMENT_GUIDE.md** | Step-by-step deployment to production (Vercel + Supabase + Railway) |
| **ACCESSIBILITY_CHECKLIST.md** | WCAG 2.1 AA compliance, testing procedures, admin enforcement |

---

## 🎨 Brand System

### Colors (Editable in Admin)
```
Dark:       #1a1a1a  (dark backgrounds)
Olive:      #4a4b02  (secondary backgrounds)
Gold:       #f5d800  (accent, CTAs, highlights)
White:      #ffffff  (text, borders)
Pale Yellow: #fef3c7 (text variants)
```

### Typography (Editable in Admin)
```
Headings:  Playfair Display or Merriweather
Body:      Open Sans or Roboto
```

### Admin Branding Editor
- Color picker with contrast checker
- Font selector with preview
- Logo upload (SVG)
- Tagline editor
- Live homepage preview
- One-click publish

---

## 📱 Public PWA Pages

### Pages Included
1. **HOME** — Hero + CTAs + Blog preview + Gallery + Newsletter
2. **ABOUT** — Mission statement + team + testimonials (optional)
3. **MEMBERS** — Directory with filters (Rider/Volunteer/Instructor)
4. **GET INVOLVED** — Multi-step membership form + volunteer signup
5. **CALENDAR** — FullCalendar with RSVP, export to .ics
6. **BLOG** — CMS-driven posts with search + tags
7. **DONATE** — Venmo redirect flow with presets + custom amounts

### Features
- ✓ Fully responsive (mobile-first)
- ✓ Offline-capable (cached on first visit)
- ✓ PWA installable
- ✓ Push notification opt-in
- ✓ Form submission with offline queue + sync
- ✓ Lighthouse 90+
- ✓ WCAG 2.1 AA accessible

---

## 🛠️ Admin System

### Dashboard Modules

| Module | Capabilities |
|--------|--------------|
| **Branding** | Edit colors, fonts, logo, tagline with live preview |
| **Page Builder** | Drag/drop homepage sections, toggle modules, reorder |
| **Blog Manager** | Create/edit/publish posts, schedule, version history |
| **Events Manager** | Calendar view, RSVP tracking, export, notifications |
| **Members Directory** | Add/edit/photo upload, role assignment, filters |
| **Gallery** | Upload images, organize by category, alt text required |
| **Forms Inbox** | View submissions (contact, newsletter, membership, volunteer) |
| **Push Notifications** | Compose, schedule, target audiences, send analytics |
| **Feature Toggles** | Enable/disable: lead magnet, RSVP, donations, testimonials, etc. |
| **Venmo Settings** | Configure username, donation presets, message template |
| **Settings** | Admin users, roles, audit log, backups |

### Admin Access Control
- **Admin** — Full access (all modules)
- **Editor** — Content management (blog, members, gallery)
- **Events Manager** — Events + calendar only
- **View Only** — Reports + analytics only

---

## 📊 Database Schema

### Core Tables
```sql
profiles              -- User accounts (extends Supabase Auth)
admin_sessions        -- Admin login sessions
site_settings         -- Global settings (key-value store)
theme_settings        -- Brand colors, fonts, logo
feature_flags         -- Feature toggles

blog_posts           -- Blog content (CMS-driven)
events               -- Calendar events
rsvps                -- Event attendance tracking
members              -- Team directory
gallery_images       -- Image library
testimonials         -- Optional member quotes
form_submissions     -- Contact, newsletter, membership

newsletter_submissions
contact_submissions
membership_applications
volunteer_applications

offline_queue        -- Failed requests queued for sync
push_subscriptions   -- FCM endpoints + preferences
push_notifications   -- Notification history
donations            -- Venmo donation logs
```

Row-level security (RLS) enforced on all tables.

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Repo setup + folder structure
- [ ] Next.js scaffolding + Tailwind config
- [ ] Database migrations + RLS policies
- [ ] Strapi CMS setup + content types
- [ ] NextAuth admin login

### Phase 2: Public Pages (Weeks 3-4)
- [ ] HOME, ABOUT, MEMBERS, BLOG
- [ ] CALENDAR with FullCalendar integration
- [ ] DONATE page (Venmo flow)
- [ ] Responsive design + mobile testing

### Phase 3: Admin System (Weeks 5-6)
- [ ] Theme editor + color picker + contrast checker
- [ ] Content managers (blog, events, members, gallery)
- [ ] Form submission dashboard
- [ ] Feature toggle panel
- [ ] Venmo configuration

### Phase 4: Offline + PWA (Weeks 7-8)
- [ ] Service Worker + caching strategy
- [ ] Offline form queue + background sync
- [ ] manifest.json + PWA install prompt
- [ ] Offline fallback page

### Phase 5: Notifications + Integrations (Weeks 9-10)
- [ ] Firebase Cloud Messaging setup
- [ ] Push subscription + admin composer
- [ ] Notification analytics
- [ ] A11y audit + fixes
- [ ] Performance optimization (Lighthouse)

### Phase 6: Deployment (Week 11)
- [ ] Vercel frontend deployment
- [ ] Railway CMS deployment
- [ ] Supabase database setup
- [ ] Custom domain + SSL
- [ ] Go-live

---

## 🎯 Success Metrics

### Performance (Lighthouse)
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 90
- SEO: ≥ 90
- PWA: ✓ Installable

### User Engagement
- Monthly active users (tracking)
- Event RSVP conversion rate
- Newsletter signup rate (target: 5%)
- Push notification opt-in rate (target: 30%)
- Donation conversion rate (tracking)

### Admin Usability
- Content publish time: < 5 minutes
- Theme change time: < 2 minutes
- No code edits required
- Zero developer support tickets

---

## 🔐 Security & Compliance

### Security
- ✓ Supabase RLS (Row-Level Security)
- ✓ NextAuth JWT tokens
- ✓ HTTPS/TLS everywhere
- ✓ Environment variables for secrets
- ✓ Rate limiting on API routes
- ✓ CORS configured properly
- ✓ Input validation + sanitization
- ✓ SQL injection prevention (ORM usage)

### Compliance
- ✓ GDPR-friendly (no tracking cookies)
- ✓ WCAG 2.1 AA accessible
- ✓ Privacy policy (admin-editable)
- ✓ Terms of service (admin-editable)
- ✓ Newsletter unsubscribe option

---

## 📦 Deliverables (This Thread)

1. ✓ **Architecture Diagram** — System overview with data flows
2. ✓ **Folder Structure** — 256 files organized logically
3. ✓ **Database Schema** — 15 tables with RLS policies
4. ✓ **Admin UI Layout** — Wireframes + mockups for all modules
5. ✓ **PWA Configuration** — manifest.json, service worker, offline
6. ✓ **Service Worker Logic** — Caching strategies, offline queue, sync
7. ✓ **Push Notification Flow** — FCM setup + admin composer
8. ✓ **Venmo Integration Logic** — Config API + redirect flow
9. ✓ **Accessibility Checklist** — WCAG 2.1 AA compliance + testing
10. ✓ **Deployment Guide** — Step-by-step production deployment

---

## 🛠️ Skills Used (Oracle-Genesis + Second-Brain)

This architecture was designed using:
- **oracle-genesis-engine** — Structured output, oracle-correct execution
- **second-brain-sync** — Context persistence, learnings capture
- **project-architect** — Tech stack validation, decision matrices
- **Accessibility best practices** — WCAG 2.1 AA compliance baked in
- **PWA best practices** — Offline-first, performance-optimized

---

## 🚀 Next Steps

### For Implementation (Phase 1)
```bash
# 1. Create GitHub repo
git init atlantasaddleclub-pwa
cd atlantasaddleclub-pwa

# 2. Initialize Next.js
npx create-next-app . --typescript --tailwind

# 3. Set up folder structure
# Use folder structure from ARCHITECTURE_COMPLETE.md

# 4. Initialize database
supabase link --project-ref your_project_id
supabase db push

# 5. Set up Strapi
cd strapi && npm install && npm start

# 6. Configure environment variables
cp .env.example .env.local
```

### For Admin Onboarding
1. Email admin@atlantasaddleclub.com with login credentials
2. Provide admin walkthrough (see ADMIN_UX_WIREFRAMES.md)
3. Have admin customize branding (colors, fonts, logo)
4. Have admin create 3+ blog posts
5. Have admin add upcoming events
6. Test push notifications end-to-end

---

## 📚 Documentation Structure

All documents follow this structure:
1. **Purpose** — Why this exists
2. **Architecture/Design** — How it works
3. **Implementation** — Code examples
4. **Configuration** — Setup instructions
5. **Testing** — How to verify it works
6. **Troubleshooting** — Common issues + fixes

---

## 💬 Support & Questions

**Architecture Questions:**
- See `ARCHITECTURE_COMPLETE.md` > Architecture section
- See `PWA_CONFIGURATION.md` for PWA-specific questions

**Admin Questions:**
- See `ADMIN_UX_WIREFRAMES.md` for UI layout
- See `DEPLOYMENT_GUIDE.md` > Phase 9: Post-Launch > Admin Onboarding

**Accessibility Questions:**
- See `ACCESSIBILITY_CHECKLIST.md` for WCAG compliance
- Reference: https://www.w3.org/WAI/WCAG21/quickref/

**Deployment Questions:**
- See `DEPLOYMENT_GUIDE.md` for step-by-step instructions
- Troubleshooting section covers common issues

---

## 📈 Project Status

**Current Phase:** Architecture Complete ✓  
**Next Phase:** Phase 1 Implementation (Repo + Scaffolding)  
**Estimated Timeline:** 11-12 weeks to launch  
**Team Size:** 1-2 developers recommended

### Phase Completion Targets
- [ ] Phase 1 (Weeks 1-2): Foundation
- [ ] Phase 2 (Weeks 3-4): Public Pages
- [ ] Phase 3 (Weeks 5-6): Admin System
- [ ] Phase 4 (Weeks 7-8): Offline + PWA
- [ ] Phase 5 (Weeks 9-10): Notifications + Polish
- [ ] Phase 6 (Week 11): Deployment & Launch

---

**Project Owner:** Atlanta Saddle Club Association  
**Architecture By:** Amp (Sourcegraph) — Oracle-Genesis Mode  
**Created:** January 26, 2026  
**Updated:** January 26, 2026

---

**Let's build something that inspires. 🐴**
