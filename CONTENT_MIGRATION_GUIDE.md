# ASCA PWA - Content Migration Guide

## Overview

This guide walks through migrating content from atlantasaddleclub.com to the new ASCA PWA at asca-pwa.vercel.app.

**Status:** Phase 4 - Content Population

---

## Step 1: Install Dependencies & Setup

```bash
cd projects/asca-pwa

# Install packages
npm install

# Install Resend for email
npm install resend

# Verify MongoDB connection
npm run type-check
```

---

## Step 2: Configure Environment

**Update `.env.local` with:**

```env
# MongoDB
MONGODB_URI=mongodb+srv://asca-admin:password@cluster.mongodb.net/asca-pwa

# NextAuth
NEXTAUTH_SECRET=generate-random-secret-here
NEXTAUTH_URL=https://asca-pwa.vercel.app

# Resend Email
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@asca-pwa.org
RESEND_FROM_NAME=Atlanta Saddle Club Association
ADMIN_EMAIL=admin@atlantasaddleclub.org
```

**In Vercel Dashboard** → Add same vars to production/preview/development environments.

---

## Step 3: Seed Initial Data

Run the seed script to populate basic content:

```bash
npm run db:seed
```

This creates:
- ✓ Admin user (admin@ascapwa.org)
- ✓ Theme (brand colors)
- ✓ Settings (contact info, social links, Venmo)
- ✓ Sample events (4 upcoming events)
- ✓ Sample members (leadership team)
- ✓ Sample blog post
- ✓ Sample gallery images

---

## Step 4: Content by Page

### HOME Page (`/`)
**From:** atlantasaddleclub.com hero section

- **Heading:** "We Ride To Inspire"
- **Subheading:** "Promoting horsemanship, sportsmanship, and community"
- **Hero Image:** Upload to `/public/images/hero-home.jpg`
- **Action Buttons:** 
  - "Learn More" → `/about`
  - "Join Us" → `/get-involved`
  - "Give" → `/donate`

**Update in:** `/app/page.tsx`

### ABOUT Page (`/about`)
**From:** atlantasaddleclub.com/about

**Content:**
```markdown
## What We Do
ASCA sponsors and promotes horse trail rides, horseback riding lessons, camp outs 
and other activities of various kinds.

## Who We Are
The purpose of ASCA is to promote a knowledge of horsemanship, to disseminate 
any general information relating to handling and training horses, and to encourage 
and develop sportsmanship among members and the local community.

## Our Mission
We are dedicated to promoting equine-assisted activities that benefit both 
experienced and beginner riders. Through our programs, we build community, 
foster sportsmanship, and create lasting connections between people and horses.

## History
[ADD history section if available from stakeholder]
```

**Update in:** `/app/about/page.tsx`

### MEMBERS Page (`/members`)
**From:** Site team/leadership list

**Add these members via admin dashboard or database:**

| Name | Role | Bio | Email | Join Date |
|------|------|-----|-------|-----------|
| Clariece Pinkney | Instructor | 15+ years experience | clariece@... | 2015-05-10 |
| [Add others] | rider/volunteer/instructor | ... | ... | ... |

**Update:** Via `/admin/members` panel

**Can filter by role:**
- rider
- volunteer
- instructor
- founder

### CALENDAR Page (`/calendar`)
**From:** Original site events

**Events to add:**

1. Monthly Members Meeting (15th each month)
2. Group Trail Rides (Saturdays)
3. Riding Lessons (Tuesdays/Thursdays)
4. Seasonal Events (Spring Campout, Holiday Party, etc.)

**Add via:** `/admin/events` dashboard
- Title, Date, Time, Location
- RSVP limit
- Description with alt text for images

### BLOG Page (`/blog`)
**From:** atlantasaddleclub.com/blog

**First post already seeded:**
- "Benefits of Equine Assisted Therapy" by Clariece Pinkney

**Add more posts via:** `/admin/blog`
- Include featured image with alt text
- Add author name
- Set publication date

### DONATE Page (`/donate`)
**From:** Current Venmo setup

**Venmo Details (already configured in Settings):**
- Username: `@therealasca1`
- Suggested amounts: $10, $25, $50, $100
- Allow custom amounts

**Update donation messaging in:** `/app/donate/page.tsx`

**Message template:**
```
Funds that the club collects gives us the opportunity to give back to the community. 
We value our local community and desire to be an asset for both the young and the young at heart.
```

### GET-INVOLVED Page (`/get-involved`)
**From:** Original site CTA

**Forms available:**
1. **Membership Application** - Role (rider/volunteer/instructor)
2. **Volunteer Signup** - Opportunity selection
3. **Contact Form** - General inquiries
4. **Donation** - Support ASCA

**Update in:** `/app/get-involved/page.tsx`

---

## Step 5: Upload Images

**Directory structure in `/public/images/`:**

```
/public/images/
  /hero/
    - home.jpg
    - about.jpg
  /gallery/
    - trail-ride-1.jpg
    - lesson-1.jpg
    - campout-1.jpg
    - [add more]
  /members/
    - clariece.jpg
    - [add more leadership photos]
  /logo/
    - asca-logo.png
    - asca-logo-white.png
```

**Requirements:**
- All images need **alt text** (enforced in admin)
- Optimize sizes: Hero (1200x400), Gallery (800x600), Members (300x300)
- Use tools: TinyPNG, ImageOptim for compression
- Formats: JPG (photos), PNG (logos with transparency)

### Add via Admin:
1. Go to `/admin/gallery` 
2. Upload image
3. Fill in title + alt text
4. Set category (rides, lessons, meetings, events)

---

## Step 6: Configure Settings

**Via `/admin/settings`:**

| Setting | Value |
|---------|-------|
| Site Title | Atlanta Saddle Club Association |
| Description | We Ride To Inspire |
| Contact Email | info@atlantasaddleclub.org |
| Phone | (404) 555-0123 |
| Address | Atlanta, Georgia |
| Facebook | https://www.facebook.com/ASCAHorsemen |
| Instagram | https://www.instagram.com/ascahorsemen/ |
| YouTube | https://www.youtube.com/channel/UCHqFOgNrYRSvbwVAJ4zphqw |
| Venmo Username | therealasca1 |
| Venmo Presets | 10, 25, 50, 100 |

---

## Step 7: Customize Theme

**Via `/admin/theme`:**

| Color | Hex Code |
|-------|----------|
| Dark | #1a1a1a |
| Olive | #4a4b02 |
| Gold | #f5d800 |
| White | #ffffff |

(Already set in theme seed, but can be adjusted here)

---

## Step 8: Test Forms & Email

### Test Contact Form:
```bash
# In development
npm run dev

# Visit http://localhost:3000/get-involved
# Fill contact form
# Check console for email logs
```

### Verify Resend Setup:
1. Go to Resend Dashboard
2. Check **Emails** tab
3. Should see delivery status

### Configure Cloudflare DNS:

**If using `asca-pwa.org` domain:**

1. Add MX record in Cloudflare:
   - Name: `asca-pwa.org`
   - Value: `feedback-dsn.com`

2. Add SPF record:
   - Name: `asca-pwa.org`
   - Value: `v=spf1 include:sendmail.resend.com ~all`

3. Verify domain in Resend dashboard

See **RESEND_SETUP.md** for detailed instructions.

---

## Step 9: Deploy to Production

```bash
# Push to GitHub
git add .
git commit -m "Phase 4: Content migration and email setup"
git push origin main

# Auto-deploys to Vercel
# Monitor: https://vercel.com/projects/asca-pwa
```

---

## Step 10: Launch Checklist

- [ ] All 7 public pages populated with content
- [ ] Admin dashboard tested
- [ ] Forms send emails correctly
- [ ] Images optimized and display properly
- [ ] Mobile responsive (test on phone/tablet)
- [ ] Lighthouse score 90+ (run: `npm run build && npm start`)
- [ ] DNS records configured in Cloudflare
- [ ] Resend domain verified
- [ ] Environment variables in Vercel
- [ ] Content backed up
- [ ] Team trained on admin panel

---

## Ongoing Maintenance

### Regular Tasks:
- **Weekly:** Check form submissions (email notifications)
- **Monthly:** Post to blog/gallery
- **Monthly:** Update events calendar
- **Quarterly:** Review member list, update featured content

### Scripts Available:
```bash
npm run dev          # Local development
npm run build        # Production build
npm run lint         # Code quality check
npm run type-check   # TypeScript check
npm run db:seed      # Repopulate database
npm run db:migrate   # Run migrations (if added)
```

---

## Support

**Questions about:**
- Content format: See page components in `/app/[page]/page.tsx`
- Form handling: See `/app/api/forms/route.ts`
- Email templates: See `/lib/email.ts`
- Database models: See `/lib/models/`

---

## What's Next (Phase 5)

1. **Email Notifications** - Admin receives form submissions
2. **Offline Forms** - Service worker + IndexedDB queue
3. **Push Notifications** - Firebase Cloud Messaging (opt-in)
4. **Member Export** - CSV export for volunteer assignments
5. **Event Reminders** - Email reminders before events
6. **Analytics** - Track page views, form submissions

