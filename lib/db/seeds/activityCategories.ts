import { getDb } from '@/lib/db';
import { CANONICAL_ACTIVITY_CATEGORIES } from '@/lib/gallery/constants';

export async function seedActivityCategories(): Promise<{ inserted: number; updated: number; unchanged: number }> {
  const db = getDb();
  let inserted = 0;
  let updated = 0;
  let unchanged = 0;

  for (const cat of CANONICAL_ACTIVITY_CATEGORIES) {
    const existingResult = await db.execute({
      sql: 'SELECT name, description, sort_order, active FROM activity_categories WHERE slug = ?',
      args: [cat.slug],
    });

    if (existingResult.rows.length === 0) {
      await db.execute({
        sql: 'INSERT INTO activity_categories (name, slug, description, sort_order, active) VALUES (?, ?, ?, ?, ?)',
        args: [cat.name, cat.slug, cat.description ?? null, cat.sortOrder, cat.active ? 1 : 0],
      });
      inserted++;
      continue;
    }

    const row = existingResult.rows[0];
    const existingName = String(row.name ?? '');
    const existingDescription = row.description == null ? null : String(row.description);
    const existingSortOrder = Number(row.sort_order ?? 0);
    const existingActive = Boolean(row.active);

    const needsUpdate =
      existingName !== cat.name ||
      existingDescription !== cat.description ||
      existingSortOrder !== cat.sortOrder ||
      existingActive !== cat.active;

    if (needsUpdate) {
      await db.execute({
        sql: 'UPDATE activity_categories SET name = ?, description = ?, sort_order = ?, active = ? WHERE slug = ?',
        args: [cat.name, cat.description ?? null, cat.sortOrder, cat.active ? 1 : 0, cat.slug],
      });
      updated++;
    } else {
      unchanged++;
    }
  }

  return { inserted, updated, unchanged };
}
