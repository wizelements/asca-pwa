# ASCA Admin System — UX Wireframes

---

## Admin Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ASCA Admin Dashboard          [Profile ▼] [Logout]          │
├─────────┬───────────────────────────────────────────────────┤
│         │                                                     │
│ SIDEBAR │   📊 DASHBOARD                                    │
│ ────────│                                                     │
│ 📊 Home │   Welcome back, Admin!                            │
│ 🎨 Brand│                                                     │
│ 📝 Blog │   Quick Stats                                     │
│ 📅 Events   ┌──────────────┬──────────────┬──────────────┐  │
│ 👥 Members │ 245 Members  │ 12 Events    │ 1,850 Subs   │  │
│ 📸 Gallery │              │              │              │  │
│ 📋 Forms   │ This Month   │ This Month   │ This Month   │  │
│ 🔔 Notify  │ ▲ 12        │ ▲ 3         │ ▲ 142        │  │
│ ⚙️ Feature │              │              │              │  │
│ 💰 Venmo   └──────────────┴──────────────┴──────────────┘  │
│ ⚙️ Settings   Recent Activity                               │
│            ┌─────────────────────────────────────────────┐  │
│            │ • New member: Sarah Johnson (15m ago)      │  │
│            │ • Blog post published: "Spring Training"  │  │
│            │ • 45 form submissions received (today)     │  │
│            └─────────────────────────────────────────────┘  │
│                                                             │
│            [New Event] [New Blog Post] [View Form Inbox]   │
│                                                             │
└─────────┴───────────────────────────────────────────────────┘
```

---

## Branding Editor

```
┌─────────────────────────────────────────────────────────────┐
│ ASCA Admin > Branding                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎨 COLORS                                                  │
│ ────────────────────────────────────────────────────────   │
│                                                             │
│ Primary Dark              Secondary Olive                   │
│ ┌──────────────────┐      ┌──────────────────┐              │
│ │                  │      │                  │              │
│ │   [■ #1a1a1a]    │      │   [■ #4a4b02]    │              │
│ │   [  Pick ...]   │      │   [  Pick ...]   │              │
│ └──────────────────┘      └──────────────────┘              │
│ Contrast: ✓ Pass (9.5:1)  Contrast: ✓ Pass (8.2:1)         │
│                                                             │
│ Accent Gold               White Text                       │
│ ┌──────────────────┐      ┌──────────────────┐              │
│ │                  │      │                  │              │
│ │   [■ #f5d800]    │      │   [■ #ffffff]    │              │
│ │   [  Pick ...]   │      │   [  Pick ...]   │              │
│ └──────────────────┘      └──────────────────┘              │
│ Contrast: ✓ Pass (9.8:1)  Contrast: ✓ Pass (21:1)          │
│                                                             │
│ ────────────────────────────────────────────────────────   │
│                                                             │
│ 📝 TYPOGRAPHY                                              │
│ ────────────────────────────────────────────────────────   │
│                                                             │
│ Heading Font:   [Playfair Display ▼]  [  Preview  ]       │
│ Body Font:      [Open Sans ▼]          [  Preview  ]       │
│                                                             │
│ ────────────────────────────────────────────────────────   │
│                                                             │
│ 🎯 LOGO & TAGLINE                                          │
│ ────────────────────────────────────────────────────────   │
│                                                             │
│ Logo SVG:       [Upload] › current-logo.svg                │
│                                                             │
│ Tagline:        [ We Ride To Inspire _________________ ]   │
│                                                             │
│ ────────────────────────────────────────────────────────   │
│                                                             │
│ 👁️  LIVE PREVIEW                                           │
│ ────────────────────────────────────────────────────────   │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ HOME PAGE PREVIEW                                    │   │
│ │ ──────────────────────────────────────────────────── │   │
│ │                                                      │   │
│ │ [ASCA Logo]           We Ride To Inspire [Join CTA] │   │
│ │                                                      │   │
│ │  Hero Section (with your colors)                    │   │
│ │  ╔════════════════════════════════════════════════╗ │   │
│ │  ║ We Ride To Inspire                             ║ │   │
│ │  ║ Building Better Horsemanship                   ║ │   │
│ │  ║                [PRIMARY CTA]                    ║ │   │
│ │  ╚════════════════════════════════════════════════╝ │   │
│ │                                                      │   │
│ │ [Cards with your colors...]                        │   │
│ │                                                      │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ [Save & Publish]  [Cancel]                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Content Manager — Blog

```
┌─────────────────────────────────────────────────────────────┐
│ ASCA Admin > Content > Blog                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [+ New Post]  [Filter ▼] [Search: ______________]         │
│                                                             │
│ Title                    Status    Date        Actions      │
│ ──────────────────────────────────────────────────────────  │
│ Spring Training Tips     ✓ Pub    Jan 20       [Edit] [⋯]  │
│ Winter Care for Horses   ✓ Pub    Jan 15       [Edit] [⋯]  │
│ Intro to Horsemanship    Draft    Jan 10       [Edit] [⋯]  │
│ Championship Results     Scheduled Jan 25       [Edit] [⋯]  │
│                                                             │
│ ──────────────────────────────────────────────────────────  │
│                                      Page 1 of 3 ›           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Blog Editor — New Post                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Title:              [____________________________________]  │
│ Slug:               [____________________________________]  │
│ Author:             [Choose Author ▼]                      │
│                                                             │
│ Featured Image:     [Upload] › image.jpg   [✓ Remove]      │
│                     Alt Text: [________________]           │
│                                                             │
│ Content:                                                    │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ [B] [I] [U] [H1] [Link] [Image] [Quote] [Code]      │   │
│ │                                                      │   │
│ │ [Rich text editor with visual formatting...]        │   │
│ │                                                      │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ Excerpt:            [____________________________________]  │
│ Tags:               [spring] [training] [Add Tag ▼]       │
│ Meta Description:   [____________________________________]  │
│                                                             │
│ Status:  ○ Draft  ○ Published  ○ Scheduled for: [Date]    │
│                                                             │
│ [Save Draft]  [Publish Now]  [Preview]  [Cancel]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Events Manager

```
┌─────────────────────────────────────────────────────────────┐
│ ASCA Admin > Content > Events                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📅 Calendar View     [← January 2026 →]                   │
│ ────────────────────────────────────────────────────────── │
│  SUN    MON    TUE    WED    THU    FRI    SAT             │
│   3      4      5      6      7      8      9              │
│                                1      2                    │
│                           [Training]  [RSVP: 23]           │
│                                                             │
│  10     11     12     13     14     15     16              │
│       [Workshop]                                           │
│       [RSVP: 45]                                           │
│                                                             │
│  17     18     19     20     21     22     23              │
│  [Championship Finals]                                     │
│  [RSVP: 128]                                               │
│                                                             │
│  24     25     26     27     28     29     30              │
│  [New Event...]                                            │
│                                                             │
│ ────────────────────────────────────────────────────────── │
│                                                             │
│ [+ New Event]  [List View]  [Today]                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Event Editor                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Title:          [Training Session ________________]         │
│                                                             │
│ Date & Time:    [Jan 25, 2026]  [2:00 PM ▼]  [to]  [4:00 PM] │
│                                                             │
│ Location:       [ASCA Facility, Atlanta, GA _____]         │
│ Category:       [Training ▼]                               │
│                                                             │
│ Description:    [____________________________________]     │
│                 [Rich text editor...]                      │
│                                                             │
│ Image:          [Upload] › event.jpg   [✓ Remove]          │
│ Alt Text:       [____________________________________]     │
│                                                             │
│ Max RSVPs:      [Unlimited ▼] or [100]                    │
│                                                             │
│ RSVP Status:    ✓ Enabled  □ Disabled                      │
│                                                             │
│ Current RSVPs:  45 / 100                                   │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Sarah Johnson (Jan 20)                    ○ Going  │   │
│ │ Mike Chen (Jan 19)                        ○ Going  │   │
│ │ Jessica Lee (Jan 18)                      ○ Going  │   │
│ │ [Export RSVPs to CSV]                              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ [Save]  [Publish]  [Send Reminder Notification]  [Cancel]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Form Submissions Inbox

```
┌─────────────────────────────────────────────────────────────┐
│ ASCA Admin > Forms & Submissions                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Filter by Type ▼] [Search: _______________] [Export]      │
│                                                             │
│ NEWSLETTER SUBSCRIPTIONS (142 new)                          │
│ ──────────────────────────────────────────────────────────  │
│ [✓] john@example.com      Added: Jan 20, 2026              │
│ [✓] sarah@example.com     Added: Jan 19, 2026  [Unsub]    │
│ [✓] mike@example.com      Added: Jan 18, 2026              │
│                                                             │
│ CONTACT FORM SUBMISSIONS (7 new)                           │
│ ──────────────────────────────────────────────────────────  │
│ ☐ Interested in Lessons                              New    │
│   From: Jane Doe (jane@example.com) | Jan 20                │
│   Message: "I'm interested in riding lessons for my..." │  │
│   [View] [Reply] [Archive] [Delete]                         │
│                                                             │
│ ☐ Event Sponsorship Inquiry                         New    │
│   From: Company ABC | Jan 19                                │
│   Message: "We'd like to sponsor your upcoming..."          │
│   [View] [Reply] [Archive] [Delete]                         │
│                                                             │
│ MEMBERSHIP APPLICATIONS (3 new)                             │
│ ──────────────────────────────────────────────────────────  │
│ Application ID: APP-001                              New    │
│   Name: Tom Wilson                                          │
│   Email: tom@example.com | Phone: (404) 555-1234           │
│   Riding Level: Intermediate | Interests: Training, Events │
│   Status: Submitted (Jan 20, 5:30 PM)                       │
│   [Approve] [Reject] [More Info] [View Details]            │
│                                                             │
│ VOLUNTEER SIGNUPS (2 new)                                   │
│ ──────────────────────────────────────────────────────────  │
│ Name: Lisa Garcia | Email: lisa@example.com                │
│ Interests: Events, Outreach                                │
│ Availability: Weekends                                     │
│ Status: New | [Contact] [Mark Active] [Archive]            │
│                                                             │
│ ──────────────────────────────────────────────────────────  │
│                                    Page 1 of 2 ›             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Notifications Center

```
┌─────────────────────────────────────────────────────────────┐
│ ASCA Admin > Notifications                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Compose New]  [History]                                   │
│                                                             │
│ COMPOSE NOTIFICATION                                        │
│ ────────────────────────────────────────────────────────── │
│                                                             │
│ Title:          [_________________________________]        │
│ Body:           [_________________________________]        │
│                 [_________________________________]        │
│                                                             │
│ Action Button:  [Optional Label]                           │
│ Action Link:    [/events or https://...]                   │
│                                                             │
│ Icon:           [Upload] › icon.png  [✓ Remove]            │
│                                                             │
│ TARGET AUDIENCE:                                           │
│ ○ All Users                                                │
│ ○ Event Subscribers                                        │
│ ○ Newsletter Subscribers                                   │
│ ○ New Members (last 30 days)                              │
│ ○ Test (Admin Only)                                        │
│                                                             │
│ SCHEDULE:                                                  │
│ ○ Send Now                                                 │
│ ○ Schedule for: [Jan 25, 2026] at [2:00 PM ▼]             │
│                                                             │
│ [Test Send] [Schedule] [Cancel]                            │
│                                                             │
│ ────────────────────────────────────────────────────────── │
│                                                             │
│ NOTIFICATION HISTORY                                        │
│ ────────────────────────────────────────────────────────── │
│                                                             │
│ "Join Our Spring Training!"     Jan 20, 2:15 PM            │
│ Sent to: All Users | Delivered: 245 / 250                 │
│ Click Rate: 18% | RSVP Conversions: 12                     │
│ [View Details]                                              │
│                                                             │
│ "Event Reminder: Training Today"  Jan 15, 8:00 AM          │
│ Sent to: Event Subscribers | Delivered: 89 / 95            │
│ Click Rate: 45% | Attendance: 38/45 (84%)                 │
│ [View Details]                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature Toggles

```
┌─────────────────────────────────────────────────────────────┐
│ ASCA Admin > Features                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ CONTROL WHICH FEATURES ARE VISIBLE TO USERS                 │
│                                                             │
│ Lead Magnet Popup                    [Toggle: ON ▼]       │
│ ─────────────────────────────────────────────────────────  │
│ Show popup after 30 seconds of scrolling? Enable to capture │
│ early interest in your newsletter.                         │
│                                                             │
│ Exit Intent Popup                    [Toggle: OFF ▼]      │
│ ─────────────────────────────────────────────────────────  │
│ Show popup when user tries to leave? Enable to offer last  │
│ chance to subscribe or take action.                        │
│                                                             │
│ Donation Module                      [Toggle: ON ▼]       │
│ ─────────────────────────────────────────────────────────  │
│ Show donate page & CTA buttons throughout site.            │
│                                                             │
│ Testimonials Section                 [Toggle: ON ▼]       │
│ ─────────────────────────────────────────────────────────  │
│ Show member testimonials on homepage?                      │
│                                                             │
│ Volunteer Module                     [Toggle: ON ▼]       │
│ ─────────────────────────────────────────────────────────  │
│ Show volunteer signup in Get Involved section?             │
│                                                             │
│ Push Notifications                   [Toggle: ON ▼]       │
│ ─────────────────────────────────────────────────────────  │
│ Enable browser push notifications? Users will see          │
│ permission prompt on first visit.                          │
│                                                             │
│ Event RSVP System                    [Toggle: ON ▼]       │
│ ─────────────────────────────────────────────────────────  │
│ Enable event RSVP tracking?                                │
│                                                             │
│ Advanced: Personalization             [Toggle: OFF ▼]     │
│ ─────────────────────────────────────────────────────────  │
│ Show personalized content based on user behavior?          │
│ (Requires analytics tracking)                              │
│                                                             │
│ [Save Changes]                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Mobile Admin View

```
┌─────────────────┐
│ ☰  Dashboard    │
├─────────────────┤
│                 │
│ Quick Stats     │
│ ┌─────────────┐ │
│ │ 245 Members │ │
│ │ △ 12 this m │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │ 12 Events   │ │
│ │ △ 3 this m  │ │
│ └─────────────┘ │
│                 │
│ [+ New Event]   │
│ [+ New Post]    │
│ [View Inbox]    │
│                 │
│ ─────────────── │
│                 │
│ Menu:           │
│ • Home          │
│ • Branding      │
│ • Blog          │
│ • Events        │
│ • Members       │
│ • Gallery       │
│ • Forms         │
│ • Notify        │
│ • Features      │
│ • Venmo         │
│ • Settings      │
│ • Logout        │
│                 │
└─────────────────┘
```

---

## Members Manager

```
┌─────────────────────────────────────────────────────────────┐
│ ASCA Admin > Content > Members                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [+ Add Member]  [Filter: Rider ▼]  [Search: ________]     │
│                                                             │
│ Members Grid                                                │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│ │              │  │              │  │              │       │
│ │  [Photo]     │  │  [Photo]     │  │  [Photo]     │       │
│ │              │  │              │  │              │       │
│ │ John Smith   │  │ Sarah Jones  │  │ Mike Chen    │       │
│ │ Rider        │  │ Instructor   │  │ Volunteer    │       │
│ │              │  │              │  │              │       │
│ │ [Edit][✓]    │  │ [Edit][✓]    │  │ [Edit][✓]    │       │
│ └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                             │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│ │              │  │              │  │              │       │
│ │  [Photo]     │  │  [Photo]     │  │  [+Add]      │       │
│ │              │  │              │  │              │       │
│ │ Jessica Lee  │  │ Tom Wilson   │  │              │       │
│ │ Rider        │  │ Instructor   │  │ New Member   │       │
│ │              │  │              │  │              │       │
│ │ [Edit][✓]    │  │ [Edit][✓]    │  │ [Add]        │       │
│ └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                             │
│ Page 1 of 3 ›                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Edit Member                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Photo:          [Upload] › photo.jpg   [✓ Remove]          │
│ Name:           [John Smith ________________]               │
│ Role(s):        [✓ Rider] [✓ Instructor] [□ Volunteer]   │
│ Bio:            [____________________________________]     │
│                 [____________________________________]     │
│                                                             │
│ Show on Directory?  [✓ Yes] [□ No]                         │
│                                                             │
│ [Save] [Delete] [Cancel]                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Venmo Configuration

```
┌─────────────────────────────────────────────────────────────┐
│ ASCA Admin > Venmo Settings                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 💰 VENMO DONATION SETTINGS                                  │
│                                                             │
│ Venmo Username:    [@atlantasaddleclub ________]            │
│ ℹ️ Your Venmo handle for donations. Users will be          │
│    redirected to pay you directly.                         │
│                                                             │
│ ────────────────────────────────────────────────────────── │
│                                                             │
│ DONATION PRESETS                                            │
│ Add preset amounts for quick donations                      │
│                                                             │
│ [✓] $10   [Remove]                                          │
│ [✓] $25   [Remove]                                          │
│ [✓] $50   [Remove]                                          │
│ [✓] $100  [Remove]                                          │
│                                                             │
│ [+ Add New Preset]                                          │
│                                                             │
│ ────────────────────────────────────────────────────────── │
│                                                             │
│ MESSAGE TEMPLATE                                            │
│ Default message on Venmo requests                           │
│                                                             │
│ [Support ASCA - We Ride To Inspire ________________]       │
│                                                             │
│ Variables: {amount} will be replaced with donation amount  │
│                                                             │
│ ────────────────────────────────────────────────────────── │
│                                                             │
│ 🔗 DONATION LINK PREVIEW                                    │
│                                                             │
│ $25 Donation Link:                                          │
│ venmo.com/atlantasaddleclub?amount=25&note=Support%20ASCA  │
│                                                             │
│ ────────────────────────────────────────────────────────── │
│                                                             │
│ DONATION TRACKING                                           │
│                                                             │
│ Donations logged (Venmo external):                          │
│ [View Donation History] — See all recorded donations       │
│                                                             │
│ ────────────────────────────────────────────────────────── │
│                                                             │
│ [Save Settings]                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Interaction Patterns

### Confirmation Dialogs
```
Publish Blog Post?

This will make the post visible to all site visitors.

[Cancel] [Publish]
```

### Toast Notifications
```
✓ Changes saved successfully (auto-dismiss after 3s)
! 3 validation errors found
⚠ Are you sure? This cannot be undone.
```

### Loading States
```
Saving theme...
[Skeleton loaders for content areas]
```

### Empty States
```
No blog posts yet.
[+ Create First Post] or [Import from another site]
```

---

**Key UX Principles:**
1. **Minimal Cognitive Load** — No technical jargon
2. **Progress Feedback** — Users always know what's happening
3. **Safe Defaults** — Difficult actions require confirmation
4. **Mobile-First** — Responsive design throughout
5. **Accessibility** — Keyboard nav, screen reader labels
