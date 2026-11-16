/**
 * FrameSequence: plays a film as a series of still frames on a <canvas>.
 *
 * Why frames and not a <video>: a video cannot be moved smoothly back and
 * forth by scrolling on every phone. Drawing still frames can.
 *
 * Usage:
 *   const film = new FrameSequence(canvas, { count, width, height, urlFor });
 *   film.load();          // start downloading the frames
 *   film.show(0.5);       // draw the frame halfway through
 *   film.destroy();       // stop and clean up
 */
import { coverRect, frameIndexAt, nearestLoadedFrame } from './frames';

interface FrameSequenceOptions {
  /** How many frames the film has. */
  count: number;
  /** Size of one frame in pixels. */
  width: number;
  height: number;
  /** The address of frame number `index`, counting from 0. */
  urlFor: (index: number) => string;
}

/** How many frames to download at the same time. */
const PARALLEL_DOWNLOADS = 6;

/** Drawing sharper than this costs speed and memory for no visible gain. */
const MAX_PIXEL_RATIO = 1.5;

export class FrameSequence {
  private readonly context: CanvasRenderingContext2D | null;
  private readonly frames: (HTMLImageElement | undefined)[];
  private readonly loaded: boolean[];
  private readonly resizeObserver: ResizeObserver;
  private wantedFrame = 0;
  private drawnFrame = -1;
  private destroyed = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly options: FrameSequenceOptions,
  ) {
    this.context = canvas.getContext('2d');
    this.frames = new Array(options.count).fill(undefined);
    this.loaded = new Array(options.count).fill(false);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
  }

  /** Downloads every frame, a few at a time. */
  async load(): Promise<void> {
    const queue = downloadOrder(this.options.count);
    const worker = async () => {
      while (queue.length > 0 && !this.destroyed) {
        const index = queue.shift();
        if (index !== undefined) await this.loadFrame(index);
      }
    };
    await Promise.all(Array.from({ length: PARALLEL_DOWNLOADS }, worker));
  }

  /** Draws the frame for a progress from 0 (first frame) to 1 (last frame). */
  show(progress: number): void {
    this.wantedFrame = frameIndexAt(progress, this.options.count);
    this.draw();
  }

  destroy(): void {
    this.destroyed = true;
    this.resizeObserver.disconnect();
    this.frames.fill(undefined);
    this.canvas.removeAttribute('data-ready');
  }

  private async loadFrame(index: number): Promise<void> {
    const image = new Image();
    image.decoding = 'async';
    image.src = this.options.urlFor(index);
    try {
      await image.decode();
    } catch {
      // A missing or broken frame is skipped. A neighbouring frame is shown instead.
      return;
    }
    if (this.destroyed) return;
    this.frames[index] = image;
    this.loaded[index] = true;
    this.draw();
  }

  /** Matches the canvas to its size on screen, then redraws. */
  private resize(): void {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const width = Math.round(this.canvas.clientWidth * ratio);
    const height = Math.round(this.canvas.clientHeight * ratio);
    if (width === 0 || height === 0) return;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.drawnFrame = -1;
    }
    this.draw();
  }

  private draw(): void {
    if (!this.context || this.canvas.width === 0) return;
    const index = nearestLoadedFrame(this.loaded, this.wantedFrame);
    const image = this.frames[index];
    if (!image || index === this.drawnFrame) return;

    const target = { width: this.canvas.width, height: this.canvas.height };
    const rect = coverRect(this.options, target);
    this.context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
    this.drawnFrame = index;
    this.canvas.setAttribute('data-ready', '');
  }
}

/**
 * The order to download frames in: a coarse pass first (every 16th frame),
 * then finer and finer. This way the whole film can be scrubbed roughly
 * within a second or two, and it sharpens as the rest arrives.
 */
export function downloadOrder(count: number): number[] {
  const order: number[] = [];
  const seen = new Set<number>();
  for (let step = 16; step >= 1; step /= 2) {
    for (let index = 0; index < count; index += step) {
      if (!seen.has(index)) {
        seen.add(index);
        order.push(index);
      }
    }
  }
  return order;
}
