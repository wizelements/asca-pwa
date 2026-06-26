# Stage 1C — Production Migration SQL

Run this exact SQL against your production Turso database before the new admin routes are used.

## Command

```bash
cd /path/to/asca-pwa
turso db shell asca-pwa < drizzle/0001_add_crm_tables.sql
```

Replace `asca-pwa` with your actual Turso database name if different.

## What it does

- Creates 7 new CRM tables:
  - `contacts`
  - `contact_messages`
  - `contact_notes`
  - `contact_tasks`
  - `contact_tags`
  - `contact_tag_assignments`
  - `contact_activities`
- Adds one nullable column each to:
  - `members.contact_id`
  - `form_submissions.contact_id`
- Creates all supporting indexes.

## Safety notes

- All changes are additive.
- No existing tables, columns, or data are modified or removed.
- Existing `members` and `form_submissions` rows remain unchanged; their `contact_id` columns will be `NULL` until a backfill is run later.
- Backup your database before running if possible:
  ```bash
  turso db shell asca-pwa .dump > asca-pwa-pre-stage1c-backup.sql
  ```

## After migration

1. Vercel production deploy should already be in progress (or complete) from the pushed commit.
2. New public form submissions will automatically create CRM contacts and messages.
3. Admin pages `/admin/contacts`, `/admin/tasks`, `/admin/forms`, and `/admin` CRM cards will use real data.

## Backfill (optional, later)

Existing members and form submissions are not automatically linked. A separate backfill mission can create `contacts` records from them and populate `members.contact_id` / `form_submissions.contact_id`.
