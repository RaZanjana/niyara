import { sceneHref, type SceneId } from './scenes';

/**
 * Every page the full website will have.
 *
 * Only the homepage is built so far. Until a page exists, links to it lead to
 * the part of the homepage that covers the same subject, so nothing is a dead
 * end. When a page is built, set `built: true` and every link to it updates.
 */
interface Page {
  path: string;
  built: boolean;
  /** The homepage section to show while the page does not exist. */
  fallback: SceneId;
}

export const pages = {
  rooms: { path: '/rooms/', built: false, fallback: 'rooms' },
  dining: { path: '/dining/', built: false, fallback: 'dining' },
  experiences: { path: '/things-to-do/', built: false, fallback: 'things-to-do' },
  wellness: { path: '/pool-and-spa/', built: false, fallback: 'pool' },
  photographs: { path: '/photographs/', built: false, fallback: 'photographs' },
  directions: { path: '/getting-here/', built: false, fallback: 'location' },
  offers: { path: '/offers/', built: false, fallback: 'book' },
  gifts: { path: '/gift-a-stay/', built: false, fallback: 'book' },
  celebrations: { path: '/celebrations/', built: false, fallback: 'book' },
  privacy: { path: '/privacy/', built: false, fallback: 'top' },
  terms: { path: '/terms/', built: false, fallback: 'top' },
  careers: { path: '/work-with-us/', built: false, fallback: 'top' },
  press: { path: '/press/', built: false, fallback: 'top' },
} as const satisfies Record<string, Page>;

export type PageName = keyof typeof pages;

/** The address to use in a link to a page. */
export function pageHref(name: PageName): string {
  const page = pages[name];
  return page.built ? page.path : sceneHref(page.fallback);
}
