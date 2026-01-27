# Admin Training Guide - ASCA PWA Dashboard
## Non-Technical User Guide

**For:** Admin staff who will manage the website  
**Time to learn:** 15 minutes  
**Difficulty:** Easy (no coding required)

---

## Getting Started

### Login
```
URL: https://asca-pwa.vercel.app/admin
Email: admin@ascapwa.org
Password: [Check with IT]
```

**Note:** Change your password immediately after first login!

---

## Dashboard Overview

After logging in, you'll see the Admin menu with 7 sections:

```
ADMIN DASHBOARD
├── 📊 Dashboard (overview, stats)
├── ⚙️ Settings (site name, contact, social)
├── 🎨 Theme (colors, logo, fonts)
├── 📅 Events (manage events)
├── 👥 Members (manage team)
├── 📝 Blog (write articles)
├── 🖼️ Gallery (upload photos)
└── 📧 Forms (view form submissions)
```

---

## 1️⃣ Settings - Site Identity

### What It Does
Controls the site name, contact info, social media links, and hero images shown on each page.

### How to Use

**Location:** Admin → Settings

**Fields to Update:**

```
SITE IDENTITY
Site Name: [Your organization name]
Description: [Tagline or mission statement]
Tagline: [Short inspiring phrase]

CONTACT INFORMATION
Email: [Contact email address]
Phone: [(404) 555-0123]
Address: [City, State]

SOCIAL MEDIA LINKS
Facebook: [https://facebook.com/yourpage]
Instagram: [https://instagram.com/yourprofile]
YouTube: [https://youtube.com/channel/...]

DONATION INFO
Venmo Username: [@yourname]
Venmo Suggested Amounts: [10, 25, 50, 100]
CashApp: [$yourname]
```

### Tips
- Social links are shown in the footer
- Contact info appears on contact page and footer
- Venmo amounts show as quick-select buttons on donate page

---

## 2️⃣ Theme - Brand Colors

### What It Does
Sets the website colors. Changes here update the entire site instantly.

### How to Use

**Location:** Admin → Theme

**Color Fields:**

```
PRIMARY COLOR
(Used for: Main text, headers, buttons)
Current: #1a1a1a (Dark)
Click to open color picker and select new color

SECONDARY COLOR
(Used for: Section backgrounds, accents)
Current: #4a4b02 (Olive)

ACCENT COLOR
(Used for: Call-to-action buttons, highlights)
Current: #f5d800 (Gold)

NEUTRAL COLOR
(Used for: Text backgrounds, cards)
Current: #ffffff (White)
```

### How to Change Colors
1. Click the color box (opens color picker)
2. Select new color or paste hex code (#rrggbb)
3. Click "Save Changes"
4. Visit website in new browser tab - colors updated immediately

### Tips
- Keep primary & neutral with high contrast for readability
- Accent color should "pop" against primary
- Test on mobile to ensure visibility
- Common hex codes:
  - #ffffff = White
  - #000000 = Black
  - #2196f3 = Blue
  - #ff6b6b = Red
  - #4caf50 = Green

---

## 3️⃣ Settings - Hero Images

### What It Does
Sets the large banner image shown at the top of each page (home, about, members, calendar, blog).

### How to Use

**Location:** Admin → Settings → Heroes Section

**Fields (for each page):**

```
HOME PAGE HERO
Image: [Upload or select from gallery]
Title: [Hero heading text]
Subtitle: [Smaller text below title]
Button Text: [e.g., "Get Involved"]
Button Link: [Select page or enter URL]

ABOUT PAGE HERO
Image: [Hero image]
Title: [Hero heading]

MEMBERS PAGE HERO
[Similar fields]

CALENDAR PAGE HERO
[Similar fields]

BLOG PAGE HERO
[Similar fields]
```

### How to Upload Image
1. Click "Upload Image" button
2. Select file from your computer
3. Image uploads and shows in preview
4. Click "Save Changes"

### Tips
- Use high-quality images (1200x400px recommended)
- Keep text large and readable
- Make sure hero image isn't too dark or too light
- If image is dark, title will be white. If light, title will be dark (auto-contrast).

---

## 4️⃣ Events - Manage Calendar

### What It Does
Add, edit, or delete events that appear on the calendar page.

### How to Use

**Location:** Admin → Events

**To Add New Event:**
1. Click "Add Event" button
2. Fill in form fields:

```
EVENT DETAILS
Title: [Event name]
Date: [Select date from calendar picker]
Time: [Enter time, e.g., "2:00 PM"]
Location: [Where the event is]
Description: [What is this event about?]
Image: [Upload event photo]
RSVP Limit: [Max number of attendees, or leave blank for unlimited]
Published: [Toggle ON to show on website]
```

3. Click "Save Event"
4. Event now appears on /calendar page

**To Edit Existing Event:**
1. Find event in the list
2. Click "Edit" button
3. Update fields
4. Click "Save Event"

**To Delete Event:**
1. Find event in list
2. Click "Delete" button
3. Confirm deletion

### Tips
- Set "Published: OFF" to draft events before they're ready
- Use clear, short titles ("Spring Trail Ride" not "annual spring trail riding event")
- Add event image for visual interest
- RSVP limit is optional - leave blank if no limit

---

## 5️⃣ Members - Manage Team Page

### What It Does
Add team members with roles, bios, and photos.

### How to Use

**Location:** Admin → Members

**To Add New Member:**
1. Click "Add Member" button
2. Fill in form:

```
MEMBER PROFILE
Name: [Full name]
Role: [Select: Instructor, Founder, Volunteer, Rider, Youth]
Bio: [Short biography, 2-3 sentences]
Email: [Contact email - optional]
Photo: [Upload member photo]
```

3. Click "Save Member"
4. Member appears on /members page

**To Edit Member:**
1. Find in list
2. Click "Edit"
3. Update fields
4. Click "Save Member"

### Tips
- Use professional/action photos
- Keep bios concise (100-150 words)
- Role filter helps people find specific roles (instructors, volunteers, etc.)
- Email is optional but useful for contact forms

---

## 6️⃣ Blog - Write Articles

### What It Does
Publish blog posts that appear on the blog page.

### How to Use

**Location:** Admin → Blog

**To Add New Post:**
1. Click "Write Article" button
2. Fill in form:

```
BLOG POST
Title: [Article headline]
Excerpt: [Short summary, 2-3 sentences]
Content: [Full article text - supports markdown]
Author: [Your name]
Category: [Select: Equestrian, Tips, Events, Community, Other]
Featured Image: [Upload article cover image]
Published Date: [Select publication date]
Publish: [Toggle ON to show on website]
```

3. Click "Publish Post"

**To Edit Post:**
1. Find in list
2. Click "Edit"
3. Update content
4. Click "Save Post"

### Tips
- Title should be catchy (use action verbs: "5 Tips for..." vs "Tips for...")
- Excerpt shows on blog list page - make it compelling
- Use markdown for formatting:
  ```
  # Heading
  **bold text**
  *italic text*
  - bullet point
  ```
- Featured image appears on blog card
- Set "Publish: OFF" to draft articles

---

## 7️⃣ Gallery - Upload Photos

### What It Does
Upload and organize photos shown on the gallery page and used for hero images.

### How to Use

**Location:** Admin → Gallery

**To Upload Image:**
1. Click "Upload Image" button
2. Select file from computer
3. Fill in details:

```
IMAGE DETAILS
Title: [Image name, e.g., "Spring Trail Ride 2026"]
Category: [Select: Rides, Lessons, Events, Members, Other]
Alt Text: [Describe image for accessibility, e.g., "Members riding on wooded trail"]
```

4. Click "Upload"

**To Edit Image:**
1. Find in gallery
2. Click "Edit"
3. Update title, category, alt text
4. Click "Save"

**To Delete Image:**
1. Find image
2. Click "Delete"
3. Confirm

### Tips
- Alt text helps people with screen readers understand images
- Use descriptive titles (not "photo1", "photo2")
- Organize by category so you can find them later
- Image size: recommended 800x600px (system compresses automatically)

---

## 8️⃣ Forms - View Submissions

### What It Does
See all form submissions (contact forms, membership applications, volunteer signups) and manage them.

### How to Use

**Location:** Admin → Forms

**What You'll See:**
- List of all form submissions
- Type (Contact, Membership, Volunteer, Donation)
- Date submitted
- Status (New, Replied, Resolved)
- Submitter email/name

**To View Submission:**
1. Click on submission
2. See all form data
3. Click "Reply" to respond to submitter email
4. Mark as "Resolved" when complete

### Tips
- Check forms daily for new submissions
- Reply to all inquiries within 24 hours
- Use "Resolved" status to keep track of follow-ups
- You also receive email notifications of new submissions

---

## Common Tasks

### Task 1: Change Brand Colors
1. Go to **Theme**
2. Click on each color box
3. Select new colors
4. Click "Save Changes"
5. Refresh website to see updates
**Time: 2 minutes**

### Task 2: Add Upcoming Event
1. Go to **Events**
2. Click "Add Event"
3. Fill in: Title, Date, Time, Location, Image
4. Toggle "Published: ON"
5. Click "Save Event"
**Time: 5 minutes**

### Task 3: Add New Team Member
1. Go to **Members**
2. Click "Add Member"
3. Fill in: Name, Role, Bio, Photo
4. Click "Save Member"
**Time: 3 minutes**

### Task 4: Post Blog Article
1. Go to **Blog**
2. Click "Write Article"
3. Fill in: Title, Content, Author, Image
4. Toggle "Publish: ON"
5. Click "Publish Post"
**Time: 10 minutes**

### Task 5: Rebrand Entire Site
1. Go to **Settings** - Update site name, contact, social links (2 min)
2. Go to **Theme** - Update 4 colors (1 min)
3. Go to **Gallery** - Upload 5 new hero images (5 min)
4. Go to **Settings** - Update hero images/text for each page (2 min)
5. Refresh website - Done!
**Time: 10 minutes total**

---

## Troubleshooting

### Q: I uploaded an image but it doesn't show
**A:** 
- Try refreshing the page (Ctrl+R or Cmd+R)
- Check that file was selected before clicking upload
- Try a different image file

### Q: Form looks wrong or colors are weird
**A:**
- Clear browser cache (Ctrl+Shift+Delete)
- Try a different browser (Chrome, Firefox, Safari)
- Check that theme colors are saved

### Q: I accidentally deleted something
**A:**
- Contact IT - they may be able to restore from backup
- For text content (blog, events, members), you may need to re-add it
- This is why we keep backups!

### Q: Hero image on page looks cut off
**A:**
- Try a different aspect ratio (wider image vs tall)
- Recommended: 1200x400 pixels
- Avoid images with important content at edges

### Q: Changes not showing on website
**A:**
- Refresh the website page (Ctrl+R or Cmd+R)
- Clear browser cache and refresh
- Wait 30 seconds for website to update
- If still not working, contact IT

---

## Best Practices

✅ **DO:**
- Use clear, professional language
- Upload high-quality images
- Include alt text for all images
- Update events regularly
- Respond to forms within 24 hours
- Keep member info current
- Write engaging blog posts

❌ **DON'T:**
- Use ALL CAPS in text (appears to be shouting)
- Upload oversized images (>5MB)
- Leave images without alt text
- Delete content by accident (always backup first)
- Post outdated event info
- Share sensitive information
- Use inappropriate photos

---

## Your Daily Routine

### Morning (5 minutes)
1. Check **Forms** - any new submissions?
2. Check **Events** - any happening today?
3. Scan **Settings** - anything need updating?

### Weekly (20 minutes)
1. Reply to all **Forms** if not already done
2. Add any new **Events** for next month
3. Update **Blog** with weekly post
4. Upload photos to **Gallery** if available

### Monthly (30 minutes)
1. Review **Members** - any changes?
2. Update **Settings** if contact info changed
3. Check **Theme** - colors still looking good?
4. Archive old **Events**

---

## Need Help?

**Technical Issues:**
- Contact: [IT email/phone]
- Issues: Login problems, uploads failing, site not updating

**Content Questions:**
- Contact: [Content manager email/phone]
- Questions: What should this say? Which photo to use?

**Admin Training:**
- Refer back to this guide
- Watch video tutorial: [Link to video - if available]
- Ask colleague who manages the site

---

## Key Principles

**Principle 1: Admin Controls Everything**
- You can change any text, color, image, content on the website
- No code changes needed
- Changes appear instantly

**Principle 2: Non-Technical**
- This dashboard is designed for non-technical users
- No coding knowledge required
- If something confuses you, ask IT

**Principle 3: Safe to Experiment**
- You can't break anything by clicking
- If you delete something, we can restore it
- Try things! That's how you learn

**Principle 4: Your Site**
- This is your organization's website
- You control how it looks and what it says
- Make it represent your brand perfectly

---

## Summary

You now have complete control of your website. Use the admin dashboard to:
- ✅ Change colors (Theme)
- ✅ Update text (Settings, Blog, Pages)
- ✅ Manage events (Events)
- ✅ Manage team (Members)
- ✅ Upload photos (Gallery)
- ✅ Post articles (Blog)
- ✅ View form submissions (Forms)

**No coding required. No IT needed. Just you and the admin dashboard.**

---

## Quick Reference Cheat Sheet

| Task | Location | Time |
|------|----------|------|
| Change colors | Theme | 1 min |
| Update contact info | Settings | 1 min |
| Add event | Events | 5 min |
| Add team member | Members | 3 min |
| Upload photo | Gallery | 2 min |
| Write blog post | Blog | 10 min |
| View form submissions | Forms | 2 min |
| Update site name | Settings | 1 min |
| Change hero image | Settings → Heroes | 2 min |

---

**You're ready! Start with Task 1-2 to get comfortable, then explore.**

---

**Document Created:** January 26, 2026  
**For:** ASCA PWA Admin Users  
**Version:** 1.0  
**Next Update:** After Phase 6 launch
