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
  /* The first three are dark: they sit behind the opening film, the film of
     the reservoirs and the gateway, and are taken from the shadows in those
     pictures, so the header and the fades between them stay in their colors. */
  dawn: {
    surface: '#1f2420',
    surfaceRaised: '#2a302b',
    ink: '#f4efe6',
    inkMuted: '#c5c8bd',
    accent: '#e8b877',
    line: '#394039',
    lineStrong: '#8a9187',
  },
  'first-light': {
    surface: '#1b231f',
    surfaceRaised: '#262f2a',
    ink: '#f4efe6',
    inkMuted: '#c3c9be',
    accent: '#e8b877',
    line: '#343d37',
    lineStrong: '#87918a',
  },
  /* The shade inside the brick gateway. */
  gateway: {
    surface: '#1d1611',
    surfaceRaised: '#2a2019',
    ink: '#f5ede2',
    inkMuted: '#cfbeab',
    accent: '#e6ab85',
    line: '#3c2e23',
    lineStrong: '#96806c',
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
  /* Night falling on the restaurant: the dark of its lawn and roof, with the
     gold of its lanterns as the accent. */
  dusk: {
    surface: '#16110c',
    surfaceRaised: '#231a12',
    ink: '#f6ecdf',
    inkMuted: '#cdbca6',
    accent: '#e9b266',
    line: '#392c1e',
    lineStrong: '#907c64',
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
