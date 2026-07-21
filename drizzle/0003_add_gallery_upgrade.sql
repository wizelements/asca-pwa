-- ASCA gallery/activities/horse upgrade schema
-- Add canonical activity categories, activity albums, horse profiles, and legacy review queue.
-- Legacy gallery_images table is preserved for rollback and review.

CREATE TABLE IF NOT EXISTS "activity_categories" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '',
	"sort_order" integer DEFAULT 0,
	"active" integer DEFAULT true NOT NULL,
	"created_at" integer DEFAULT (unixepoch()),
	"updated_at" integer DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS "activity_categories_slug_unique" ON "activity_categories" ("slug");
CREATE INDEX IF NOT EXISTS "activity_categories_active_sort_idx" ON "activity_categories" ("active", "sort_order");

CREATE TABLE IF NOT EXISTS "activity_albums" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"category_id" integer NOT NULL REFERENCES "activity_categories"("id"),
	"event_id" integer REFERENCES "events"("id") ON DELETE SET NULL,
	"activity_date" integer,
	"location" text DEFAULT '',
	"summary" text DEFAULT '',
	"cover_media_asset_id" text REFERENCES "media_assets"("id") ON DELETE SET NULL,
	"featured" integer DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"privacy_review_status" text DEFAULT 'not_required' NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" integer DEFAULT (unixepoch()),
	"updated_at" integer DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS "activity_albums_slug_unique" ON "activity_albums" ("slug");
CREATE INDEX IF NOT EXISTS "activity_albums_category_status_featured_sort_idx" ON "activity_albums" ("category_id", "status", "featured", "sort_order");
CREATE INDEX IF NOT EXISTS "activity_albums_event_idx" ON "activity_albums" ("event_id");

CREATE TABLE IF NOT EXISTS "album_media_assets" (
	"album_id" integer NOT NULL REFERENCES "activity_albums"("id") ON DELETE CASCADE,
	"media_asset_id" text NOT NULL REFERENCES "media_assets"("id"),
	"sort_order" integer DEFAULT 0,
	"caption" text DEFAULT '',
	"alt_text" text DEFAULT '' NOT NULL,
	"created_at" integer DEFAULT (unixepoch()),
	"updated_at" integer DEFAULT (unixepoch()),
	PRIMARY KEY ("album_id", "media_asset_id")
);

CREATE INDEX IF NOT EXISTS "album_media_assets_album_sort_idx" ON "album_media_assets" ("album_id", "sort_order");

CREATE TABLE IF NOT EXISTS "horse_profiles" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '',
	"primary_media_asset_id" text REFERENCES "media_assets"("id") ON DELETE SET NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" integer DEFAULT (unixepoch()),
	"updated_at" integer DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS "horse_profiles_slug_unique" ON "horse_profiles" ("slug");
CREATE INDEX IF NOT EXISTS "horse_profiles_status_sort_idx" ON "horse_profiles" ("status", "sort_order");

CREATE TABLE IF NOT EXISTS "horse_profile_media" (
	"horse_profile_id" integer NOT NULL REFERENCES "horse_profiles"("id") ON DELETE CASCADE,
	"media_asset_id" text NOT NULL REFERENCES "media_assets"("id"),
	"sort_order" integer DEFAULT 0,
	"caption" text DEFAULT '',
	"alt_text" text DEFAULT '' NOT NULL,
	"created_at" integer DEFAULT (unixepoch()),
	"updated_at" integer DEFAULT (unixepoch()),
	PRIMARY KEY ("horse_profile_id", "media_asset_id")
);

CREATE INDEX IF NOT EXISTS "horse_profile_media_profile_sort_idx" ON "horse_profile_media" ("horse_profile_id", "sort_order");

CREATE TABLE IF NOT EXISTS "legacy_gallery_review" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"legacy_gallery_image_id" integer NOT NULL,
	"legacy_title" text NOT NULL,
	"legacy_category" text NOT NULL,
	"legacy_media_reference" text NOT NULL,
	"proposed_destination_type" text NOT NULL,
	"proposed_category_slug" text,
	"proposed_album_id" integer REFERENCES "activity_albums"("id") ON DELETE SET NULL,
	"proposed_horse_profile_id" integer REFERENCES "horse_profiles"("id") ON DELETE SET NULL,
	"migration_confidence" text NOT NULL,
	"review_reason" text NOT NULL,
	"review_status" text DEFAULT 'pending' NOT NULL,
	"privacy_review_status" text DEFAULT 'not_required' NOT NULL,
	"notes" text DEFAULT '',
	"created_at" integer DEFAULT (unixepoch()),
	"reviewed_at" integer,
	"reviewer_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
	UNIQUE("legacy_gallery_image_id")
);

CREATE INDEX IF NOT EXISTS "legacy_gallery_review_status_idx" ON "legacy_gallery_review" ("review_status");
CREATE INDEX IF NOT EXISTS "legacy_gallery_review_legacy_id_idx" ON "legacy_gallery_review" ("legacy_gallery_image_id");
