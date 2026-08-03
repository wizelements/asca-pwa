import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_ACTIVITY_CATEGORIES,
  isGenericTitle,
  looksLikeHorseTitle,
  LEGACY_TO_CANONICAL_CATEGORY_MAP,
  REVIEW_REQUIRED_LEGACY_CATEGORIES,
} from '../../lib/gallery/constants.ts';

describe('constants', () => {
  it('has seven canonical categories', () => {
    assert.equal(CANONICAL_ACTIVITY_CATEGORIES.length, 7);
    assert.ok(CANONICAL_ACTIVITY_CATEGORIES.some((c) => c.slug === 'trail-rides'));
  });

  it('detects generic titles', () => {
    assert.equal(isGenericTitle('Events'), true);
    assert.equal(isGenericTitle('Meet Shade'), false);
  });

  it('detects horse titles', () => {
    const horse = looksLikeHorseTitle('Meet Prince');
    assert.equal(horse.isHorse, true);
    assert.equal(horse.name, 'Prince');
  });

  it('maps legacy categories', () => {
    assert.equal(LEGACY_TO_CANONICAL_CATEGORY_MAP['Trail Rides'], 'trail-rides');
    assert.equal(REVIEW_REQUIRED_LEGACY_CATEGORIES.has('Members'), true);
  });
});
