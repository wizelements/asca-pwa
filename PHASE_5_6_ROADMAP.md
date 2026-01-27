# ASCA PWA - Phases 5 & 6 Roadmap
## Focus: Visual Consistency + Admin Rebrandability

**Status:** Planning Phase  
**Target Completion:** February 16-March 2, 2026  
**Effort:** 8-10 days (design system + content population)

---

## Current State Assessment

### ✅ What's Working
- Core Next.js architecture (Pages, API, Admin)
- MongoDB backend with seed data
- NextAuth authentication  
- Resend email integration
- Tailwind CSS variables for theming
- Admin dashboard structure (blog, events, members, gallery, settings, theme)

### ⚠️ What Needs Work
- **Visual hierarchy inconsistent** - Pages use hardcoded placeholder content, not database-driven
- **No reusable component library** - Each page is standalone, hard to rebrand
- **Admin controls don't affect frontend** - Settings stored but not consumed by pages
- **Image handling incomplete** - No image upload UI, placeholder images hardcoded
- **Hero sections static** - Same template on every page, not configurable
- **Colors CSS variables only** - No runtime theme switching (requires page reload)
- **Form templates hardcoded** - Can't customize field labels/descriptions from admin

---

## Phase 5: Design System & Component Library
**Timeline:** 5 days  
**Goal:** Create reusable, fully themeable components that pull data from admin

### 5.1 Create Design System (Day 1)
**Deliverable:** Comprehensive Tailwind-based component library

**Components to build:**
```
components/
├── Layout/
│   ├── Header.tsx (reads theme + settings from DB)
│   ├── Footer.tsx (reads settings from DB)
│   ├── Hero.tsx (reusable hero with image + text, configurable)
│   └── Navigation.tsx (dynamic menu, pulls from settings)
├── Cards/
│   ├── EventCard.tsx (event with image, date, RSVP button)
│   ├── MemberCard.tsx (member profile with role badge)
│   ├── BlogCard.tsx (blog post preview)
│   └── GalleryCard.tsx (image with lightbox)
├── Forms/
│   ├── FormInput.tsx (branded input with label)
│   ├── FormSelect.tsx (branded dropdown)
│   ├── FormTextarea.tsx (branded textarea)
│   └── FormSubmit.tsx (branded button)
├── UI/
│   ├── Badge.tsx (role badges, category tags)
│   ├── Button.tsx (primary, secondary, accent variants)
│   ├── Loading.tsx (skeleton loaders)
│   └── Empty.tsx (empty state message)
└── Admin/
    ├── AdminNav.tsx (admin sidebar)
    ├── AdminForm.tsx (CRUD form builder)
    ├── AdminTable.tsx (data table with pagination)
    └── AdminModal.tsx (modal for dialogs)
```

**Key Features:**
- All colors use CSS variables (theme from DB)
- All text scales from theme font settings
- All icons use emoji or simple SVG
- Responsive grid layouts (mobile-first)
- Accessibility built in (ARIA labels, focus states)

### 5.2 Database-Driven Pages (Day 2)
**Current:** Pages hardcoded  
**Target:** Pages pull content from admin dashboard

**Files to refactor:**
```
BEFORE (Static):
/app/page.tsx → Hero hardcoded, events array empty

AFTER (Database-driven):
/app/page.tsx → Fetches hero config, upcoming events, featured blog
/app/about/page.tsx → Fetches About section from settings
/app/members/page.tsx → Fetches members, filters by role
/app/calendar/page.tsx → Fetches events, groups by month
/app/blog/page.tsx → Fetches blog posts, sorted by date
```

**Pattern for each page:**
```typescript
export default async function PageName() {
  // Fetch settings + theme
  const settings = await getSettings();
  const theme = await getTheme();
  
  // Fetch page-specific data
  const content = await getPageContent();
  
  // Use Hero component
  return (
    <>
      <Header settings={settings} theme={theme} />
      <Hero image={content.hero.image} title={content.hero.title} />
      {/* Rest of page using reusable components */}
      <Footer settings={settings} />
    </>
  );
}
```

### 5.3 Dynamic Hero Sections (Day 2-3)
**Current:** Each page has its own hardcoded hero  
**Target:** Configurable hero via admin

**Hero configuration (in admin/settings):**
```json
{
  "heroes": {
    "home": {
      "image": "/images/hero-home.jpg",
      "title": "We Ride To Inspire",
      "subtitle": "Promoting horsemanship, sportsmanship, and community",
      "ctaText": "Get Involved",
      "ctaLink": "/get-involved"
    },
    "about": {
      "image": "/images/hero-about.jpg",
      "title": "Our Story",
      "subtitle": "A legacy of equestrian excellence"
    }
  }
}
```

**Hero.tsx component:**
```typescript
interface HeroProps {
  image: string;
  title: string;
  subtitle?: string;
  cta?: { text: string; link: string };
}

export default function Hero({ image, title, subtitle, cta }: HeroProps) {
  return (
    <section 
      className="hero py-32 bg-cover bg-center text-center"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="container">
        <h1 className="text-6xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
          {title}
        </h1>
        {subtitle && <p className="text-3xl" style={{ color: 'var(--color-accent)' }}>{subtitle}</p>}
        {cta && <Link href={cta.link} className="btn-accent">{cta.text}</Link>}
      </div>
    </section>
  );
}
```

### 5.4 Admin Form Template Builder (Day 3-4)
**Current:** Forms hardcoded in pages  
**Target:** Admin can customize form fields, labels, placeholders

**Admin form templates (in DB):**
```
Form Templates:
├── contact-form
│   ├── name (text, required)
│   ├── email (email, required)
│   ├── message (textarea, required)
│   └── submitLabel: "Send Message"
├── membership-form
│   ├── name, email, phone, role, experience
└── volunteer-form
    ├── name, email, interests, availability
```

**Update /app/api/forms/route.ts:**
```typescript
export async function POST(request: Request) {
  const formData = await request.json();
  const { type, data } = formData;
  
  // Get form template from DB
  const template = await getFormTemplate(type);
  
  // Validate against template fields
  const validation = validateForm(data, template.fields);
  if (!validation.valid) return new Response(..., 400);
  
  // Send email using template
  await sendFormEmail(type, data, template.submitLabel);
  
  // Save to FormSubmissions collection
  await saveFormSubmission(type, data);
  
  return new Response(JSON.stringify({ success: true }), 201);
}
```

### 5.5 Image Upload & Gallery (Day 4-5)
**Current:** Hardcoded placeholder images  
**Target:** Admin can upload and manage images

**Image storage strategy:**
```
Option A: Vercel Blob (recommended for MVP)
- Simple API: `put()`, `get()`, `delete()`
- Files: /public/images/ → automatically served
- Cost: Free tier included with Vercel

Option B: MongoDB GridFS
- Store binary in database
- More control, more complexity

Choose Option A for Phase 5.
```

**Admin gallery UI workflow:**
```
1. Admin clicks "Upload Image"
2. Selects file + adds title, alt text, category
3. System compresses with sharp/tinypng
4. Uploads to Vercel Blob (or /public/images/)
5. Saves metadata to GalleryImages collection
6. Returns to gallery table
```

**Database model for GalleryImages:**
```typescript
interface GalleryImage {
  _id: ObjectId;
  title: string;
  url: string;
  category: 'events' | 'lessons' | 'trails' | 'members' | 'gallery';
  altText: string;
  width: number;
  height: number;
  uploadedAt: Date;
  uploadedBy: ObjectId; // User reference
}
```

---

## Phase 6: Content Population & Styling
**Timeline:** 5 days  
**Goal:** Populate all pages with real content, optimize for production

### 6.1 Content Audit & Extraction (Day 1)
**Source:** atlantasaddleclub.com snapshot

**Content to extract:**
```markdown
HOME:
- Hero image, title, tagline
- 3 Feature boxes (values/benefits)
- "Ready to Ride?" CTA section

ABOUT:
- Mission statement
- History timeline (if available)
- Leadership intro
- Core values (3-5 items)

MEMBERS:
- Full team list (names, roles, photos, bios)
- Role categories: instructor, founder, veteran, youth

CALENDAR:
- 10-12 upcoming events with dates, times, locations
- Event types: rides, lessons, meetings, special events
- RSVP caps per event

BLOG:
- 3-5 existing blog posts (published date, author, excerpt)
- Featured image per post
- Category/tags

GALLERY:
- 20-30 photos organized by category
- Trail rides, lessons, events, member highlights

CONTACT:
- Email: info@atlantasaddleclub.org
- Phone: (404) 555-0123
- Address: Atlanta, Georgia
- Social: Facebook, Instagram, YouTube, Venmo, CashApp
```

### 6.2 Populate Admin Dashboard (Day 2-3)
**Workflow:** Use admin UI to add all content

**Admin checklist:**
```
SETTINGS (/admin/settings):
- [ ] Site name: "Atlanta Saddle Club Association"
- [ ] Description: "We Ride To Inspire"
- [ ] Contact email: info@atlantasaddleclub.org
- [ ] Phone: (404) 555-0123
- [ ] Address: Atlanta, Georgia
- [ ] Social links (Facebook, Instagram, YouTube)
- [ ] Venmo: @therealasca1
- [ ] CashApp: $therealasca1

THEME (/admin/theme):
- [ ] Primary: #1a1a1a (dark)
- [ ] Secondary: #4a4b02 (olive)
- [ ] Accent: #f5d800 (gold)
- [ ] Neutral: #ffffff (white)
- [ ] Font family: sans-serif
- [ ] Font size base: 16px

MEMBERS (/admin/members):
- [ ] Add 5-10 leadership members
- [ ] Each: name, role, bio, email, photo
- [ ] Filter by role working

EVENTS (/admin/events):
- [ ] Add 10-12 upcoming events
- [ ] Each: title, date, time, location, description, image, RSVP cap
- [ ] Publish status (draft/live)

BLOG (/admin/blog):
- [ ] Add 3-5 blog posts
- [ ] Each: title, excerpt, content (markdown), author, image, date
- [ ] Categories/tags

GALLERY (/admin/gallery):
- [ ] Upload 20-30 images
- [ ] Categories: rides, lessons, events, members
- [ ] All with alt text
```

### 6.3 Style Refinements (Day 3-4)
**Current:** Basic styling works  
**Target:** Professional, polished appearance

**Polish tasks:**
```
[ ] Hero sections: overlay text on images, improve contrast
[ ] Buttons: hover states, active states, disabled states
[ ] Cards: consistent shadows, hover animations
[ ] Typography: font scaling, line heights, letter spacing
[ ] Spacing: consistent margin/padding across pages
[ ] Mobile: test on iPhone 12, 14, Android phones
[ ] Accessibility: keyboard navigation, screen reader test
[ ] Dark mode: optional, can add in Phase 7
```

**Tailwind utilities to add:**
```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      spacing: {
        'gutter': '1.5rem',
      },
      typography: {
        '3xl': '1.875rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
      },
    },
  },
};
```

### 6.4 Image Optimization (Day 4)
**Tool:** sharp or TinyPNG API

**Optimization targets:**
```
Hero images: 1200x400px, < 100KB
Gallery images: 800x600px, < 80KB
Member photos: 300x300px, < 30KB
Logo: 200x200px, < 20KB
```

**Script:** `scripts/optimize-images.js`
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const optimize = async () => {
  const imageDir = './public/images';
  
  // Find all JPG/PNG files
  const files = fs.readdirSync(imageDir);
  
  for (const file of files) {
    if (!file.match(/\.(jpg|png)$/i)) continue;
    
    const filepath = path.join(imageDir, file);
    const info = await sharp(filepath).metadata();
    
    // Resize if needed
    if (info.width > 1200) {
      await sharp(filepath)
        .resize(1200, 800, { fit: 'cover' })
        .toFile(filepath);
    }
  }
  
  console.log('Images optimized!');
};

optimize();
```

### 6.5 Lighthouse Audit & Deploy (Day 5)
**Target:** 90+ across all metrics

**Checklist:**
```
[ ] Performance: 90+ (image optimization, lazy loading)
[ ] Accessibility: 95+ (ARIA labels, contrast ratios)
[ ] Best Practices: 90+ (HTTPS, security headers)
[ ] SEO: 95+ (meta tags, structured data)
[ ] PWA: Configured (service worker, manifest)
```

**Commands:**
```bash
npm run build        # Production build
npm start            # Start production server locally
# Open http://localhost:3000 and run Lighthouse audit
```

**Deploy:**
```bash
git add .
git commit -m "Phase 6: Content population and styling"
git push origin main
# Vercel auto-deploys
```

---

## Phase 5-6 Success Criteria

✅ **Design System Complete**
- Component library documented
- All components use CSS variables
- Responsive on all breakpoints
- Accessibility WCAG AA

✅ **Database-Driven Pages**
- 0 hardcoded content (except branding)
- All pages fetch from MongoDB
- Settings control appearance
- Admin dashboard controls all content

✅ **Image Management**
- Admin can upload images
- Images auto-optimized
- Gallery displays properly
- Hero images configurable

✅ **Content Populated**
- All 7 pages have real content
- 10+ events in calendar
- 5+ blog posts
- 20+ gallery images
- Full team in members page

✅ **Production Ready**
- Lighthouse 90+ across metrics
- Mobile responsive tested
- All forms working
- Email verified
- Deployed to production

✅ **Rebrandability**
- Admin can change all colors via theme
- Admin can change all text via settings
- Admin can upload images
- Admin can manage all content
- No code changes needed to rebrand

---

## Technical Stack (Finalized)

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | Next.js 14 (App Router) | Modern, performant, full-stack |
| Styling | Tailwind CSS + CSS variables | Customizable themes |
| Database | MongoDB (Atlas) | Document flexibility, offline-first ready |
| Auth | NextAuth.js | Enterprise auth, MongoDB compatible |
| Email | Resend | Serverless, simple setup |
| Image hosting | Vercel Blob or /public | Simple, included with Vercel |
| Deployment | Vercel | Native Next.js support, auto-deploy |

---

## Files to Create/Modify

### New Components (5.1)
```
components/Layout/Hero.tsx
components/Cards/EventCard.tsx
components/Cards/MemberCard.tsx
components/Cards/BlogCard.tsx
components/Cards/GalleryCard.tsx
components/UI/Badge.tsx
components/UI/Button.tsx
components/Forms/FormInput.tsx
components/Admin/AdminTable.tsx
```

### Page Refactors (5.2)
```
app/page.tsx (refactor)
app/about/page.tsx (refactor)
app/members/page.tsx (refactor)
app/calendar/page.tsx (refactor)
app/blog/page.tsx (refactor)
```

### New Admin Pages (5.3-5.4)
```
app/admin/settings/page.tsx (update)
app/admin/theme/page.tsx (update)
app/admin/gallery/page.tsx (refactor)
```

### Utilities & Scripts (5.5, 6.4)
```
lib/db/queries.ts (fetch page content)
lib/db/settings.ts (fetch settings + theme)
scripts/optimize-images.js
```

---

## Next Steps (Immediate)

1. **Review this roadmap** - Agree on approach
2. **Start Phase 5.1** - Build 3 core components (Hero, Card, Button)
3. **Test with existing pages** - Integrate Hero into home page
4. **Iterate** - Refactor one page per day
5. **Move to Phase 6** - Populate content via admin

**Questions to answer:**
- Should we use Vercel Blob or keep /public/images/?
- Do you want image compression built-in or manual?
- Should admin interface have image cropping?
- Any custom fonts needed (or keep system fonts)?

---

**Status:** Ready to Execute  
**Estimated Time:** 8-10 days  
**Blocker:** None - can start immediately  
**Next Review:** After Phase 5.1 completion
