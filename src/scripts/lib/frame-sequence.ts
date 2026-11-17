/**
 * FrameSequence: plays a film as a series of still frames on a <canvas>.
 *
 * Why frames and not a <video>: a video cannot be moved smoothly back and
 * forth by scrolling on every phone. Drawing still frames can.
 *
 * Usage:
 *   const film = new FrameSequence(canvas, { count, width, height, urlFor });
 *   film.load();          // start downloading the frames
 *   await film.ready(20); // wait until frames 0 to 20 have arrived
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
  /**
   * How many frames at the start of the film to download first, in order,
   * before the spread-out pass. For a film that moves by itself as soon as
   * it appears, so that its first moments play without a jump.
   */
  lead?: number;
  /** Called as frames arrive, with the share of the film tried so far, from 0 to 1. */
  onProgress?: (fraction: number) => void;
}

/**
 * How many frames to download at the same time. Frames are small, and the
 * site is served over HTTP/2, so more at once mostly saves waiting on the
 * connection's round trips.
 */
const PARALLEL_DOWNLOADS = 8;

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
  /** How many frames have been tried, whether they arrived or not. */
  private tried = 0;
  /** Promises waiting for a run of frames, see `ready()`. */
  private waiters: { upTo: number; resolve: () => void }[] = [];
  /** Resolves when every frame has been tried. */
  readonly done: Promise<void>;
  private finish: () => void = () => {};

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly options: FrameSequenceOptions,
  ) {
    this.context = canvas.getContext('2d');
    this.frames = new Array(options.count).fill(undefined);
    this.loaded = new Array(options.count).fill(false);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.done = new Promise((resolve) => (this.finish = resolve));
  }

  /** Downloads every frame, a few at a time. */
  async load(): Promise<void> {
    const queue = downloadOrder(this.options.count, this.options.lead);
    const worker = async () => {
      while (queue.length > 0 && !this.destroyed) {
        const index = queue.shift();
        if (index !== undefined) await this.loadFrame(index);
      }
    };
    await Promise.all(Array.from({ length: PARALLEL_DOWNLOADS }, worker));
    // Anyone still waiting gets an answer: what could be loaded, has been.
    this.waiters.forEach((waiter) => waiter.resolve());
    this.waiters = [];
    this.finish();
  }

  /** Resolves once frames 0 to `upTo` have all arrived (or failed to). */
  ready(upTo: number): Promise<void> {
    const last = Math.min(upTo, this.options.count - 1);
    if (this.hasRun(last)) return Promise.resolve();
    return new Promise((resolve) => this.waiters.push({ upTo: last, resolve }));
  }

  private report(): void {
    this.tried += 1;
    if (!this.destroyed) this.options.onProgress?.(this.tried / this.options.count);
  }

  private hasRun(upTo: number): boolean {
    for (let index = 0; index <= upTo; index += 1) if (!this.loaded[index]) return false;
    return true;
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
      this.report();
      return;
    }
    this.report();
    if (this.destroyed) return;
    this.frames[index] = image;
    this.loaded[index] = true;
    this.draw();
    this.waiters = this.waiters.filter((waiter) => {
      if (!this.hasRun(waiter.upTo)) return true;
      waiter.resolve();
      return false;
    });
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
 * The order to download frames in: first the `lead` frames at the start, one
 * after another, then a coarse pass (every 16th frame), then finer and finer.
 * This way the opening plays smoothly at once, the whole film can be scrubbed
 * roughly within a second or two, and it sharpens as the rest arrives.
 */
export function downloadOrder(count: number, lead = 0): number[] {
  const order: number[] = [];
  const seen = new Set<number>();
  for (let index = 0; index < Math.min(lead, count); index += 1) {
    seen.add(index);
    order.push(index);
  }
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
