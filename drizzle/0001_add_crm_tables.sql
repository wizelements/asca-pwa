-- ASCA CRM Stage 1C: additive CRM tables
-- Apply only after backing up the production database.
-- This migration contains no destructive changes.

CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text DEFAULT 'person' NOT NULL,
	`first_name` text,
	`last_name` text,
	`organization_name` text,
	`email` text,
	`phone` text,
	`source` text DEFAULT 'manual' NOT NULL,
	`status` text DEFAULT 'lead' NOT NULL,
	`lifecycle_stage` text DEFAULT 'awareness' NOT NULL,
	`interests` text DEFAULT '[]' NOT NULL,
	`consent_email` integer DEFAULT false NOT NULL,
	`consent_sms` integer DEFAULT false NOT NULL,
	`notes_summary` text DEFAULT '',
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);

CREATE TABLE `contact_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`form_submission_id` integer,
	`subject` text,
	`message` text,
	`source_page` text,
	`status` text DEFAULT 'new' NOT NULL,
	`assigned_to` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);

CREATE TABLE `contact_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`author_admin_id` integer NOT NULL,
	`note` text NOT NULL,
	`visibility` text DEFAULT 'admin' NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);

CREATE TABLE `contact_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`due_date` integer,
	`status` text DEFAULT 'open' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`assigned_to` integer,
	`created_by` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);

CREATE TABLE `contact_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#737373' NOT NULL,
	`category` text DEFAULT 'custom' NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);

CREATE TABLE `contact_tag_assignments` (
	`contact_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	PRIMARY KEY(`contact_id`, `tag_id`)
);

CREATE TABLE `contact_activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`activity_type` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);

ALTER TABLE `members` ADD COLUMN `contact_id` integer;

ALTER TABLE `form_submissions` ADD COLUMN `contact_id` integer;

-- Indexes
CREATE INDEX `contacts_email_idx` ON `contacts` (`email`);
CREATE INDEX `contacts_status_idx` ON `contacts` (`status`);
CREATE INDEX `contacts_source_idx` ON `contacts` (`source`);
CREATE INDEX `contacts_lifecycle_stage_idx` ON `contacts` (`lifecycle_stage`);

CREATE INDEX `contact_messages_contact_id_idx` ON `contact_messages` (`contact_id`);
CREATE INDEX `contact_messages_status_idx` ON `contact_messages` (`status`);
CREATE INDEX `contact_messages_form_submission_id_idx` ON `contact_messages` (`form_submission_id`);

CREATE INDEX `contact_notes_contact_id_idx` ON `contact_notes` (`contact_id`);
CREATE INDEX `contact_notes_author_idx` ON `contact_notes` (`author_admin_id`);

CREATE INDEX `contact_tasks_contact_id_idx` ON `contact_tasks` (`contact_id`);
CREATE INDEX `contact_tasks_assigned_to_idx` ON `contact_tasks` (`assigned_to`);
CREATE INDEX `contact_tasks_status_idx` ON `contact_tasks` (`status`);
CREATE INDEX `contact_tasks_due_date_idx` ON `contact_tasks` (`due_date`);

CREATE UNIQUE INDEX `contact_tags_name_idx` ON `contact_tags` (`name`);

CREATE INDEX `contact_tag_assignments_contact_id_idx` ON `contact_tag_assignments` (`contact_id`);
CREATE INDEX `contact_tag_assignments_tag_id_idx` ON `contact_tag_assignments` (`tag_id`);

CREATE INDEX `contact_activities_contact_id_idx` ON `contact_activities` (`contact_id`);
CREATE INDEX `contact_activities_type_idx` ON `contact_activities` (`activity_type`);

CREATE INDEX `members_contact_id_idx` ON `members` (`contact_id`);
CREATE INDEX `form_submissions_contact_id_idx` ON `form_submissions` (`contact_id`);
