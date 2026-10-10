-- ASCA client-editable static page content.
-- Additive and idempotent: safe to execute before every production build.

CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_by INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS site_content_updated_at_idx
  ON site_content(updated_at);
