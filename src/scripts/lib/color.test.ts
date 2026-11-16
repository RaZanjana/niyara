import { describe, expect, it } from 'vitest';
import { colorAlong, contrastRatio, mix, parseHex, prefersDarkInk, toCss } from './color';

describe('parseHex', () => {
  it('reads six and three digit colors', () => {
    expect(parseHex('#c9d2d6')).toEqual([201, 210, 214]);
    expect(parseHex(' #FFF ')).toEqual([255, 255, 255]);
  });

  it('rejects anything that is not a hex color', () => {
    expect(() => parseHex('rgb(0 0 0)')).toThrow();
  });
});

describe('mix', () => {
  it('returns the ends at 0 and 1 and the middle at 0.5', () => {
    expect(mix([0, 0, 0], [100, 200, 50], 0)).toEqual([0, 0, 0]);
    expect(mix([0, 0, 0], [100, 200, 50], 1)).toEqual([100, 200, 50]);
    expect(mix([0, 0, 0], [100, 200, 50], 0.5)).toEqual([50, 100, 25]);
  });

  it('does not go past either end', () => {
    expect(mix([10, 10, 10], [20, 20, 20], 4)).toEqual([20, 20, 20]);
    expect(mix([10, 10, 10], [20, 20, 20], -1)).toEqual([10, 10, 10]);
  });
});

describe('colorAlong', () => {
  const colors = [parseHex('#000000'), parseHex('#646464'), parseHex('#c8c8c8')];

  it('walks through the list by position', () => {
    expect(colorAlong(colors, 0)).toEqual([0, 0, 0]);
    expect(colorAlong(colors, 1)).toEqual([100, 100, 100]);
    expect(colorAlong(colors, 1.5)).toEqual([150, 150, 150]);
  });

  it('stops at the first and last color', () => {
    expect(colorAlong(colors, -3)).toEqual([0, 0, 0]);
    expect(colorAlong(colors, 9)).toEqual([200, 200, 200]);
  });
});

describe('contrast', () => {
  it('measures black on white as 21 to 1', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
  });

  it('chooses dark ink for light backgrounds only', () => {
    expect(prefersDarkInk(parseHex('#f3eee6'))).toBe(true);
    expect(prefersDarkInk(parseHex('#14181a'))).toBe(false);
    expect(prefersDarkInk(parseHex('#8c4a31'))).toBe(false);
  });
});

describe('toCss', () => {
  it('writes a CSS color', () => {
    expect(toCss([1, 2, 3])).toBe('rgb(1 2 3)');
  });
});
