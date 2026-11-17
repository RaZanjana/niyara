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
 * The longest side of an ambient copy, in pixels, and how much it is blurred
 * here, once, while the site is built. The blur is about a tenth of the
 * picture's width: enough that, stretched across the screen, it reads as a
 * wash of the picture's colors, never as a second, faint copy of it. The
 * browser does not blur it again, on any screen (see `.ambient` in base.css),
 * so it looks the same on a phone as on a desktop and costs a phone nothing.
 */
const AMBIENT_SIZE = 64;
const AMBIENT_BLUR = 6.5;

const cache = new Map<string, Promise<string>>();

/** The file of a photograph, found by its shot ID (for example `S10`). */
export function shotFile(id: string): string | undefined {
  const name = readdirSync(imagesFolder).find((file) => file.split('.')[0] === id);
  return name ? path.join(imagesFolder, name) : undefined;
}

/** The file behind a public address such as `/frames/hero/desktop/0001.webp`. */
export function publicFile(url: string): string {
  // Drop anything after `?`, such as a film's fingerprint.
  return path.join(root, 'public', url.split('?')[0] ?? url);
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
      .webp({ quality: 70 })
      .toBuffer()
      .then((buffer) => `data:image/webp;base64,${buffer.toString('base64')}`);
    cache.set(file, uri);
  }
  return uri;
}
