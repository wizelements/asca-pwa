# Gallery Admin–Public Correlation Matrix

**Project:** ASCA PWA — Gallery, Activities, Horses, Legacy Review, Media Integrity upgrade
**Branch:** `feat/gallery-activities-complete-upgrade`
**Updated:** 2026-07-21

This document maps every current and new Gallery-related content consumer to its canonical service, public destination, admin destination, compatibility behavior, cache tags, required role, and tests.

---

## Matrix

| Content or action | Current public source | Current admin source | Current DB source | Canonical service | New public destination | New admin destination | Compatibility behavior | Cache tags | Required role | Tests |
|---|---|---|---|---|---|---|---|---|---|---|
| Homepage activity cards | Managed page-image slots (`settings.heroes`) + hardcoded "Our Latest Activities" section | `/admin/media` managed-image upload | `settings.heroes` JSON | `getFeaturedAlbums()` / `getManagedImagesFromRecord()` | `/` homepage "Our Latest Activities" section | `/admin/albums` + `/admin/media` | Prefer featured albums when `GALLERY_FEATURE_STAGE` enables public preview; fall back to managed slots | `home`, `gallery`, `albums` | Admin to feature albums; Editor to upload | `tests/gallery/services.test.mjs` (featured), public E2E |
| Gallery listing | `/gallery` renders flat `gallery_images` rows by category | `/admin/gallery` legacy grid | `gallery_images` table | `getPublicAlbums(categorySlug?)` | `/gallery` album grid with category filters | `/admin/albums` list | Legacy `/gallery` remains default until `public-preview` stage | `gallery`, `gallery-{categorySlug}` | Admin to publish | API + public E2E |
| Category filtering | Hardcoded categories in legacy Gallery query + URL `?category=` | N/A | `gallery_images.category` column | `getPublicCategories()` + `getPublicAlbums(categorySlug?)` | `/gallery?category={slug}` | `/admin/categories` | Canonical slugs only; unknown slugs → 404 or fallback | `gallery`, `gallery-{slug}`, `categories` | Admin to manage categories | Public E2E |
| Gallery cards | `GalleryCard` from legacy row | Legacy row edit | `gallery_images` | `AlbumRecord` rendered by `AlbumCard` | `/gallery` grid | `/admin/albums` table | New cards show cover, title, category, count | `gallery` | Editor to set cover | Public E2E |
| Legacy Gallery admin | N/A | `/admin/gallery` page | `gallery_images` | `getLegacyReviewRecords()` | N/A (admin-only) | `/admin/legacy-review` | Preserved until new workflow is complete | `legacy-review` | Admin to resolve | API + admin E2E |
| Managed page-image admin | N/A | `/admin/media` | `settings.heroes` | `getSettings()` / `updateSettings()` | `/` hero and static pages | `/admin/media` | Unchanged; kept for rollback | `home`, `page-images` | Editor/Admin | Regression E2E |
| Albums | N/A | N/A | `activity_albums` (new) | `albums.ts` service | `/gallery/[slug]` | `/admin/albums/[id]` | Gated by feature stage | `albums`, `album-{slug}`, `gallery` | Editor create; Admin publish | API + service + E2E |
| Album media | N/A | N/A | `album_media_assets` (new) | `albums.ts` media helpers | `/gallery/[slug]` viewer | `/admin/albums/[id]` media manager | Asset preserved when relationship removed | `album-{slug}`, `gallery` | Editor update; Admin publish | Service + E2E |
| Album covers | N/A | N/A | `activity_albums.cover_media_asset_id` | `albums.ts` | `/gallery`, `/gallery/[slug]`, homepage cards | `/admin/albums/[id]` | Cover must be attached to album | `albums`, `gallery`, `home` | Editor select | Service + E2E |
| Horses | Legacy `/gallery` horses category | `/admin/gallery` legacy | `gallery_images` where category = "Horses" | `horses.ts` service | `/horses`, `/horses/[slug]` | `/admin/horses/[id]` | Legacy horses gallery remains reachable until cutover | `horses`, `horse-{slug}` | Editor create; Admin publish | API + service + E2E |
| Members content | Legacy `/gallery` members category | `/admin/gallery` legacy | `gallery_images` where category = "Members" | `legacy-review.ts` + migration | Not shown on new public surfaces | `/admin/legacy-review` | Migrated to `pending` privacy review; never featured or inferred | `legacy-review`, `members` | Admin to resolve | Migration test + API |
| Event links | Static event cards on homepage | `/admin/events` | `events` table | `relatedEvent()` in `albums.ts` | `/gallery/[slug]` related-event link | `/admin/albums/[id]` event select | Optional; `ON DELETE SET NULL` | `album-{slug}`, `events` | Editor select | Service test |
| Media delivery | `/api/media/asset/[id]`, `/api/media/gallery/[id]` | Upload via `/admin/media` | `media_assets` (base64), `gallery_images.image` | `getMediaAssetDataUrl()` | Same routes | `/api/gallery/media` upload | Preserve all existing media URLs | `media-{assetId}` | Editor to upload | Regression |
| Publication | Legacy row `published` flag | `/admin/gallery` toggle | `gallery_images.published` | `publishAlbum()` / `publishHorse()` | Makes album/horse visible | `/admin/albums` / `/admin/horses` | Validates public eligibility first | `public-{slug}`, `gallery`, `horses`, `home` | Admin | API + service |
| Featuring | N/A | N/A | N/A | `featureAlbum()` | Homepage activity cards | `/admin/albums` | Requires `privacyReviewStatus = not_required` | `home`, `gallery` | Admin | Service test |
| Archiving | N/A | Legacy delete | N/A | `archiveAlbum()` / `archiveHorse()` | Removes from public surfaces | `/admin/albums` / `/admin/horses` | Can restore to draft | `gallery`, `horses`, `home` | Admin | API + service |
| Deletion | N/A | Legacy delete | `gallery_images` | `deleteAlbum()` hard delete; archive preferred | N/A | `/admin/albums` | Hard delete removes relationships; asset kept | `gallery`, `albums` | Admin | API |
| Legacy review | N/A | N/A | `legacy_gallery_review` (new) | `legacy-review.ts` | N/A | `/admin/legacy-review` | Resolves to album/horse/skip; records reviewer | `legacy-review` | Admin | API + service |
| Category administration | N/A | N/A | `activity_categories` (new) | `categories.ts` | `/gallery` filter labels | `/admin/categories` | Slug protected; legacy alias resolution | `categories`, `gallery` | Admin | API + service |
| Media integrity | N/A | N/A | `media_assets` + references | `media-integrity.ts` | N/A | `/admin/media-integrity` | Read-only report; no destructive cleanup | `media-integrity` | Admin | Service test |
| Cache invalidation | N/A | N/A | N/A | `cache.ts` helpers | All public surfaces | Admin actions trigger invalidation | Public revalidation after mutations | `home`, `gallery`, `albums`, `horses`, `categories`, `legacy-review`, `media-integrity` | System | Service + API |

---

## Compatibility strategy

The feature stage is controlled by the environment variable `GALLERY_FEATURE_STAGE`:

- `legacy-only` (default): Public `/gallery` uses legacy `gallery_images`. `/horses` returns 404.
- `admin-preview`: Admin UIs are live; public pages still legacy.
- `public-preview`: Public `/gallery` shows album grid; `/horses` is live.
- `legacy-readonly`: Legacy Gallery visible but read-only; new surfaces active.
- `legacy-retired`: Legacy Gallery fully replaced.

Homepage "Our Latest Activities" precedence during transition:

1. If `public-preview` or later and at least one featured eligible album exists → use featured album cards.
2. Else if managed page-image slots exist → use legacy managed slots.
3. Else show an empty/fallback CTA to contact the club.

Legacy `/admin/gallery` and `/admin/media` remain available until explicit cutover approval.

---

## Authorization summary

| Capability | Viewer | Editor | Admin |
|---|---|---|---|
| Read public Gallery | Yes | Yes | Yes |
| Read admin album list (all statuses) | No | Yes | Yes |
| Create/edit draft album | No | Yes | Yes |
| Upload media | No | Yes | Yes |
| Publish/archive/restore | No | No | Yes |
| Feature album | No | No | Yes |
| Resolve privacy review | No | No | Yes |
| Manage categories | No | No | Yes |
| Run migration | No | No | Yes |
| Hard delete album | No | No | Yes |
| Access media integrity | No | No | Yes |

---

## Tests correlation

| Test file | Coverage |
|---|---|
| `tests/gallery/slug.test.mjs` | Slug generation, uniqueness, collisions |
| `tests/gallery/constants.test.mjs` | Canonical categories, legacy classifier |
| `tests/gallery/legacyClassifier.test.mjs` | Category alias resolution, confidence |
| `tests/gallery/migration.test.mjs` | Dry-run migration, review queue generation |
| `tests/gallery/services.test.mjs` | Album CRUD, horse CRUD, publish validation, media references, cache tags |
| `tests/gallery/api.test.mjs` (to add) | Route authorization, public-only GET, upload limits, EXIF stripping |
| Public E2E (to add) | `/gallery`, `/gallery/[slug]`, `/horses`, homepage |
| Admin E2E (to add) | Album CRUD, horse CRUD, legacy review, media integrity |
| Regression (to add) | Existing pages, admin login, media routes, forms |

---

## Open items

1. Add `tests/gallery/api.test.mjs`.
2. Implement media manager component with reorder, cover select, alt/caption editing.
3. Replace raw `<img>` with Next.js `<Image>` on public pages.
4. Add pagination to admin lists and public grids.
5. Implement `/admin/media-integrity` dashboard.
6. Complete accessible image viewer component.
7. Add E2E tests via Playwright or similar.
8. Push branch when Git transport is restored.
