/**
 * Hero scene: the opening film.
 *
 * Three things happen here.
 * 1. The opening. The title card (ui/loader.ts) covers the page while this
 *    film's frames load, and counts them. As it parts, the camera begins to
 *    glide forward by itself and the name rises letter by letter, followed
 *    by the other lines. Because the frames are already there, nothing
 *    starts and then has to stop.
 * 2. The scroll. The section is taller than the screen and its stage sticks
 *    to the top (plain CSS). Scrolling plays the rest of the film, pushes the
 *    camera in a little and lifts the words away.
 * 3. The dissolve. Over the last screen of scrolling the stage fades out. The
 *    next scene has already slid in underneath it (see Location.astro), so
 *    one film dissolves into the other.
 *
 * Everything that moves here moves by opacity and transform only, which the
 * browser can animate without redrawing the page.
 */
import { find, findAll } from '../lib/dom';
import { startFilm } from '../lib/film';
import { gsap, SplitText } from '../lib/motion';
import { loaderDone, trackLoading } from '../ui/loader';

/** How far into the film the camera glides by itself when the page opens. */
const OPENING_DRIFT = 0.16;

/** The frames fetched first, in order: enough for the opening glide and a little more. */
const LEAD_FRAMES = 16;

/** The longest the opening waits for the typeface and the first frames, in milliseconds. */
const MAX_WAIT = 1800;

/** Sent on the window once the opening film's frames have all arrived. */
export const HERO_LOADED = 'niyara:hero-loaded';

/** The opening plays once, even if the scenes are set up again after a resize. */
let openingPlayed = false;

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

export function createHero({ wide }: { wide: boolean }): () => void {
  const root = document.documentElement;
  const scene = find('#top');
  const stage = find('[data-hero-stage]');
  const filmBox = find('[data-hero-film]');
  const content = find('[data-hero-content]');
  const title = find('[data-hero-title]');
  const canvas = find<HTMLCanvasElement>('[data-hero-canvas]');
  if (!scene || !stage || !filmBox || !content || !title || !canvas) return () => {};

  const lines = findAll('[data-hero-line]', content);
  const cue = find('[data-hero-cue]');
  const extras = [cue].filter((element): element is HTMLElement => element !== null);

  // On a data-saving connection this is empty, and the first frame stays.
  // The title card waits for its frames, and shows how far they have come.
  const film = startFilm('hero', canvas, {
    wide,
    lead: LEAD_FRAMES,
    onProgress: trackLoading(4),
  });
  // The next film waits for this one, so the two do not compete for the
  // connection while the opening plays (see scenes/location.ts).
  void (film?.done ?? Promise.resolve()).then(() => window.dispatchEvent(new Event(HERO_LOADED)));

  // Two things move the film: the glide of the opening, and the scroll. The
  // scroll plays whatever part of the film the glide has left.
  const playhead = { drift: 0, scroll: 0 };
  const showFrame = () => film?.show(playhead.drift + playhead.scroll * (1 - playhead.drift));

  // ---- 1. The opening ----
  // From here on the words are in this script's hands (see
  // the styles in Hero.astro).
  root.dataset.heroIntro = '';
  let letters: SplitText | undefined;
  let cancelled = false;
  const opening = gsap.timeline({ paused: true });

  const skipOpening = openingPlayed || window.scrollY > 8;
  openingPlayed = true;

  if (skipOpening) {
    playhead.drift = OPENING_DRIFT;
    showFrame();
  } else {
    gsap.set([title, ...lines, cue], { opacity: 0 });

    // Begins as the title card parts. By then the frames are normally all
    // here; the wait below only matters if the card gave up waiting for them.
    const firstFrames = film?.ready(LEAD_FRAMES - 1) ?? Promise.resolve();
    const ready = loaderDone.then(() =>
      Promise.race([Promise.all([document.fonts.ready, firstFrames]), wait(MAX_WAIT)]),
    );
    void ready.then(() => {
      if (cancelled) return;
      // Split only now, with the real typeface in place, so the letters
      // never jump when it arrives.
      letters = SplitText.create(title, { type: 'chars' });
      gsap.set(title, { opacity: 1 });
      opening
        .to(
          playhead,
          { drift: OPENING_DRIFT, duration: 6.5, ease: 'power1.out', onUpdate: showFrame },
          0,
        )
        .fromTo(
          letters.chars,
          { opacity: 0, yPercent: 32 },
          { opacity: 1, yPercent: 0, duration: 1.9, stagger: 0.085, ease: 'expo.out' },
          0.35,
        )
        .fromTo(
          lines,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 1.4, stagger: 0.14, ease: 'power3.out' },
          0.95,
        )
        .to(cue, { opacity: 1, duration: 1.2 }, 2.2)
        .play();
    });
  }

  // ---- 2. The scroll ----
  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
    })
    .to(playhead, { scroll: 1, duration: 1, onUpdate: showFrame }, 0)
    .to(filmBox, { scale: 1.1, duration: 1 }, 0)
    .to(content, { autoAlpha: 0, y: -90, duration: 0.2 }, 0.02)
    .to(
      extras.filter((element) => element === cue),
      { autoAlpha: 0, duration: 0.06 },
      0,
    );

  // ---- 3. The dissolve ----
  // It begins one screen before the end of the section, which is the moment
  // the next scene has come to rest underneath.
  gsap.to(stage, {
    autoAlpha: 0,
    ease: 'power1.inOut',
    scrollTrigger: { trigger: scene, start: 'bottom 200%', end: 'bottom 112%', scrub: true },
  });

  return () => {
    cancelled = true;
    opening.kill();
    letters?.revert();
    film?.destroy();
    gsap.set([stage, filmBox, content, title, ...lines, ...extras], { clearProps: 'all' });
    // Whatever happens next, the opening has been seen: skip it from now on.
    playhead.drift = OPENING_DRIFT;
    delete root.dataset.heroIntro;
  };
}
