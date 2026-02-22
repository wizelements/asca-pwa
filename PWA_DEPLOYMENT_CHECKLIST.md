# ASCA PWA Deployment Checklist

## Pre-Deployment (Local Testing)

### Build & Test
- [ ] Run `pnpm install` to ensure dependencies
- [ ] Run `pnpm build` to compile Next.js
- [ ] Run `pnpm start` to test production build locally
- [ ] Test on `http://localhost:3000`

### Service Worker
- [ ] Open DevTools (F12) → Application tab
- [ ] Check Service Workers section
- [ ] Verify `sw.js` is registered and active
- [ ] Check Cache Storage for precached assets

### PWA Installation
- [ ] Open DevTools → Application → Manifest
- [ ] Verify all manifest fields are correct:
  - [ ] name, short_name, description
  - [ ] theme_color: #1f6b3a
  - [ ] background_color: #f7f3ea
  - [ ] display: standalone
  - [ ] icons (192, 512, maskable variants)
  - [ ] screenshots
  - [ ] shortcuts
- [ ] Test "Add to Home Screen" (Chrome/Edge)
- [ ] Test Apple Web App (iOS)

### Offline Testing
- [ ] Open DevTools → Network tab
- [ ] Enable "Offline" mode
- [ ] Navigate to different pages
- [ ] Verify cached content loads
- [ ] Check offline.html displays correctly

### Performance
- [ ] Open DevTools → Lighthouse
- [ ] Run PWA audit
- [ ] Verify score is 90+
- [ ] Check all PWA checkmarks pass:
  - [ ] Installable
  - [ ] Has icons
  - [ ] Starts in standalone mode
  - [ ] Has theme color
  - [ ] Has splash screen

### Admin Testing
- [ ] Navigate to `/admin`
- [ ] Verify dashboard loads
- [ ] Check API endpoints:
  - [ ] `/api/admin/stats` returns data
  - [ ] `/api/admin/activity` returns data
- [ ] Test all sidebar navigation links
- [ ] Verify responsive design (mobile, tablet, desktop)
- [ ] Test sidebar collapse/expand

### Mobile Testing (iOS/Android)
- [ ] Test on iPhone:
  - [ ] Add to Home Screen works
  - [ ] App launches in standalone mode
  - [ ] Touch icons display correctly
  - [ ] Status bar styling works
- [ ] Test on Android:
  - [ ] PWA install prompt appears
  - [ ] App launches in standalone mode
  - [ ] Offline functionality works

---

## Vercel Deployment

### Environment Variables
- [ ] All `.env.local` variables set in Vercel project
- [ ] Database connection strings configured
- [ ] API keys secured

### Deploy
```bash
git add .
git commit -m "feat: complete PWA implementation with service worker and admin dashboard"
git push origin main
```

### Post-Deployment
- [ ] Verify deployment successful on Vercel
- [ ] Test public URL (`https://asca-pwa.vercel.app`)
- [ ] Run Lighthouse audit on deployed version
- [ ] Verify PWA is installable on production
- [ ] Test offline functionality on production
- [ ] Check all pages load correctly
- [ ] Verify admin panel is accessible
- [ ] Test all API endpoints

---

## Monitoring

### Set Up Monitoring
- [ ] Configure Vercel Analytics
- [ ] Set up error tracking (Sentry optional)
- [ ] Monitor Service Worker issues
- [ ] Track PWA installation analytics

### Regular Checks
- [ ] Weekly: Verify deployment is live
- [ ] Weekly: Check error logs
- [ ] Monthly: Re-run Lighthouse audit
- [ ] Monthly: Test PWA installation

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Lighthouse PWA | 90+ | ⏳ |
| LCP | < 2.5s | ⏳ |
| FID | < 100ms | ⏳ |
| CLS | < 0.1 | ⏳ |
| TTFB | < 600ms | ⏳ |

---

## File Checklist

- [x] `public/manifest.json` - Updated with complete config
- [x] `public/sw.js` - Service Worker implementation
- [x] `public/offline.html` - Offline fallback page
- [x] `app/layout.tsx` - Service Worker registration
- [x] `app/globals.css` - Global styles
- [x] `app/admin/page.tsx` - Admin dashboard
- [x] `app/admin/layout.tsx` - Admin layout with sidebar
- [x] `app/api/admin/stats/route.ts` - Stats endpoint
- [x] `app/api/admin/activity/route.ts` - Activity endpoint
- [x] `next.config.js` - PWA optimizations

---

## Icons & Assets Needed

Create these in `/public/icons/`:
- [ ] `icon-192.png` (192x192)
- [ ] `icon-512.png` (512x512)
- [ ] `icon-192-maskable.png` (192x192, adaptive)
- [ ] `icon-512-maskable.png` (512x512, adaptive)

Create these in `/public/icons/shortcuts/`:
- [ ] `calendar-96.png` (96x96)
- [ ] `join-96.png` (96x96)
- [ ] `members-96.png` (96x96)
- [ ] `donate-96.png` (96x96)

Create these in `/public/screenshots/`:
- [ ] `narrow-540x720.png` (540x720, portrait)
- [ ] `wide-1280x720.png` (1280x720, landscape)

---

## Next Steps

1. Generate PWA icons (use design tool or icon service)
2. Test on real devices (iOS + Android)
3. Gather user feedback on PWA experience
4. Plan Phase 2:
   - [ ] Complete CRUD operations for all admin sections
   - [ ] User authentication & authorization
   - [ ] Advanced caching strategies
   - [ ] Push notifications
   - [ ] Offline form submission with sync
