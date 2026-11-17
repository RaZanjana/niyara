import { describe, expect, it } from 'vitest';
import { coverRect, frameIndexAt, frameUrl, nearestLoadedFrame } from './frames';

describe('frameUrl', () => {
  it('numbers frames from 1 with leading zeros', () => {
    expect(frameUrl('/frames/hero/desktop', 0, 4, 'webp')).toBe('/frames/hero/desktop/0001.webp');
    expect(frameUrl('/frames/hero/desktop', 149, 4, 'webp')).toBe('/frames/hero/desktop/0150.webp');
  });

  it("adds the film's fingerprint, so a replaced film is fetched afresh", () => {
    expect(frameUrl('/frames/hero/desktop', 0, 4, 'webp', 'a1b2c3')).toBe(
      '/frames/hero/desktop/0001.webp?v=a1b2c3',
    );
  });
});

describe('frameIndexAt', () => {
  it('maps progress to the first, middle and last frame', () => {
    expect(frameIndexAt(0, 150)).toBe(0);
    expect(frameIndexAt(0.5, 151)).toBe(75);
    expect(frameIndexAt(1, 150)).toBe(149);
  });

  it('stays in range for progress outside 0 to 1', () => {
    expect(frameIndexAt(-0.2, 150)).toBe(0);
    expect(frameIndexAt(1.4, 150)).toBe(149);
  });
});

describe('nearestLoadedFrame', () => {
  it('returns the wanted frame when it is loaded', () => {
    expect(nearestLoadedFrame([true, true, true], 1)).toBe(1);
  });

  it('falls back to the closest loaded frame, earlier first', () => {
    expect(nearestLoadedFrame([true, false, false, true], 2)).toBe(3);
    expect(nearestLoadedFrame([true, false, false, false, true], 2)).toBe(0);
  });

  it('returns -1 when nothing is loaded', () => {
    expect(nearestLoadedFrame([false, false], 1)).toBe(-1);
  });
});

describe('coverRect', () => {
  it('crops the sides of a wide picture in a tall box', () => {
    const rect = coverRect({ width: 1600, height: 900 }, { width: 400, height: 800 });
    expect(rect.height).toBe(800);
    expect(rect.width).toBeCloseTo(1422.22, 1);
    expect(rect.x).toBeCloseTo(-511.11, 1);
    expect(rect.y).toBe(0);
  });

  it('crops top and bottom of a tall picture in a wide box', () => {
    const rect = coverRect({ width: 720, height: 1280 }, { width: 1440, height: 900 });
    expect(rect.width).toBe(1440);
    expect(rect.y).toBeLessThan(0);
  });
});
