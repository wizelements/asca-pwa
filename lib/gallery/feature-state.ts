export type FeatureStage = 'legacy-only' | 'admin-preview' | 'public-preview' | 'legacy-readonly' | 'legacy-retired';

const DEFAULT_STAGE: FeatureStage = 'legacy-only';

export function getGalleryFeatureStage(): FeatureStage {
  const env = process.env.GALLERY_FEATURE_STAGE;
  if (
    env === 'legacy-only' ||
    env === 'admin-preview' ||
    env === 'public-preview' ||
    env === 'legacy-readonly' ||
    env === 'legacy-retired'
  ) {
    return env;
  }
  return DEFAULT_STAGE;
}

export function isAdminPreviewEnabled(): boolean {
  const stage = getGalleryFeatureStage();
  return stage !== 'legacy-only';
}

export function isPublicPreviewEnabled(): boolean {
  const stage = getGalleryFeatureStage();
  return stage === 'public-preview' || stage === 'legacy-readonly' || stage === 'legacy-retired';
}

export function isLegacyReadonly(): boolean {
  const stage = getGalleryFeatureStage();
  return stage === 'legacy-readonly' || stage === 'legacy-retired';
}

export function isLegacyRetired(): boolean {
  return getGalleryFeatureStage() === 'legacy-retired';
}
