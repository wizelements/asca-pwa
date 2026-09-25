# Atlanta Saddle Club Association — PWA + Admin

ASCA's active web application and non-technical administration workspace.

> **Current architecture is the code in this repository.** Older phase, handoff, MongoDB, Supabase, Strapi, and early Next.js documents are historical references unless explicitly marked current.

## Current stack

- **Framework:** Next.js 15 App Router + React 18 + TypeScript
- **Styling:** Tailwind CSS with ASCA design tokens
- **Database:** Turso/libSQL with Drizzle ORM
- **Authentication:** signed admin sessions using HttpOnly cookies and role checks
- **Email:** Resend
- **PWA:** web app manifest + first-party service worker + offline fallback
- **Hosting:** Vercel
- **Testing:** Node service tests + Playwright end-to-end tests in pull requests
- **Package manager:** pnpm 11.8.0

## Product surfaces

### Public site

The public experience includes Home, About, Meet ASCA, Get Involved, Event Calendar, Gallery, Our Horses, and Support ASCA. Content that changes routinely is managed through the admin workspace rather than code.

### Admin workspace

The primary client workflow is intentionally small:

- **Dashboard** — messages, tasks, events, members, recent activity
- **People** — contacts and member records
- **Operations** — events, messages, tasks
- **Website** — gallery albums, horses, page images, appearance, social/donation settings
- **Support** — guided walkthrough, help, and account settings

Migration/integrity tools exist but are intentionally excluded from primary navigation.

## Local setup

1. Install Node.js 22 and pnpm 11.8.0.
2. Copy `.env.example` to `.env.local`.
3. Configure a development Turso/libSQL database and a strong `NEXTAUTH_SECRET`.
4. Install dependencies and run the app:

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm dev
```

Default development URL: `http://localhost:3000`.

## Required environment variables

See `.env.example`. Production requires, at minimum:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN` for remote Turso databases
- `NEXTAUTH_SECRET` — at least 32 random characters; never commit it
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAIL`
- Resend variables when email delivery/password reset is enabled

Never commit database credentials, admin passwords, API keys, or authentication secrets.

## Quality gates

Before merging a production change:

```bash
pnpm type-check
pnpm lint
pnpm test
pnpm build
```

Pull requests also run the Playwright end-to-end workflow in `.github/workflows/e2e.yml`.

A deployment is not considered healthy only because Vercel reports READY. Verify the intended public route, admin authentication boundary, core admin workflow, and relevant write path.

## PWA rules

- HTML, admin pages, APIs, and mutable content are network-first/no-store.
- Only truly immutable Next/static/icon assets use cache-first behavior.
- Service-worker activation must not force-navigate every open client.
- `manifest.json` must advertise only implemented capabilities.
- Admin routes are not offline-authoritative; destructive or state-changing work requires a live server response.

## Security rules

- Admin session tokens must remain HttpOnly and must not be stored in `localStorage`.
- Production startup/auth must fail closed when the signing secret is missing or weak.
- All admin APIs enforce server-side authentication; UI guards are not authorization.
- Public form input is bounded and sanitized before persistence/email rendering.
- Any credential ever committed to git must be treated as exposed and rotated outside the repository.

## Repository documentation

Use this README and the live code as the source of truth. Documents named `PHASE_*`, `*_COMPLETE*`, older deployment guides, and the original architecture/handoff documents describe earlier project stages and may contain retired design decisions.

Current operational references include:

- `.env.example`
- `.github/workflows/e2e.yml`
- `drizzle/` and `drizzle.config.ts`
- `PWA_CONFIGURATION.md` (validate examples against current `public/sw.js`)
- `ADMIN_TRAINING_QUICK_GUIDE.md` (client usage; current UI remains authoritative)
- `docs/audits/` for implementation-specific audits

## Deployment

The repository is connected to the Vercel project `asca-pwa`. Normal production changes should go through a branch/preview/PR flow:

1. Build a preview from a branch.
2. Verify preview behavior.
3. Require CI/E2E to pass.
4. Merge with a clean production commit.
5. Verify the production deployment and runtime error state.

Do not bypass these gates for client-facing or security-sensitive changes.
