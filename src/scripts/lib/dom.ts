/** Short, typed helpers for finding elements. */

type Root = Document | Element;

/** The first element matching a selector, or null. */
export function find<T extends Element = HTMLElement>(selector: string, root: Root = document) {
  return root.querySelector<T>(selector);
}

/** Every element matching a selector, as a real array. */
export function findAll<T extends Element = HTMLElement>(selector: string, root: Root = document) {
  return Array.from(root.querySelectorAll<T>(selector));
}
