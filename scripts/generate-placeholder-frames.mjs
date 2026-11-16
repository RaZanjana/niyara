/**
 * Draws stand-in frames for the opening film.
 *
 * The real film will come from Higgsfield later. Until then the site needs
 * frames of the right number, size and weight, so that scroll smoothness and
 * loading speed can be tested honestly. This script draws a simple sketch of
 * the scene (reservoir, pavilion, reeds, rising light) for every frame.
 *
 * It never overwrites real frames: it only writes into a folder that is
 * empty, or that it filled itself (it leaves a small marker file behind).
 *
 * Run:  npm run placeholders
 * Force a fresh set:  npm run placeholders -- --force
 */
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = '.placeholder';
const force = process.argv.includes('--force');
const WORKERS = Math.max(2, Math.min(8, availableParallelism()));

const sequences = JSON.parse(
  await readFile(path.join(root, 'src/data/frame-sequences.json'), 'utf8'),
);

for (const [name, sequence] of Object.entries(sequences)) {
  for (const variant of ['desktop', 'mobile']) {
    await generate(`${name}/${variant}`, sequence[variant], sequence);
  }
}

/** Fills one folder with frames, unless it already holds a usable set. */
async function generate(label, variant, { digits, extension }) {
  const folder = path.join(root, 'public', variant.path);
  const signature = `${variant.count} frames, ${variant.width}x${variant.height}, sketch v1`;

  const existing = existsSync(folder) ? await readdir(folder) : [];
  const hasFrames = existing.some((file) => file.endsWith(`.${extension}`));
  const marker = existing.includes(MARKER)
    ? await readFile(path.join(folder, MARKER), 'utf8')
    : undefined;

  if (hasFrames && marker === undefined) {
    console.log(`${label}: real frames found, left untouched.`);
    return;
  }
  if (hasFrames && marker === signature && !force) {
    console.log(`${label}: stand-in frames already in place.`);
    return;
  }

  await rm(folder, { recursive: true, force: true });
  await mkdir(folder, { recursive: true });

  const grain = await makeGrain(variant.width, variant.height);
  let totalBytes = 0;

  const drawFrame = async (index) => {
    const progress = variant.count === 1 ? 0 : index / (variant.count - 1);
    const file = path.join(folder, `${String(index + 1).padStart(digits, '0')}.${extension}`);

    await sharp(Buffer.from(drawScene(variant.width, variant.height, progress)))
      .composite([{ input: grain, blend: 'soft-light' }])
      .webp({ quality: 72, effort: 4 })
      .toFile(file);

    totalBytes += (await stat(file)).size;
  };

  // Draw a few frames at a time, to make use of every processor core.
  const indexes = Array.from({ length: variant.count }, (_, index) => index);
  const worker = async () => {
    while (indexes.length > 0) await drawFrame(indexes.shift());
  };
  await Promise.all(Array.from({ length: WORKERS }, worker));

  await writeFile(path.join(folder, MARKER), signature);

  const totalKb = Math.round(totalBytes / 1024);
  const verdict = totalKb <= variant.budgetKb ? 'within' : 'OVER';
  console.log(
    `${label}: drew ${variant.count} frames, ${totalKb} KB in total ` +
      `(${Math.round(totalKb / variant.count)} KB each), ${verdict} the ${variant.budgetKb} KB budget.`,
  );
}

/**
 * Film grain. A flat drawing compresses to almost nothing, which would make
 * the stand-in frames far lighter than real film frames. Grain brings the
 * file weight close to what a real frame weighs.
 */
async function makeGrain(width, height) {
  const pixels = Buffer.alloc(width * height * 4);
  for (let offset = 0; offset < pixels.length; offset += 4) {
    const value = 128 + Math.round((Math.random() - 0.5) * 70);
    pixels[offset] = value;
    pixels[offset + 1] = value;
    pixels[offset + 2] = value;
    pixels[offset + 3] = 255;
  }
  return sharp(pixels, { raw: { width, height, channels: 4 } })
    .blur(0.6)
    .png()
    .toBuffer();
}

/** Blends two hex colors. `amount` 0 gives the first, 1 gives the second. */
function blend(from, to, amount) {
  const channel = (hex, start) => parseInt(hex.slice(start, start + 2), 16);
  const parts = [1, 3, 5].map((start) =>
    Math.round(channel(from, start) + (channel(to, start) - channel(from, start)) * amount),
  );
  return `rgb(${parts.join(',')})`;
}

/** Slow at both ends, faster in the middle, like a camera on a dolly. */
function ease(value) {
  return value * value * (3 - 2 * value);
}

/**
 * One frame of the sketch, as an SVG drawing.
 * `progress` runs from 0 (first frame, grey dawn) to 1 (last frame, first light).
 * The camera moves forward: the pavilion grows, the reeds slide out of view.
 */
function drawScene(width, height, progress) {
  const moved = ease(progress);
  const horizon = height * 0.56;
  const unit = Math.min(width, height * 1.4) / 100;

  // Light: the sky warms and a low sun lifts behind the tree line.
  const skyTop = blend('#aebbc2', '#c8d3d6', moved);
  const skyLow = blend('#c9d2d6', '#f1ddc4', moved);
  const waterNear = blend('#8e9da4', '#a9b6b6', moved);
  const sunX = width * 0.66;
  const sunY = horizon - unit * (1 + moved * 7);
  const sunGlow = 0.25 + moved * 0.5;

  // Camera push: things near the middle of the picture grow.
  const zoom = 1 + moved * 0.55;
  const pavilionWidth = unit * 30 * zoom;
  const pavilionX = width * 0.44 - pavilionWidth / 2;
  const wallHeight = unit * 2.4 * zoom;
  const roofHeight = unit * 3.2 * zoom;

  const trees = Array.from({ length: 16 }, (_, index) => {
    const x = (index / 15) * width * 1.2 - width * 0.1;
    const shifted = width / 2 + (x - width / 2) * (1 + moved * 0.18);
    const radius = unit * (5 + ((index * 7) % 5)) * (1 + moved * 0.18);
    return `<ellipse cx="${shifted.toFixed(1)}" cy="${(horizon - radius * 0.45).toFixed(1)}" rx="${(radius * 1.5).toFixed(1)}" ry="${radius.toFixed(1)}"/>`;
  }).join('');

  const ripples = Array.from({ length: 9 }, (_, index) => {
    const depth = (index + 1) / 10;
    const y = horizon + (height - horizon) * depth * depth;
    const drift = Math.sin(progress * Math.PI * 2 + index) * unit * 2;
    const length = width * (0.12 + depth * 0.3);
    const x = width * 0.44 - length / 2 + drift;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${length.toFixed(1)}" height="${(1 + depth * 2).toFixed(1)}" rx="1" opacity="${(0.1 + depth * 0.14).toFixed(2)}"/>`;
  }).join('');

  // Reeds stand close to the camera, so they move the most and leave the frame.
  const reeds = Array.from({ length: 22 }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const spread = (index % 11) / 11;
    const base =
      side < 0
        ? width * (0.02 + spread * 0.2) - moved * width * 0.34
        : width * (0.98 - spread * 0.2) + moved * width * 0.34;
    const tall = height * (0.34 + ((index * 13) % 9) / 30) * (1 + moved * 0.4);
    const lean = side * unit * (1.5 + (index % 4)) + Math.sin(progress * 6 + index) * unit * 0.7;
    return `<path d="M${base.toFixed(1)} ${height} Q${(base + lean * 0.4).toFixed(1)} ${(height - tall * 0.6).toFixed(1)} ${(base + lean).toFixed(1)} ${(height - tall).toFixed(1)}"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${skyTop}"/><stop offset="1" stop-color="${skyLow}"/>
    </linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${skyLow}"/><stop offset="1" stop-color="${waterNear}"/>
    </linearGradient>
    <radialGradient id="sun">
      <stop offset="0" stop-color="#fff3dc" stop-opacity="${sunGlow.toFixed(2)}"/>
      <stop offset="1" stop-color="#fff3dc" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e9ecea" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#e9ecea" stop-opacity="${(0.75 - moved * 0.35).toFixed(2)}"/>
      <stop offset="1" stop-color="#e9ecea" stop-opacity="0"/>
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="${(unit * 0.5).toFixed(1)}"/></filter>
    <filter id="softer"><feGaussianBlur stdDeviation="${(unit * 1.1).toFixed(1)}"/></filter>
  </defs>

  <rect width="${width}" height="${horizon}" fill="url(#sky)"/>
  <circle cx="${sunX}" cy="${sunY.toFixed(1)}" r="${(unit * 26).toFixed(1)}" fill="url(#sun)"/>
  <g fill="#55605a" opacity="0.55" filter="url(#soft)">${trees}</g>

  <rect y="${horizon}" width="${width}" height="${height - horizon}" fill="url(#water)"/>
  <ellipse cx="${sunX}" cy="${(horizon + unit * 9).toFixed(1)}" rx="${(unit * 5).toFixed(1)}" ry="${(unit * 16).toFixed(1)}" fill="#fff3dc" opacity="${(sunGlow * 0.5).toFixed(2)}" filter="url(#softer)"/>

  <g opacity="0.3" transform="translate(0 ${(2 * horizon).toFixed(1)}) scale(1 -1)" filter="url(#soft)">
    <rect x="${pavilionX.toFixed(1)}" y="${(horizon - wallHeight).toFixed(1)}" width="${pavilionWidth.toFixed(1)}" height="${wallHeight.toFixed(1)}" fill="#e9e2d4"/>
    <path d="M${(pavilionX - unit * zoom).toFixed(1)} ${(horizon - wallHeight).toFixed(1)} L${(pavilionX + pavilionWidth * 0.14).toFixed(1)} ${(horizon - wallHeight - roofHeight).toFixed(1)} H${(pavilionX + pavilionWidth * 0.86).toFixed(1)} L${(pavilionX + pavilionWidth + unit * zoom).toFixed(1)} ${(horizon - wallHeight).toFixed(1)} Z" fill="#6b4a3a"/>
  </g>
  <rect x="${pavilionX.toFixed(1)}" y="${(horizon - wallHeight).toFixed(1)}" width="${pavilionWidth.toFixed(1)}" height="${wallHeight.toFixed(1)}" fill="#e9e2d4"/>
  <g fill="#3a312b">${Array.from({ length: 7 }, (_, index) => `<rect x="${(pavilionX + (pavilionWidth / 7) * index + pavilionWidth / 28).toFixed(1)}" y="${(horizon - wallHeight * 0.82).toFixed(1)}" width="${(pavilionWidth / 14).toFixed(1)}" height="${(wallHeight * 0.82).toFixed(1)}"/>`).join('')}</g>
  <path d="M${(pavilionX - unit * zoom).toFixed(1)} ${(horizon - wallHeight).toFixed(1)} L${(pavilionX + pavilionWidth * 0.14).toFixed(1)} ${(horizon - wallHeight - roofHeight).toFixed(1)} H${(pavilionX + pavilionWidth * 0.86).toFixed(1)} L${(pavilionX + pavilionWidth + unit * zoom).toFixed(1)} ${(horizon - wallHeight).toFixed(1)} Z" fill="#6b4a3a"/>

  <rect y="${(horizon - unit * 9).toFixed(1)}" width="${width}" height="${(unit * 18).toFixed(1)}" fill="url(#mist)"/>
  <g fill="#f4f1ea">${ripples}</g>
  <g fill="none" stroke="#2f3b34" stroke-width="${(unit * 0.5).toFixed(1)}" stroke-linecap="round" opacity="0.85" filter="url(#soft)">${reeds}</g>
</svg>`;
}
