import { getDbClient, withTransaction, type DbClient } from './db.ts';
import { slugify, uniqueSlug, isValidSlug } from '../slug.ts';
import type { CanonicalCategory } from '../types.ts';
import { CANONICAL_ACTIVITY_CATEGORIES } from '../constants.ts';

export interface ActivityCategoryRecord {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  sortOrder?: number;
  active?: boolean;
}

function rowToCategory(row: Record<string, unknown>): ActivityCategoryRecord {
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: row.description == null ? null : String(row.description),
    sortOrder: Number(row.sort_order ?? 0),
    active: Boolean(row.active),
    createdAt: row.created_at ? new Date(Number(row.created_at) * 1000) : null,
    updatedAt: row.updated_at ? new Date(Number(row.updated_at) * 1000) : null,
  };
}

const PROTECTED_SLUGS = new Set([
  'members',
  'horses',
  'events',
  'community',
  'activities',
  'admin',
  'api',
]);

export function isProtectedSlug(slug: string): boolean {
  return PROTECTED_SLUGS.has(slug.toLowerCase());
}

export async function seedCanonicalCategories(): Promise<ActivityCategoryRecord[]> {
  const db = getDbClient();
  const inserted: ActivityCategoryRecord[] = [];
  for (const cat of CANONICAL_ACTIVITY_CATEGORIES) {
    const existing = await db.execute({
      sql: 'SELECT id FROM activity_categories WHERE slug = ?',
      args: [cat.slug],
    });
    if (existing.rows.length > 0) continue;
    await db.execute({
      sql: 'INSERT INTO activity_categories (name, slug, description, sort_order, active) VALUES (?, ?, ?, ?, ?)',
      args: [cat.name, cat.slug, cat.description, cat.sortOrder, cat.active ? 1 : 0],
    });
  }
  return getAllCategories();
}

export async function getPublicCategories(): Promise<ActivityCategoryRecord[]> {
  const db = getDbClient();
  const result = await db.execute({
    sql: 'SELECT * FROM activity_categories WHERE active = 1 ORDER BY sort_order, name',
    args: [],
  });
  return result.rows.map(rowToCategory);
}

export async function getAllCategories(): Promise<ActivityCategoryRecord[]> {
  const db = getDbClient();
  const result = await db.execute({
    sql: 'SELECT * FROM activity_categories ORDER BY sort_order, name',
    args: [],
  });
  return result.rows.map(rowToCategory);
}

export async function getCategoryById(id: number): Promise<ActivityCategoryRecord | null> {
  const db = getDbClient();
  const result = await db.execute({
    sql: 'SELECT * FROM activity_categories WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToCategory(result.rows[0]);
}

export async function getCategoryBySlug(slug: string): Promise<ActivityCategoryRecord | null> {
  const db = getDbClient();
  const result = await db.execute({
    sql: 'SELECT * FROM activity_categories WHERE slug = ?',
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  return rowToCategory(result.rows[0]);
}

export async function resolveLegacyCategoryAlias(value: string): Promise<{
  slug: string | null;
  requiresReview: boolean;
}> {
  const trimmed = value.trim();
  if (!trimmed) return { slug: null, requiresReview: true };

  const direct = await getCategoryBySlug(slugify(trimmed));
  if (direct) return { slug: direct.slug, requiresReview: false };

  const all = await getAllCategories();
  const normalized = trimmed.toLowerCase();

  for (const cat of all) {
    if (cat.name.toLowerCase() === normalized) {
      return { slug: cat.slug, requiresReview: false };
    }
  }

  // Hardcoded safe legacy aliases approved by the correlation matrix.
  const aliasMap: Record<string, string> = {
    'trail rides': 'trail-rides',
    'community outreach': 'community-outreach',
    'parades': 'parades',
    'horsemanship': 'horsemanship',
    'festival & rodeo events': 'festivals-rodeos',
    'festivals & rodeos': 'festivals-rodeos',
    'fellowship': 'fellowship',
  };
  const mapped = aliasMap[normalized];
  if (mapped) return { slug: mapped, requiresReview: false };

  return { slug: null, requiresReview: true };
}

async function ensureUniqueSlug(db: DbClient, slug: string, excludeId?: number): Promise<string> {
  if (!isValidSlug(slug)) {
    throw new Error(`Invalid slug: ${slug}`);
  }
  if (isProtectedSlug(slug)) {
    throw new Error(`Slug is reserved: ${slug}`);
  }
  const existing = await db.execute({
    sql: excludeId ? 'SELECT slug FROM activity_categories WHERE slug LIKE ? AND id != ?' : 'SELECT slug FROM activity_categories WHERE slug LIKE ?',
    args: excludeId ? [`${slug}%`, excludeId] : [`${slug}%`],
  });
  const used = new Set(existing.rows.map((r) => String(r.slug)));
  return uniqueSlug(slug, used);
}

export async function createCategory(input: CategoryInput): Promise<ActivityCategoryRecord> {
  const db = getDbClient();
  const slug = await ensureUniqueSlug(db, input.slug);
  const result = await db.execute({
    sql: 'INSERT INTO activity_categories (name, slug, description, sort_order, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, unixepoch(), unixepoch())',
    args: [input.name, slug, input.description ?? null, input.sortOrder ?? 0, input.active !== false ? 1 : 0],
  });
  const record = await getCategoryById(Number(result.lastInsertRowid));
  if (!record) throw new Error('Category creation failed');
  return record;
}

export async function updateCategory(
  id: number,
  input: Partial<CategoryInput>
): Promise<ActivityCategoryRecord | null> {
  const db = getDbClient();
  const existing = await getCategoryById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const args: (string | number | null)[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    args.push(input.name);
  }
  if (input.slug !== undefined) {
    const slug = await ensureUniqueSlug(db, input.slug, id);
    updates.push('slug = ?');
    args.push(slug);
  }
  if (input.description !== undefined) {
    updates.push('description = ?');
    args.push(input.description ?? null);
  }
  if (input.sortOrder !== undefined) {
    updates.push('sort_order = ?');
    args.push(input.sortOrder);
  }
  if (input.active !== undefined) {
    updates.push('active = ?');
    args.push(input.active ? 1 : 0);
  }

  if (updates.length === 0) return existing;

  updates.push('updated_at = unixepoch()');
  args.push(id);

  await db.execute({
    sql: `UPDATE activity_categories SET ${updates.join(', ')} WHERE id = ?`,
    args,
  });

  return getCategoryById(id);
}

export async function deactivateCategory(id: number): Promise<ActivityCategoryRecord | null> {
  return updateCategory(id, { active: false });
}

export async function activateCategory(id: number): Promise<ActivityCategoryRecord | null> {
  return updateCategory(id, { active: true });
}
