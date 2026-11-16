/**
 * Brings pictures and films downloaded from Higgsfield into the site.
 *
 * Give it the folder that holds the downloads. It recognises each file by
 * the Higgsfield job ID in its name (listed in scripts/media-sources.json),
 * then:
 * - saves each picture as `src/assets/images/<shot ID>.jpg`, at a size and
 *   quality suited to the web, and
 * - cuts each film into frames under `public/frames/`, in a wide set for
 *   desktop and an upright set for phones, as described in
 *   `src/data/frame-sequences.json`.
 *
 * Run:  node scripts/import-media.mjs "/path/to/downloads"
 * Needs the free tool ffmpeg for the films.
 */
import { execFileSync } from 'node:child_process';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const downloads = process.argv[2];
if (!downloads) {
  console.error('Usage: node scripts/import-media.mjs "/path/to/downloads"');
  process.exit(1);
}

/** The longest side a picture is saved at. Larger than any screen shows it. */
const PICTURE_MAX_SIDE = 2400;
const PICTURE_QUALITY = 84;
const FRAME_QUALITY = 72;

const sources = JSON.parse(await readFile(path.join(root, 'scripts/media-sources.json'), 'utf8'));
const sequencesPath = path.join(root, 'src/data/frame-sequences.json');
const sequences = JSON.parse(await readFile(sequencesPath, 'utf8'));
const files = await readdir(downloads);
const fileFor = (job) => files.find((name) => name.includes(job));

// Pictures
const imagesFolder = path.join(root, 'src/assets/images');
await mkdir(imagesFolder, { recursive: true });
for (const [shot, job] of Object.entries(sources.pictures)) {
  const file = fileFor(job);
  if (!file) {
    console.log(`${shot}: not in the folder, skipped.`);
    continue;
  }
  const target = path.join(imagesFolder, `${shot}.jpg`);
  await sharp(path.join(downloads, file))
    .resize({
      width: PICTURE_MAX_SIDE,
      height: PICTURE_MAX_SIDE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: PICTURE_QUALITY, mozjpeg: true })
    .toFile(target);
  console.log(`${shot}: saved, ${Math.round((await stat(target)).size / 1024)} KB.`);
}

// Films
for (const [name, film] of Object.entries(sources.films)) {
  const file = fileFor(film.job);
  if (!file) {
    console.log(`${name} film: not in the folder, skipped.`);
    continue;
  }
  const input = path.join(downloads, file);
  const seconds = filmSeconds(input) - film.startSeconds;

  for (const variant of ['desktop', 'mobile']) {
    const { path: publicPath, count, width, height, budgetKb } = sequences[name][variant];
    const folder = path.join(root, 'public', publicPath);
    await rm(folder, { recursive: true, force: true });
    await mkdir(folder, { recursive: true });

    // Cut the film to the shape of the frame around the chosen point, then
    // spread the wanted number of frames evenly over its length.
    const shape = width / height;
    const focus = variant === 'mobile' ? film.mobileFocusX : 0.5;
    const crop =
      `crop='min(iw,ih*${shape})':'min(ih,iw/${shape})':` +
      `'max(0,min(iw-out_w,iw*${focus}-out_w/2))':'(ih-out_h)/2'`;
    execFileSync(
      'ffmpeg',
      [
        '-loglevel',
        'error',
        '-y',
        '-ss',
        String(film.startSeconds),
        '-i',
        input,
        '-vf',
        `fps=${count}/${seconds},${crop},scale=${width}:${height}:flags=lanczos`,
        '-frames:v',
        String(count),
        '-c:v',
        'libwebp',
        '-quality',
        String(FRAME_QUALITY),
        path.join(folder, `%0${sequences[name].digits}d.${sequences[name].extension}`),
      ],
      { stdio: 'inherit' },
    );

    const made = (await readdir(folder)).filter((f) => f.endsWith(sequences[name].extension));
    let bytes = 0;
    for (const frame of made) bytes += (await stat(path.join(folder, frame))).size;
    const totalKb = Math.round(bytes / 1024);
    const verdict = totalKb <= budgetKb ? 'within' : 'OVER';
    console.log(
      `${name} film, ${variant}: ${made.length} frames, ${totalKb} KB in total, ${verdict} the ${budgetKb} KB budget.`,
    );
    // Keep the settings file true to what is on disk.
    sequences[name][variant].count = made.length;
  }
  sequences[name].standIn = false;
}
await writeFile(sequencesPath, JSON.stringify(sequences, null, 2) + '\n');

/** The length of a film in seconds. */
function filmSeconds(file) {
  const output = execFileSync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'csv=p=0',
    file,
  ]);
  return Number(String(output).trim());
}
