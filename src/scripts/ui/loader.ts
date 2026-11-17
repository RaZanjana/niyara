/**
 * Loader: the opening title card (components/layout/PageLoader.astro).
 *
 * It stays until the page is ready to play its opening smoothly: the
 * typeface, the first picture, and the frames of the opening film. Other
 * scripts can ask it to wait for their own work with `trackLoading()`.
 *
 * Then it plays its exit: the water line spreads to the edges of the screen
 * and the dark parts along it, above and below. `loaderDone` resolves as
 * the parting begins, which is the hero's cue to begin its own opening.
 *
 * - The count always runs forward, and smoothly, never in jumps.
 * - It is shown for a moment at least, so it reads as a title, not a flash:
 *   less on a second visit in the same session, when everything is cached.
 * - It never waits more than a few seconds. On a slow connection the page
 *   opens anyway, and the film carries on loading behind it.
 * - With reduced motion it simply fades.
 */
import { find, findAll } from '../lib/dom';
import { gsap, matches, queries } from '../lib/motion';
import type { ScrollLock } from '../lib/smooth-scroll';

/** The shortest time the card is on screen, in milliseconds. */
const MIN_SHOW = 1900;
/** The same, on a second visit in the same session. */
const MIN_SHOW_AGAIN = 800;
/** The longest the page waits for anything, in milliseconds. */
const MAX_WAIT = 9000;
/**
 * How the shown count follows what has loaded, measured in time rather than
 * in frames, so it runs at the same pace on any screen, and catches up at
 * once in a tab that was in the background:
 * it closes this share of the gap each second (as a rate), and never moves
 * slower than `MIN_PACE` of the whole count per second.
 */
const CATCH_UP = 3.6;
const MIN_PACE = 0.3;

const VISITED = 'niyara:visited';

interface Task {
  weight: number;
  progress: number;
}

const tasks: Task[] = [];
let resolveDone: () => void = () => {};

/** Resolves when the loader starts to part, or at once if there is none. */
export const loaderDone = new Promise<void>((resolve) => (resolveDone = resolve));

/**
 * Asks the loader to wait for some work. `weight` is how much of the count
 * it is worth. Call the returned function with how far along it is, from 0
 * to 1.
 */
export function trackLoading(weight: number): (fraction: number) => void {
  const task: Task = { weight, progress: 0 };
  tasks.push(task);
  return (fraction) => {
    task.progress = Math.max(task.progress, Math.min(1, fraction));
  };
}

const visitedBefore = () => {
  try {
    return sessionStorage.getItem(VISITED) === '1';
  } catch {
    return false;
  }
};

export function initLoader(scroll: ScrollLock): void {
  const root = document.documentElement;
  const loader = find('[data-loader]');
  if (!loader) {
    resolveDone();
    return;
  }

  const letters = findAll('[data-loader-letter]', loader);
  const echoes = findAll('[data-loader-echo]', loader);
  const fades = findAll('[data-loader-fade]', loader);
  const halves = findAll('[data-loader-half]', loader);
  const line = find('[data-loader-line]', loader);
  const count = find('[data-loader-count]', loader);
  const status = find('[data-loader-status]', loader);
  const fullMotion = matches(queries.fullMotion);

  // From here on the card is in this script's hands (see PageLoader.astro).
  gsap.set([...letters, ...echoes, ...fades], { opacity: 0 });
  root.dataset.loader = '';

  // Nothing behind the card can be reached or scrolled while it is up.
  const behind = ['.header', 'main', 'footer']
    .map((selector) => find(selector))
    .filter((element): element is HTMLElement => element !== null);
  behind.forEach((element) => (element.inert = true));
  scroll.lock();
  window.scrollTo(0, 0);

  // What the page waits for itself. The opening film adds its own frames.
  const fontsTask = trackLoading(1);
  void document.fonts.ready.then(() => fontsTask(1));
  const posterTask = trackLoading(1);
  const poster = find<HTMLImageElement>('[data-hero-poster]');
  void (poster?.decode() ?? Promise.resolve()).catch(() => undefined).then(() => posterTask(1));

  // ---- The card comes in ----
  // The letters wait for the typeface, so they never change shape mid-way.
  const started = performance.now();
  const minShow = visitedBefore() ? MIN_SHOW_AGAIN : MIN_SHOW;
  void Promise.race([document.fonts.ready, wait(1000)]).then(() => {
    if (!fullMotion) {
      gsap.set([...letters, ...echoes, ...fades], { opacity: 1 });
      return;
    }
    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(
        letters,
        { opacity: 0, yPercent: 42 },
        { opacity: 1, yPercent: 0, duration: 1.4, stagger: 0.09 },
      )
      .fromTo(
        echoes,
        { opacity: 0, yPercent: 42 },
        { opacity: 1, yPercent: 0, duration: 1.4, stagger: 0.09 },
        0.12,
      )
      .to(fades, { opacity: 1, duration: 1.2, stagger: 0.12 }, 0.5);
  });

  // ---- The count and the water line follow what has loaded ----
  /** The share of the screen the line reaches at 100: the width of the name. */
  const reach = () => {
    const name = find('[data-loader-name]', loader);
    return name ? Math.min(1, name.getBoundingClientRect().width / window.innerWidth) : 0.5;
  };
  let lineReach = reach();
  const onResize = () => (lineReach = reach());
  window.addEventListener('resize', onResize);

  let shown = 0;
  let finished = false;
  let lastTick = performance.now();

  const tick = () => {
    const now = performance.now();
    const seconds = Math.min(0.25, (now - lastTick) / 1000);
    lastTick = now;
    const elapsed = now - started;
    const total = tasks.reduce((sum, task) => sum + task.weight, 0);
    const loaded = tasks.reduce((sum, task) => sum + task.weight * task.progress, 0);
    const timedOut = elapsed > MAX_WAIT;
    const target = timedOut || total === 0 ? 1 : loaded / total;

    // Catch up smoothly, faster when far behind, and never go back.
    const step = Math.max(
      MIN_PACE * seconds,
      (target - shown) * (1 - Math.exp(-CATCH_UP * seconds)),
    );
    shown = Math.min(target, shown + step);
    if (count) count.textContent = String(Math.round(shown * 100)).padStart(3, '0');
    if (line) gsap.set(line, { scaleX: shown * lineReach });

    if (!finished && shown >= 0.995 && elapsed >= minShow) {
      finished = true;
      gsap.ticker.remove(tick);
      leave();
    }
  };
  gsap.ticker.add(tick);

  // ---- The exit: the water line spreads, and the dark parts along it ----
  function leave() {
    if (status) status.textContent = '';
    const done = () => {
      window.removeEventListener('resize', onResize);
      loader?.remove();
      behind.forEach((element) => (element.inert = false));
      scroll.unlock();
      try {
        sessionStorage.setItem(VISITED, '1');
      } catch {
        // Storage may be switched off. The next visit simply shows the full card.
      }
    };

    if (!fullMotion) {
      resolveDone();
      gsap.to(loader, { opacity: 0, duration: 0.5, ease: 'power1.out', onComplete: done });
      return;
    }

    gsap
      .timeline({ onComplete: done })
      // The line warms to the color of the lamps, and the words go.
      .to(line, { '--line-color': '#e0a458', opacity: 1, duration: 0.5, ease: 'power1.out' }, 0)
      .to(count, { opacity: 0, duration: 0.3 }, 0)
      .to(fades, { opacity: 0, y: -8, duration: 0.45, ease: 'power2.in', stagger: 0.04 }, 0)
      // The letters sink into the water, and their reflections with them.
      .to(
        letters,
        {
          opacity: 0,
          yPercent: 60,
          duration: 0.7,
          ease: 'power2.in',
          stagger: { each: 0.045, from: 'center' },
        },
        0.08,
      )
      .to(
        echoes,
        {
          opacity: 0,
          yPercent: 60,
          duration: 0.7,
          ease: 'power2.in',
          stagger: { each: 0.045, from: 'center' },
        },
        0.08,
      )
      .to(line, { scaleX: 1, duration: 0.8, ease: 'expo.inOut' }, 0.35)
      // The dark parts along the line, and the film is there behind it.
      .add(resolveDone, 0.95)
      .to(
        halves,
        {
          yPercent: (index: number) => (index === 0 ? -100 : 100),
          duration: 1.35,
          ease: 'expo.inOut',
        },
        0.95,
      )
      .to(line, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 1.1);
  }
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}
