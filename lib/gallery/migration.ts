import { createClient, type Client } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CANONICAL_ACTIVITY_CATEGORIES,
  LEGACY_TO_CANONICAL_CATEGORY_MAP,
  REVIEW_REQUIRED_LEGACY_CATEGORIES,
  isGenericTitle,
  looksLikeHorseTitle,
} from './constants.ts';
import { slugify, uniqueSlug } from './slug.ts';
import type { LegacyClassification } from './legacyClassifier.ts';

export const PRODUCTION_HOSTS = [
  'asca-pwa-swatkins.aws-us-east-1.turso.io',
  'turso.io',
];

export function isProductionDatabaseUrl(url: string): boolean {
  return PRODUCTION_HOSTS.some((host) => url.includes(host));
}

export interface MigrationOptions {
  url: string;
  authToken?: string;
  apply: boolean;
  migrationSqlPath?: string;
}

export interface MigrationReport {
  applied: boolean;
  categoriesSeeded: number;
  albumsCreated: number;
  horseProfilesCreated: number;
  reviewQueueRows: number;
  legacyRows: number;
  warnings: string[];
  errors: string[];
  byCategory: Record<string, number>;
}

export async function runLegacyMigration(opts: MigrationOptions): Promise<MigrationReport> {
  const report: MigrationReport = {
    applied: false,
    categoriesSeeded: 0,
    albumsCreated: 0,
    horseProfilesCreated: 0,
    reviewQueueRows: 0,
    legacyRows: 0,
    warnings: [],
    errors: [],
    byCategory: {},
  };

  if (isProductionDatabaseUrl(opts.url) && opts.apply) {
    throw new Error(`Refusing to apply migration to suspected production database: ${opts.url}`);
  }

  const db = createClient({ url: opts.url, authToken: opts.authToken });

  const migrationPath = opts.migrationSqlPath ?? join(process.cwd(), 'drizzle', '0003_add_gallery_upgrade.sql');
  const sql = readFileSync(migrationPath, 'utf8');

  if (opts.apply) {
    await db.executeMultiple(sql);
    report.applied = true;
  }

  const categories = await seedCategories(db, report);
  const legacy = await db.execute('SELECT id, title, category, image, alt FROM gallery_images ORDER BY id');
  const rows = legacy.rows as Array<{ id: number; title: string; category: string; image: string; alt: string }>;
  report.legacyRows = rows.length;

  const usedAlbumSlugs = new Set<string>();
  const categoryNameBySlug: Record<string, string> = {};
  for (const c of categories) {
    categoryNameBySlug[c.slug] = c.name;
  }

  for (const row of rows) {
    report.byCategory[row.category] = (report.byCategory[row.category] ?? 0) + 1;
    const classification = classify(row.title, row.category, categories);

    if (classification.destinationType === 'horse') {
      if (opts.apply) {
        const horse = looksLikeHorseTitle(row.title);
        const baseSlug = slugify(horse.name ?? row.title);
        const slug = uniqueSlug(baseSlug, usedAlbumSlugs);
        usedAlbumSlugs.add(slug);
        await db.execute({
          sql: `INSERT OR IGNORE INTO horse_profiles (name, slug, primary_media_asset_id, status, sort_order, description)
                VALUES (?, ?, ?, 'published', ?, ?)`,
          args: [horse.name, slug, extractAssetId(row.image), row.id, ''],
        });
        await db.execute({
          sql: `INSERT OR IGNORE INTO horse_profile_media (horse_profile_id, media_asset_id, sort_order, alt_text)
                VALUES ((SELECT id FROM horse_profiles WHERE slug = ?), ?, ?, ?)`,
          args: [slug, extractAssetId(row.image), 0, row.alt || `${horse.name} photo`],
        });
      }
      report.horseProfilesCreated++;
      continue;
    }

    if (classification.destinationType === 'album' && classification.proposedCategorySlug) {
      if (opts.apply) {
        const catName = categoryNameBySlug[classification.proposedCategorySlug];
        const baseSlug = slugify(`${catName} legacy`);
        const slug = uniqueSlug(baseSlug, usedAlbumSlugs);
        usedAlbumSlugs.add(slug);
        const assetId = extractAssetId(row.image);
        await db.execute({
          sql: `INSERT INTO activity_albums (title, slug, category_id, cover_media_asset_id, status, privacy_review_status, sort_order, summary)
                VALUES (?, ?, (SELECT id FROM activity_categories WHERE slug = ?), ?, 'published', 'not_required', ?, ?)`,
          args: [row.title, slug, classification.proposedCategorySlug, assetId, row.id, ''],
        });
        await db.execute({
          sql: `INSERT INTO album_media_assets (album_id, media_asset_id, sort_order, alt_text)
                VALUES ((SELECT id FROM activity_albums WHERE slug = ?), ?, ?, ?)`,
          args: [slug, assetId, 0, row.alt || `${row.title} photo`],
        });
      }
      report.albumsCreated++;
      continue;
    }

    if (opts.apply) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO legacy_gallery_review
              (legacy_gallery_image_id, legacy_title, legacy_category, legacy_media_reference, proposed_destination_type, proposed_category_slug, migration_confidence, review_reason, privacy_review_status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          row.id,
          row.title,
          row.category,
          row.image,
          classification.destinationType,
          classification.proposedCategorySlug,
          classification.confidence,
          classification.reason,
          classification.privacyReviewStatus,
        ],
      });
    }
    report.reviewQueueRows++;
  }

  return report;
}

async function seedCategories(
  db: Client,
  report: MigrationReport
): Promise<Array<{ id: number; slug: string; name: string }>> {
  const inserted: Array<{ id: number; slug: string; name: string }> = [];
  for (const cat of CANONICAL_ACTIVITY_CATEGORIES) {
    const existing = await db.execute({
      sql: 'SELECT id, slug, name FROM activity_categories WHERE slug = ?',
      args: [cat.slug],
    });
    if (existing.rows.length > 0) {
      inserted.push({ id: Number(existing.rows[0].id), slug: cat.slug, name: cat.name });
      continue;
    }
    if (report) {
      // report is always defined in this context
    }
    const result = await db.execute({
      sql: 'INSERT INTO activity_categories (name, slug, description, sort_order, active) VALUES (?, ?, ?, ?, ?)',
      args: [cat.name, cat.slug, cat.description, cat.sortOrder, cat.active ? 1 : 0],
    });
    report.categoriesSeeded++;
    inserted.push({ id: Number(result.lastInsertRowid), slug: cat.slug, name: cat.name });
  }
  return inserted;
}

function classify(title: string, category: string, categories: Array<{ slug: string }>): LegacyClassification {
  const slug = LEGACY_TO_CANONICAL_CATEGORY_MAP[category.trim()];
  const horse = looksLikeHorseTitle(title);

  if (horse.isHorse) {
    return {
      destinationType: 'horse',
      proposedCategorySlug: null,
      confidence: 'high',
      reason: `Title "${title}" matches horse profile pattern "Meet <Name>".`,
      privacyReviewStatus: 'not_required',
    };
  }

  if (slug && categories.some((c) => c.slug === slug)) {
    if (isGenericTitle(title)) {
      return {
        destinationType: 'review',
        proposedCategorySlug: slug,
        confidence: 'medium',
        reason: `Category "${category}" maps to "${slug}" but title "${title}" is generic and needs editorial review.`,
        privacyReviewStatus: 'not_required',
      };
    }
    return {
      destinationType: 'album',
      proposedCategorySlug: slug,
      confidence: 'high',
      reason: `Category "${category}" maps directly to canonical "${slug}" with a specific title.`,
      privacyReviewStatus: 'not_required',
    };
  }

  if (REVIEW_REQUIRED_LEGACY_CATEGORIES.has(category.trim())) {
    return {
      destinationType: 'review',
      proposedCategorySlug: null,
      confidence: 'low',
      reason: `Legacy category "${category}" requires manual review before migration.`,
      privacyReviewStatus: category.trim() === 'Members' ? 'pending' : 'not_required',
    };
  }

  return {
    destinationType: 'review',
    proposedCategorySlug: null,
    confidence: 'low',
    reason: `Unknown or generic legacy category "${category}" with title "${title}".`,
    privacyReviewStatus: 'not_required',
  };
}

function extractAssetId(image: string): string | null {
  if (!image) return null;
  if (image.startsWith('/api/media/asset/')) {
    return image.replace('/api/media/asset/', '').split('?')[0];
  }
  if (image.startsWith('/api/media/gallery/')) {
    return image.replace('/api/media/gallery/', '').split('?')[0];
  }
  if (image.startsWith('data:')) {
    return null;
  }
  return image;
}
