/**
 * Location scene: the film of the reservoirs from the air.
 *
 * The section is much taller than the screen and its stage sticks to the top
 * (plain CSS). This script maps "how far through the section" to "which film
 * frame", and brings the three texts in and out in turn.
 *
 * The scroll distance has three parts:
 *   one screen   the opening film dissolves away on top of this scene
 *   the hold     the camera flies down, and the three texts take turns
 *   one screen   this scene dissolves away, on top of the gateway
 */
import { find, findAll } from '../lib/dom';
import { startFilm } from '../lib/film';
import type { FrameSequence } from '../lib/frame-sequence';
import { gsap, ScrollTrigger, SplitText } from '../lib/motion';
import { HERO_LOADED } from './hero';

export function createLocation({ wide }: { wide: boolean }): () => void {
  const scene = find('#location');
  const stage = find('[data-location-stage]');
  const filmBox = find('[data-location-film]');
  const canvas = find<HTMLCanvasElement>('[data-location-canvas]');
  const heading = find('[data-location-heading]');
  const timeline = find('[data-location-timeline]');
  const chapters = findAll('[data-location-chapter]');
  const [intro, story, travel] = chapters;
  if (!scene || !stage || !filmBox || !canvas || !heading || !intro || !story || !travel) {
    return () => {};
  }
  const rows = findAll('[data-location-row]', travel);

  let film: FrameSequence | undefined;
  const playhead = { progress: 0 };

  // The frames are fetched once the opening film has finished loading, or as
  // soon as the visitor starts to scroll, whichever comes first. Not before:
  // while the opening plays, its own frames get the whole connection.
  const start = () => {
    if (film) return;
    film = startFilm('location', canvas, { wide });
    film?.show(playhead.progress);
  };
  const loader = ScrollTrigger.create({
    trigger: '#top',
    start: 'top -15%',
    once: true,
    onEnter: start,
  });
  window.addEventListener(HERO_LOADED, start, { once: true });

  const headingLines = SplitText.create(heading, { type: 'lines', mask: 'lines' });

  // The timeline is measured in screens, to match the three parts above:
  // 0 to 1 is the dissolve in, 1 to 1 + hold is the flight, and the last
  // screen is the dissolve out. `at(0.5)` is halfway through the flight.
  const screens = (scene.offsetHeight - stage.offsetHeight) / stage.offsetHeight;
  const hold = Math.max(1, screens - 2);
  const at = (part: number) => 1 + part * hold;
  const enter = { autoAlpha: 1, y: 0, duration: 0.1 * hold };
  const leave = { autoAlpha: 0, y: -36, duration: 0.07 * hold };

  gsap.set(chapters, { autoAlpha: 0, y: 44 });

  const flight = gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
    })
    // The camera is already moving as the opening film dissolves away.
    .to(
      playhead,
      {
        progress: 1,
        duration: at(0.96) - 0.45,
        ease: 'sine.inOut',
        onUpdate: () => film?.show(playhead.progress),
      },
      0.45,
    )
    .fromTo(filmBox, { scale: 1.08 }, { scale: 1, duration: at(0.3), ease: 'sine.out' }, 0);

  if (timeline) flight.to(timeline, { scaleX: 1, duration: at(0.96) - 0.45 }, 0.45);

  flight
    // 1. The heading.
    .to(intro, { ...enter, ease: 'power2.out' }, 0.82)
    .from(
      headingLines.lines,
      { yPercent: 110, duration: 0.12 * hold, stagger: 0.03 * hold, ease: 'power3.out' },
      0.82,
    )
    .to(intro, { ...leave, ease: 'power1.in' }, at(0.3))
    // 2. The story of the reservoirs.
    .to(story, { ...enter, ease: 'power2.out' }, at(0.39))
    .to(story, { ...leave, ease: 'power1.in' }, at(0.65))
    // 3. The travel times, one row after another, as the camera reaches the bank.
    .to(travel, { ...enter, ease: 'power2.out' }, at(0.74))
    .from(
      rows,
      { opacity: 0, x: -22, duration: 0.07 * hold, stagger: 0.035 * hold, ease: 'power2.out' },
      at(0.76),
    )
    // The words go before the picture does, so they never show over the
    // words of the scene underneath while the two pictures cross.
    .to(travel, { ...leave, ease: 'power1.in' }, screens - 1.3)
    .to(
      [timeline?.parentElement].filter(Boolean),
      { autoAlpha: 0, duration: 0.07 * hold },
      screens - 1.3,
    )
    // The dissolve out. The gateway is already in place underneath.
    .to(stage, { autoAlpha: 0, duration: 0.8, ease: 'power1.inOut' }, screens - 0.92)
    // Makes the timeline exactly as long as the scroll distance.
    .set({}, {}, screens);

  return () => {
    loader.kill();
    window.removeEventListener(HERO_LOADED, start);
    headingLines.revert();
    film?.destroy();
    gsap.set([stage, filmBox, ...chapters, ...rows, timeline].filter(Boolean), {
      clearProps: 'all',
    });
  };
}
