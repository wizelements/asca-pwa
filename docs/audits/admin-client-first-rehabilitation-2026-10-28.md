# ASCA admin rehabilitation — client-first scope and acceptance plan
**Audit date:** 2026-10-28  
**Source:** `wizelements/asca-pwa`  
**Production project identified:** Vercel `asca-pwa`, project ID `prj_yE7U1yDSF86CNstu1u13xT6JiOa9`  
**Safety:** changes staged on `fix/admin-client-first-workflow-2026-10-28`, not merged to `main`.

## Goal
A nontechnical ASCA officer should be able to **find, complete, verify, and if necessary recover** routine updates on a phone without developer help. Success is measured by successful client tasks, not number of admin pages, walkthrough slides, or settings.

## Client evidence
On October 20, a client contact asked how to change the monthly meeting location and requested a walkthrough of the entire system. She later said she figured it out. The later success does **not** prove that the interface was discoverable. The requirement is a direct, self-explanatory path, with an unambiguous indication of which public pages change.

Earlier ASCA reports identify another recurring acceptance failure: a photo/album can be uploaded or saved in admin but not visible where the client expects it on the public site. This is unacceptable without a clear publication/status explanation.

## Verified architectural findings
1. The existing walkthrough had **16 steps** and opened automatically on first use. This interrupts the user's real task. Make long help opt-in.
2. `app/admin/content/page.tsx` originally rendered *every* page's text fields at once, although the client usually has one specific public page in mind.
3. The recurring monthly meeting was buried in **Page Text > Shared Site Copy > Monthly meeting**, despite an explicit `shared.meeting.venue` and `shared.meeting.address` mapping to the homepage meeting callout and About page.
4. The album editor saves a draft separately from privacy review and publication. The public gallery additionally requires a publishable status, approved/no-review-needed privacy, active category, attached media, and attached cover. `app/admin/albums/page.tsx` already reports eligibility reasons, but the editor did not show the prerequisites next to Publish.
5. The legacy Gallery, newer Gallery Albums, Page Images, Media Integrity, and Legacy Review are distinct systems. Their separate purposes need understandable labels and task paths, not a technical taxonomy in the primary navigation.
6. The publicly rendered horse detail route had a grouped runtime error for `/horses/sage` on October 26 (Vercel error digest 2622014654). The underlying cause is **not verified** and requires a targeted repair/retail check. This is not proof of a general admin outage.
7. Test infrastructure exists: Playwright browser tests and seeded local libSQL/Turso fixtures in `.github/workflows/e2e.yml`. Real client behavior still needs an observed acceptance run.

## Fixes implemented on the improvement branch
- **Monthly Meeting**: dedicated focused editor with one save operation for cadence, time, venue, address, label; dashboard and sidebar links; verified data source shared with the existing public homepage/About page.
- **Page Text**: select one public page; keep unrelated unsaved page edits isolated when another page is saved; fail closed and retry on API load errors (never silently edit default text as if it were authoritative).
- **Walkthrough**: no forced 16-step modal; still available from the admin header or Help.
- **Album publishing**: explain missing photo, cover, category, alt text, pending privacy review, and restricted privacy *before* the publish attempt. Link to the inventory for definitive public visibility including disabled gallery and category visibility.
- **Help and browser tests**: first-party recurring-meeting recipe, task-path checks, persistence and public-render verification.

## Delivery roadmap — prioritized
### P0: Make routine client tasks reliable
| Client task | Intended journey | Exit condition |
|---|---|---|
| Change monthly meeting location | Dashboard -> Monthly Meeting -> Venue & Address -> Save -> Check Homepage & About | Saved values survive refresh; both public destinations show updated values; error is clear when storage fails |
| Change text on a public page | Dashboard -> Page Text -> choose page -> edit -> Save -> View public page | One-page focus; changes persist; failed fetch blocks overwrite; no unsaved-data loss |
| Post activity photos | Gallery Albums -> Create -> Add & describe photos -> Save draft -> privacy review -> Publish -> verify | Every prerequisite explained before publish; album appears in correct gallery/public link; restrictions are never bypassed |
| Change an event | Events -> Edit -> Save -> verify calendar | Date, venue, public/draft state consistent; no duplicate meeting truth |
| Change a hero/section photo | Page Images -> exact destination -> Upload -> Save -> verify | Image is retrievable and public slot shows it; fallback slots explicitly marked |
| Manage member and inquiries | Members / Messages / Contacts / Tasks | Confidentiality preserved; all CRUD actions show understandable outcomes |

### P1: Comprehensive usability and accessibility pass
- Reduce default navigation to **jobs the club performs**; advanced Gallery migration/media diagnostics only in Help/Advanced.
- Mobile-first tap targets >=44 px, readable contrast, clear headings, responsive form layout, visible keyboard focus and helpful error text.
- Use separate **Draft**, **Saved**, **Published**, **Publicly visible**, **Restricted**, and **Failed** states instead of ambiguous "success" messaging.
- Add route-appropriate empty/loading/error/retry paths, search, pagination, and confirmations for destructive operations.
- Show exact public destination alongside every editable page image, photo album, event, and horse.
- Add unsaved-change protection for all editors and avoid live changes from incidental field interactions.
- Replace unnecessary internal terminology with client language (e.g., "Monthly meeting", "Album ready to publish").
- Target WCAG 2.2 AA including programmatic status/error announcements, labels, focus order, and keyboard use.

### P1: Data correctness and publishing
- Build a field-to-public-component mapping for **every visitor-visible text, image, contact method and action**, and identify hardcoded strings or settings with no current public consumer.
- Match each Save response to persisted database state and public render, across production, preview and cache revalidation.
- Verify runtime media fetch URL, storage existence, permission/privacy rule, album cover relation and feature flag for every missing asset.
- Reconcile old Gallery data to Gallery Albums using existing migration/review tooling, backups and a no-data-loss dry run.
- Audit all admin mutations for server-side authorization, validation, CSRF/session handling, audit logging and recovery options; editors cannot approve their own restricted-photo clearance.
- Inspect the actual Vercel horse-detail render failure, trace the source, and add regression tests.

### P2: Client certification and operational safeguards
- Observe a nontechnical client perform **at least five** real tasks (meeting location, event, page copy, gallery publication, image slot) without guidance on Android and desktop.
- Record task completion, errors, lost edits, time-to-find-control, time-to-public-result, and whether the user could explain the outcome.
- Test offline/retry, slow network, expired session, large/multiple uploads, invalid files, missing permissions, and cache propagation.
- Smoke-test all public URLs and admin routes after deploy; keep rollback and a tested content backup.
- Create short task-specific help for remaining obstacles. Do not solve hidden workflows by adding more mandatory tutorials.

## Release gates
1. CI type-check, unit/API integrity tests, and browser E2E pass on the exact candidate SHA.
2. A preview deployment is actually reachable under authorized login, and public destinations are checked **against its database**, not production.
3. No new critical errors on admin, gallery, horses, events or public content during validation.
4. Test account/editor/admin permissions and privacy review gates remain intact.
5. Independent public website checks confirm persisted edits and correctly explain non-public states.
6. A club representative completes the five core tasks without coaching; only then approve production merge.
7. After production release, run smoke tests, verify analytics/errors and keep a known-good rollback.

## Standard references
- Nielsen Norman Group: progressive disclosure, focus frequently needed actions rather than surfacing everything at once. https://www.nngroup.com/articles/progressive-disclosure/
- WCAG 2.2: input instructions, error identification, status announcements, keyboard access and visible focus. https://www.w3.org/TR/WCAG22/

## Not established
This static code audit does not establish which user accounts currently succeed/fail login; does not provide a signed-in reproduction of the client's device; does not establish the actual reasons for every production album being missing; and does not verify production data mutations. Never label the admin "fully fixed" until the release gates pass.


## October 28 follow-up: what complete success really means

### The product is the public website plus the client workspace
A content-management task succeeds only if **all five parts** work:
1. **Find:** a nontechnical officer can identify the right action from its everyday name.
2. **Edit:** the editor loads the actual saved record, offers comprehensible choices and guards against accidental data loss.
3. **Commit:** the correct authorized action persists to the correct environment with clear saved/draft/published distinctions.
4. **Show:** the relevant public page renders the intended text/image/event/album with privacy permissions, image availability and cache revalidation applied.
5. **Prove and recover:** the client can open the public destination, understand why something is unavailable, and reverse or retry safely.

An HTTP 200 or successful database save proves only one part. It is not an acceptable substitute for end-user verification.

### Public-website acceptance in addition to admin acceptance
| Visitor need | Public routes / components | Required evidence |
| --- | --- | --- |
| Understand club identity and mission in seconds | Home, About, Header | Clear saddle-club / equestrian purpose; legible contrast, no ambiguous stock/fabricated activities |
| Find the next accurate meeting | Home meeting callout, About membership section, event calendar | Location/time agree for the same meeting; one-time exceptions explicitly labeled; no stale location fallback |
| Find real upcoming activities | Event Calendar, event detail/CTAs | Correct date/time/venue, sensible TBA distinction, no past event mistaken for upcoming |
| See actual ASCA activity photography | Gallery, album detail, homepage feature cards | Every published/eligible album discoverable; cover, category, privacy, media file and thumbnail all work; no promises for hidden albums |
| Learn about the club's horses | Our Horses, horse detail | No dead-end site navigation; published/eligible profiles only; error-free images and pages |
| Take a next step | Get Involved, membership application, contact, support | Working CTAs, forms, accessible validation, confirmed submission and correct destination/notification |
| Use site comfortably | Mobile/desktop/PWA | WCAG 2.2 AA target, keyboard and focus, 44 px touch targets, responsive layout, readable text, Core Web Vitals and retry behavior |
| Trust privacy and factual content | All public surfaces | Explicit permission for photos of children and other restricted subjects; no fabricated photographs or unverifiable activity claims |

### Newly verified code findings and implemented changes
- The public `/horses` and `/horses/[slug]` routes are gated by `GALLERY_FEATURE_STAGE`. A successful admin "Publish" operation alone cannot establish a visitor-visible horse profile.
- The horse admin previously asserted "Public now" and linked to public detail even when that stage is disabled. The horses API now supplies effective deployment-side availability in `X-Horses-Public-Enabled`; the list/editor separate **published in the database** from **available on the website** and direct officers to verify the public page.
- An existing horse edit page previously rendered editable defaults after the initial record fetch failed. It now blocks editing and offers a retry/back route so a transient error cannot accidentally overwrite saved content.
- The public Our Horses navigation can remain visible even with the feature disabled. The list route now presents a truthful, useful visitor-facing explanation and routes to gallery/get involved instead of a dead-end 404; individual unpublished/disabled detail routes remain inaccessible.
- Automated browser coverage was extended for horse-rollout visibility and failing record loads.
- Vercel reports one historical grouped server-render failure on `/horses/[slug]` (five grouped instances on October 26, corresponding to `/horses/sage`). The public Sage page was retrievable in a fresh October 28 web fetch; the original production failure cause remains **unknown**, because grouped errors redact production details and full historical logs are beyond the available retention. Do not claim the defect is resolved based on one successful request.
- An October 28 web retrieval of the public gallery identified **six discoverable albums**. That does not establish all eligible admin albums are represented; compare actual inventory in the appropriate environment before release.

### Remaining high-priority dependencies
1. **True client account testing:** an authorized officer must complete meeting-location, event, page-text, album and page-image changes uncoached on a real phone and desktop. A developer-run E2E suite is not sufficient evidence of usability.
2. **Preview data isolation:** Vercel environment metadata cannot currently be listed with the connected credential (403). Until preview database/storage isolation is independently proven, **do not run mutating preview tests with real club data**.
3. **Meeting data consistency:** future explicitly saved `Monthly Meeting` calendar events may carry their own location/time overrides. The recurring meeting editor changes the shared location/time but does not overwrite explicitly entered events. Need a deliberate future-only reconciliation flow, preserving special-venue exceptions and historical meetings.
4. **Gallery discrepancy inventory:** reconcile every admin album with public eligibility, rollout mode, category status, attached cover, media existence, privacy status and homepage featuring; do not bypass restrictions to meet album counts.
5. **Editable-page inventory:** map each public text, link, photo and CTA to an actual admin control or mark as intentional protected site code. Existing page text editor covers many, **not proven all**, visitor-visible strings.
6. **Reliability/security:** role-by-role unauthorized mutation tests, safe backup and restoration, large-upload handling, expired-session recovery, rate-limits and privacy review; confirm production and preview caches invalidate correctly.
7. **Operational outcome:** after safe production release, compare expected vs observed content on the live domain with screenshots/browser tests and check errors, requests and submissions.

### Release decision / objective scorecard
Do **not** call this rehabilitation complete until each of these gates is backed by evidence:
- Latest exact commit: successful type-check/build, browser E2E and API/privacy tests; preview renders all public routes.
- At least five uncoached officer tasks completed with **zero unintended edits**, **zero confusing "published but missing" outcomes**, and understandable recovery when a task is blocked.
- Every publish action yields a **public URL and verified render** or a **specific truthful explanation** of why it is not public.
- A read-only media/album reconciliation identifies and accounts for all client-reported missing assets without discarding or fabricating data.
- Membership/contact paths, accessible forms and public CTAs are tested end to end.
- Staging database and media are isolated or tests use only verified synthetic fixtures.
- Client review is documented; production release, smoke check and rollback have evidence.

**Scope truth:** branch work described here is implemented, but a full production certification and independent client signoff have not occurred. Keep the pull request as draft until these gates are met.
