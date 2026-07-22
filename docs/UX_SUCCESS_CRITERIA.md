# UX Upgrade Success Criteria

| Area | Acceptance checklist | How verified |
|---|---|---|
| Toasts | ☐ Every admin mutation shows success or error feedback within 100 ms of its response. ☐ Toasts are dismissible and announced through `aria-live`. ☐ Reversible actions offer Undo. | Unit test timing and states; manual screen-reader audit |
| Drag reorder | ☐ A drop indicator remains visible during drag. ☐ Up/down controls provide keyboard parity. ☐ Reordering is announced to assistive technology. | Unit test; keyboard and screen-reader manual audit |
| Empty states | ☐ Every admin list and public grid has an illustrated, actionable empty state. | E2E empty-data fixture; manual visual audit |
| Pagination | ☐ Users can jump directly to any page. ☐ The active page uses `aria-current="page"`. ☐ More than seven pages use ellipsis windowing. | Unit test; `public-gallery.spec.ts`; `public-horses.spec.ts` |
| Public journey | ☐ List and detail journeys expose breadcrumbs/back navigation. ☐ Lightboxes support Escape and arrow keys. ☐ Interactive cards have visible focus rings. | Gallery and horses E2E specs; keyboard manual audit |
| E2E | ☐ Public gallery, public horses, and unauthenticated admin-auth specs are green in CI. Feature-gated journeys report an explicit skip when disabled. | Playwright CI workflow |
| Performance | ☐ Local TTFB, HTML size, and image caching satisfy the budgets in `PERF_BASELINE.md`. | `npm run perf:baseline`; image-header manual audit |

## Photo-flow criteria (Airbnb-referenced)

| Area | Acceptance checklist | How verified |
|---|---|---|
| Hero mosaic | ☐ Albums/horses with ≥5 photos render a 1-large + 4-small mosaic on desktop with a "Show all photos" button. ☐ Fewer than 5 photos falls back to the plain grid. ☐ The lead image is the prioritized LCP candidate. | Manual visual audit; Playwright spec (albums with ≥5 photos) |
| Mobile hero | ☐ A full-width snap-scrolling photo strip with an "N / total" counter pill replaces the mosaic below `md`. | Manual device audit |
| Route-synced lightbox | ☐ Opening a photo sets `?photo=N`. ☐ Browser Back closes the viewer without leaving the page. ☐ Deep links open the viewer at that photo, and closing returns to the clean page URL (never off-site). ☐ Next/prev replace (not push) history. | Manual audit; Playwright history assertions |
| Viewer accessibility | ☐ Tab focus is trapped inside the open dialog and restored on close. ☐ Escape/arrows work. ☐ Swipe advances exactly one photo and ignores vertical drags. ☐ Position changes are announced politely. ☐ Controls are ≥44px and safe-area aware. | Keyboard + screen-reader manual audit; Playwright keyboard spec |
| Perceived speed | ☐ Adjacent photos preload when the viewer index changes. ☐ Grid scroll position survives open/close. | Network-tab manual audit |
| Deferred (documented) | Blur/LQIP placeholders (needs an image-processing dependency at upload time), per-card cover carousels, intercepted-route modal URLs. | — |
