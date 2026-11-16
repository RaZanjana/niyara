import { sceneHref, type SceneId } from './scenes';

interface NavLink {
  label: string;
  href: string;
}

const link = (label: string, scene: SceneId): NavLink => ({ label, href: sceneHref(scene) });

/** Links in the top bar on wide screens. */
export const primaryNav: NavLink[] = [
  link('Rooms', 'rooms'),
  link('Dining', 'dining'),
  link('Things to do', 'things-to-do'),
  link('Photographs', 'photographs'),
  link('Getting here', 'location'),
];

/** Links in the full-screen menu on small screens. */
export const menuNav: NavLink[] = [
  link('Rooms', 'rooms'),
  link('Dining', 'dining'),
  link('Things to do', 'things-to-do'),
  link('The pool', 'pool'),
  link('Photographs', 'photographs'),
  link('Getting here', 'location'),
];

export const bookHref = sceneHref('book');
