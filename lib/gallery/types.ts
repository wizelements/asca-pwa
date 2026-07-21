export type ActivityAlbumStatus = 'draft' | 'published' | 'archived';
export type PrivacyReviewStatus = 'not_required' | 'pending' | 'approved' | 'restricted';
export type LegacyGalleryReviewStatus = 'pending' | 'approved' | 'rejected' | 'resolved' | 'skipped';

export interface CanonicalCategory {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  active: boolean;
}

export interface ActivityAlbumInput {
  title: string;
  slug: string;
  categoryId: number;
  eventId?: number | null;
  activityDate?: Date | null;
  location?: string;
  summary?: string;
  coverMediaAssetId?: string | null;
  featured?: boolean;
  status?: ActivityAlbumStatus;
  privacyReviewStatus?: PrivacyReviewStatus;
  sortOrder?: number;
}

export interface AlbumMediaInput {
  mediaAssetId: string;
  sortOrder?: number;
  caption?: string;
  altText: string;
}

export interface HorseProfileInput {
  name: string;
  slug: string;
  description?: string;
  primaryMediaAssetId?: string | null;
  status?: 'draft' | 'published' | 'archived';
  sortOrder?: number;
}

export interface HorseProfileMediaInput {
  mediaAssetId: string;
  sortOrder?: number;
  caption?: string;
  altText: string;
}

export interface LegacyGalleryReviewInput {
  legacyGalleryImageId: number;
  legacyTitle: string;
  legacyCategory: string;
  legacyMediaReference: string;
  proposedDestinationType: 'album' | 'horse' | 'review' | 'skip';
  proposedCategorySlug?: string;
  proposedAlbumId?: number | null;
  proposedHorseProfileId?: number | null;
  migrationConfidence: 'high' | 'medium' | 'low';
  reviewReason: string;
  reviewStatus?: LegacyGalleryReviewStatus;
  privacyReviewStatus?: PrivacyReviewStatus;
  notes?: string;
}
