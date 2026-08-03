import { z } from 'zod';
import { CANONICAL_CATEGORY_SLUGS } from './constants.ts';
import { isValidSlug } from './slug.ts';

const ActivityAlbumStatus = z.enum(['draft', 'published', 'archived']);
const PrivacyReviewStatus = z.enum(['not_required', 'pending', 'approved', 'restricted']);

export const albumInputSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().refine(isValidSlug, { message: 'Slug must be lowercase letters, numbers, and hyphens only.' }),
  categoryId: z.number().int().positive(),
  eventId: z.number().int().positive().nullable().optional(),
  activityDate: z.coerce.date().nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  summary: z.string().max(2000).nullable().optional(),
  coverMediaAssetId: z.string().min(1).nullable().optional(),
  featured: z.boolean().default(false),
  status: ActivityAlbumStatus.default('draft'),
  privacyReviewStatus: PrivacyReviewStatus.default('not_required'),
  sortOrder: z.number().int().default(0),
});

export const albumMediaInputSchema = z.object({
  mediaAssetId: z.string().min(1),
  sortOrder: z.number().int().default(0),
  caption: z.string().max(500).nullable().optional(),
  altText: z.string().min(1).max(1000),
});

export const horseProfileInputSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().refine(isValidSlug, { message: 'Slug must be lowercase letters, numbers, and hyphens only.' }),
  description: z.string().max(2000).nullable().optional(),
  primaryMediaAssetId: z.string().min(1).nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  sortOrder: z.number().int().default(0),
});

export const horseProfileMediaInputSchema = z.object({
  mediaAssetId: z.string().min(1),
  sortOrder: z.number().int().default(0),
  caption: z.string().max(500).nullable().optional(),
  altText: z.string().min(1).max(1000),
});

export const categoryInputSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().refine(isValidSlug, { message: 'Slug must be lowercase letters, numbers, and hyphens only.' }),
  description: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export function isGenericAltText(alt: string): boolean {
  const normalized = alt.trim().toLowerCase();
  const generic = ['image', 'photo', 'picture', 'event', 'activity', 'member', 'horse', '2026', '2025', '2024'];
  return normalized.length < 3 || generic.includes(normalized);
}

export function validatePublishableAlbum(album: {
  title: string;
  status: string;
  privacyReviewStatus: string;
  mediaCount: number;
  coverMediaAssetId: string | null;
  altTexts: string[];
}): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!album.title.trim()) errors.push('Album title is required.');
  if (album.status !== 'published' && album.status !== 'draft') errors.push('Status must be draft or published.');
  if (album.privacyReviewStatus === 'pending' || album.privacyReviewStatus === 'restricted') {
    errors.push('Album cannot be published while privacy review is pending or restricted.');
  }
  if (album.mediaCount === 0) errors.push('At least one image is required.');
  if (!album.coverMediaAssetId) errors.push('A cover image is required.');
  const missingAlt = album.altTexts.some((alt) => !alt.trim() || isGenericAltText(alt));
  if (missingAlt) errors.push('All images must have meaningful alt text.');
  return { ok: errors.length === 0, errors };
}
