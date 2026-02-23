# ASCA PWA Logo & Brand Assets

**Created:** February 22, 2026  
**Brand Colors:** Forest Green (#1f6b3a), Cream (#f7f3ea)  
**Designer:** AI Logo Generator (PIL + SVG)

---

## Logo Overview

A stylized horse head logo designed specifically for the Atlanta Saddle Club Association PWA. The logo features:

- **Horse Head Profile** — Centered, looking forward with expressive eye
- **Mane Design** — Three flowing strokes suggesting movement and elegance
- **Ears** — Rounded, alert posture with inner details
- **Snout & Nostrils** — Subtle cream accents for realism
- **Neck** — Transitions into shoulder base
- **Color Scheme** — Forest green primary (#1f6b3a) with cream (#f7f3ea) accents

---

## File Structure

```
public/
├── icons/
│   ├── horse-logo.svg                    # Source vector (500x500)
│   ├── icon-192.png                      # App icon (192x192)
│   ├── icon-192-maskable.png             # PWA maskable variant
│   ├── icon-512.png                      # Large app icon (512x512)
│   ├── icon-512-maskable.png             # PWA maskable variant
│   └── shortcut-events-96.png            # Quick action icon
└── screenshots/
    ├── narrow.png                        # Mobile screenshot (540x720)
    └── wide.png                          # Tablet screenshot (1280x720)
```

---

## Asset Specifications

### SVG Logo
- **Format:** Scalable Vector Graphics
- **Size:** 500x500 viewBox
- **File:** `horse-logo.svg`
- **Use Case:** Print, web scaling, source for other formats
- **Colors:** Forest Green (#1f6b3a), Cream (#f7f3ea), White, Black (pupil)
- **Best For:** Logo marks, branding guidelines, large displays

### PNG Icons (Standard)
| Filename | Size | Purpose | Notes |
|----------|------|---------|-------|
| icon-192.png | 192x192 | Android home screen, small devices | App launcher icon |
| icon-512.png | 512x512 | PWA splash screens, large displays | Largest variant |
| shortcut-events-96.png | 96x96 | Quick action shortcut | Home screen shortcut |

### PNG Icons (Maskable)
| Filename | Size | Purpose | Notes |
|----------|------|---------|-------|
| icon-192-maskable.png | 192x192 | PWA install (adaptive icons) | Safe area within 80% |
| icon-512-maskable.png | 512x512 | PWA install (splash screens) | Safe area within 80% |

**What are maskable icons?**  
Maskable icons allow the OS to apply different shapes (circle, teardrop, square) while keeping content visible. Content stays within the inner 80% (100px padding on 512px icon).

### Screenshots
| Filename | Size | Purpose | Notes |
|----------|------|---------|-------|
| narrow.png | 540x720 | Mobile display mockup | Portrait orientation |
| wide.png | 1280x720 | Tablet/desktop mockup | Landscape orientation |

**What are screenshots for?**  
PWA manifests include screenshots to show app preview before install. These are displayed in the install dialog on supporting browsers/OS.

---

## Manifest Integration

The logo assets are already integrated into `public/manifest.json`:

```json
{
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192-maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/narrow.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/wide.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ]
}
```

---

## Usage Guidelines

### For Web
- **Logo Placement:** Header, footer, loading screens
- **Size:** 64px-512px (SVG recommended for scaling)
- **Spacing:** Minimum 16px clear space around logo
- **Color:** Forest Green (#1f6b3a) on light backgrounds, White/Cream on dark

### For Mobile Apps
- Use `icon-192.png` for standard displays
- Use `icon-512-maskable.png` for adaptive icon systems
- No modifications needed — Android/iOS handles rendering

### For PWA Install
- Manifest automatically uses correct icons
- Browser displays `icon-192.png` in install dialog
- OS generates splash screen from `icon-512-maskable.png`
- Screenshots preview app before install

### For Print
- Export SVG at desired size
- Convert to PDF for highest quality
- Use CMYK color space (approximate #1f6b3a → Forest Green CMYK)

---

## Brand Colors

### Primary
**Forest Green**
- Hex: #1f6b3a
- RGB: 31, 107, 58
- CMYK: 71%, 0%, 46%, 58%
- HSL: 145°, 55%, 27%

### Accent
**Cream**
- Hex: #f7f3ea
- RGB: 247, 243, 234
- CMYK: 0%, 2%, 5%, 3%
- HSL: 30°, 67%, 95%

### Complementary (Established)
**White** — #ffffff (highlights, eyes)  
**Black** — #000000 (pupils, details)

---

## Customization

### Regenerating Assets
To regenerate logo assets with modifications:

```bash
cd scripts
python generate-logos.py
```

The script will:
1. Create fresh SVG logo
2. Generate all PNG sizes
3. Create maskable variants
4. Generate app screenshots
5. Place files in correct directories

### Modifying the Logo
Edit `scripts/generate-logos.py`:

```python
# Change colors
FOREST_GREEN = "#1f6b3a"    # Edit this
CREAM = "#f7f3ea"           # Edit this

# Modify SVG path
# Edit create_horse_svg() function for shape changes
```

Then regenerate:
```bash
python generate-logos.py
```

---

## Testing

### Verify Icons Display Correctly
1. Open browser DevTools (F12)
2. Go to Application → Manifest
3. Click on each icon path
4. Verify image loads without errors

### Test PWA Install
1. Open https://asca-pwa.vercel.app
2. Click install prompt (address bar or menu)
3. Verify logo appears in install dialog
4. Verify icon appears on home screen after install
5. Verify adaptive icon shapes on Android (Settings → Apps)

### Check Sizes
```bash
# Verify PNG dimensions
file public/icons/*.png
```

---

## Lighthouse Impact

- **PWA Audit:** Correct icon sizes increase PWA score
- **Maskable Icons:** +5 points for proper adaptive support
- **Performance:** Optimized PNG sizes (1-3KB each)

**Current sizes:**
- icon-192.png: 1.0 KB
- icon-512.png: 3.2 KB
- shortcut-events-96.png: 0.5 KB
- Total: ~5 KB (negligible impact)

---

## Future Enhancements

### Phase 4 (Optional)
- Add multiple logo variants (icon-only, horizontal, with text)
- Create dark mode variants
- Generate logo animation (CSS/SVG)

### Phase 5 (Optional)
- Animated splash screen during PWA launch
- Logo used in email headers (Resend integration)
- Logo used in push notification icons (Firebase)

---

## Credits & Attribution

- **Logo Design:** Procedurally generated with PIL (Python Imaging Library)
- **Brand Colors:** ASCA equestrian theme (forest green for nature, cream for heritage)
- **SVG Structure:** Custom vector paths optimized for web
- **Maskable Design:** Follows PWA Icon Guidelines (W3C)

---

## Questions?

Refer to:
- `public/manifest.json` — Full PWA manifest
- `scripts/generate-logos.py` — Logo generation code
- `PHASE_3_IMPLEMENTATION_PLAN.md` — PWA testing checklist

