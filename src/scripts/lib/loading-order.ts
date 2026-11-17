/**
 * Loading order: what the page downloads, and when, so that each part is
 * ready before the visitor reaches it, and nothing competes with what is
 * needed first.
 *
 *   1. The opening film, while the title card is up (scenes/hero.ts).
 *   2. The film of the reservoirs, once the opening film is in, or as soon
 *      as the visitor starts to scroll (scenes/location.ts).
 *   3. Then, a few at a time, every picture further down the page, in page
 *      order, and the restaurant's film (scenes/dining.ts). Pictures are
 *      marked to load lazily, which would only fetch them as the visitor
 *      nears them, so they would arrive late and appear in front of them.
 *
 * Visitors who have asked their browser to save data skip step 3: their
 * pictures still load, as each one comes near.
 */
import { findAll } from './dom';

/** Sent on the window once the opening film's frames have all arrived. */
export const HERO_LOADED = 'niyara:hero-loaded';
/** Sent on the window once the reservoirs film's frames have all arrived. */
export const LOCATION_LOADED = 'niyara:location-loaded';

/** How many pictures are fetched at the same time in step 3. */
const PARALLEL_PICTURES = 3;
/** If step 2 never ends (no films, or a slow connection), step 3 starts anyway after this long. */
const FALLBACK_DELAY = 9000;

/** True when the visitor has asked their browser to save mobile data. */
export function prefersLessData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}

/** Starts step 3 when step 2 is done, or after a while at the latest. */
export function initLoadingOrder(): void {
  if (prefersLessData()) return;
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    void warmPictures();
  };
  window.addEventListener(LOCATION_LOADED, start, { once: true });
  window.setTimeout(start, FALLBACK_DELAY);
}

/**
 * Fetches every lazy picture on the page, in page order, a few at a time.
 * Switching a picture to `eager` makes the browser fetch the version it
 * would have chosen anyway, in the same size and format.
 */
async function warmPictures(): Promise<void> {
  const queue = findAll<HTMLImageElement>('img[loading="lazy"]');
  const worker = async () => {
    for (let image = queue.shift(); image; image = queue.shift()) {
      if (image.complete) continue;
      image.loading = 'eager';
      await new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      });
    }
  };
  await Promise.all(Array.from({ length: PARALLEL_PICTURES }, worker));
}
