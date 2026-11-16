import { describe, expect, it } from 'vitest';
import { downloadOrder } from './frame-sequence';

describe('downloadOrder', () => {
  it('includes every frame exactly once', () => {
    const order = downloadOrder(150);
    expect(order).toHaveLength(150);
    expect(new Set(order).size).toBe(150);
  });

  it('starts with the first frame, then a coarse pass', () => {
    expect(downloadOrder(40).slice(0, 4)).toEqual([0, 16, 32, 8]);
  });
});
