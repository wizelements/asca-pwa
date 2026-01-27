# 🖼️ Images Guide - Replacing Placeholders

**Status:** All SVG placeholders created and deployed ✅

---

## Current Image Setup

All image directories exist with **SVG placeholder images**:

```
public/images/
├── hero/
│   ├── home.svg (1200x400)
│   ├── about.svg (1200x400)
│   ├── members.svg (1200x400)
│   ├── calendar.svg (1200x400)
│   ├── blog.svg (1200x400)
│   ├── donate.svg (1200x400)
│   └── involved.svg (1200x400)
├── members/
│   └── placeholder.svg (300x300)
├── blog/
│   └── placeholder.svg (800x400)
├── events/
│   └── placeholder.svg (800x400)
└── gallery/
    └── placeholder.svg (800x600)
```

---

## What You See Now

✅ **Hero Images** - Professional SVG banners with ASCA colors
✅ **Member Images** - Simple placeholder profiles
✅ **Event Images** - Event placeholder in gallery
✅ **Blog Images** - Blog post placeholder
✅ **Gallery Images** - Gallery placeholder

All placeholders are **branded with ASCA colors:**
- Gold (#f5d800) - Primary accent
- Olive (#4a4b02) - Secondary accent
- Dark (#1a1a1a) - Text/dark backgrounds

---

## How to Replace with Real Images

### Option 1: Replace SVG Files (Keep Same Paths)

1. **Get your images ready:**
   - Save as JPG or PNG
   - Recommended sizes:
     - Heroes: 1200x400px (wide format)
     - Members: 300x300px (square)
     - Events: 800x400px
     - Gallery: 800x600px
     - Blog: 800x400px

2. **Replace the files:**
   ```bash
   # Copy your image over the placeholder
   cp my-hero-image.jpg public/images/hero/home.jpg
   
   # Update the seed script reference:
   # From: /images/hero/home.svg
   # To: /images/hero/home.jpg
   ```

3. **Update seed-complete.js:**
   ```javascript
   // Change all image paths from .svg to .jpg
   image: '/images/hero/home.jpg'  // instead of .svg
   ```

4. **Redeploy:**
   ```bash
   npm run db:seed-complete
   git push origin main
   ```

### Option 2: Upload via Admin Dashboard (Phase 7)

When admin dashboard is built (Phase 7):
1. Go to `/admin/gallery`
2. Click "Upload Image"
3. Select file
4. Assign to category (hero, members, events, blog)
5. Save - automatically replaces placeholder

---

## Quick Replacement Guide

### Hero Images (1200x400)

| File | Usage | Replace With |
|------|-------|--------------|
| `/images/hero/home.svg` | Home page hero | Your ASCA hero photo |
| `/images/hero/about.svg` | About page hero | ASCA facility/landscape |
| `/images/hero/members.svg` | Members page hero | Team photo |
| `/images/hero/calendar.svg` | Calendar page hero | Event action shot |
| `/images/hero/blog.svg` | Blog page hero | Horse/trail photo |
| `/images/hero/donate.svg` | Donate page hero | ASCA activities photo |
| `/images/hero/involved.svg` | Get Involved hero | Community photo |

### Member Images (300x300)

| Path | Replace With |
|------|--------------|
| `/images/members/placeholder.svg` | Create individual member files: |
| | `clariece.jpg` |
| | `marcus.jpg` |
| | `sarah.jpg` |
| | `david.jpg` |
| | `jessica.jpg` |

Then update seed-complete.js:
```javascript
{
  name: 'Clariece Pinkney',
  image: '/images/members/clariece.jpg'  // instead of placeholder
}
```

### Event Images (800x400)

Update `/images/events/placeholder.svg` with your event photos or create separate files:
- `/images/events/trail-ride.jpg`
- `/images/events/lessons.jpg`
- etc.

### Blog Images (800x400)

Each blog post has an image. Replace `/images/blog/placeholder.svg` with actual article images:
```javascript
{
  title: 'Benefits of Equine Therapy',
  image: '/images/blog/therapy.jpg'  // instead of placeholder
}
```

### Gallery Images

Upload to `/images/gallery/`:
- `trail-ride-1.jpg`
- `lesson-1.jpg`
- `event-1.jpg`
- etc.

---

## Steps to Replace All Images

### 1. Prepare Your Images
```bash
# Get images ready (JPG format recommended)
# Sizes:
# - Heroes: 1200x400px
# - Members: 300x300px
# - Others: 800x600px or 800x400px
# - Compress to < 100KB each
```

### 2. Copy to Project
```bash
# Replace hero images
cp hero-home.jpg public/images/hero/home.jpg
cp hero-about.jpg public/images/hero/about.jpg
# ... etc for all 7 heroes

# Replace member images
cp clariece.jpg public/images/members/clariece.jpg
# ... etc for all 5 members

# Replace blog images
cp therapy.jpg public/images/blog/therapy.jpg
# ... etc for all 3 blog posts
```

### 3. Update Seed Script
**File:** `scripts/seed-complete.js`

Change all `.svg` to `.jpg`:
```javascript
// FROM:
image: '/images/hero/home.svg'

// TO:
image: '/images/hero/home.jpg'
```

### 4. Update Database
```bash
npm run db:seed-complete
```

### 5. Test Locally
```bash
npm run dev
# Visit http://localhost:3000
# All images should show
```

### 6. Deploy
```bash
git add .
git commit -m "Replace placeholder images with real photos"
git push origin main
# Vercel redeploys automatically
```

---

## Compression Tips

### Reduce Image File Sizes

**Tool 1: TinyPNG (Online)**
- Go to: https://tinypng.com
- Upload images
- Download compressed versions
- Reduces 40-60% typically

**Tool 2: ImageOptim (Mac)**
- Download: https://imageoptim.com
- Drag and drop images
- Automatically optimizes

**Tool 3: ImageMagick (Command Line)**
```bash
convert input.jpg -resize 1200x400 -quality 85 output.jpg
```

**Target Sizes:**
- Heroes: < 100KB each
- Members: < 30KB each
- Blog/Events: < 50KB each
- Gallery: < 80KB each

---

## SVG Placeholder Details

All SVG placeholders are:
- ✅ Responsive (scale to any size)
- ✅ Themed with ASCA colors
- ✅ Lightweight (< 1KB each)
- ✅ Accessible (alt text support)
- ✅ Professional looking
- ✅ Ready to replace

**Colors Used:**
```
Gold accent: #f5d800
Olive secondary: #4a4b02
Dark primary: #1a1a1a
White neutral: #ffffff
```

---

## Image Best Practices

### Do's ✅
- Use JPG for photos (smaller file size)
- Use PNG for transparent/logo images
- Compress all images before uploading
- Use descriptive filenames (not "image-1.jpg")
- Test images display correctly on mobile
- Optimize for web (800-1200px width)
- Add alt text to all images

### Don'ts ❌
- Don't use huge uncompressed images
- Don't use WebP (older browsers don't support)
- Don't use non-standard aspect ratios
- Don't forget alt text
- Don't use watermarked images
- Don't use low-quality screenshots

---

## Testing Images

### Local Testing
```bash
npm run dev
# Visit http://localhost:3000
# Check:
# ✓ Heroes display on all pages
# ✓ Members show on /members page
# ✓ Events show on /calendar
# ✓ Blog images on /blog
# ✓ Gallery images on /gallery
# ✓ No broken image icons (🖼️ with ?)
```

### Live Testing (After Deploy)
1. Visit https://asca-pwa.vercel.app
2. Check all pages
3. Verify images load
4. Test mobile view (DevTools)
5. Check console for errors

---

## Troubleshooting

### "Image not showing"
**Solution:** Check file path in database matches actual file location

### "Image is huge/slow"
**Solution:** Compress with TinyPNG or ImageOptim

### "Image looks blurry"
**Solution:** Use higher resolution source (1200x400+ for heroes)

### "Missing image on one page"
**Solution:** Verify image path in seed script exactly matches file in `/public/images/`

### "Can't replace SVG"
**Solution:** Delete `.svg` file first, then copy `.jpg` with same name

---

## Current Image Summary

**Total Images:** 12 placeholder SVGs  
**Total Size:** < 20KB (very lightweight)  
**Quality:** Placeholder only - replace with real photos  
**Status:** Ready for production photos  

---

## Next Steps

### Immediate (Now)
- ✅ SVG placeholders in place
- ✅ Site working with placeholders
- ✅ Deploy to Vercel with placeholders

### Short Term (Next Week)
- Collect real images from ASCA
- Compress images
- Replace SVG placeholders with JPG
- Redeploy

### Medium Term (Phase 7)
- Build admin image upload UI
- Allow users to upload own images
- Automatic image compression
- Image gallery management

---

## Admin Image Upload (Phase 7)

When admin dashboard is complete:

```
Admin → Gallery
  ├── Upload Image
  │   ├── Select file from computer
  │   ├── Add title
  │   ├── Add alt text
  │   ├── Select category
  │   └── Auto-compress
  └── Image appears on site immediately
```

No code changes needed!

---

## Resources

**Image Tools:**
- Compression: https://tinypng.com
- Optimization: https://imageoptim.com
- Resizing: https://pixlr.com
- Free Photos: https://unsplash.com, https://pexels.com

**ASCA Branding:**
- Primary: #1a1a1a (dark)
- Secondary: #4a4b02 (olive)
- Accent: #f5d800 (gold)
- Neutral: #ffffff (white)

---

## Summary

**What You Have:**
- ✅ All image directories created
- ✅ Professional SVG placeholders
- ✅ Branded with ASCA colors
- ✅ Ready to replace with real photos
- ✅ Zero impact on performance (small file sizes)

**What You Do:**
1. Prepare real images
2. Compress with TinyPNG
3. Copy to `/public/images/` folders
4. Update seed script paths
5. Run `npm run db:seed-complete`
6. Deploy with `git push`

**Time to Replace:** 30-60 minutes (for 12 images)

---

**Status:** ✅ Ready for image replacement  
**Placeholder Images:** ✅ All created  
**Deployment:** ✅ Live with placeholders  
**Next:** Replace with real ASCA photos
