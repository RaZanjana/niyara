import { describe, expect, it } from 'vitest';
import { contrastRatio, parseHex } from '@/scripts/lib/color';
import { themes, themeStyles } from './themes';

/** WCAG AA: 4.5 to 1 for text, 3 to 1 for the borders of controls. */
const TEXT_MINIMUM = 4.5;
const BORDER_MINIMUM = 3;

describe.each(Object.entries(themes))('theme "%s"', (_name, theme) => {
  const surfaces = [theme.surface, theme.surfaceRaised].map(parseHex);

  it.each(['ink', 'inkMuted', 'accent'] as const)('%s is readable on both surfaces', (field) => {
    for (const surface of surfaces) {
      expect(contrastRatio(parseHex(theme[field]), surface)).toBeGreaterThanOrEqual(TEXT_MINIMUM);
    }
  });

  it('control borders stand out from the surface', () => {
    expect(
      contrastRatio(parseHex(theme.lineStrong), parseHex(theme.surface)),
    ).toBeGreaterThanOrEqual(BORDER_MINIMUM);
  });
});

describe('themeStyles', () => {
  it('writes one CSS rule per theme', () => {
    const css = themeStyles();
    for (const name of Object.keys(themes)) {
      expect(css).toContain(`[data-theme='${name}']`);
    }
    expect(css).toContain('--surface:#c9d2d6');
  });
});
