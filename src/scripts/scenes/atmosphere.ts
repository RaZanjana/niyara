/**
 * Atmosphere: the page background follows the time of day.
 *
 * Each section has its own background color (its theme's `--surface`).
 * As the visitor scrolls from one section to the next, this script blends
 * the page background between the two colors, so the sections never meet at
 * a hard line. It also tells the header whether to use dark or light text.
 *
 * It writes two CSS variables on <html>:
 *   --page-bg   the current background color
 *   --page-ink  a text color that is readable on it
 */
import {
  colorAlong,
  parseHex,
  prefersDarkInk,
  relativeLuminance,
  toCss,
  type Rgb,
} from '../lib/color';
import { find, findAll } from '../lib/dom';
import { ScrollTrigger } from '../lib/motion';

const DARK_INK = '#1c2428';
const LIGHT_INK = '#f3eee6';

interface AtmosphereOptions {
  /**
   * true:  blend smoothly between colors while a boundary crosses the screen.
   * false: switch color at once when a section reaches the header (reduced motion).
   */
  blend: boolean;
}

export function createAtmosphere({ blend }: AtmosphereOptions): () => void {
  const root = document.documentElement;
  const scenes = findAll('[data-scene]');
  const colors: Rgb[] = scenes.map((scene) =>
    parseHex(getComputedStyle(scene).getPropertyValue('--surface')),
  );
  const headerHeight = find('.header')?.offsetHeight ?? 0;

  // One trigger per boundary between two sections. Its progress runs from
  // 0 (still the earlier section's color) to 1 (fully the later section's).
  // The list is filled one by one, because a trigger can call `apply` while
  // it is being created.
  const boundaries: ScrollTrigger[] = [];
  scenes.slice(1).forEach((scene, index) => {
    const [start, end] = blend
      ? blendWindow(colors[index], colors[index + 1])
      : [`top ${headerHeight + 1}px`, `top ${headerHeight}px`];
    boundaries.push(
      ScrollTrigger.create({ trigger: scene, start, end, onUpdate: apply, onRefresh: apply }),
    );
  });

  function apply() {
    // Adding up the progress of every boundary gives the position along the
    // list of colors: 0 is the first section, 1.5 is halfway from the second
    // to the third. This stays correct however far the page jumps.
    const position = boundaries.reduce((sum, boundary) => sum + boundary.progress, 0);
    const color = colorAlong(colors, blend ? position : Math.round(position));
    root.style.setProperty('--page-bg', toCss(color));
    root.style.setProperty('--page-ink', prefersDarkInk(color) ? DARK_INK : LIGHT_INK);
  }

  root.dataset.atmosphere = blend ? 'blend' : 'step';
  apply();

  return () => {
    boundaries.forEach((boundary) => boundary.kill());
    delete root.dataset.atmosphere;
    root.style.removeProperty('--page-bg');
    root.style.removeProperty('--page-ink');
  };
}

/** How much lighter or darker the next section must be to count as a change of light. */
const LIGHT_CHANGE = 0.25;

/**
 * Where on the screen the top of the next section is while the two colors
 * blend, as a ScrollTrigger start and end.
 *
 * Text is dark on a light section and light on a dark one, so when the page
 * goes between the two, the blend must not happen under words that are still
 * on screen:
 * - Dark to light: the page lightens early, while the new section is still
 *   low on the screen, before its words have faded in.
 * - Light to dark: the page darkens late, once the words of the section
 *   that is leaving have faded out at the top.
 * - Otherwise the blend happens around the middle of the screen.
 */
function blendWindow(from: Rgb | undefined, to: Rgb | undefined): [string, string] {
  const change = from && to ? relativeLuminance(to) - relativeLuminance(from) : 0;
  if (change > LIGHT_CHANGE) return ['top 100%', 'top 55%'];
  if (change < -LIGHT_CHANGE) return ['top 46%', 'top 0%'];
  return ['top 80%', 'top 20%'];
}
