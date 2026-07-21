import {
  LEGACY_TO_CANONICAL_CATEGORY_MAP,
  REVIEW_REQUIRED_LEGACY_CATEGORIES,
  isGenericTitle,
  looksLikeHorseTitle,
} from './constants.ts';
import type { CanonicalCategory } from './types.ts';

export interface LegacyClassification {
  destinationType: 'album' | 'horse' | 'review' | 'skip';
  proposedCategorySlug: string | null;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  privacyReviewStatus: 'not_required' | 'pending' | 'approved' | 'restricted';
}

export function classifyLegacyRow(
  title: string,
  category: string,
  canonicalCategories: CanonicalCategory[]
): LegacyClassification {
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

  if (slug) {
    const exists = canonicalCategories.some((c) => c.slug === slug);
    if (!exists) {
      return {
        destinationType: 'review',
        proposedCategorySlug: null,
        confidence: 'low',
        reason: `Mapped slug "${slug}" is not present in canonical categories.`,
        privacyReviewStatus: 'not_required',
      };
    }
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
    const isMembers = category.trim() === 'Members';
    return {
      destinationType: isMembers ? 'review' : 'review',
      proposedCategorySlug: null,
      confidence: 'low',
      reason: `Legacy category "${category}" requires manual review before migration.`,
      privacyReviewStatus: isMembers ? 'pending' : 'not_required',
    };
  }

  if (!category.trim() || category.trim() === 'general') {
    return {
      destinationType: 'review',
      proposedCategorySlug: null,
      confidence: 'low',
      reason: `Legacy row has missing or generic category "${category}".`,
      privacyReviewStatus: 'not_required',
    };
  }

  return {
    destinationType: 'review',
    proposedCategorySlug: null,
    confidence: 'low',
    reason: `Unknown legacy category "${category}" with title "${title}".`,
    privacyReviewStatus: 'not_required',
  };
}
