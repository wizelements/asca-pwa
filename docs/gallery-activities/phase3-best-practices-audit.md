# Phase 3 Best-Practices Audit: Admin & Public Gallery

**Audited:** 2026-07-21
**Scope:** `feat/gallery-activities-complete-upgrade` after Phase 3 UI commit `75b8e33`
**Auditor:** OpenClaw

---

## 1. Executive Summary

The Phase 3 UI is functional and committed, but it prioritizes shipping over production polish. There are **no critical security holes**, but there are several **medium-priority gaps** in authorization consistency, UX resilience, accessibility, and operational hygiene. The highest-impact fixes are:

1. Tighten API authorization so non-admin users cannot enumerate draft content.
2. Add loading/error/success feedback and optimistic UI states to admin pages.
3. Replace raw `<img>` tags with Next.js `<Image>` + sizes for performance.
4. Add pagination to admin lists and public grids.
5. Add E2E/API tests covering the new routes.
6. Standardize delete behavior (soft vs hard) and make it explicit.

---

## 2. Security & Authorization

| Area | Current State | Best Practice | Gap Level |
|---|---|---|---|
| API `/api/gallery/albums` GET | `requireAuth` + `getAdminAlbums` returns **all** statuses to any authenticated role | Editor/admin see drafts; viewers/public API consumers should only see published | **Medium** |
| API `/api/gallery/horses` GET | Same pattern | Same fix | **Medium** |
| API `/api/gallery/legacy-review` | Admin-only — good | ✅ | None |
| API `/api/gallery/media` upload | Editor/admin can upload any data-URL image | Add file-size limits, MIME-type allowlist, and per-user rate limits | **Medium** |
| Public pages | Gated by `isPublicPreviewEnabled()` and filter `status === 'published'` | ✅ | None |
| Auth token | Bearer token, verified against DB user + password version | ✅ | None |
| CSRF | Bearer auth makes CSRF less relevant, but cookie-based sessions are not used | N/A for this design | Low |
| Input sanitization | Zod schemas validate shape; no HTML/JS output escaping for `title`/`summary` before rendering | Escape output in React is automatic, but API JSON consumers may not escape | Low |
| Activity logging | Writes logged in `activity_log` | ✅ | None |

**Recommendation:** Split the album/horse GET handlers:
- `/api/gallery/albums?admin=1` → `canEdit(user)` + `getAdminAlbums`
- Default `/api/gallery/albums` → public-only (or require admin role if no public API is needed)
- Alternatively, return `getPublicAlbums()` unless `canEdit(user)` is true.

---

## 3. Architecture & API Design

| Topic | Current | Best Practice | Gap |
|---|---|---|---|
| REST shape | Single `PUT` with `action` string dispatch | Resource-oriented routes or tRPC/server actions | Medium |
| HTTP verbs | `PUT` used for publish/archive/feature | `PATCH` for partial updates, `POST` for actions | Low |
| Batch media upload | Sequential `fetch` loops in client | Parallel upload with rollback / transaction | Medium |
| Error response shape | `{ error: string | flattened ZodError }` | Consistent `{ error: { code, message, field? } }` | Low |
| Cache invalidation | `invalidateAlbumPublicSurfaces()` helper | Also call `revalidateTag` / `revalidatePath` on mutations | Medium |
| Idempotency | No idempotency keys on upload | Add client-generated UUID idempotency key for retries | Low |

**Recommendation:** Introduce a small `fetchGalleryApi` helper in admin pages that handles token injection, 401 logout, and consistent error parsing. This removes duplicated `fetch` boilerplate across 6 admin pages.

---

## 4. UX / UI / Accessibility

| Topic | Current | Best Practice | Gap |
|---|---|---|---|
| Loading states | Basic "Loading..." text | Skeleton loaders for tables/forms | Medium |
| Empty states | Plain text | Action-oriented empty state with CTA | Low |
| Success/error feedback | Inline colored `<p>` | Toast/notification system; auto-dismiss | Medium |
| Form validation | Relying on server Zod | Client-side validation before submit | Medium |
| Buttons | Color-only differentiation (green/red/blue) | Add icons + text; maintain 3:1 contrast | Low |
| Tables | No `<th scope="col">` | Add scope attributes for screen readers | Low |
| Image upload | Single `AdminImageField` per media item | Drag-and-drop, multi-select, progress bars | Medium |
| Media reordering | New media appended only; no sort/reorder/cover selection UI | Drag-to-reorder + set-cover action | **High** |
| Mobile layout | Tables can overflow horizontally on small screens | Card-based mobile layout or horizontal scroll container | Low |
| Focus management | No focus reset after actions | Return focus to actionable element after modal/save | Low |

**Recommendation:** The admin album/horse edit pages need a real media manager component: list existing media with thumbnails, drag-to-reorder, set cover, edit alt/caption inline, and delete individual items. This is the biggest UX gap.

---

## 5. Performance

| Topic | Current | Best Practice | Gap |
|---|---|---|---|
| Images | Raw `<img>` tags on public pages | Next.js `<Image>` with `sizes`, `priority`, and blur placeholder | **Medium** |
| Hero image | No `priority` or `fetchPriority` | Add `priority` to LCP hero | Low |
| Grid pagination | Loads all public albums/horses | Cursor/pagination + ISR | Medium |
| Caching | Server components call services directly | ISR `revalidate` + cache tags tied to mutations | Medium |
| Bundle size | Admin pages import `AdminShell` etc. | Code-split heavy media manager | Low |

**Recommendation:** Add `next/image` configuration for the media asset domain/path and update `AlbumCard`, `HorseCard`, and detail pages to use `<Image>`.

---

## 6. Data Integrity & Business Logic

| Topic | Current | Best Practice | Gap |
|---|---|---|---|
| Publish guard | `validatePublishableAlbum` exists in service but is not enforced in API publish action | Call validator before `publishAlbum` and reject with errors | **Medium** |
| Cover image | `coverMediaAssetId` can be set to any media ID, even one not in the album | Restrict cover to media items attached to the album | Medium |
| Soft vs hard delete | Albums: hard delete. Horses: archive on DELETE. | Consistent policy; use `deletedAt` soft delete for both | **Medium** |
| Category deletion | Not exposed in UI (no delete route) | Decide: deactivate only, or cascade/restrict delete | Low |
| Slug uniqueness | Enforced in service | ✅ | None |
| Date coercion | Form sends `YYYY-MM-DD` string; schema coerces to date | Verify UTC/local handling; store as date-only or ISO midnight | Low |

**Recommendation:**
1. Add a `beforePublish` validation step in the API so admins get actionable error messages ("Add alt text to all images").
2. Implement soft-delete (`deleted_at` column) for albums and horses; make DELETE soft-delete and add a separate purge for hard delete.
3. Auto-set cover to first uploaded media if none selected.

---

## 7. Testing

| Topic | Current | Best Practice | Gap |
|---|---|---|---|
| Unit tests | Slug, constants, legacy classifier pass | ✅ | None |
| Service tests | 29 pass | ✅ | None |
| API route tests | None | Add tests for each `/api/gallery/*` route | **High** |
| Admin UI tests | None | Add Playwright/Cypress smoke tests | High |
| Public page tests | None | Add rendering + 404 tests for gated pages | Medium |
| Accessibility tests | None | Add axe-core or Lighthouse CI | Medium |

**Recommendation:** Add a `tests/gallery/api.test.mjs` suite that mounts the routes in an Hono-style test server or uses Next.js `createRouteHandler` testing pattern. At minimum test:
- Unauthorized → 401
- Viewer GET /api/gallery/albums → only published
- Editor create → 201
- Admin publish without cover/alt → 400 with clear errors

---

## 8. Observability & Ops

| Topic | Current | Best Practice | Gap |
|---|---|---|---|
| Error logging | `console.error` in catch blocks | Structured logger (Pino/Winston) + request ID | Low |
| Metrics | None | Track upload size/latency, publish errors | Low |
| Health checks | Gateway health only | Add DB connectivity check endpoint | Low |
| Rate limiting | None | Add Vercel/Upstash rate limit on upload/login | Medium |
| Backups | Turso provides point-in-time | Document RTO/RPO | Low |

---

## 9. Compliance & Privacy

| Topic | Current | Best Practice | Gap |
|---|---|---|---|
| Privacy review workflow | `privacyReviewStatus` field + admin queue | ✅ conceptually | None |
| EXIF data in uploads | Not stripped | Strip GPS/camera metadata from uploaded images | **Medium** |
| Image rights | No consent/rights tracking | Add `rightsStatus` or `consentObtained` flag for event photos | Low |
| Age/content filtering | Manual review only | Consider auto-blur for restricted status | Low |

---

## 10. Prioritized Action Plan

### P1 — Fix before production preview
1. Tighten `/api/gallery/albums` and `/api/gallery/horses` GET to return only public records unless user is editor/admin.
2. Enforce `validatePublishableAlbum` before publish action in API.
3. Add file-size/MIME validation to media upload.
4. Strip EXIF metadata from uploaded images (or at least GPS).

### P2 — Ship before wide release
5. Build a real media manager component (reorder, set cover, edit alt/caption, delete).
6. Replace raw `<img>` with Next.js `<Image>` on public pages.
7. Add pagination to admin lists and public grids.
8. Add API route tests.
9. Standardize soft-delete for both albums and horses.

### P3 — Polish
10. Add client-side form validation, toast notifications, skeleton loaders.
11. Add rate limiting and structured logging.
12. Add accessibility improvements (table scope, focus management, contrast).

---

## 11. Verdict

**Are we slacking?** Not critically, but yes — in the areas that separate a "works on my machine" feature from a trustworthy production surface. The foundation (schema, services, feature flags, auth, privacy workflow) is solid. The slack is mostly in **API authorization consistency**, **media-management UX**, **performance/image optimization**, and **test coverage**. None of these are blockers for an internal admin preview, but P1 items should be resolved before any public-preview or production deployment.
