/**
 * Arithmetic for film frames played by scrolling.
 * Kept free of browser code so it can be unit tested.
 */

interface Size {
  width: number;
  height: number;
}

interface Rect extends Size {
  x: number;
  y: number;
}

/**
 * The address of one frame. Frames are numbered from 1, for example `0001.webp`.
 * `version` is the film's fingerprint (see scripts/stamp-frames.mjs). It is
 * added to the address so that browsers can keep the frame for a long time,
 * and still fetch it afresh when the film is replaced.
 */
export function frameUrl(
  basePath: string,
  index: number,
  digits: number,
  extension: string,
  version?: string,
) {
  const file = `${basePath}/${String(index + 1).padStart(digits, '0')}.${extension}`;
  return version ? `${file}?v=${version}` : file;
}

/** Which frame (counting from 0) to show for a scroll progress from 0 to 1. */
export function frameIndexAt(progress: number, count: number): number {
  if (count <= 0) return 0;
  const clamped = Math.min(1, Math.max(0, progress));
  return Math.min(count - 1, Math.round(clamped * (count - 1)));
}

/**
 * The loaded frame closest to the one we want.
 * While frames are still downloading this lets us show a near frame and not
 * a blank screen. Returns -1 when nothing has loaded yet.
 */
export function nearestLoadedFrame(loaded: readonly boolean[], target: number): number {
  for (let distance = 0; distance < loaded.length; distance += 1) {
    if (loaded[target - distance]) return target - distance;
    if (loaded[target + distance]) return target + distance;
  }
  return -1;
}

/**
 * Where to draw a picture so it covers a box completely, keeping its shape.
 * Works like CSS `object-fit: cover` with the picture centred.
 */
export function coverRect(source: Size, target: Size): Rect {
  const scale = Math.max(target.width / source.width, target.height / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  return { x: (target.width - width) / 2, y: (target.height - height) / 2, width, height };
}
