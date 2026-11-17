/**
 * Stamps each film in src/data/frame-sequences.json with a `version`: a short
 * fingerprint of its frame files.
 *
 * The site adds it to every frame's address (`0001.webp?v=…`). That lets the
 * frames be cached by browsers for a year (see vercel.json), and still be
 * fetched afresh the moment a film is replaced, because its fingerprint, and
 * so its addresses, change with it.
 *
 * It runs by itself before `npm run dev` and `npm run build`, so the
 * fingerprint always matches the files. It only writes when something changed.
 *
 * Run:  npm run stamp
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sequencesPath = path.join(root, 'src/data/frame-sequences.json');
const sequences = JSON.parse(await readFile(sequencesPath, 'utf8'));

let changed = false;
for (const [name, film] of Object.entries(sequences)) {
  const hash = createHash('sha1');
  for (const variant of ['desktop', 'mobile']) {
    const folder = path.join(root, 'public', film[variant].path);
    if (!existsSync(folder)) continue;
    const files = (await readdir(folder))
      .filter((file) => file.endsWith(`.${film.extension}`))
      .sort();
    for (const file of files) {
      hash.update(file);
      hash.update(await readFile(path.join(folder, file)));
    }
  }
  const version = hash.digest('hex').slice(0, 10);
  if (film.version !== version) {
    film.version = version;
    changed = true;
    console.log(`${name} film: frames stamped ${version}.`);
  }
}
if (changed) await writeFile(sequencesPath, JSON.stringify(sequences, null, 2) + '\n');
else console.log('Film frames: stamps up to date.');
