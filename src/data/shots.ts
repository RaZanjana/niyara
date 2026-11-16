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
    alt: 'A private granite plunge pool at the tip of the bank, with the reservoir directly beyond it.',
    tone: '#d3dadd',
  },
  S10: {
    name: 'The pool from above',
    alt: 'A granite pool seen from directly above, stepped on all four sides, with tree shadow across one corner.',
    tone: '#d8d3c8',
    focus: '64% 50%',
  },
  S12: {
    name: 'A walk along the reservoirs',
    alt: 'Two small figures walking a red-earth path on a bank between two reservoirs, with egrets in the shallows.',
    tone: '#a9b3a2',
  },
  S13: {
    name: 'Lunch in the rice fields',
    alt: 'A long table under a tree at the edge of a green rice field, with clay pots over a wood fire.',
    tone: '#8c9a6b',
  },
  S14: {
    name: 'The old tree',
    alt: 'A very large kumbuk tree leaning over the reservoir in low gold light, beside the restaurant roof.',
    tone: '#e3b877',
  },
  S15: {
    name: 'Dining, at dusk',
    alt: 'The open-sided restaurant on the bank just after sunset, tables set and lanterns not yet lit.',
    tone: '#d9a07a',
  },
  S16: {
    name: 'Dining, at night',
    alt: 'The same restaurant twenty minutes later, every lantern lit and reflected in the dark water.',
    tone: '#4a3329',
  },
  S18: {
    name: 'Dinner at The Ambalama',
    alt: 'Inside the restaurant at night, lit lanterns overhead and two guests at a table looking out to the water.',
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
    alt: 'A forest lake with a rim of pale sand at dawn, and spotted deer at the far edge.',
    tone: '#c5cdb9',
  },
} as const satisfies Record<string, Shot>;

export type ShotId = keyof typeof shots;
