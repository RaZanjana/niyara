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
import { colorAlong, parseHex, prefersDarkInk, toCss, type Rgb } from '../lib/color';
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
  scenes.slice(1).forEach((scene) => {
    boundaries.push(
      ScrollTrigger.create({
        trigger: scene,
        start: blend ? 'top 80%' : `top ${headerHeight + 1}px`,
        end: blend ? 'top 20%' : `top ${headerHeight}px`,
        onUpdate: apply,
        onRefresh: apply,
      }),
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
