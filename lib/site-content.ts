import 'server-only';

import { unstable_cache } from 'next/cache';

import { getDb } from '@/lib/db';
import {
  SITE_CONTENT_FIELD_MAP,
  getDefaultSiteContent,
  type SiteContentFieldDefinition,
} from '@/lib/content/site-content';

export const CACHE_TAG_SITE_CONTENT = 'site-content';

export type SiteContentValues = Record<string, string | string[]>;

function decodeValue(field: SiteContentFieldDefinition, value: string): string | string[] {
  if (field.type !== 'list') return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : field.defaultValue;
  } catch {
    return field.defaultValue;
  }
}

function encodeValue(field: SiteContentFieldDefinition, value: string | string[]): string {
  return field.type === 'list' ? JSON.stringify(value) : String(value);
}

function isMissingTableError(error: unknown) {
  return error instanceof Error && /no such table:\s*site_content/i.test(error.message);
}

export async function getSiteContent(): Promise<SiteContentValues> {
  const defaults = getDefaultSiteContent();
  const db = getDb();

  try {
    const result = await db.execute('SELECT key, value FROM site_content');
    for (const row of result.rows) {
      const key = String(row.key);
      const field = SITE_CONTENT_FIELD_MAP.get(key);
      if (!field) continue;
      defaults[key] = decodeValue(field, String(row.value ?? ''));
    }
    return defaults;
  } catch (error) {
    // PR previews created before the additive production migration must still
    // render safely from code defaults. Writes never silently fall back.
    if (isMissingTableError(error)) return defaults;
    throw error;
  }
}

export const getCachedSiteContent = unstable_cache(
  async () => getSiteContent(),
  ['site-content-public-v1'],
  { revalidate: 60, tags: [CACHE_TAG_SITE_CONTENT] }
);

function validateValue(field: SiteContentFieldDefinition, value: unknown): string | string[] {
  if (field.type === 'list') {
    if (!Array.isArray(value)) throw new Error(`${field.label} must be a list.`);
    const cleaned = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
    if (cleaned.length === 0) throw new Error(`${field.label} needs at least one item.`);
    if (cleaned.length > 30) throw new Error(`${field.label} has too many items.`);
    if (cleaned.some((item) => item.length > field.maxLength)) {
      throw new Error(`${field.label} items must be ${field.maxLength} characters or fewer.`);
    }
    return cleaned;
  }

  if (typeof value !== 'string') throw new Error(`${field.label} must be text.`);
  const cleaned = value.trim();
  if (!cleaned) throw new Error(`${field.label} cannot be blank.`);
  if (cleaned.length > field.maxLength) {
    throw new Error(`${field.label} must be ${field.maxLength} characters or fewer.`);
  }
  return cleaned;
}

export async function updateSiteContent(
  updates: Record<string, unknown>,
  updatedBy?: number
): Promise<SiteContentValues> {
  const entries = Object.entries(updates);
  if (entries.length === 0) throw new Error('No page text changes were provided.');
  if (entries.length > 80) throw new Error('Too many page text changes in one request.');

  const validated = entries.map(([key, value]) => {
    const field = SITE_CONTENT_FIELD_MAP.get(key);
    if (!field) throw new Error(`Unknown page text field: ${key}`);
    return { key, field, value: validateValue(field, value) };
  });

  const db = getDb();
  try {
    await db.execute('BEGIN');
    for (const item of validated) {
      await db.execute({
        sql: `INSERT INTO site_content (key, value, updated_by, created_at, updated_at)
              VALUES (?, ?, ?, unixepoch(), unixepoch())
              ON CONFLICT(key) DO UPDATE SET
                value = excluded.value,
                updated_by = excluded.updated_by,
                updated_at = unixepoch()`,
        args: [item.key, encodeValue(item.field, item.value), updatedBy ?? null],
      });
    }
    await db.execute('COMMIT');
  } catch (error) {
    await db.execute('ROLLBACK').catch(() => undefined);
    if (isMissingTableError(error)) {
      throw new Error('Page text storage has not been migrated in this environment yet.');
    }
    throw error;
  }

  return getSiteContent();
}


export function siteText(values: SiteContentValues, key: string): string {
  const field = SITE_CONTENT_FIELD_MAP.get(key);
  const fallback = field && typeof field.defaultValue === 'string' ? field.defaultValue : '';
  const value = values[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export function siteList(values: SiteContentValues, key: string): string[] {
  const field = SITE_CONTENT_FIELD_MAP.get(key);
  const fallback = field && Array.isArray(field.defaultValue) ? field.defaultValue : [];
  const value = values[key];
  return Array.isArray(value) && value.length > 0 ? value : [...fallback];
}
