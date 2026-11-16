/**
 * Every photograph on the homepage.
 *
 * Each entry matches a shot in the "Niyara Property Bible and Shot List".
 * To add the real picture, save it as `src/assets/images/<ID>.jpg`
 * (for example `S04.jpg`). The `Media` component finds it by its ID.
 * Until the file exists, the page shows a flat stand-in block in `tone`.
 */
interface Shot {
  /** What the picture is, in a few words. Shown on the stand-in block. */
  name: string;
  /** Description for people who cannot see the picture. */
  alt: string;
  /** Color of the stand-in block. */
  tone: string;
  /** Which part of the picture to keep when it is cropped (CSS object-position). */
  focus?: string;
}

export const shots = {
  S03: {
    name: 'Through the gateway',
    alt: 'A brick gateway opening onto a courtyard with a long channel of still water and tall trees beyond.',
    tone: '#dce1e2',
  },
  S04: {
    name: 'Tank Pavilion, from the bed',
    alt: 'A bed facing open timber doors, with a verandah and the misty reservoir beyond.',
    tone: '#e9e2d6',
    focus: '40% 50%',
  },
  S05: {
    name: 'Tank Pavilion, the verandah',
    alt: 'A verandah with a daybed and folded shutters, looking along the grassy bank to the water.',
    tone: '#e4dccd',
  },
  S06: {
    name: 'Courtyard Suite, sitting room',
    alt: 'A sitting room with cane chairs opening onto a small brick-walled courtyard with one tree and an outdoor bath.',
    tone: '#e6dccb',
  },
  S08: {
    name: 'Bund Villa, the pool terrace',
    alt: 'A private plunge pool lined in green stone at the tip of the bank, with two loungers and the reservoir directly beyond it.',
    tone: '#d3dadd',
  },
  S10: {
    name: 'The pool',
    alt: 'A long pool lined in dark green stone, looking out over rice fields, with a tiled pavilion of sun loungers beside it.',
    tone: '#d8d3c8',
  },
  S12: {
    name: 'A walk along the reservoirs',
    alt: 'A couple walking and laughing on a red-earth path along a bank between two reservoirs, with egrets in the shallows.',
    tone: '#a9b3a2',
  },
  S13: {
    name: 'The rice and curry table',
    alt: 'A hostess in a Kandyan sari lifting the lid of a brass pot at a lunch buffet of rice and curries, in the open dining pavilion by the water.',
    tone: '#8c9a6b',
  },
  S14: {
    name: 'The old tree',
    alt: 'A very large kumbuk tree leaning over the reservoir in low gold light, beside the restaurant roof.',
    tone: '#e3b877',
  },
  S15: {
    name: 'Dining, at dusk',
    alt: 'The long open-sided restaurant beside the old tree just after sunset, with its bar and open kitchen at the back, tables set and lanterns not yet lit.',
    tone: '#d9a07a',
  },
  S16: {
    name: 'Dining, at night',
    alt: 'The same restaurant twenty minutes later, every lantern lit and reflected in the dark water.',
    tone: '#4a3329',
  },
  S18: {
    name: 'Dinner at The Ambalama',
    alt: 'A family of four laughing over dinner by candlelight in the long dining hall, with lit lanterns overhead, the bar and open kitchen behind and the dark water beyond.',
    tone: '#6b4534',
  },
  S19: {
    name: 'The water after dark',
    alt: 'The reservoir at night, still black water full of reflected stars and three warm lanterns on the bank.',
    tone: '#1a2023',
  },
  S20: {
    name: 'The bank at first light',
    alt: 'The path along the bank at sunrise, with the reservoir on one side and a lily pond on the other.',
    tone: '#c9d2d6',
  },
  S21: {
    name: 'The old city by bicycle',
    alt: 'A great white stupa far across a misty reservoir at dawn, and a lone cyclist on a red-earth path.',
    tone: '#d3dadd',
  },
  S22: {
    name: 'Mihintale at sunset',
    alt: 'A long flight of worn stone steps climbing between frangipani trees in golden light.',
    tone: '#e0a458',
  },
  S23: {
    name: 'A day in Wilpattu',
    alt: 'Guests in a safari jeep watching a small herd of elephants walk along the edge of a forest lake.',
    tone: '#c5cdb9',
  },
} as const satisfies Record<string, Shot>;

export type ShotId = keyof typeof shots;
