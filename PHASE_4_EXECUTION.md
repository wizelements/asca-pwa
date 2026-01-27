# Phase 4: Content Migration & Email Setup - Full Execution

## Overview

Complete step-by-step plan to migrate content from atlantasaddleclub.com to ASCA PWA and configure email notifications.

**Timeline:** 5-7 days
**Status:** Ready to execute

---

## Day 1: Setup & Dependencies

### 1.1 Install Packages
```powershell
cd C:\Users\jacla\projects\asca-pwa
npm install resend dotenv
```

**Result:** ✓ Resend package installed

### 1.2 Verify Environment
```bash
npm run type-check
npm run build
```

**Verify:**
- [ ] No TypeScript errors
- [ ] Build completes successfully

---

## Day 2: Email Configuration

### 2.1 Create Resend Account
1. Go to https://resend.com
2. Sign up with email
3. Create API key in **API Keys** section
4. Copy key (format: `re_xxxxxxxxxxxx`)

**Save:** `RESEND_API_KEY`

### 2.2 Update Environment Variables

**In `.env.local`:**
```env
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=noreply@asca-pwa.org
RESEND_FROM_NAME=Atlanta Saddle Club Association
ADMIN_EMAIL=admin@atlantasaddleclub.org
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

**In Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add same 4 vars to `production`, `preview`, `development`
3. Deploy (triggers redeploy of all branches)

### 2.3 Configure Cloudflare DNS

**Goal:** Verify email domain with Resend

**Steps:**

1. **In Resend Dashboard:**
   - Go to **Domains**
   - Click **Add Domain**
   - Enter: `asca-pwa.org` (or your domain)
   - Resend shows 3 DNS records needed

2. **In Cloudflare Dashboard:**
   - Domain → DNS → Records
   - Add these 3 records from Resend:
     - MX record
     - SPF TXT record
     - DKIM CNAME record
   - Wait 5-10 minutes for propagation

3. **Back in Resend:**
   - Click "Verify Domain"
   - Should show green checkmark ✓

**Result:** ✓ Email domain verified

---

## Day 3: Database Seeding

### 3.1 Run Seed Script
```bash
npm run db:seed
```

**Creates:**
- ✓ Admin user (admin@ascapwa.org / AsCA2024!Secure)
- ✓ Theme (ASCA brand colors)
- ✓ Settings (contact, social, Venmo)
- ✓ 4 sample events
- ✓ 4 sample members
- ✓ 1 sample blog post
- ✓ 3 sample gallery images

**Verify:**
```powershell
# Check in MongoDB compass or cli
db.users.findOne({ role: "admin" })
db.themes.findOne({})
db.settings.findOne({})
```

### 3.2 Test Email Sending

**Create test file:** `/scripts/test-email.js`
```javascript
require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: 'your-email@example.com',
    subject: 'Test Email from ASCA PWA',
    html: '<h1>Hello!</h1><p>Email system working.</p>',
  });
  console.log(result);
}

test().catch(console.error);
```

**Run:**
```bash
node scripts/test-email.js
```

**Verify:**
- [ ] Email arrives in inbox
- [ ] Sender name shows "Atlanta Saddle Club Association"
- [ ] Email in Resend dashboard shows "Delivered"

**Result:** ✓ Email sending works

---

## Day 4: Content Population - Pages

### 4.1 Update HOME Page

**File:** `/app/page.tsx`

Content:
```
Hero Section:
- Title: "We Ride To Inspire"
- Subtitle: "Promoting horsemanship, sportsmanship, and community"
- Image: Upload to /public/images/hero-home.jpg
- CTA Buttons: Learn More, Join Us, Donate

Featured Section:
- 3 recent blog posts
- Upcoming events
- Member spotlight
```

### 4.2 Update ABOUT Page

**File:** `/app/about/page.tsx`

Sections:
1. Hero with image
2. "What We Do" - ASCA sponsors and promotes...
3. "Who We Are" - Purpose statement
4. "Our Mission" - 2-3 paragraph mission statement
5. Team/Leadership section
6. Call to action "Join Us"

### 4.3 Update GET-INVOLVED Page

**File:** `/app/get-involved/page.tsx`

Content:
1. Hero image + title
2. 4 action cards:
   - **Become a Member** - Role selection, experience level
   - **Volunteer** - Opportunity selection, availability
   - **Contact Us** - General inquiries
   - **Donate** - "Funds give us opportunity to give back..."

### 4.4 Update DONATE Page

**File:** `/app/donate/page.tsx`

Content:
1. Mission statement about community support
2. Venmo integration (username: `@therealasca1`)
3. Suggested amounts: $10, $25, $50, $100
4. Custom amount option
5. Tax deductibility note (if applicable)

### 4.5 Update Other Pages

**CALENDAR** (`/app/calendar/page.tsx`):
- Display events from MongoDB
- Show RSVP button
- Add to calendar (download .ics)

**MEMBERS** (`/app/members/page.tsx`):
- Display all members
- Filter by role (rider, volunteer, instructor)
- Featured members highlighted

**BLOG** (`/app/blog/page.tsx`):
- List all published posts
- Featured post first
- Search/filter

**Result:** ✓ All 7 public pages populated

---

## Day 5: Content Admin Population

### 5.1 Add Events

**Via Admin Dashboard:** `/admin/events`

Events to add (from original site):
1. Monthly Members Meetings (2nd Sunday each month)
2. Group Trail Rides (Saturdays, various locations)
3. Riding Lessons (Tuesdays/Thursdays)
4. Seasonal Campouts
5. Special Events (holiday parties, etc.)

**Per event:**
- Title
- Description
- Date & Time
- Location
- Type (ride, lesson, meeting, campout)
- Capacity
- Featured (checkbox)

### 5.2 Add Members

**Via Admin Dashboard:** `/admin/members`

Add leadership team:
- Clariece Pinkney (Instructor)
- [Get actual members from stakeholder]

**Per member:**
- Name
- Role (rider, volunteer, instructor)
- Bio (3-4 sentences)
- Email
- Phone
- Join date
- Photo (optional)
- Featured (checkbox)

### 5.3 Add Blog Posts

**Via Admin Dashboard:** `/admin/blog`

Posts:
1. "Benefits of Equine Assisted Therapy" (already seeded)
2. [Add other posts if available from original site]

**Per post:**
- Title
- Slug (auto-generated)
- Excerpt
- Content (rich text)
- Featured image + alt text
- Author name
- Publish date

### 5.4 Upload Gallery Images

**Via Admin Dashboard:** `/admin/gallery`

Categories: rides, lessons, meetings, events

**Per image:**
- Upload file
- Title
- Alt text (required)
- Description
- Category
- Featured (checkbox)

**Result:** ✓ All content populated via admin UI

---

## Day 6: Image Optimization & Upload

### 6.1 Download Images from Original Site
```bash
# Visit atlantasaddleclub.com and download:
# - Hero images
# - Gallery photos
# - Member headshots
# - Logo files

# Save to: C:\Users\jacla\projects\asca-pwa\public\images\
```

### 6.2 Optimize Images

**Tools:** TinyPNG, ImageOptim

**Sizes:**
- Hero: 1200x400 (JPG, < 100KB)
- Gallery: 800x600 (JPG, < 150KB)
- Members: 300x300 (JPG, < 50KB)
- Logo: PNG with transparency, < 100KB

### 6.3 Add Alt Text

**All images must have descriptive alt text:**
- "ASCA members riding horses on trail"
- "Beginner riding lesson at facility"
- "Clariece Pinkney, lead instructor"
- "Atlanta Saddle Club Association logo"

**Result:** ✓ All images optimized and uploaded

---

## Day 7: Testing & Deployment

### 7.1 Test All Forms

**In local dev:**
```bash
npm run dev
```

**Visit each form and submit:**
1. `/get-involved` → Contact form
2. `/get-involved` → Membership application
3. `/get-involved` → Volunteer signup
4. `/donate` → Donation form (test with dummy Venmo)

**Verify:**
- [ ] Form submits without error
- [ ] Admin receives email notification
- [ ] Email contains all form data
- [ ] Email looks professional
- [ ] No console errors

### 7.2 Test Mobile Responsiveness

**Using Chrome DevTools (F12):**
- [ ] iPhone 12 (390x844)
- [ ] iPad (768x1024)
- [ ] Android (360x640)

**Check:**
- [ ] Text readable
- [ ] Images responsive
- [ ] Buttons clickable
- [ ] Forms work on mobile

### 7.3 Lighthouse Audit

```bash
npm run build
npm start
# Visit http://localhost:3000
# F12 → Lighthouse → Generate report
```

**Targets:**
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 90+
- [ ] SEO: 90+

### 7.4 Deploy to Production

```bash
# Push to GitHub
git add .
git commit -m "Phase 4: Content migration, email setup, and image optimization"
git push origin main

# Vercel auto-deploys
# Monitor: https://vercel.com/projects/asca-pwa
```

**Verify:**
- [ ] Deployment completes without errors
- [ ] Live at https://asca-pwa.vercel.app
- [ ] All pages load correctly
- [ ] Forms work on production
- [ ] Emails send from production domain

### 7.5 DNS Cutover (Optional)

If moving from old domain to new:

**Option A: Subdomain**
- Keep old domain, point `asca-pwa.yourdomain.com` to Vercel

**Option B: Full Migration**
1. Update Cloudflare nameservers to Vercel
2. Add domain to Vercel project
3. Update all links in Resend
4. Redirect old site to new

---

## Final Checklist

- [ ] **Day 1:** Dependencies installed
- [ ] **Day 2:** Resend configured, DNS verified
- [ ] **Day 3:** Database seeded, email tested
- [ ] **Day 4:** All 7 pages updated with content
- [ ] **Day 5:** Admin panel populated with events/members/blog/gallery
- [ ] **Day 6:** Images optimized and uploaded
- [ ] **Day 7:** All forms tested, mobile responsive, Lighthouse 90+, deployed

---

## Post-Launch Tasks (Phase 5)

1. **Email Notifications**
   - Admin receives form submissions
   - Event reminder emails (48h before)
   - Donation receipts

2. **Offline Support**
   - Service worker registration
   - IndexedDB queue for forms
   - Sync when online

3. **Analytics**
   - Vercel Analytics
   - Form submission tracking
   - Page view metrics

4. **Team Training**
   - How to add events
   - How to manage members
   - How to post blog articles
   - How to edit theme/settings

5. **Push Notifications** (Firebase)
   - New events announcement
   - Reminder 48h before event
   - Opt-in only

---

## Support & Reference

- **Email Templates:** `/lib/email.ts`
- **Form Handler:** `/app/api/forms/route.ts`
- **Content Migration Guide:** `CONTENT_MIGRATION_GUIDE.md`
- **Resend Setup:** `RESEND_SETUP.md`
- **Admin Dashboard:** `/app/admin/`
- **Database Models:** `/lib/models/`

---

**Status:** Ready to execute
**Estimated Duration:** 5-7 days
**Next Milestone:** Phase 5 - Feature completion & offline support
