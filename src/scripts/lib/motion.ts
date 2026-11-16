/**
 * The one place that sets up the animation library (GSAP).
 * Import `gsap`, `ScrollTrigger` and `SplitText` from here, never from the
 * package directly, so the plugins are always registered first.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Media queries used by the scripts. The width matches the CSS breakpoint. */
export const queries = {
  fullMotion: '(prefers-reduced-motion: no-preference)',
  wide: '(min-width: 56.25em)',
  finePointer: '(hover: hover) and (pointer: fine)',
} as const;

export const matches = (query: string) => window.matchMedia(query).matches;

export { gsap, ScrollTrigger, SplitText };
