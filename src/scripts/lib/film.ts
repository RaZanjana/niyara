/**
 * Film: starts one of the site's scroll-controlled films on a canvas.
 *
 * The films are listed in `src/data/frame-sequences.json`. Each has a wide
 * set of frames for desktop screens and a smaller, upright set for phones.
 */
import sequences from '@/data/frame-sequences.json';
import { FrameSequence } from './frame-sequence';
import { frameUrl } from './frames';
import { prefersLessData } from './loading-order';

export type FilmName = keyof typeof sequences;

/**
 * Starts downloading a film and returns its player.
 * Returns nothing for visitors who are saving data: they keep the still picture.
 */
export function startFilm(
  name: FilmName,
  canvas: HTMLCanvasElement,
  {
    wide,
    lead,
    onProgress,
  }: { wide: boolean; lead?: number; onProgress?: (fraction: number) => void },
): FrameSequence | undefined {
  if (prefersLessData()) return undefined;

  const { digits, extension, version } = sequences[name];
  const frames = wide ? sequences[name].desktop : sequences[name].mobile;
  const film = new FrameSequence(canvas, {
    count: frames.count,
    width: frames.width,
    height: frames.height,
    urlFor: (index) => frameUrl(frames.path, index, digits, extension, version),
    lead,
    onProgress,
  });
  void film.load();
  return film;
}
