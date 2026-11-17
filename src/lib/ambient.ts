/**
 * Ambient pictures: tiny, blurred copies of the site's pictures and film
 * frames, made while the site is built.
 *
 * A section lays one behind its picture as a soft glow (the `.ambient` style
 * in styles/base.css). Each copy is only a few hundred bytes, so it is written
 * straight into the page and costs no extra download.
 *
 * This file runs at build time only. It must never be imported by a script
 * that is sent to the browser.
 */
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const imagesFolder = path.join(root, 'src/assets/images');

/**
 * The longest side of an ambient copy, in pixels, and how much it is
 * blurred here, once, while the site is built. Blurred enough, a small copy
 * stretched across the screen looks like a soft glow by itself, so phones do
 * not have to blur it again on every frame (see `.ambient` in base.css).
 */
const AMBIENT_SIZE = 96;
const AMBIENT_BLUR = 4.5;

const cache = new Map<string, Promise<string>>();

/** The file of a photograph, found by its shot ID (for example `S10`). */
export function shotFile(id: string): string | undefined {
  const name = readdirSync(imagesFolder).find((file) => file.split('.')[0] === id);
  return name ? path.join(imagesFolder, name) : undefined;
}

/** The file behind a public address such as `/frames/hero/desktop/0001.webp`. */
export function publicFile(url: string): string {
  return path.join(root, 'public', url);
}

/** A tiny blurred copy of a picture, as a data URI. Empty if the file is missing. */
export function ambientUri(file: string | undefined): Promise<string> {
  if (!file || !existsSync(file)) return Promise.resolve('');
  let uri = cache.get(file);
  if (!uri) {
    uri = sharp(file)
      .resize(AMBIENT_SIZE, AMBIENT_SIZE, { fit: 'inside' })
      .blur(AMBIENT_BLUR)
      .modulate({ saturation: 1.15 })
      .webp({ quality: 58 })
      .toBuffer()
      .then((buffer) => `data:image/webp;base64,${buffer.toString('base64')}`);
    cache.set(file, uri);
  }
  return uri;
}
