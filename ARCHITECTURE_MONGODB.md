# ASCA PWA - MongoDB Architecture (Phase 1)

## Overview

This is the **Phase 1 Foundation Build** for the Atlanta Saddle Club Association Progressive Web App with MongoDB as the primary database (changed from Supabase PostgreSQL).

**Status:** Phase 1 Complete (Ready for Phase 2: Public Pages)

## Database Schema

MongoDB Collections (instead of PostgreSQL tables):

### 1. **Users**
- Stores admin/staff login credentials
- Email-based authentication
- Role-based access control (admin, editor, viewer)
- Password hashing with bcrypt

```javascript
{
  email: string (unique),
  password: string (hashed),
  name: string,
  role: 'admin' | 'editor' | 'viewer',
  permissions: string[],
  isActive: boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **Theme**
- Single document for site-wide theme
- Admin-editable colors and fonts
- Logo and favicon URLs

```javascript
{
  colors: {
    primary: string,
    secondary: string,
    accent: string,
    neutral: string
  },
  fonts: {
    sans: string,
    serif: string
  },
  logo: string,
  favicon: string,
  updatedBy: string,
  updatedAt: Date
}
```

### 3. **Settings**
- Site configuration (title, description, URL)
- Venmo integration settings
- Feature toggles (notifications, maintenance mode)

```javascript
{
  siteTitle: string,
  siteDescription: string,
  siteUrl: string,
  venmoUsername: string,
  venmoPresets: Array<{ label: string, amount: number }>,
  notificationsEnabled: boolean,
  maintenanceMode: boolean,
  updatedAt: Date
}
```

### 4. **Events**
- Calendar events with RSVP tracking
- Requires imageAlt for accessibility
- Published/draft state

```javascript
{
  title: string,
  description: string,
  date: Date,
  endDate: Date,
  location: string,
  imageUrl: string,
  imageAlt: string (required),
  capacity: number,
  registrationDeadline: Date,
  rsvpList: string[],
  published: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. **Members**
- User-submitted membership profiles
- Filterable by role (rider, volunteer, instructor)
- Verification and active status

```javascript
{
  firstName: string,
  lastName: string,
  email: string (unique),
  phone: string,
  roles: ['rider' | 'volunteer' | 'instructor'][],
  joinDate: Date,
  profileImage: string,
  bio: string,
  experience: string,
  isVerified: boolean,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. **BlogPosts**
- Content management for blog articles
- Slug-based URLs (unique)
- Published/draft state
- View counting

```javascript
{
  title: string,
  slug: string (unique),
  content: string,
  excerpt: string,
  author: string,
  categories: string[],
  imageUrl: string,
  imageAlt: string,
  published: boolean,
  publishedAt: Date,
  viewCount: number,
  createdAt: Date,
  updatedAt: Date
}
```

### 7. **GalleryImages**
- Photo gallery management
- Categorized and featured filtering

```javascript
{
  title: string,
  imageUrl: string,
  alt: string (required),
  description: string,
  category: string,
  featured: boolean,
  uploadedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 8. **FormSubmissions**
- Stores form submissions (membership, volunteer, contact, donation)
- Tracks offline submissions
- Status workflow (submitted → reviewed → resolved)

```javascript
{
  formType: 'membership' | 'volunteer' | 'contact' | 'donation',
  data: object,
  status: 'submitted' | 'reviewed' | 'resolved',
  submittedAt: Date,
  submittedOffline: boolean,
  notes: string,
  createdAt: Date,
  updatedAt: Date
}
```

## API Routes (Phase 1)

### Authentication
- `POST /api/auth` - Login endpoint
- Validates credentials, returns user info

### Events
- `GET /api/events` - Fetch published events
- `POST /api/events` - Create event (admin)

### Health
- `GET /api/health` - Database connectivity check

## Project Structure

```
asca-pwa/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── events/
│   │   └── health/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── db.ts (MongoDB connection)
│   └── models/
│       ├── User.ts
│       ├── Theme.ts
│       ├── Settings.ts
│       ├── Event.ts
│       ├── Member.ts
│       ├── BlogPost.ts
│       ├── GalleryImage.ts
│       └── Form.ts
├── public/
│   ├── manifest.json (PWA manifest)
│   └── offline.html
├── scripts/
│   ├── migrate.js (Create indexes)
│   └── seed.js (Default theme/settings)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local
```

## Setup & Running

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
# Copy .env.example to .env.local and fill in MongoDB URI
cp .env.example .env.local
```

### 3. Run migrations (create indexes)
```bash
npm run db:migrate
```

### 4. Seed database (default theme/settings)
```bash
npm run db:seed
```

### 5. Start development server
```bash
npm run dev
```

Visit `http://localhost:3000`

## Key Changes from Supabase → MongoDB

| Aspect | Supabase | MongoDB |
|--------|----------|---------|
| **Database** | PostgreSQL | MongoDB (document-based) |
| **Query Style** | SQL | Mongoose schemas |
| **Row-Level Security** | Native RLS policies | Document validation + middleware |
| **Realtime** | Supabase Realtime | Socket.io or polling |
| **Auth** | Supabase Auth | NextAuth.js with custom User model |
| **Migrations** | Supabase migrations | MongoDB indexes + seed script |

## Next Steps (Phase 2)

- [ ] Create public page routes (HOME, ABOUT, MEMBERS, CALENDAR, etc.)
- [ ] Build admin dashboard UI
- [ ] Implement theme editor (color picker, font selector)
- [ ] Set up NextAuth.js admin login flow
- [ ] Create form submission endpoints
- [ ] Build event calendar UI with RSVP

---

**Build Date:** January 26, 2026  
**Database:** MongoDB (Atlas or local)  
**Framework:** Next.js 14 (App Router)  
**Auth:** NextAuth.js  
**Status:** Phase 1 ✓ Complete
