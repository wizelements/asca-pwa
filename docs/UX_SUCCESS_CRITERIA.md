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
