# ASCA Gallery & Activities Correlation Matrix

## Purpose

This matrix maps every current public/admin/data source to the new canonical service, public destination, admin destination, compatibility behavior, cache tags, required role, migration state, and verification test. It is the source of truth for the server-services phase and must be updated if any column changes.

## Status values

- `FeatureState`: `legacy-only` → `admin-preview` → `public-preview` → `legacy-readonly` → `legacy-retired`
- Current state: `legacy-only` (new tables exist but public/admin routes still use legacy systems).

## Matrix

| Content or action | Current public source | Current admin source | Current database source | New canonical service | New public destination | New admin destination | Compatibility behavior | Cache tags | Required role | Migration state | Verification test |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Homepage activity cards | `app/page.tsx`, managed image settings (`home.activity.*`), hardcoded `ACTIVITY_CATEGORY_MAP` | `/admin/media` page images | `settings.heroes` JSON | `albumServices.getFeaturedAlbums()` | `app/page.tsx` activity grid reading eligible featured albums | `/admin/albums` feature toggle | Legacy activity cards remain until feature flag enables new sourcing; old URLs still route to `/gallery?category=` | `homepage`, `albums`, `categories` | Editor to feature; Admin to publish/approve | Approved canonical categories replace hardcoded map | `services/featured.test.mjs` |
| Gallery listing | `app/gallery/page.tsx`, `getCachedGalleryImages()` | `/admin/gallery` single-image CRUD | `gallery_images` | `albumServices.getPublicAlbums()` and `albumServices.getAlbumsByCategory()` | `app/gallery/page.tsx` album grid with category filters | `/admin/albums` list, filters, create/edit | Legacy `/gallery` remains functional until cutover; canonical aliases resolve legacy category query params | `gallery`, `albums`, `categories` | Editor create/edit; Admin publish/archive | Legacy rows classified into albums/review queue | `services/albums.test.mjs` |
| Category query | Display label in URL `?category=...` | Free-text input | `gallery_images.category` text | `categoryServices.getCategoryBySlug()` + legacy alias resolver | Same `/gallery` page | `/admin/categories` list + album form selector | Unknown legacy values enter review queue; known aliases resolve to canonical slug | `categories`, `gallery` | Admin manage categories | Canonical seed categories confirmed | `services/categories.test.mjs` |
| Gallery image cards | `GalleryCard` with loose rows | `/admin/gallery` edit modal | `gallery_images` | `albumServices.getAlbumDetailBySlug()` | `app/gallery/[slug]/page.tsx` album detail | `/admin/albums/[id]` edit | Legacy cards remain until cutover | `albums`, `gallery` | Editor/Admin | Media reused via `media_assets` references | UI tests deferred to Phase 3 |
| Gallery admin | `/admin/gallery` | Same | `gallery_images` | `albumServices.*`, `categoryServices.*` | N/A | `/admin/albums` full workflow | Old admin route stays available until new admin is verified | `gallery`, `albums`, `categories` | Editor create/edit; Admin publish/archive | Legacy admin not modified until cutover | Manual/admin smoke test |
| Page image admin | `/admin/media` managed images | Same | `settings.heroes` + `theme.logo/favicon` | `queries.updateSettings()`, `queries.updateTheme()` (preserved) | `/`, `/gallery`, etc. hero images | `/admin/media` | No change to existing page-image workflow | `settings`, `theme`, `homepage`, `gallery` | Admin/Editor as currently enforced | Not migrated | `services/media-integrity.test.mjs` |
| Horses in Gallery | Legacy `Horses` category rendered in `app/gallery/page.tsx` | `/admin/gallery` | `gallery_images` where category = 'Horses' | `horseServices.*` | `/horses` index and `/horses/[slug]` | `/admin/horses` CRUD | Legacy Horses category remains visible until `/horses` verified | `horses`, `gallery`, `albums` | Editor create/edit; Admin publish/archive | "Meet <Name>" records migrated to profiles | `services/horses.test.mjs` |
| Members in Gallery | Legacy `Members` category in `app/gallery/page.tsx` | `/admin/gallery` | `gallery_images` where category = 'Members' | `legacyReviewServices.*` | Privacy-review compatibility rendering only (not in new albums) | `/admin/legacy-review` queue | Legacy members content stays public via old path; new system marks `privacyReviewStatus = pending` and excludes from all new queries | `albums`, `gallery`, `homepage`, `legacy-review` | Admin resolve privacy review | Migrated to review queue, not albums | `services/legacy-review.test.mjs` |
| Event relationships | Independent event cards/links | `/admin/events` | `events` table | `albumServices.updateAlbumEvent()` + `eventServices` read | Optional related-event link on album detail | Album form event selector | Events deletion sets album `eventId = NULL` via FK | `albums`, `events` | Editor/Admin | Not inferred during migration | `services/albums.test.mjs` |
| Media delivery | `/api/media/[kind]/[key]/route.ts` | `/api/media` POST | `media_assets`, `settings.heroes`, `gallery_images` | Same routes reused | All image consumers | `/admin/media`, `/admin/albums`, `/admin/horses` | Existing URLs preserved; new albums/horses use `/api/media/asset/{id}` | `media` (immutable long cache when v present) | Admin/Editor for uploads | Existing assets reused | `services/media-integrity.test.mjs` |
| Publish actions | Immediate `published` boolean on gallery row | Toggle in `/admin/gallery` | `gallery_images.published` | `albumServices.publishAlbum()`, `archiveAlbum()` | Draft → invisible; Published → visible; Archived → invisible | `/admin/albums` status transitions | Legacy publish remains until cutover | `albums`, `gallery`, `homepage` | Editor save draft; Admin publish/archive | N/A | `services/albums.test.mjs` |
| Homepage feature selection | Managed activity image slot | `/admin/media` | `settings.heroes` | `albumServices.featureAlbum()` | Featured album may appear on homepage when eligible | `/admin/albums` feature toggle | Old managed images remain until cutover | `homepage`, `albums` | Admin feature/unfeature | N/A | `services/featured.test.mjs` |
| Cache invalidation | `revalidateTag(CACHE_TAG_GALLERY)` in API | Admin mutation triggers revalidation | N/A | `cache.invalidateAlbumCache()`, `cache.invalidateHomepageCache()` | Stale content prevented | Revalidation fired from API routes | Legacy cache tags preserved; new tags added | `gallery`, `albums`, `categories`, `horses`, `homepage`, `legacy-review`, `media-integrity` | Admin/Editor via API | N/A | `services/cache.test.mjs` |
| Deletion | Legacy row deletion only | `/admin/gallery` delete | `gallery_images` | `albumServices.archiveAlbum()` (soft archive) + relationship removal | Archived content disappears from public | Archive/restore in `/admin/albums` | Hard delete of legacy rows still possible in old admin; new system uses archive by default | `albums`, `gallery`, `homepage` | Admin archive/restore | N/A | `services/albums.test.mjs` |

## Authorization matrix

| Operation | Viewer | Editor | Admin | Enforcement |
|---|---|---|---|---|
| Read public albums/horses/categories | ✅ | ✅ | ✅ | Public route, no auth |
| Read admin album/horse/category list | ✅ if logged in | ✅ | ✅ | `requireAuth` + role check in API |
| Create album/horse | ❌ | ✅ | ✅ | `requireAuth` + `canEdit` |
| Edit album/horse draft | ❌ | ✅ own/any? | ✅ | `requireAuth` + `canEdit` (Editors can edit any draft) |
| Publish album/horse | ❌ | ❌ | ✅ | `requireAuth` + `canAdmin` |
| Archive album/horse | ❌ | ❌ | ✅ | `requireAuth` + `canAdmin` |
| Feature album on homepage | ❌ | ❌ | ✅ | `requireAuth` + `canAdmin` |
| Manage categories | ❌ | ❌ | ✅ | `requireAuth` + `canAdmin` |
| Resolve legacy review / privacy | ❌ | ❌ | ✅ | `requireAuth` + `canAdmin` |
| View media-integrity report | ✅ if logged in | ✅ | ✅ | `requireAuth` |
| Run migration script | ❌ | ❌ | ✅ | CLI script with production guard |

## Visibility rules

### Public album eligibility

```text
status = 'published'
AND privacyReviewStatus IN ('not_required', 'approved')
AND categoryId refers to active category
AND coverMediaAssetId is not null
AND (eventId IS NULL OR linked event is published)
```

### Featured album eligibility

```text
public-album eligible
AND featured = true
AND categoryId NOT 'members' / privacy not pending
AND has >= 1 media item with meaningful alt text
```

### Public horse eligibility

```text
status = 'published'
AND primaryMediaAssetId is not null
```

### Privacy-restricted member content

```text
privacyReviewStatus = 'restricted' OR legacy category 'Members' unresolved
→ excluded from every new public query, API, homepage, search preview, metadata
```

## Feature-state plan

1. **legacy-only** (now): New tables exist; all public/admin still uses legacy. No dual writes.
2. **admin-preview**: New `/admin/albums`, `/admin/horses`, `/admin/legacy-review` available behind feature flag; public still legacy-only.
3. **public-preview**: Feature flag enables new public Gallery and Horses pages; legacy routes still available for fallback.
4. **legacy-readonly**: Legacy admin edit routes disabled; legacy public routes redirect or render compatibility notices.
5. **legacy-retired**: After 30 days verified stability, `gallery_images` table and legacy admin can be removed.

## Cache tags

- `homepage` — activity section and featured albums
- `gallery` — legacy gallery listings
- `albums` — album detail and album lists
- `categories` — canonical category lists and filters
- `horses` — horse index and detail
- `legacy-review` — admin review queue
- `media-integrity` — admin report
- `settings` — managed page images
- `theme` — logo/favicon
- `events` — event lists used by album detail

## Transaction boundaries

- Album creation with initial media: wrap `INSERT album` + `INSERT album_media_assets` in one batch or explicit transaction.
- Album update (category/event/cover/status): single UPDATE unless media reorder batch is included.
- Legacy review resolution: wrap review record UPDATE + target album/horse INSERT/UPDATE + privacy review UPDATE in a transaction.
- Horse profile creation with media: wrap horse INSERT + primary/media INSERTs in a transaction.
- Media removal from album/horse: relationship DELETE only; never delete `media_assets`.

## Migration interactions

- Migration script remains dry-run default; `--apply` blocked on production hosts.
- Migration populates `activity_categories` seed, creates albums, creates horse profiles, fills `legacy_gallery_review` for uncertain rows.
- Members category rows go to review queue with `privacyReviewStatus = pending`.
- No automatic deletion of `gallery_images`.
- No dual-write until cutover.

## Media-reference behavior

- Album cover and media reference `media_assets.id`.
- Horse primary and additional media reference `media_assets.id`.
- Managed page images remain in `settings.heroes` / `theme.logo`.
- Legacy gallery images remain in `gallery_images.image` until retired.
- Media integrity service scans all reference locations and reports counts, missing assets, orphans, and multi-use assets.
- Deleting an album, horse, or relationship never deletes the underlying asset in this phase.

## Verification checklist before UI phase

- [ ] Draft album invisible publicly
- [ ] Published album visible publicly
- [ ] Archived album invisible publicly
- [ ] Featured album appears only when eligible
- [ ] Pending/restricted member album cannot be featured or listed publicly
- [ ] Category change reflected in public filtering
- [ ] Cover change reflected in public cards
- [ ] Media ordering reflected in public album detail
- [ ] Published horse visible; archived horse invisible
- [ ] Removing album/horse media does not delete asset
- [ ] Resolved legacy record does not duplicate public content
- [ ] Existing gallery still works while feature disabled
- [ ] Existing media URLs still work
- [ ] Existing managed page-image reads/writes still work
- [ ] Unauthenticated mutations fail
- [ ] Viewer/Editor cannot perform Admin-only actions
- [ ] Publication invalidates correct cache tags
- [ ] Privacy restriction invalidates all public surfaces
