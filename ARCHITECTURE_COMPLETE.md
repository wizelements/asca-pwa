# ASCA PWA + Admin System — Complete Architecture

**Project:** Atlanta Saddle Club Association  
**Mission:** "We Ride To Inspire"  
**Status:** Oracle-Ready Architecture  
**Last Updated:** 2026-01-26

---

## 📋 QUICK START

### Tech Stack (Locked)
| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14 (App Router) | SSR for SEO, PWA support, Vercel native |
| **Styling** | Tailwind CSS + Design Tokens | Fast iteration, admin-editable themes |
| **CMS** | Strapi Headless | Non-tech-friendly content management |
| **Database** | PostgreSQL (Supabase) | Reliability, row-level security, realtime |
| **API** | Next.js API Routes + Strapi REST | Minimal backend, CMS-driven content |
| **Auth** | NextAuth.js + Supabase | JWT tokens, admin panel security |
| **Push Notifications** | Firebase Cloud Messaging | Web Push API, admin control |
| **Offline** | Service Workers + IndexedDB | Forms sync, cached content |
| **Payments** | Venmo (link integration) | Non-tech setup, future Stripe-ready |
| **Hosting** | Vercel (Frontend) + Railway (Strapi) + Supabase (DB) | Best-in-class DX, auto-scaling |

---

## 🏗️ FOLDER STRUCTURE

```
atlantasaddleclub-pwa/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, typecheck, test
│       └── deploy.yml                # Deploy to Vercel + Railway
│
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx              # HOME
│   │   │   ├── about/page.tsx        # ABOUT
│   │   │   ├── members/page.tsx      # MEMBERS (with filters)
│   │   │   ├── get-involved/page.tsx # GET INVOLVED (membership flow)
│   │   │   ├── calendar/page.tsx     # CALENDAR (FullCalendar)
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx          # BLOG index
│   │   │   │   └── [slug]/page.tsx   # BLOG post
│   │   │   ├── donate/page.tsx       # DONATE (Venmo flow)
│   │   │   └── layout.tsx            # Public layout
│   │   │
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx        # Admin wrapper + sidebar
│   │   │   │   ├── page.tsx          # Dashboard
│   │   │   │   ├── branding/page.tsx # 🎨 Theme editor
│   │   │   │   ├── content/
│   │   │   │   │   ├── blog/page.tsx
│   │   │   │   │   ├── events/page.tsx
│   │   │   │   │   ├── members/page.tsx
│   │   │   │   │   └── gallery/page.tsx
│   │   │   │   ├── forms/page.tsx    # 📋 Form submissions
│   │   │   │   ├── notifications/page.tsx # 🔔 Push center
│   │   │   │   ├── features/page.tsx # ⚙️ Feature toggles
│   │   │   │   ├── venmo/page.tsx    # 💰 Venmo settings
│   │   │   │   ├── settings/page.tsx # General settings
│   │   │   │   └── error.tsx         # Error boundary
│   │   │   └── login/page.tsx        # Admin login
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── session/route.ts
│   │   │   ├── admin/
│   │   │   │   ├── theme/route.ts    # GET/POST theme settings
│   │   │   │   ├── feature-flags/route.ts
│   │   │   │   ├── notifications/send/route.ts
│   │   │   │   └── content/[type]/route.ts
│   │   │   ├── content/
│   │   │   │   ├── blog/route.ts
│   │   │   │   ├── events/route.ts
│   │   │   │   ├── members/route.ts
│   │   │   │   └── images/route.ts
│   │   │   ├── forms/
│   │   │   │   ├── subscribe/route.ts # Newsletter
│   │   │   │   ├── contact/route.ts
│   │   │   │   ├── membership/route.ts
│   │   │   │   └── volunteer/route.ts
│   │   │   ├── calendar/
│   │   │   │   ├── events/route.ts
│   │   │   │   ├── rsvp/route.ts
│   │   │   │   └── [id]/ics/route.ts
│   │   │   ├── donations/
│   │   │   │   └── venmo-config/route.ts
│   │   │   ├── push/
│   │   │   │   ├── subscribe/route.ts
│   │   │   │   └── test/route.ts
│   │   │   └── webhooks/
│   │   │       └── offline-sync/route.ts
│   │   │
│   │   ├── middleware.ts            # Auth + redirect logic
│   │   └── layout.tsx               # Root layout + providers
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Nav + logo + CTA
│   │   │   ├── Footer.tsx           # Map + socials + newsletter
│   │   │   ├── AdminSidebar.tsx     # Admin nav
│   │   │   └── ThemeProvider.tsx    # Theme tokens provider
│   │   │
│   │   ├── pages/
│   │   │   ├── HomeHero.tsx
│   │   │   ├── ConnectLearnGive.tsx # Card section
│   │   │   ├── MembershipForm.tsx   # Multi-step form
│   │   │   ├── EventCard.tsx
│   │   │   ├── MemberCard.tsx
│   │   │   ├── Gallery.tsx          # Lightbox + lazy load
│   │   │   ├── Calendar.tsx         # FullCalendar integration
│   │   │   └── NewsletterSignup.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── ThemeEditor.tsx      # Color picker + preview
│   │   │   ├── PageBuilder.tsx      # Drag-drop layout
│   │   │   ├── BlogEditor.tsx
│   │   │   ├── EventsManager.tsx
│   │   │   ├── MembersManager.tsx
│   │   │   ├── GalleryUpload.tsx
│   │   │   ├── NotificationComposer.tsx
│   │   │   └── FeatureTogglePanel.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Form.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── ColorPicker.tsx
│   │       ├── ContrastChecker.tsx  # A11y helper
│   │       └── SkeletonLoader.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts              # Client + admin clients
│   │   ├── strapi.ts                # CMS API client
│   │   ├── auth.ts                  # NextAuth config + helpers
│   │   ├── offlineQueue.ts          # Offline form submissions
│   │   ├── pushNotifications.ts     # FCM integration
│   │   ├── venmo.ts                 # Venmo redirect logic
│   │   ├── cache.ts                 # IndexedDB wrapper
│   │   ├── types.ts                 # Shared TypeScript types
│   │   └── utils.ts
│   │
│   ├── hooks/
│   │   ├── useTheme.ts              # Theme token consumer
│   │   ├── useOfflineQueue.ts
│   │   ├── usePushNotifications.ts
│   │   ├── useForm.ts
│   │   └── useAuth.ts
│   │
│   ├── types/
│   │   ├── database.ts              # Supabase generated types
│   │   ├── strapi.ts                # Strapi schema types
│   │   ├── forms.ts
│   │   └── admin.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── tailwind.css
│   │   └── tokens.css               # Generated theme tokens
│   │
│   └── public/
│       ├── logo.svg
│       ├── logo-maskable.svg        # PWA maskable icon
│       ├── manifest.json            # PWA manifest
│       ├── offline.html             # Offline fallback
│       ├── icons/
│       │   ├── icon-192.png
│       │   └── icon-512.png
│       └── service-worker.js        # SW registration
│
├── public/
│   └── sw.js                        # Service Worker code
│
├── strapi/
│   ├── config/
│   │   ├── database.js
│   │   ├── plugins.js
│   │   └── functions/
│   │       └── bootstrap.js
│   ├── src/
│   │   ├── api/
│   │   │   ├── blog-post/
│   │   │   │   ├── content-types/blog-post/schema.json
│   │   │   │   └── routes/blog-post.js
│   │   │   ├── event/
│   │   │   ├── member/
│   │   │   ├── gallery-image/
│   │   │   ├── site-settings/
│   │   │   ├── feature-flag/
│   │   │   ├── theme-setting/
│   │   │   ├── venmo-config/
│   │   │   └── form-submission/
│   │   ├── extensions/
│   │   │   └── upload/
│   │   │       └── config/
│   │   │           └── settings.json # Image size limits
│   │   └── plugins/
│   │       └── custom/
│   │           └── strapi-server.js
│   ├── database/
│   │   ├── migrations/
│   │   └── seed.sql
│   ├── .env.example
│   └── package.json
│
├── db/
│   ├── migrations/
│   │   ├── 001_init.sql
│   │   ├── 002_auth_tables.sql
│   │   ├── 003_offline_queue.sql
│   │   ├── 004_push_subscriptions.sql
│   │   └── 005_permissions.sql
│   ├── seed.sql
│   ├── schema.sql
│   └── README.md
│
├── tests/
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── homepage.spec.ts
│   │   ├── membership-flow.spec.ts
│   │   ├── admin.spec.ts
│   │   └── fixtures/
│   │       └── auth.ts
│   ├── unit/
│   │   ├── offlineQueue.test.ts
│   │   ├── theme.test.ts
│   │   └── venmo.test.ts
│   ├── playwright.config.ts
│   └── vitest.config.ts
│
├── docs/
│   ├── ARCHITECTURE.md              # This file
│   ├── ADMIN_UX.md
│   ├── PWA_SETUP.md
│   ├── CMS_SCHEMA.md
│   ├── ACCESSIBILITY.md
│   ├── DEPLOYMENT.md
│   ├── API_REFERENCE.md
│   └── BRAND_SYSTEM.md
│
├── .env.example
├── .env.local                      # Git-ignored
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── pnpm-workspace.yaml             # Monorepo
└── README.md
```

---

## 💾 DATABASE SCHEMA

### PostgreSQL (Supabase)

#### Auth Tables
```sql
-- User profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role ENUM ('admin', 'editor', 'events_manager', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin sessions
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  token_hash TEXT UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Content Tables (Strapi Mirror)
```sql
-- Site-wide settings
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Theme/Branding
CREATE TABLE theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE,
  colors JSONB DEFAULT '{
    "dark": "#1a1a1a",
    "olive": "#4a4b02",
    "gold": "#f5d800",
    "white": "#ffffff"
  }',
  fonts JSONB DEFAULT '{
    "heading": "Playfair Display",
    "body": "Open Sans"
  }',
  button_style JSONB,
  logo_url TEXT,
  tagline TEXT DEFAULT 'We Ride To Inspire',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Feature flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Content Management
```sql
-- Blog posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  featured_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status ENUM ('draft', 'published') DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location TEXT,
  category TEXT,
  image_url TEXT,
  max_rsvps INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  status ENUM ('going', 'interested', 'not_going') DEFAULT 'going',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Members directory
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  role TEXT[], -- ['rider', 'volunteer', 'instructor']
  photo_url TEXT,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gallery images
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  title TEXT,
  caption TEXT,
  category TEXT,
  sort_order INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Testimonials (optional)
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_role TEXT,
  content TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Forms & Submissions
```sql
-- Form submissions (newsletter)
CREATE TABLE newsletter_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  source TEXT, -- 'homepage', 'footer', 'modal'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contact form submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  phone TEXT,
  status ENUM ('new', 'read', 'responded') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Membership applications
CREATE TABLE membership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_info JSONB, -- {name, email, phone, address}
  experience JSONB,    -- {riding_level, interests[], experience_years}
  membership_type TEXT, -- 'full', 'student', 'volunteer'
  status ENUM ('submitted', 'reviewing', 'approved', 'rejected') DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Volunteer signups
CREATE TABLE volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interests TEXT[], -- ['events', 'instruction', 'outreach']
  availability TEXT,
  status ENUM ('new', 'contacted', 'active', 'inactive') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Offline queue (sync when online)
CREATE TABLE offline_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL, -- 'POST', 'PUT', 'DELETE'
  payload JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);
```

#### Push Notifications
```sql
-- Push subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT UNIQUE NOT NULL,
  auth_secret TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  notification_types TEXT[] DEFAULT '{"all"}',
  subscribed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification history
CREATE TABLE push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT,
  action TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  target_count INT,
  success_count INT DEFAULT 0
);
```

#### Donations
```sql
-- Donation tracking (Venmo logs only)
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name TEXT,
  amount DECIMAL(10, 2),
  venmo_username TEXT,
  external_url TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Row Level Security (RLS)
```sql
-- Public content is readable by all
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts visible to all" 
  ON blog_posts FOR SELECT 
  USING (status = 'published');

-- Admin only
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own sessions" 
  ON admin_sessions FOR SELECT 
  USING (auth.uid() = user_id);
```

---

## 🎨 THEME & BRANDING SYSTEM

### Brand Tokens (Editable in Admin)

```typescript
// src/lib/theme.ts
export const DEFAULT_THEME = {
  colors: {
    dark: '#1a1a1a',
    olive: '#4a4b02',
    gold: '#f5d800',
    white: '#ffffff',
    pale_yellow: '#fef3c7', // for text variants
  },
  fonts: {
    heading: 'Playfair Display, serif',
    body: 'Open Sans, sans-serif',
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  button: {
    style: 'solid', // 'solid' | 'outline' | 'ghost'
    size: 'lg', // 'sm' | 'md' | 'lg'
  },
};
```

### Tailwind Config Integration

```javascript
// tailwind.config.ts
import { DEFAULT_THEME } from '@/lib/theme';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        asca: {
          dark: DEFAULT_THEME.colors.dark,
          olive: DEFAULT_THEME.colors.olive,
          gold: DEFAULT_THEME.colors.gold,
        },
      },
      fontFamily: {
        heading: [DEFAULT_THEME.fonts.heading],
        body: [DEFAULT_THEME.fonts.body],
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
```

### Admin Branding Editor

```typescript
// src/components/admin/ThemeEditor.tsx
export function ThemeEditor() {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  return (
    <div className="space-y-6">
      <section>
        <h2>Colors</h2>
        <ColorPicker
          label="Dark Background"
          value={theme.colors.dark}
          onChange={(color) => setTheme({ ...theme, colors: { ...theme.colors, dark: color } })}
        />
        <ContrastChecker color1={theme.colors.dark} color2={theme.colors.white} />
      </section>

      <section>
        <h2>Fonts</h2>
        <select value={theme.fonts.heading}>
          <option>Playfair Display</option>
          <option>Merriweather</option>
          <option>Georgia</option>
        </select>
      </section>

      <section>
        <h2>Logo & Tagline</h2>
        <FileUpload label="Logo SVG" />
        <TextInput label="Tagline" defaultValue="We Ride To Inspire" />
      </section>

      <section>
        <h2>Preview</h2>
        <ThemePreview theme={theme} />
      </section>

      <button onClick={saveTheme}>Save & Publish</button>
    </div>
  );
}
```

---

## 🛠️ ADMIN SYSTEM UI LAYOUT

### Dashboard Structure

```
/admin/
├── Dashboard (KPIs, recent activity, quick actions)
├── Branding (Colors, fonts, logo, contrast checker)
├── Content Management
│   ├── Blog (Create, edit, publish, schedule)
│   ├── Events (Calendar view, edit, delete)
│   ├── Members (Directory, photos, filters)
│   └── Gallery (Upload, organize, alt text)
├── Forms & Submissions
│   ├── Newsletter (List, export, unsubscribe)
│   ├── Contact (Inbox, respond, archive)
│   ├── Membership Apps (Review, approve, reject)
│   └── Volunteer Signups (Manage, contact)
├── Notifications (Compose, schedule, test, analytics)
├── Feature Toggles (Lead magnet, RSVP, donations, etc.)
├── Venmo Settings (Username, donation presets)
└── Admin Settings (Users, roles, audit log)
```

### Admin Key Pages

#### Branding Dashboard
- **Color Picker** with A11y contrast checker
- **Font Selector** with preview
- **Logo Upload** (SVG + PNG)
- **Button Style Editor** (solid/outline/ghost)
- **Live Theme Preview** (renders homepage with new theme)
- **Save & Publish** (updates Supabase + cache invalidation)

#### Page Builder
- Drag-drop sections (Hero, Cards, Gallery, Calendar, Newsletter)
- Toggle modules on/off
- Edit CTA labels + links
- Reorder sections
- Preview mobile + desktop
- Publish

#### Content Manager (Blog Example)
```
┌─────────────────────────────┐
│ Blog Posts                  │
├─────────────────────────────┤
│ [New Post]    [Filters] [Search] │
├─────────────────────────────┤
│ Title         Status  Date   │
│ ────────────────────────────│
│ Post Title    Draft   1/20  │
│ ────────────────────────────│
│ [Edit] [Preview] [Delete]   │
└─────────────────────────────┘
```

#### Notification Composer
```
┌──────────────────────────────┐
│ Send Push Notification       │
├──────────────────────────────┤
│ Title: [____________]         │
│ Body: [____________]          │
│ Action: [Join Now] or [RSVP] │
│ Icon: [Upload]                │
│                              │
│ Audience:                    │
│ ☑ All Users                  │
│ ☐ Event Subscribers          │
│ ☐ Newsletter Subscribers     │
│ ☐ Admin (Test)               │
│                              │
│ Schedule:                    │
│ ☑ Send Now                   │
│ ☐ Schedule for: [Date] [Time] │
│                              │
│ [Test] [Schedule] [Cancel]   │
└──────────────────────────────┘
```

---

## 📱 PWA CONFIGURATION

### manifest.json

```json
{
  "name": "Atlanta Saddle Club Association",
  "short_name": "ASCA",
  "description": "We Ride To Inspire - Premium equestrian community",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#f5d800",
  "background_color": "#1a1a1a",
  "prefer_related_applications": false,
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/logo-maskable.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "maskable"
    }
  ],
  "categories": ["community", "events"],
  "screenshots": [
    {
      "src": "/screenshot-540.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshot-1280.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ]
}
```

### Next.js PWA Config

```javascript
// next.config.js
import withPWA from 'next-pwa';

const withPWAConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: false,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https:\/\/api\.strapi\..*\/graphql/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'cms-api',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 20, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/_next\/image/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-images',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
  ],
});

export default withPWAConfig({
  reactStrictMode: true,
});
```

---

## ⚙️ SERVICE WORKER LOGIC

### SW Registration & Lifecycle

```typescript
// src/lib/serviceWorker.ts
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    registration.onupdatefound = () => {
      const newWorker = registration.installing;
      newWorker.onstatechange = () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New SW waiting, show "Update Available" prompt
          showUpdatePrompt();
        }
      };
    };

    return registration;
  } catch (error) {
    console.error('SW registration failed:', error);
  }
}
```

### Service Worker Code

```javascript
// public/sw.js
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Static assets (cache first)
const STATIC_ASSETS = ['/offline.html', '/logo.svg', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !name.startsWith(CACHE_VERSION))
          .map((name) => caches.delete(name))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Static assets: Cache first
  if (STATIC_ASSETS.includes(url.pathname)) {
    return event.respondWith(caches.match(request));
  }

  // API requests: Network first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(API_CACHE).then((cache) => cache.put(request, clonedResponse));
          return response;
        })
        .catch(() => caches.match(request))
    );
  }

  // HTML pages: Network first
  if (request.method === 'GET' && request.headers.get('accept')?.includes('text/html')) {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clonedResponse));
          return response;
        })
        .catch(() => caches.match('/offline.html'))
    );
  }

  // Images & other assets: Cache first
  if (
    request.method === 'GET' &&
    (request.destination === 'image' || request.destination === 'font')
  ) {
    return event.respondWith(
      caches.match(request).then((response) =>
        response ||
        fetch(request).then((response) => {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clonedResponse));
          return response;
        })
      )
    );
  }

  // Default: Network first
  return event.respondWith(
    fetch(request).catch(() => {
      // Return offline page or cached response
      return caches.match(request) || caches.match('/offline.html');
    })
  );
});

// Background sync for offline forms
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-sync') {
    event.waitUntil(syncOfflineQueue());
  }
});

async function syncOfflineQueue() {
  const db = await openDB('asca', 1);
  const queue = await db.getAll('offline-queue');

  for (const item of queue) {
    try {
      const response = await fetch(item.endpoint, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });

      if (response.ok) {
        await db.delete('offline-queue', item.id);
      }
    } catch (error) {
      // Retry on next sync
      console.error('Offline sync failed:', error);
    }
  }
}
```

### Offline Form Queue

```typescript
// src/lib/offlineQueue.ts
import { openDB } from 'idb';

const DB_NAME = 'asca';
const STORE_NAME = 'offline-queue';

export async function queueOfflineSubmission(endpoint: string, payload: any) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });

  await db.add(STORE_NAME, {
    endpoint,
    method: 'POST',
    payload,
    createdAt: Date.now(),
  });

  // Trigger background sync
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('offline-sync');
  }
}
```

---

## 🔔 PUSH NOTIFICATION FLOW

### Firebase Cloud Messaging Setup

```typescript
// src/lib/pushNotifications.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FCM_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FCM_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FCM_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FCM_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export async function requestPushPermission() {
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
    });

    // Save token to Supabase
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    return token;
  } catch (error) {
    console.error('Failed to get push token:', error);
  }
}

export function listenForMessages() {
  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);

    // Show notification
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: payload.notification.image,
    });
  });
}
```

### Admin Push Send

```typescript
// src/app/api/admin/notifications/send/route.ts
import { adminSupabase } from '@/lib/supabase';
import * as admin from 'firebase-admin';

export async function POST(request: Request) {
  const { title, body, action, targetAudience } = await request.json();

  // Get subscriptions
  let subscriptions;
  if (targetAudience === 'all') {
    subscriptions = await adminSupabase
      .from('push_subscriptions')
      .select('*');
  } else if (targetAudience === 'events') {
    subscriptions = await adminSupabase
      .from('push_subscriptions')
      .select('*')
      .contains('notification_types', ['events']);
  }

  // Send via FCM
  const messaging = admin.messaging();
  const promises = subscriptions.data.map((sub) =>
    messaging.send({
      webpush: {
        headers: {
          TTL: '86400',
        },
        data: {
          title,
          body,
          action,
        },
        notification: {
          title,
          body,
          icon: '/icon-192.png',
          badge: '/logo.svg',
          click_action: action || '/',
        },
      },
      token: sub.endpoint,
    })
  );

  await Promise.allSettled(promises);

  return Response.json({
    sent: promises.length,
    timestamp: new Date(),
  });
}
```

---

## 💰 VENMO INTEGRATION LOGIC

### Venmo Config & Redirect Flow

```typescript
// src/lib/venmo.ts
export interface VenmoConfig {
  username: string;
  preset_amounts: number[];
  message_template: string;
}

export function buildVenmoLink(
  config: VenmoConfig,
  amount: number,
  note?: string
): string {
  const note_text = note || config.message_template;
  const encoded_note = encodeURIComponent(note_text);
  return `https://venmo.com/${config.username}?amount=${amount}&note=${encoded_note}`;
}

export async function getVenmoConfig(): Promise<VenmoConfig> {
  const response = await fetch('/api/donations/venmo-config');
  return response.json();
}
```

### Donation Page

```typescript
// src/app/(public)/donate/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { buildVenmoLink, getVenmoConfig, VenmoConfig } from '@/lib/venmo';

export default function DonatePage() {
  const [config, setConfig] = useState<VenmoConfig>(null);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    getVenmoConfig().then(setConfig);
  }, []);

  const handleDonate = (amount: number) => {
    const link = buildVenmoLink(config, amount);
    window.location.href = link;
  };

  return (
    <div className="bg-asca-dark text-white py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-heading mb-4">Support ASCA</h1>
        <p className="text-lg mb-8">Your donation directly supports our mission to inspire through horsemanship.</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {config?.preset_amounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleDonate(amount)}
              className="bg-asca-gold text-asca-dark py-4 rounded-lg font-bold hover:opacity-90"
            >
              Donate ${amount}
            </button>
          ))}
        </div>

        <div className="mb-8">
          <input
            type="number"
            placeholder="Custom amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full px-4 py-2 rounded-lg text-asca-dark mb-4"
          />
          <button
            onClick={() => handleDonate(parseFloat(customAmount))}
            className="w-full bg-asca-olive text-asca-gold py-3 rounded-lg font-bold hover:opacity-90"
          >
            Donate Custom Amount
          </button>
        </div>

        <div className="text-center text-sm text-asca-pale-yellow">
          You'll be redirected to Venmo to complete the donation securely.
        </div>
      </div>
    </div>
  );
}
```

### Admin Venmo Settings

```typescript
// src/app/(admin)/admin/venmo/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function VenmoSettings() {
  const [venmoUsername, setVenmoUsername] = useState('');
  const [presets, setPresets] = useState([10, 25, 50, 100]);
  const [messageTemplate, setMessageTemplate] = useState('');

  const handleSave = async () => {
    await supabase
      .from('site_settings')
      .upsert({
        key: 'venmo_config',
        value: { username: venmoUsername, preset_amounts: presets, message_template: messageTemplate },
      });
  };

  return (
    <div className="space-y-6">
      <h1>Venmo Settings</h1>

      <input
        type="text"
        placeholder="Venmo username"
        value={venmoUsername}
        onChange={(e) => setVenmoUsername(e.target.value)}
      />

      <div>
        <label>Donation Presets</label>
        {presets.map((preset, i) => (
          <input
            key={i}
            type="number"
            value={preset}
            onChange={(e) => {
              const newPresets = [...presets];
              newPresets[i] = parseInt(e.target.value);
              setPresets(newPresets);
            }}
          />
        ))}
      </div>

      <textarea
        placeholder="Message template for donation requests"
        value={messageTemplate}
        onChange={(e) => setMessageTemplate(e.target.value)}
      />

      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
}
```

---

## ♿ ACCESSIBILITY CHECKLIST

### Standards Compliance
- [x] WCAG 2.1 Level AA (minimum)
- [x] ARIA labels on dynamic content
- [x] Keyboard navigation (Tab, Enter, Esc)
- [x] Focus indicators (visible, high contrast)
- [x] Semantic HTML (nav, main, article, section)
- [x] Alt text required for all images (admin enforced)
- [x] Color contrast ≥ 4.5:1 (large text), 7:1 (normal)
- [x] Form labels associated (htmlFor)
- [x] Error messages linked to inputs (aria-describedby)

### Form Accessibility
```typescript
// src/components/ui/Form.tsx
<form>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-describedby="email-error"
    required
  />
  <span id="email-error" className="text-red-600" role="alert">
    {errors.email?.message}
  </span>
</form>
```

### Calendar Accessibility
```typescript
// FullCalendar config
const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  // ARIA labels
  eventClassNames: 'event-accessible',
  eventDisplay: 'block',
  datesAboveResources: true,
};
```

### Required Fields in Admin
- Every image: **alt text** (form validation)
- Every blog post: **meta description** (SEO + a11y)
- Every CTA button: **screen reader text** if icon-only
- Every form field: **label + required indicator**

### Testing
- Automated: axe-core in CI/CD
- Manual: Screen reader testing (NVDA, JAWS)
- Browser: Firefox accessibility inspector

---

## 📊 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-2)
- [ ] Repo init + folder structure
- [ ] Next.js setup + Tailwind config
- [ ] Supabase DB schema + RLS policies
- [ ] Strapi CMS setup + content types
- [ ] NextAuth admin login

### Phase 2: Public Pages (Weeks 3-4)
- [ ] HOME page + hero + CTAs
- [ ] ABOUT page + mission statement
- [ ] MEMBERS page + filtering
- [ ] BLOG page + post templates
- [ ] CALENDAR (FullCalendar integration)
- [ ] DONATE page (Venmo redirect)

### Phase 3: Admin System (Weeks 5-6)
- [ ] Theme editor + color picker
- [ ] Page builder (drag-drop layout)
- [ ] Content managers (blog, events, members, gallery)
- [ ] Form submission dashboard
- [ ] Feature toggle panel
- [ ] Venmo settings

### Phase 4: Offline + PWA (Weeks 7-8)
- [ ] Service Worker + caching strategy
- [ ] Offline form queue + sync
- [ ] manifest.json + PWA install prompt
- [ ] PWA app shell caching
- [ ] Offline page

### Phase 5: Notifications + Polish (Weeks 9-10)
- [ ] Firebase Cloud Messaging setup
- [ ] Push subscription endpoints
- [ ] Admin notification composer
- [ ] Push analytics dashboard
- [ ] A11y audit + fixes
- [ ] Performance optimization (Lighthouse)

### Phase 6: Deployment (Week 11)
- [ ] Vercel production deploy
- [ ] Railway Strapi deployment
- [ ] Supabase connection pooling
- [ ] Custom domain + SSL
- [ ] Analytics + monitoring
- [ ] Go-live

---

## 🚀 DEPLOYMENT GUIDE

### Prerequisites
- GitHub repo created
- Vercel account connected
- Railway account for Strapi
- Supabase project initialized
- Firebase project for FCM

### 1. Deploy Frontend (Vercel)

```bash
# Connect repo to Vercel
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_STRAPI_API_URL
vercel env add NEXT_PUBLIC_FCM_API_KEY
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Deploy
vercel deploy --prod
```

### 2. Deploy Strapi (Railway)

```bash
# Connect Railway to GitHub
# Auto-deploys on push to main

# Set environment variables in Railway
DATABASE_URL=postgresql://...
JWT_SECRET=...
ADMIN_JWT_SECRET=...
STRAPI_ADMIN_PATH=/cms-admin
```

### 3. Database (Supabase)

```bash
# Run migrations
supabase db push

# Enable RLS on all tables
supabase roles create public --level database
supabase policies enable --all
```

### 4. Monitoring

```bash
# Vercel Analytics
# Built-in Web Vitals tracking

# Supabase Dashboard
# Query performance, row count, storage

# Firebase Console
# FCM delivery rates, user engagement
```

---

## 📞 SUPPORT & DOCUMENTATION

### Generated Docs (Created During Build)
- `ADMIN_UX.md` — Admin dashboard walkthrough
- `PWA_SETUP.md` — PWA installation & offline testing
- `CMS_SCHEMA.md` — Strapi content type documentation
- `API_REFERENCE.md` — All endpoints, request/response
- `BRAND_SYSTEM.md` — Color theory, font pairing, logo usage
- `ACCESSIBILITY.md` — WCAG compliance checklist

---

## 🎯 SUCCESS METRICS

### Performance Targets (Lighthouse)
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 90
- SEO: ≥ 90
- PWA: Installable

### User Engagement
- Monthly Active Users tracking
- Page view distribution
- Form completion rates
- Event RSVP conversion
- Push notification opt-in rate

### Admin Usability
- Zero code edits required
- Content publish time < 5 minutes
- Theme change < 2 minutes
- Support ticket resolution time

---

**END OF ARCHITECTURE DOCUMENT**

Next: Execute Phase 1 with oracle-genesis-engine + project-scaffolder
