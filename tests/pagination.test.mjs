import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getPageItems } from '../lib/pagination.ts';

describe('getPageItems', () => {
  it('shows every page for small totals', () => {
    assert.deepEqual(getPageItems(4, 7), [1, 2, 3, 4, 5, 6, 7]);
  });

  it('windows pages around the current page with ellipses', () => {
    assert.deepEqual(getPageItems(5, 20), [1, 'ellipsis', 4, 5, 6, 'ellipsis', 20]);
  });

  it('handles the first and last page without duplicate items', () => {
    assert.deepEqual(getPageItems(1, 20), [1, 2, 'ellipsis', 20]);
    assert.deepEqual(getPageItems(20, 20), [1, 'ellipsis', 19, 20]);
  });

  it('returns no items when there are no pages', () => {
    assert.deepEqual(getPageItems(1, 0), []);
  });
});
