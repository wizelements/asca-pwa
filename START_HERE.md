# ASCA PWA — Start Here

This repository is an **active production application**, not a future architecture package.

## Source of truth

1. Read **README.md** for the current product, stack, setup, quality gates, and security rules.
2. Read **package.json** for the executable commands and dependency versions.
3. Read **.env.example** for supported configuration.
4. Read **lib/db/schema.ts** and **drizzle/** for the current data model.
5. Read **app/** and **components/** for the actual public/admin product.

## Current architecture

```text
Public ASCA site / Installed PWA
             |
        Next.js 15
             |
   Public routes + Admin UI
             |
   Next.js route handlers
      |              |
 HttpOnly admin    Public forms
    sessions          |
      |               |
      +------ Turso/libSQL
      |        via Drizzle
      |
    Resend email
```

Vercel hosts the application. The service worker is intentionally conservative: application pages and mutable data remain network-authoritative.

## Development

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm dev
```

For release verification:

```bash
pnpm type-check
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

The repository's PR workflow provisions a local libSQL database and runs Playwright independently.

## Documentation warning

Many root-level files beginning with `PHASE_`, older handoff/build reports, and the original `ARCHITECTURE_COMPLETE.md` describe retired January–July 2026 plans (including Strapi, Supabase/PostgreSQL, MongoDB, Firebase-first workflows, and earlier Next.js versions). They remain only as historical project context.

**Do not use historical documents to configure production or create credentials.** Current implementation and README.md win whenever there is a conflict.
