-- Add soft-delete columns to gallery tables

ALTER TABLE activity_albums ADD COLUMN deleted_at INTEGER;
ALTER TABLE horse_profiles ADD COLUMN deleted_at INTEGER;

-- Ensure future reads filter out soft-deleted rows
-- (Application code must enforce the deleted_at IS NULL filter.)
