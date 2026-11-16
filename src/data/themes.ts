/**
 * Color themes, one per time of day.
 *
 * The page moves from dawn to night as the visitor scrolls. Each section picks
 * one theme with a `data-theme` attribute, and that theme sets the CSS variables
 * every component reads (`--surface`, `--ink` and so on).
 *
 * This file is the single source of truth for those colors:
 * - `themeStyles()` turns it into CSS, which the base layout puts in the page.
 * - `themes.test.ts` checks that every text color is readable on its background.
 */

export interface Theme {
  /** Page background for the section. */
  surface: string;
  /** Panels that sit on the surface, such as the booking form. */
  surfaceRaised: string;
  /** Headings and body text. */
  ink: string;
  /** Labels, captions and secondary text. */
  inkMuted: string;
  /** Links and small marks. Never a large fill. */
  accent: string;
  /** Decorative hairlines. */
  line: string;
  /** Borders of inputs and outlined buttons. */
  lineStrong: string;
}

export const themes = {
  dawn: {
    surface: '#c9d2d6',
    surfaceRaised: '#d8dfe2',
    ink: '#1c2428',
    inkMuted: '#46535a',
    accent: '#7a4630',
    line: '#a9b4b8',
    lineStrong: '#66737a',
  },
  'first-light': {
    surface: '#dcddd8',
    surfaceRaised: '#e6e7e3',
    ink: '#1c2428',
    inkMuted: '#46535a',
    accent: '#7a4630',
    line: '#b9c0c1',
    lineStrong: '#6b777c',
  },
  morning: {
    surface: '#f3eee6',
    surfaceRaised: '#fbf8f3',
    ink: '#1f2623',
    inkMuted: '#55605a',
    accent: '#9a4f31',
    line: '#d9d1c4',
    lineStrong: '#8c8477',
  },
  noon: {
    surface: '#faf7f0',
    surfaceRaised: '#ffffff',
    ink: '#1f2623',
    inkMuted: '#55605a',
    accent: '#9a4f31',
    line: '#e4ded2',
    lineStrong: '#8c8477',
  },
  afternoon: {
    surface: '#f1e4d3',
    surfaceRaised: '#f7eee2',
    ink: '#1f2623',
    inkMuted: '#55605a',
    accent: '#94492c',
    line: '#dccdb8',
    lineStrong: '#857d70',
  },
  dusk: {
    surface: '#8c4a31',
    surfaceRaised: '#7c402a',
    ink: '#fbf3ea',
    inkMuted: '#ead3c3',
    accent: '#f7d49b',
    line: '#a9664b',
    lineStrong: '#d9a58c',
  },
  gallery: {
    surface: '#0e1112',
    surfaceRaised: '#181c1e',
    ink: '#ede6da',
    inkMuted: '#a9a79f',
    accent: '#e0a458',
    line: '#262c2f',
    lineStrong: '#6a7579',
  },
  night: {
    surface: '#14181a',
    surfaceRaised: '#1d2326',
    ink: '#ede6da',
    inkMuted: '#a9a79f',
    accent: '#e0a458',
    line: '#2a3134',
    lineStrong: '#6a7579',
  },
} as const satisfies Record<string, Theme>;

export type ThemeName = keyof typeof themes;

/** Maps each theme field to the CSS variable components use. */
const cssVariables: Record<keyof Theme, string> = {
  surface: '--surface',
  surfaceRaised: '--surface-raised',
  ink: '--ink',
  inkMuted: '--ink-muted',
  accent: '--accent',
  line: '--line',
  lineStrong: '--line-strong',
};

/** Builds the CSS that defines every theme, for the base layout to print. */
export function themeStyles(): string {
  return Object.entries(themes)
    .map(([name, theme]) => {
      const declarations = (Object.keys(cssVariables) as (keyof Theme)[])
        .map((field) => `${cssVariables[field]}:${theme[field]}`)
        .join(';');
      return `[data-theme='${name}']{${declarations}}`;
    })
    .join('');
}
