# PWA Installation Testing Checklist

## Automated Checks (DevTools)

### Chrome/Edge
```powershell
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Run audit with "Mobile" device
# 4. Check for PWA errors in console
```

### Firefox
```bash
# 1. Open DevTools → Application → Manifest
# 2. Verify manifest.json loads without errors
# 3. Check for HTTPS warnings
```

---

## Manual Tests

### Desktop (Chrome)
- [ ] Navigate to https://asca-pwa.vercel.app
- [ ] Click install icon in address bar (should appear within 2s)
- [ ] Install app, verify launch works
- [ ] Go offline (DevTools → Network → Offline)
- [ ] Verify offline.html displays
- [ ] Test RSVP form submission queues in IndexedDB

### Android (Chrome)
- [ ] Open in Chrome, tap menu → "Install app" (if visible)
- [ ] Grant permissions (home screen, notifications)
- [ ] Verify app launches from home screen
- [ ] Close Chrome, disable WiFi, open app
- [ ] Verify cached pages load

### iOS (Safari 14.5+)
- [ ] Open in Safari, tap Share → Add to Home Screen
- [ ] Name: "ASCA"
- [ ] Verify app launches in fullscreen (no Safari UI)
- [ ] Test offline access (offline.html should display)
- [ ] Check status bar display (black vs white)

---

## Manifest Validation

| Property | Expected | Status |
|----------|----------|--------|
| `name` | Atlanta Saddle Club Association | ✓ |
| `short_name` | ASCA | ✓ |
| `theme_color` | #1f6b3a (forest green) | ✓ |
| `background_color` | #f7f3ea (cream) | ✓ |
| `display` | standalone | ✓ |
| `start_url` | / | ✓ |
| `icons` (192x192) | maskable PNG | ✓ |
| `icons` (512x512) | maskable PNG | ✓ |
| `screenshots` | narrow + wide | ✓ |
| `shortcuts` | Events, Join, Donate, Members | ✓ |

---

## Core Web Vitals Check

Run in DevTools Console:

```javascript
// Check if metrics are available
if ('web-vital' in window) {
  console.log('Web Vitals available');
} else {
  console.log('No Web Vitals library');
}

// Manual LCP check
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.renderTime || entry.loadTime);
  }
}).observe({entryTypes: ['largest-contentful-paint']});

// CLS check
let cls = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      cls += entry.value;
      console.log('CLS update:', cls);
    }
  }
}).observe({entryTypes: ['layout-shift']});
```

---

## Checklist Results

- [ ] PWA installable on desktop
- [ ] PWA installable on Android
- [ ] PWA installable on iOS 14.5+
- [ ] Offline mode works (cached content loads)
- [ ] Offline form submission queues
- [ ] No console errors (DevTools)
- [ ] Lighthouse PWA score >= 90
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] FID < 100ms

---

## Known Issues

None currently identified. Monitor for:
- Service Worker update delays
- Cache invalidation timing
- IndexedDB quota limits
