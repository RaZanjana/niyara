/**
 * Small color helpers with no dependencies.
 * Used to blend the page background between sections and to check contrast.
 */

/** A color as red, green and blue, each from 0 to 255. */
export type Rgb = readonly [number, number, number];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Reads a hex color such as `#c9d2d6` or `#fff`. */
export function parseHex(hex: string): Rgb {
  const value = hex.trim().replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`"${hex}" is not a hex color.`);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** Blends two colors. `amount` 0 gives `from`, 1 gives `to`. */
export function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  const t = clamp01(amount);
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ];
}

/**
 * Picks a color from a list by a fractional position.
 * Position 0 is the first color, 1 the second, and 1.5 is halfway between
 * the second and the third.
 */
export function colorAlong(colors: readonly Rgb[], position: number): Rgb {
  const first = colors[0];
  if (!first) throw new Error('colorAlong needs at least one color.');
  const last = colors.length - 1;
  const clamped = Math.min(last, Math.max(0, position));
  const index = Math.min(last, Math.floor(clamped));
  const from = colors[index] ?? first;
  const to = colors[Math.min(last, index + 1)] ?? from;
  return mix(from, to, clamped - index);
}

export function toCss([red, green, blue]: Rgb): string {
  return `rgb(${red} ${green} ${blue})`;
}

/** Perceived brightness from 0 (black) to 1 (white), as defined by WCAG. */
export function relativeLuminance(color: Rgb): number {
  const [red, green, blue] = color.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** Contrast between two colors, from 1 (none) to 21 (black on white). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (lighter + 0.05) / (darker + 0.05);
}

/** True when dark text reads better than light text on this background. */
export function prefersDarkInk(background: Rgb): boolean {
  return relativeLuminance(background) > 0.3;
}
