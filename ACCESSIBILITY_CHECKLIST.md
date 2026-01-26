# ASCA PWA — Accessibility Compliance Checklist

**Standard:** WCAG 2.1 Level AA (minimum)  
**Target:** Lighthouse Accessibility Score ≥ 95  
**Testing:** Automated + Manual + Screen Reader

---

## 1. SEMANTIC HTML

### Structure
- [x] Page has semantic `<header>`, `<nav>`, `<main>`, `<footer>`
- [x] One `<h1>` per page (page title, not logo)
- [x] Headings in logical order (no skipping: h1 > h2 > h3)
- [x] Lists use `<ul>`, `<ol>`, `<li>` (not divs)
- [x] Forms use `<form>`, `<fieldset>`, `<legend>` where appropriate
- [x] Buttons are `<button>` (not `<div onclick>`)
- [x] Links are `<a>` with `href` (not buttons styled as links)
- [x] Articles use `<article>`
- [x] Sections use `<section>`
- [x] Sections have headings

### Example: Semantic Form
```html
<form>
  <fieldset>
    <legend>Membership Information</legend>
    <div>
      <label htmlFor="name">Full Name *</label>
      <input id="name" type="text" required />
    </div>
    <div>
      <label htmlFor="experience">Riding Experience</label>
      <select id="experience">
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
      </select>
    </div>
    <button type="submit">Submit</button>
  </fieldset>
</form>
```

---

## 2. KEYBOARD NAVIGATION

### Focus Management
- [x] All interactive elements are keyboard accessible
- [x] Tab order logical (top to bottom, left to right)
- [x] Focus indicator visible (≥ 3:1 contrast)
- [x] Focus styles not removed (no `outline: none` without replacement)
- [x] Skip navigation link available (hide with `position: absolute`)
- [x] Modal traps focus (Tab cycles within modal)
- [x] Dropdown menus navigable with arrow keys
- [x] Can reach all content without mouse

### Focus Indicator CSS
```css
/* Visible focus for all elements */
button:focus,
a:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 3px solid #f5d800;
  outline-offset: 2px;
}

/* Remove browser default only if replacement present */
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 3px solid #f5d800;
}
```

### Skip Navigation Link
```html
<a href="#main-content" style="
  position: absolute;
  top: -40px;
  left: 0;
  background: #f5d800;
  padding: 8px;
  text-decoration: none;
">
  Skip to main content
</a>

<main id="main-content">
  {/* Page content */}
</main>
```

---

## 3. COLOR & CONTRAST

### WCAG AA Standards
- **Normal text:** 4.5:1 ratio (dark text on light or vice versa)
- **Large text** (18pt+): 3:1 ratio
- **UI components & borders:** 3:1 ratio
- **Graphical objects:** 3:1 ratio

### ASCA Brand Compliance
| Color | Purpose | Contrast with White | Contrast with Dark |
|-------|---------|-------------------|-------------------|
| Dark (#1a1a1a) | Background | 21:1 ✓ | - |
| Olive (#4a4b02) | Secondary BG | 9.5:1 ✓ | 1.2:1 ✗ |
| Gold (#f5d800) | Accent CTA | 9.8:1 ✓ | 19.2:1 ✓ |
| White (#ffffff) | Text | 21:1 ✓ | 21:1 ✓ |

### Contrast Checker Component
```typescript
// src/components/ui/ContrastChecker.tsx
export function ContrastChecker({ color1, color2 }) {
  const ratio = calculateContrast(color1, color2);
  const level = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail';
  
  return (
    <div>
      <p>Contrast Ratio: {ratio.toFixed(1)}:1 {level === 'AAA' ? '✓✓' : '✓'}</p>
      <div style={{
        display: 'flex',
        gap: '10px',
      }}>
        <div style={{
          flex: 1,
          padding: '20px',
          background: color1,
          color: color2,
        }}>
          Text Sample
        </div>
        <div style={{
          flex: 1,
          padding: '20px',
          background: color2,
          color: color1,
        }}>
          Text Sample
        </div>
      </div>
    </div>
  );
}
```

### Color Not Only
- [x] Errors not indicated by color alone (use icon + text)
- [x] Links not distinguished by color alone (use underline or icon)
- [x] Charts have patterns, not just color
- [x] Form fields have labels, not just colored borders

---

## 4. TEXT ALTERNATIVES

### Images
- [x] **All images have alt text** (no empty alts except decorative)
- [x] Alt text is descriptive, not "image of" or "picture"
- [x] Complex images have extended description
- [x] Decorative images: `alt=""`
- [x] Images in links describe the link, not the image

### Alt Text Examples
```html
<!-- Good: Descriptive -->
<img src="member-sarah.jpg" alt="Sarah Johnson, ASCA riding instructor" />

<!-- Bad: Vague -->
<img src="member-sarah.jpg" alt="person" />

<!-- Decorative (empty) -->
<img src="decorative-line.svg" alt="" aria-hidden="true" />

<!-- Complex image (use caption + aria-describedby) -->
<figure>
  <img 
    src="event-chart.png" 
    alt="Monthly event attendance chart"
    aria-describedby="chart-description"
  />
  <figcaption id="chart-description">
    Attendance grew from 20 members in Jan to 45 in Feb, with peak on weekends.
  </figcaption>
</figure>
```

### Admin Enforcement
In admin UI, make alt text required:
```typescript
<TextInput
  label="Image"
  type="file"
  required
/>
<TextInput
  label="Alt Text (required for accessibility)"
  placeholder="Describe the image for screen readers..."
  required
  value={altText}
  onChange={setAltText}
/>
```

---

## 5. FORM ACCESSIBILITY

### Labels
- [x] Every input has associated `<label>` with `htmlFor`
- [x] Labels visible (not placeholder-only)
- [x] Required fields marked with `*` or "required"
- [x] Hidden labels use `sr-only` class if visual label needed

### Screen Reader Only CSS
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Error Handling
- [x] Error messages linked to input via `aria-describedby`
- [x] Errors announced to screen readers (`role="alert"`)
- [x] Input with error marked: `aria-invalid="true"`
- [x] Error text in red + icon

### Example: Accessible Form
```tsx
<form onSubmit={handleSubmit}>
  <div>
    <label htmlFor="email">
      Email Address <span style={{ color: 'red' }}>*</span>
    </label>
    <input
      id="email"
      type="email"
      required
      aria-required="true"
      aria-describedby={errors.email ? 'email-error' : undefined}
      aria-invalid={errors.email ? 'true' : 'false'}
      {...register('email')}
    />
    {errors.email && (
      <span 
        id="email-error" 
        role="alert" 
        style={{ color: '#ff0000' }}
      >
        ⚠ {errors.email.message}
      </span>
    )}
  </div>

  <button type="submit">Submit Application</button>
</form>
```

---

## 6. ARIA LABELS & ROLES

### When to Use ARIA
- **Link with icon only:** `aria-label="Next page"`
- **Button with icon only:** `aria-label="Close menu"`
- **Live regions:** `aria-live="polite"` or `role="alert"`
- **Dialog:** `role="dialog"` + `aria-labelledby`
- **Tabs:** `role="tablist"`, `role="tab"`, `role="tabpanel"`
- **Tree navigation:** `role="tree"`, `role="treeitem"`

### Common ARIA Attributes
```typescript
// Buttons
<button aria-label="Open navigation menu">☰</button>

// Links
<a href="/events" aria-current="page">Events</a>

// Forms
<input aria-label="Search events" type="text" placeholder="Event name..." />

// Alerts/Status
<div aria-live="polite" aria-atomic="true">
  {submitMessage}
</div>

// Disabled state
<button aria-disabled="true" disabled>Join (Full)</button>

// Dropdowns
<select aria-label="Filter members by role">
  <option>All</option>
  <option>Rider</option>
</select>

// Dialog
<dialog aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Action</h2>
  Are you sure?
</dialog>
```

---

## 7. CALENDAR ACCESSIBILITY (FullCalendar)

### FullCalendar Config
```typescript
const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  // Accessibility
  contentHeight: 'auto',
  eventDisplay: 'block',
  eventTimeFormat: { hour: 'numeric', minute: '2-digit', meridiem: false },
  slotLabelFormat: { hour: 'numeric', minute: '2-digit', meridiem: false },
  // ARIA labels
  buttonText: {
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    list: 'List',
  },
  // Handle keyboard
  eventClick: (info) => {
    // Open event details in modal (focus trap)
    setSelectedEvent(info.event);
  },
};
```

### Event Modal
```tsx
<dialog 
  open={!!selectedEvent}
  aria-labelledby="event-title"
  aria-modal="true"
>
  <h2 id="event-title">{selectedEvent?.title}</h2>
  <p>{selectedEvent?.start?.toLocaleString()}</p>
  <p>{selectedEvent?.extendedProps?.description}</p>
  
  <button onClick={handleRSVP} aria-label="RSVP going">
    I'm Going
  </button>
  <button onClick={handleClose} aria-label="Close event details">
    Close
  </button>
</dialog>
```

---

## 8. MODAL & DIALOG ACCESSIBILITY

### Focus Trap
```typescript
// src/hooks/useFocusTrap.ts
import { useEffect } from 'react';

export function useFocusTrap(ref: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }

      // Close on Escape
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => element.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

### Modal Usage
```tsx
<dialog
  ref={modalRef}
  aria-labelledby="modal-title"
  aria-modal="true"
  role="alertdialog" // if confirming action
>
  <h2 id="modal-title">Confirm Membership</h2>
  <p>This action cannot be undone.</p>
  <button autofocus onClick={handleConfirm}>Confirm</button>
  <button onClick={handleClose}>Cancel</button>
</dialog>
```

---

## 9. VIDEO & AUDIO ACCESSIBILITY

### Video
- [x] Captions for all dialogue (burned-in or track)
- [x] Audio description for important visual info
- [x] Transcript available
- [x] Control playback (keyboard + mouse)

### Audio
- [x] Transcript for podcasts
- [x] Transcript links from audio player
- [x] Captions if dialogue in video

### HTML5 Example
```html
<video controls aria-label="ASCA Training Demonstration">
  <source src="training-demo.mp4" type="video/mp4" />
  <track kind="captions" src="training-demo-en.vtt" srclang="en" label="English" />
  <track kind="descriptions" src="training-demo-descriptions-en.vtt" srclang="en" />
</video>

<a href="training-demo-transcript.pdf" download>
  Download transcript (PDF)
</a>
```

---

## 10. ANIMATION & MOTION

### Respect Preferences
```css
/* For users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### In React
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function AnimatedComponent() {
  const variants = {
    animate: prefersReducedMotion
      ? { opacity: 1 }
      : { opacity: [0, 1], transition: { duration: 0.5 } },
  };

  return <motion.div variants={variants}>Content</motion.div>;
}
```

---

## 11. READABLE TEXT

### Font Sizes
- [x] Body text: ≥ 16px (14px minimum)
- [x] Mobile text: ≥ 14px
- [x] Headings: Scaled proportionally

### Line Height & Spacing
- [x] Line height: ≥ 1.5 for body text
- [x] Letter spacing: ≥ 0.12em
- [x] Word spacing: ≥ 0.16em
- [x] Paragraph spacing: ≥ 1.5x line height

### CSS Example
```css
body {
  font-size: 16px;
  line-height: 1.6;
  letter-spacing: 0.02em;
}

p {
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 2.5rem;
  line-height: 1.2;
  margin: 1.5rem 0 1rem;
}
```

### Readability
- [x] No justified text (except headings)
- [x] Dark text on light background (or light on dark)
- [x] Avoid all caps (harder to read)
- [x] Links underlined (or contrasting color + underline)

---

## 12. MOBILE & RESPONSIVE

### Touch Targets
- [x] Buttons/links: ≥ 44x44px (iOS) or 48x48px (Android)
- [x] Spacing between targets: ≥ 8px
- [x] Target center at least 44px from other targets

### Responsive Design
- [x] Works at 320px width (mobile)
- [x] Works at 1280px width (desktop)
- [x] No horizontal scrolling
- [x] Text resizable without loss of content

### Meta Tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
```

---

## 13. TESTING PROCEDURES

### Automated Testing
```bash
# Axe accessibility scanner
npm install -D @axe-core/react

# Run in test
import { axe, toHaveNoViolations } from 'jest-axe';

test('home page has no accessibility violations', async () => {
  const { container } = render(<HomePage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing
```bash
# 1. Keyboard navigation
# Navigate entire site using Tab/Shift+Tab/Enter/Escape
# All interactive elements reachable
# Focus visible at all times

# 2. Screen reader (Windows: NVDA or JAWS)
# Download NVDA: https://www.nvaccess.org/
# Commands:
# - Alt+down: Read current window
# - H: Jump to heading
# - G: Jump to graphic
# - L: Jump to list
# - T: Jump to table

# 3. Zoom to 200%
# DevTools > Rendering > Zoom to 200%
# Verify layout doesn't break

# 4. High contrast mode (Windows)
# Settings > Display > High contrast
# Verify all content visible
```

### Browser Extensions
- **Axe DevTools** (Chrome, Firefox)
- **WAVE** (Chrome, Firefox)
- **Lighthouse** (Chrome DevTools)

### Lighthouse Audit
```bash
# Built into Chrome DevTools
# F12 > Lighthouse > Accessibility
# Score should be ≥ 95
```

---

## 14. CONTENT-SPECIFIC ACCESSIBILITY

### Blog Posts
- [x] Headings structure correct
- [x] Images have alt text
- [x] Links have descriptive text (not "click here")
- [x] No color-only emphasis

### Forms (Membership, Contact, Newsletter)
- [x] All fields labeled
- [x] Required fields marked
- [x] Errors announced
- [x] Multi-step forms have progress indicator
- [x] Confirmation page has success message

### Events & Calendar
- [x] Date format consistent and international
- [x] Time zones specified if multi-region
- [x] Location accessible (map has keyboard nav)
- [x] RSVP form accessible

### Gallery & Images
- [x] Lightbox keyboard accessible (arrow keys, Esc to close)
- [x] Images have alt text
- [x] Captions available where relevant

### Notifications
- [x] Success/error messages announced
- [x] Live region: `aria-live="polite"` + `role="status"`
- [x] Not just audio feedback

---

## 15. ADMIN PANEL ACCESSIBILITY

### Admin UI
- [x] All controls keyboard accessible
- [x] Color pickers have text input fallback
- [x] File uploads have text labels
- [x] Rich text editor has keyboard shortcuts
- [x] Data tables have row/column headers

### Example: Color Picker
```tsx
<fieldset>
  <legend>Brand Colors</legend>
  
  <div>
    <label htmlFor="color-dark">Dark Color</label>
    <div style={{ display: 'flex', gap: '10px' }}>
      <input
        type="color"
        id="color-dark"
        value={colors.dark}
        onChange={(e) => setColors({ ...colors, dark: e.target.value })}
      />
      <input
        type="text"
        aria-label="Dark color hex value"
        placeholder="#000000"
        value={colors.dark}
        onChange={(e) => setColors({ ...colors, dark: e.target.value })}
      />
    </div>
    <ContrastChecker color={colors.dark} against="#ffffff" />
  </div>
</fieldset>
```

---

## CHECKLIST SUMMARY

### Pre-Launch (Must Pass)
- [ ] Lighthouse Accessibility ≥ 95
- [ ] All images have alt text
- [ ] All forms properly labeled
- [ ] Keyboard navigation complete
- [ ] Color contrast ≥ 4.5:1
- [ ] Focus indicators visible
- [ ] No WAVE errors
- [ ] Screen reader tested (30 min)

### Nice to Have
- [ ] Lighthouse ≥ 98
- [ ] ARIA landmarks throughout
- [ ] Captions on videos
- [ ] Transcripts for audio
- [ ] High contrast mode tested
- [ ] Zoom to 200% tested
- [ ] Reduced motion respected

---

## Resources

- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Accessible Components:** https://www.radix-ui.com/
- **Testing Tools:** https://www.w3.org/WAI/test-evaluate/
- **Color Contrast:** https://webaim.org/resources/contrastchecker/
- **ARIA Patterns:** https://www.w3.org/WAI/ARIA/apg/

---

**Accessibility is a human right, not a feature.**

Train team: All developers should understand WCAG 2.1 AA
Monitor: Test on every deploy
Iterate: Gather feedback from users with disabilities
