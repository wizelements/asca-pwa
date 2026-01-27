# Phase 4: Quick Start (5-7 Days)

## TL;DR

1. Get Resend API key
2. Update `.env.local` with key
3. Add DNS records to Cloudflare
4. Run `npm install resend && npm run db:seed`
5. Test form at `/get-involved`
6. Populate admin dashboard with content
7. Deploy

---

## 1. Resend Setup (30 minutes)

```bash
# Sign up: https://resend.com
# Create API key
# Copy key to .env.local

RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=noreply@asca-pwa.org
ADMIN_EMAIL=admin@atlantasaddleclub.org
```

---

## 2. Install & Seed (10 minutes)

```bash
npm install resend dotenv
npm run db:seed
npm run dev
```

Visit: http://localhost:3000/get-involved

---

## 3. Configure Cloudflare DNS (5 minutes)

Resend Dashboard → Add Domain → Copy DNS records → Paste in Cloudflare → Verify

---

## 4. Add Content via Admin (2-3 hours)

```
http://localhost:3000/admin
- Events (add upcoming rides, lessons, meetings)
- Members (add leadership team)
- Blog (post articles)
- Gallery (upload photos with alt text)
- Settings (verify contact info)
- Theme (lock brand colors)
```

---

## 5. Deploy (5 minutes)

```bash
git add .
git commit -m "Phase 4: Content migration & email"
git push origin main
```

**Live at:** https://asca-pwa.vercel.app

---

## What You Get

✓ Email notifications for all forms
✓ 7 public pages with real content
✓ Admin dashboard for non-technical staff
✓ 4 form types (contact, membership, volunteer, donation)
✓ Events with RSVP
✓ Member directory with filters
✓ Blog with rich content
✓ Gallery with alt text
✓ Customizable theme
✓ Social links & Venmo integration

---

## Next: Phase 5

- Email reminders for events
- Offline form queue
- Push notifications
- Analytics
