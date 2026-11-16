import type { ThemeName } from './themes';

/**
 * The sections of the homepage, in scroll order.
 *
 * A "scene" is one full-width section. Its `id` is the anchor used by links
 * (`#rooms`), and its `theme` sets the time of day and so the colors.
 * The order here must match the order of the components in `pages/index.astro`.
 */
interface Scene {
  id: string;
  theme: ThemeName;
  /** Short name, used as the small label above the section heading. */
  label: string;
}

export const scenes = [
  { id: 'top', theme: 'dawn', label: 'Niyara' },
  { id: 'location', theme: 'first-light', label: 'Where we are' },
  { id: 'arrival', theme: 'morning', label: 'Arriving' },
  { id: 'rooms', theme: 'morning', label: 'Rooms' },
  { id: 'pool', theme: 'noon', label: 'The pool' },
  { id: 'things-to-do', theme: 'afternoon', label: 'Things to do' },
  { id: 'dining', theme: 'dusk', label: 'Dining' },
  { id: 'photographs', theme: 'gallery', label: 'Photographs' },
  { id: 'book', theme: 'night', label: 'Book a stay' },
] as const satisfies readonly Scene[];

export type SceneId = (typeof scenes)[number]['id'];

export function getScene(id: SceneId) {
  const scene = scenes.find((candidate) => candidate.id === id);
  if (!scene) throw new Error(`Unknown scene "${id}". Add it to src/data/scenes.ts.`);
  return scene;
}

/** The link target for a scene, for example `#rooms`. */
export function sceneHref(id: SceneId): string {
  return `#${id}`;
}
