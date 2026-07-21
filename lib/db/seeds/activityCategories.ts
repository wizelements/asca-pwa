import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { activityCategories } from '@/lib/db/schema';
import { CANONICAL_ACTIVITY_CATEGORIES } from '@/lib/gallery/constants';

export async function seedActivityCategories(): Promise<{ inserted: number; updated: number; unchanged: number }> {
  let inserted = 0;
  let updated = 0;
  let unchanged = 0;

  for (const cat of CANONICAL_ACTIVITY_CATEGORIES) {
    const existing = await db.select().from(activityCategories).where(eq(activityCategories.slug, cat.slug)).limit(1);
    if (existing.length === 0) {
      await db.insert(activityCategories).values({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        active: cat.active,
      });
      inserted++;
    } else {
      const row = existing[0];
      const needsUpdate =
        row.name !== cat.name ||
        row.description !== cat.description ||
        row.sortOrder !== cat.sortOrder ||
        row.active !== cat.active;
      if (needsUpdate) {
        await db
          .update(activityCategories)
          .set({ name: cat.name, description: cat.description, sortOrder: cat.sortOrder, active: cat.active })
          .where(eq(activityCategories.slug, cat.slug));
        updated++;
      } else {
        unchanged++;
      }
    }
  }

  return { inserted, updated, unchanged };
}
