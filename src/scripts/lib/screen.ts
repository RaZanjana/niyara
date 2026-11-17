/**
 * Screen: fixes the height of "one screen" in pixels, so that the page does
 * not change height while a phone's address bar grows and shrinks.
 *
 * The held scenes, and the scroll distances they take, are measured in
 * screens (`--lv` and `--sv` in styles/tokens.css). Some phone browsers
 * change their screen units as the address bar moves. Every scene then
 * changes height together, the page grows or shrinks by a screen or more,
 * and the scroll animations, worked out for the old height, start in the
 * wrong places: further down the page, more and more out of step. This
 * measures the units once, and again only when the width changes (the phone
 * is turned), and writes them as fixed pixels.
 *
 * On a phone, "the screen at its largest" is at least the height of the
 * screen itself, so a held scene always reaches the bottom, whatever the
 * browser's bars are doing. It may reach a little further, under them.
 */
import { ScrollTrigger } from './motion';

/** The height of an element sized in the given CSS unit, in pixels. */
function measure(height: string): number {
  const probe = document.createElement('div');
  probe.style.cssText = `position:fixed;top:0;left:0;width:1px;visibility:hidden;height:${height}`;
  document.body.append(probe);
  const value = probe.getBoundingClientRect().height;
  probe.remove();
  return value;
}

const supports = (unit: string) => CSS.supports('height', `100${unit}`);

function apply(): void {
  const root = document.documentElement;
  const visible = window.innerHeight;
  const touch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  // The screen's own long or short side, depending on how the phone is held.
  const portrait = window.innerHeight >= window.innerWidth;
  const device = portrait
    ? Math.max(window.screen.width, window.screen.height)
    : Math.min(window.screen.width, window.screen.height);

  const large = Math.max(
    supports('lvh') ? measure('100lvh') : visible,
    visible,
    touch ? device : 0,
  );
  const small = Math.min(supports('svh') ? measure('100svh') : visible, visible, large);

  root.style.setProperty('--lv', `${(large / 100).toFixed(3)}px`);
  root.style.setProperty('--sv', `${(small / 100).toFixed(3)}px`);
}

/**
 * Sets the screen units, and keeps them steady. Call first, before anything
 * measures the page.
 */
export function initScreenUnits(): void {
  apply();

  let width = window.innerWidth;
  window.addEventListener('resize', () => {
    // A change of height alone is the address bar: ignore it.
    if (window.innerWidth === width) return;
    width = window.innerWidth;
    apply();
    ScrollTrigger.refresh();
  });

  // A safety net. Should the page change height for any other reason (a late
  // typeface, a picture without a known size), the scroll animations are
  // worked out again for the new height, once it has settled.
  const main = document.querySelector('main');
  if (!main) return;
  let height = main.offsetHeight;
  let timer: number | undefined;
  new ResizeObserver(() => {
    const next = main.offsetHeight;
    if (Math.abs(next - height) < 2) return;
    height = next;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
  }).observe(main);
}
