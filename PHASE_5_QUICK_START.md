# Phase 5: Quick Start - Design System & Reusable Components
## Build Once, Use Everywhere

**Timeline:** 5 days  
**Effort:** 6/10 (straightforward component building)  
**Status:** Ready to execute  

---

## Day 1: Foundation Components

### 1.1 Create Reusable Hero Component
**File:** `components/Hero.tsx`

```typescript
interface HeroProps {
  image?: string;
  title: string;
  subtitle?: string;
  cta?: {
    text: string;
    link: string;
  };
  darken?: boolean; // Darken image background
}

export default function Hero({
  image,
  title,
  subtitle,
  cta,
  darken = true,
}: HeroProps) {
  return (
    <section
      className="hero py-32 min-h-[400px] flex items-center justify-center relative"
      style={
        image
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,${darken ? 0.5 : 0}), rgba(0,0,0,${darken ? 0.5 : 0})), url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {
              background: 'var(--color-secondary, #4a4b02)',
            }
      }
    >
      <div className="container text-center text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl mb-8 text-amber-300">
            {subtitle}
          </p>
        )}
        {cta && (
          <a
            href={cta.link}
            className="inline-block px-8 py-3 bg-accent text-primary font-bold rounded hover:opacity-90"
          >
            {cta.text}
          </a>
        )}
      </div>
    </section>
  );
}
```

**Test:** Update `app/page.tsx` to use Hero component

```typescript
import Hero from '@/components/Hero';

export default function Home() {
  return (
    <>
      <Hero 
        image="/images/hero-home.jpg"
        title="We Ride To Inspire"
        subtitle="Promoting horsemanship, sportsmanship, and community"
        cta={{ text: "Get Involved", link: "/get-involved" }}
      />
      {/* Rest of page */}
    </>
  );
}
```

**Checklist:**
- [ ] Component created
- [ ] Props interface defined
- [ ] Used on home page
- [ ] Renders with and without image
- [ ] Responsive on mobile

---

### 1.2 Create Card Components
**File:** `components/Cards/EventCard.tsx`

```typescript
interface EventCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  description?: string;
  rsvpLink?: string;
}

export default function EventCard({
  title,
  date,
  time,
  location,
  image,
  description,
  rsvpLink,
}: EventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
          {title}
        </h3>
        <div className="text-sm text-gray-600 mb-4">
          <p>📅 {date} at {time}</p>
          <p>📍 {location}</p>
        </div>
        {description && (
          <p className="text-gray-700 mb-4">{description}</p>
        )}
        {rsvpLink && (
          <a
            href={rsvpLink}
            className="inline-block px-4 py-2 text-white font-bold rounded"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            RSVP
          </a>
        )}
      </div>
    </div>
  );
}
```

**File:** `components/Cards/MemberCard.tsx`

```typescript
interface MemberCardProps {
  name: string;
  role: string;
  bio?: string;
  image?: string;
  email?: string;
}

export default function MemberCard({
  name,
  role,
  bio,
  image,
  email,
}: MemberCardProps) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-center overflow-hidden">
      {image && (
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
          {name}
        </h3>
        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-accent)' }}>
          {role}
        </p>
        {bio && <p className="text-gray-600 text-sm mb-4">{bio}</p>}
        {email && (
          <a
            href={`mailto:${email}`}
            className="text-blue-600 text-sm hover:underline"
          >
            {email}
          </a>
        )}
      </div>
    </div>
  );
}
```

**File:** `components/Cards/BlogCard.tsx`

```typescript
interface BlogCardProps {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image?: string;
  link: string;
  category?: string;
}

export default function BlogCard({
  title,
  excerpt,
  author,
  date,
  image,
  link,
  category,
}: BlogCardProps) {
  return (
    <article className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        {category && (
          <span
            className="text-xs font-bold px-2 py-1 rounded"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary)',
            }}
          >
            {category}
          </span>
        )}
        <h3 className="text-xl font-bold mt-3 mb-2" style={{ color: 'var(--color-primary)' }}>
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          By {author} • {date}
        </p>
        <p className="text-gray-700 mb-4">{excerpt}</p>
        <a
          href={link}
          className="text-blue-600 font-semibold hover:underline"
        >
          Read More →
        </a>
      </div>
    </article>
  );
}
```

**Checklist:**
- [ ] EventCard created and styled
- [ ] MemberCard created and styled
- [ ] BlogCard created and styled
- [ ] All cards use CSS variables for colors
- [ ] Cards responsive on mobile

---

### 1.3 Create Branded Form Components
**File:** `components/Forms/FormInput.tsx`

```typescript
interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export default function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  error,
}: FormInputProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block font-semibold mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
```

**File:** `components/Forms/FormTextarea.tsx`

```typescript
interface FormTextareaProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  error?: string;
}

export default function FormTextarea({
  label,
  name,
  placeholder,
  required,
  rows = 5,
  error,
}: FormTextareaProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block font-semibold mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
```

**File:** `components/Forms/FormButton.tsx`

```typescript
interface FormButtonProps {
  children: string;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  disabled?: boolean;
}

export default function FormButton({
  children,
  type = 'submit',
  loading,
  disabled,
}: FormButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className="w-full px-6 py-3 font-bold text-white rounded hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: 'var(--color-accent)' }}
    >
      {loading ? 'Sending...' : children}
    </button>
  );
}
```

**Checklist:**
- [ ] FormInput created
- [ ] FormTextarea created
- [ ] FormButton created
- [ ] Form components styled consistently
- [ ] Error states work

---

## Day 2: Database-Driven Pages

### 2.1 Create Query Functions
**File:** `lib/db/queries.ts`

```typescript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('asca-pwa');

// Get all settings
export async function getSettings() {
  try {
    const settings = await db
      .collection('Settings')
      .findOne({});
    return settings || {};
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
}

// Get theme
export async function getTheme() {
  try {
    const theme = await db
      .collection('Theme')
      .findOne({});
    return theme || {
      colors: {
        primary: '#1a1a1a',
        secondary: '#4a4b02',
        accent: '#f5d800',
        neutral: '#ffffff',
      },
    };
  } catch (error) {
    console.error('Error fetching theme:', error);
    return {};
  }
}

// Get upcoming events
export async function getUpcomingEvents(limit = 6) {
  try {
    const events = await db
      .collection('Events')
      .find({ publishedAt: { $lte: new Date() } })
      .sort({ date: 1 })
      .limit(limit)
      .toArray();
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// Get all members
export async function getMembers() {
  try {
    const members = await db
      .collection('Members')
      .find({})
      .sort({ role: 1 })
      .toArray();
    return members;
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
}

// Get recent blog posts
export async function getBlogPosts(limit = 5) {
  try {
    const posts = await db
      .collection('BlogPosts')
      .find({})
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray();
    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Get gallery images
export async function getGalleryImages(category?: string) {
  try {
    const query = category ? { category } : {};
    const images = await db
      .collection('GalleryImages')
      .find(query)
      .sort({ uploadedAt: -1 })
      .toArray();
    return images;
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return [];
  }
}
```

**Checklist:**
- [ ] Query functions created
- [ ] All queries tested in development
- [ ] Error handling in place

---

### 2.2 Update Home Page
**File:** `app/page.tsx` (refactored)

```typescript
import Hero from '@/components/Hero';
import EventCard from '@/components/Cards/EventCard';
import BlogCard from '@/components/Cards/BlogCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  getSettings,
  getUpcomingEvents,
  getBlogPosts,
} from '@/lib/db/queries';

export default async function Home() {
  const settings = await getSettings();
  const upcomingEvents = await getUpcomingEvents(3);
  const blogPosts = await getBlogPosts(1);

  return (
    <>
      <Header settings={settings} />
      <main>
        {/* Hero Section - from settings */}
        <Hero
          image={settings.heroes?.home?.image}
          title={settings.heroes?.home?.title || 'We Ride To Inspire'}
          subtitle={settings.heroes?.home?.subtitle}
          cta={settings.heroes?.home?.cta}
        />

        {/* Upcoming Events - from database */}
        <section className="py-20 bg-white">
          <div className="container">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: 'var(--color-primary)' }}>
              Upcoming Events
            </h2>
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event._id.toString()}
                    title={event.title}
                    date={new Date(event.date).toLocaleDateString()}
                    time={event.time}
                    location={event.location}
                    image={event.image}
                    description={event.description}
                    rsvpLink={`/calendar#${event._id}`}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">
                Check back soon for upcoming events!
              </p>
            )}
          </div>
        </section>

        {/* Why Join Section - from settings */}
        {settings.features && (
          <section className="py-20 bg-gray-50">
            <div className="container">
              <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: 'var(--color-primary)' }}>
                {settings.featuresTitle || 'Why Join ASCA?'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {settings.features.map((feature) => (
                  <div
                    key={feature.title}
                    className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
                  >
                    <div className="text-5xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 text-white" style={{ backgroundColor: 'var(--color-secondary)' }}>
          <div className="container text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Ride With Us?</h2>
            <p className="text-lg mb-8 text-gray-200">
              Learn more about membership or get involved with ASCA today
            </p>
            <a
              href="/get-involved"
              className="inline-block px-8 py-3 font-bold rounded hover:opacity-90"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Join Now
            </a>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
```

**Checklist:**
- [ ] Home page refactored to use components
- [ ] Data fetched from database
- [ ] Hero from settings
- [ ] Events from database
- [ ] Page renders correctly

---

## Day 3-4: Refactor Other Pages

### Similar pattern for:
- `/about` - Hero from settings + about content
- `/members` - Hero + Member grid cards
- `/calendar` - Hero + Event cards grid
- `/blog` - Hero + Blog cards grid

**Pattern (example for /about):**

```typescript
import Hero from '@/components/Hero';
import { getSettings } from '@/lib/db/queries';

export default async function About() {
  const settings = await getSettings();

  return (
    <>
      <Hero
        image={settings.heroes?.about?.image}
        title={settings.heroes?.about?.title || 'Our Story'}
      />
      
      <section className="py-20 container">
        <h2 className="text-4xl font-bold mb-8">{settings.aboutTitle}</h2>
        <div className="prose max-w-none">
          {settings.aboutContent}
        </div>
      </section>
    </>
  );
}
```

**Checklist for each page:**
- [ ] Uses Hero component
- [ ] Fetches data from database
- [ ] Uses Card components for lists
- [ ] Responsive layout
- [ ] Colors from CSS variables

---

## Day 5: Testing & Verification

### 5.1 Test All Pages
```bash
npm run dev
```

Visit each page and verify:
- [ ] Home - hero shows, events load, colors apply
- [ ] About - hero shows, content displays
- [ ] Members - hero shows, members display as cards
- [ ] Calendar - hero shows, events as cards
- [ ] Blog - hero shows, blog posts as cards
- [ ] Get Involved - forms work
- [ ] Donate - content displays

### 5.2 Test Mobile Responsive
- [ ] Open on iPhone (or phone browser)
- [ ] All pages readable
- [ ] Images scale properly
- [ ] Buttons clickable
- [ ] No overflow

### 5.3 Test Theme Switching
1. Update MongoDB theme colors:
```bash
mongosh
use asca-pwa
db.Theme.updateOne({}, {$set: {colors: {primary: "#2196f3", ...}}})
```

2. Refresh page - colors should update

**Checklist:**
- [ ] All pages render correctly
- [ ] Mobile responsive works
- [ ] Theme colors apply everywhere
- [ ] No console errors
- [ ] Forms functional

---

## Success Criteria

✅ **Hero Component**
- Works with/without image
- Responsive
- Uses CSS variables

✅ **Card Components**
- EventCard, MemberCard, BlogCard created
- All themed with CSS variables
- Responsive grid layouts

✅ **Form Components**
- FormInput, FormTextarea, FormButton
- Error states
- Branded styling

✅ **Database-Driven Pages**
- All 7 pages fetch from DB
- No hardcoded content
- Settings control appearance
- Theme affects all colors

✅ **Mobile Responsive**
- All pages work on small screens
- Images scale properly
- Touch-friendly buttons

---

## Files to Create/Modify

**New:**
```
components/Hero.tsx
components/Cards/EventCard.tsx
components/Cards/MemberCard.tsx
components/Cards/BlogCard.tsx
components/Forms/FormInput.tsx
components/Forms/FormTextarea.tsx
components/Forms/FormButton.tsx
lib/db/queries.ts
```

**Modify:**
```
app/page.tsx
app/about/page.tsx
app/members/page.tsx
app/calendar/page.tsx
app/blog/page.tsx
```

---

## Next: Phase 6 (Content Population)

Once Phase 5 is complete:
1. Admin adds events, members, blog posts
2. Upload images to gallery
3. Set hero images in settings
4. Deploy

---

## Tips

- **Use hardcoded fallbacks** - If setting not found, use default
- **Test in development** - Verify each component before moving next
- **Keep components simple** - One responsibility per component
- **Document props** - Add comments to interfaces
- **Test responsiveness** - Use browser DevTools mobile view

---

**Status:** Ready to Build  
**Estimated Duration:** 5 days  
**Next Milestone:** Phase 6 (Content Population)
