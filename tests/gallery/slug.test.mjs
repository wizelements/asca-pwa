import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { slugify, uniqueSlug, isValidSlug } from '../../lib/gallery/slug.ts';

describe('slug', () => {
  it('slugifies display names', () => {
    assert.equal(slugify('Trail Rides'), 'trail-rides');
    assert.equal(slugify('Festivals & Rodeos'), 'festivals-and-rodeos');
    assert.equal(slugify('Fellowship!!!'), 'fellowship');
  });

  it('generates unique slugs', () => {
    const existing = new Set(['trail-rides', 'trail-rides-2']);
    assert.equal(uniqueSlug('trail-rides', existing), 'trail-rides-3');
  });

  it('validates slug format', () => {
    assert.equal(isValidSlug('trail-rides'), true);
    assert.equal(isValidSlug('Trail Rides'), false);
    assert.equal(isValidSlug('trail--rides'), false);
  });
});
