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

  it('can fetch the opening frames first, in order', () => {
    const order = downloadOrder(40, 5);
    expect(order.slice(0, 7)).toEqual([0, 1, 2, 3, 4, 16, 32]);
    expect(order).toHaveLength(40);
    expect(new Set(order).size).toBe(40);
  });
});
