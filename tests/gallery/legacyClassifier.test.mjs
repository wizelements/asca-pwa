import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classifyLegacyRow } from '../../lib/gallery/legacyClassifier.ts';
import { CANONICAL_ACTIVITY_CATEGORIES } from '../../lib/gallery/constants.ts';

const categories = CANONICAL_ACTIVITY_CATEGORIES;

describe('legacyClassifier', () => {
  it('classifies horse titles as horse profiles', () => {
    const result = classifyLegacyRow('Meet Shade', 'Horses', categories);
    assert.equal(result.destinationType, 'horse');
    assert.equal(result.confidence, 'high');
  });

  it('maps Trail Rides directly to album when title is specific', () => {
    const result = classifyLegacyRow('2026 Spring Trail Ride', 'Trail Rides', categories);
    assert.equal(result.destinationType, 'album');
    assert.equal(result.proposedCategorySlug, 'trail-rides');
    assert.equal(result.confidence, 'high');
  });

  it('sends generic titled Trail Rides to review', () => {
    const result = classifyLegacyRow('Trail Rides', 'Trail Rides', categories);
    assert.equal(result.destinationType, 'review');
    assert.equal(result.proposedCategorySlug, 'trail-rides');
    assert.equal(result.confidence, 'medium');
  });

  it('flags Members for privacy review', () => {
    const result = classifyLegacyRow('ASCA member', 'Members', categories);
    assert.equal(result.destinationType, 'review');
    assert.equal(result.privacyReviewStatus, 'pending');
  });

  it('flags unknown categories for review', () => {
    const result = classifyLegacyRow('Random', 'OldCategory', categories);
    assert.equal(result.destinationType, 'review');
    assert.equal(result.confidence, 'low');
  });
});
