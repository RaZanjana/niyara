import type { ShotId } from './shots';

interface Room {
  id: string;
  name: string;
  /** Lowest nightly rate, as shown to guests. */
  priceFrom: string;
  description: string;
  /** The room's pictures, in the order they are shown. The first is the main one. */
  shots: [ShotId, ...ShotId[]];
}

export const roomsIntro = {
  heading: 'The buildings are low. None is taller than the trees.',
  text: 'Twenty-two private pavilions, suites and villas, spread far apart along the bank. Each has a deep verandah, a bath that opens to the sky or the water, and wooden shutters for anyone who would rather not be up with the birds.',
};

export const rooms: Room[] = [
  {
    id: 'tank-pavilion',
    name: 'Tank Pavilion',
    priceFrom: 'from USD 650 a night',
    description:
      'Fourteen pavilions in a row along the bank, 68 m² each. Step off the verandah onto the grass and the water is ten paces away. For the sunrise, ask for one of numbers nine to fourteen.',
    shots: ['S04', 'S05', 'S02'],
  },
  {
    id: 'courtyard-suite',
    name: 'Courtyard Suite',
    priceFrom: 'from USD 820 a night',
    description:
      'Six suites set back among the trees, 92 m² each, built around a walled courtyard with an outdoor bath. Choose one if you like privacy more than a view.',
    shots: ['S06', 'S24', 'S25'],
  },
  {
    id: 'bund-villa',
    name: 'Bund Villa',
    priceFrom: 'from USD 1,450 a night',
    description:
      'Two villas at the quiet end of the bank, each with two bedrooms, a private pool and a butler. They suit a family, or two couples travelling together.',
    shots: ['S08', 'S26', 'S27'],
  },
];
