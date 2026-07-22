# Gallery & Activities Upgrade — AMP Live Monitoring Ledger

AMP is the independent implementation monitor for OpenClaw's Gallery and
Activities upgrade. Entries are append-only; do not overwrite earlier findings.

---

## Checkpoint 1 — Initial checkpoint + Gate 1 (branch/foundation)

- **Timestamp:** 2026-07-21T14:23Z
- **Current branch:** `feat/gallery-activities-complete-upgrade`
- **Current commit (pre-intervention):** `82afb1c`
- **Working tree:** untracked unrelated files only (`1`, `ASCA_INVOICE_2026-07-08.html`); no unrelated changes bundled into branch commits
- **OpenClaw claimed phase:** schema + seeds + migration foundation (4 commits)
- **Database target:** none active — `.env.local` intentionally contains no secrets; live secrets isolated in `/root/.openclaw/secrets/asca-pwa.env` (production hostname `asca-pwa-swatkins.aws-us-east-1.turso.io`)

### Independent verification performed

- `git merge-base main feat/...` → `d8158c5` = audited starting point = `origin/main`. Branch base correct; no work on `main`.
- Commits on branch: `81299d1` (test foundation), `f897949` (schemas), `083e912` (seeds/legacy review), `82afb1c` (migration + guards).
- Node v22.22.3, pnpm 11.8.0.
- Shell reliability: stdout/stderr/exit-codes/workdir verified. **Caveat:** `git diff` content diffs and shell pipes wedge in this PRoot environment — use `git diff-tree`, `git show`, and file redirection instead. `node --test` runner mode also wedges; run test files directly (`node --experimental-strip-types <file>`).
- Secret scan of branch diff: no tokens/keys found. Env files leak nothing (`.env.local` is a pointer comment only).
- Production backup exists: `/root/backups/asca-pwa-turso-pre-media-migration-20260720-220514.sql` (21,123,539 bytes, Jul 20; sha256 prefix `d2610a0f1f0446eef31cbbab94ff9dce`).
- Disposable database: **none exists yet** — required before Gate 4 dry-run verification against restored data.
- No unreviewed deployment observed. No baseline lint/typecheck/build recorded yet (deferred; see Checkpoint 2 gaps).

### Gate 1 decision: **PASS WITH NON-BLOCKING FINDINGS**

- Non-blocking: no disposable restored DB yet; baseline typecheck/lint/build not yet recorded; production credentials present on machine (outside repo) — migration guards must stay proven.

---

## Checkpoint 2 — Gate 2 (schema) + Gate 3 (seeds/migration safety) review

- **Timestamp:** 2026-07-21T14:23Z
- **Branch/commit:** `feat/gallery-activities-complete-upgrade` @ `82afb1c`
- **Files reviewed:** `drizzle/0003_add_gallery_upgrade.sql`, `lib/db/schema.ts`, `lib/gallery/{migration,legacyClassifier,constants,slug,types,validation}.ts`, `lib/db/seeds/activityCategories.ts`, `lib/db/connection.ts`, `scripts/migrate-legacy-gallery.js`, `tests/gallery/*`

### Verified findings (PASS)

- All six new tables present with required columns, unique slugs, indexes; `legacy_gallery_review` durably records all required fields.
- No destructive SQL: zero DROP/DELETE/ALTER; migration is additive-only; legacy `gallery_images` preserved; no writes to `media_assets`.
- Canonical 7 categories with exact slugs; seed idempotent (select-first by slug); labels never used as identifiers.
- No forced legacy mappings: Events/Community/Activities/Members/Horses + unknowns route to review (low confidence); `Meet <Name>` → horse candidate (high confidence); exact `Members` → privacy pending.
- No invented event names, dates, locations, or descriptions.
- Production hostname refused on `--apply` (exact host + `turso.io` substring); safeguard failures exit non-zero.

### Failed findings

- **BLOCKER B1 (Gate 2):** No foreign keys anywhere in new schema — no event/cover `SET NULL`, no album-relationship cascade, no category integrity.
- **BLOCKER B2 (Gate 3):** Dry run not read-only — `seedCategories` inserted rows without `--apply`; dry run against production permitted and would have written category rows.
- **BLOCKER B3 (Gate 3):** Album migration not rerun-idempotent — plain `INSERT` with per-run slug set; reruns abort on unique-slug conflicts or duplicate albums.
- High (open): no SQL CHECK constraints on status/privacy enums (app-level only); reconciliation report lacks distinct member-privacy/skip/error terminal states and counts classifications rather than confirmed writes; migration reads `TURSO_DATABASE_URL` from ambient env.
- Medium (open): `Meet <Name>` precedence bypasses member privacy pending when a Members row matches horse pattern; `Members` match is case/whitespace-sensitive; production detection is substring matching; Drizzle schema omits secondary indexes declared in SQL; TS nullability drift vs Zod/SQL; no Zod schema for legacy review input.
- Low (open): report field names (`albumsCreated` etc.) count classifications, not inserts; `tests/utils/db.mjs` uses single-statement `execute` on multi-statement SQL (currently unused, broken helper); `tests/run.mjs` glob scans `node_modules` (wedges).

### Gate 2 + 3 decision: **HOLD — CORRECTIONS REQUIRED** (blockers B1–B3)

---

## Checkpoint 3 — AMP direct intervention (blockers B1–B3)

- **Timestamp:** 2026-07-21T14:24Z
- **Branch/commit:** `feat/gallery-activities-complete-upgrade` @ `64f78a8`
- **Intervention policy basis:** user instructed AMP to fix blockers; defects narrow and clearly understood; isolated commit with AMP attribution.

### Defects and patches

1. **B1 — Foreign keys added** to `drizzle/0003_add_gallery_upgrade.sql` and `lib/db/schema.ts`:
   - `activity_albums.category_id → activity_categories(id)`; `event_id → events(id) ON DELETE SET NULL`; `cover_media_asset_id → media_assets(id) ON DELETE SET NULL`
   - `album_media_assets.album_id → activity_albums(id) ON DELETE CASCADE`; `media_asset_id → media_assets(id)` (no action — blocks deleting referenced assets)
   - `horse_profiles.primary_media_asset_id → media_assets(id) ON DELETE SET NULL`; `horse_profile_media` same pattern as album media
   - `legacy_gallery_review.proposed_album_id/proposed_horse_profile_id/reviewer_id` → `SET NULL`; `legacy_gallery_image_id` **intentionally unconstrained** so review records outlive legacy-table changes (durability requirement)
2. **B2 — Dry run made read-only:** `seedCategories(db, report, apply)` skips INSERT without apply (sentinel id `-1`, still counted as would-seed); warning recorded when dry run targets a suspected production URL; `PRAGMA foreign_keys = ON` enabled on migration connection.
3. **B3 — Album idempotency:** deterministic per-legacy-row slug `<slugified-title>-legacy-<rowid>` + `INSERT OR IGNORE` for `activity_albums` and `album_media_assets`.
4. Test-harness repair: `tests/gallery/migration.test.mjs` used CommonJS `require()` inside ESM cleanup (silently failed, leaving stale `/tmp` DBs that broke reruns) — replaced with imported `unlinkSync`.
5. Removed misleading `--force-production` hint from `scripts/migrate-legacy-gallery.js` (no such override exists).

### Independent verification of the intervention

- Tests: all 4 gallery test files pass — 14/14 (`constants` 4, `legacyClassifier` 5, `migration` 2, `slug` 3), exit 0 each.
- Disposable file DB end-to-end check:
  - Dry run created **no tables and no rows** (schema absent afterward) while still classifying 4/4 rows (1 album, 1 horse, 2 review; 7 would-seed categories).
  - Apply twice: identical counts both runs (7 cats, 1 album, 1 album-media, 1 horse, 1 horse-media, 2 review; legacy 4, media 4 untouched); reconciliation 4/4.
  - `PRAGMA foreign_key_check`: zero violations. Album delete removed only relationship rows (media intact). Deleting a referenced media asset blocked by FK. Horse primary media `SET NULL` confirmed after asset delete.
- Not run: typecheck/lint/production build (deferred: heavy on this device; must be recorded before Gate 6).

### Gate decision: **PASS WITH NON-BLOCKING FINDINGS** (blockers B1–B3 resolved and independently retested; High/Medium findings from Checkpoint 2 remain open)

### OpenClaw may proceed to

Correcting the open High findings (CHECK constraints, reconciliation terminal states, member-privacy precedence), then Phase Gate 4 (legacy reconciliation dry run **against a disposable database restored from the Jul 20 dump** — must be created first). Public/admin UI work remains gated until Gate 4 passes.

### Notes for OpenClaw

- Behavior change: media assets referenced by album/horse media rows can no longer be hard-deleted (FK blocks it). The existing `/admin/media` delete path must surface this as "asset in use" rather than a 500 — verify during Gate 6.
- FK enforcement requires `PRAGMA foreign_keys = ON` on file-based SQLite connections; the migration runner now sets it. Confirm app-runtime connections (`lib/db/connection.ts`) behave correctly on Turso (server-side enforcement).
- `tests/run.mjs` glob includes `node_modules` and wedges in this environment; run test files directly or scope the glob to `tests/`.
