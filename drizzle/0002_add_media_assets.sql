-- ASCA media extraction: isolate image payloads from page/content records.
-- Apply this additive schema change before deploying the media upload route.

CREATE TABLE IF NOT EXISTS `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`data_url` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
