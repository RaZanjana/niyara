import type { ShotId } from './shots';

interface Room {
  id: string;
  name: string;
  /** Lowest nightly rate, as shown to guests. */
  priceFrom: string;
  description: string;
  shot: ShotId;
}

export const roomsIntro = {
  heading: 'The buildings are low. None is taller than the trees.',
  text: 'There are twenty-two rooms, in three kinds. All have a deep verandah to sit out on, a bathtub by the window, and wooden shutters for anyone who would rather not be up with the birds.',
};

export const rooms: Room[] = [
  {
    id: 'tank-pavilion',
    name: 'Tank Pavilion',
    priceFrom: 'from USD 650 a night',
    description:
      'Fourteen pavilions in a row along the bank, 68 m² each. Step off the verandah and you are at the water. For the sunrise, ask for one of numbers nine to fourteen.',
    shot: 'S04',
  },
  {
    id: 'courtyard-suite',
    name: 'Courtyard Suite',
    priceFrom: 'from USD 820 a night',
    description:
      'Six suites set back among the trees, 92 m² each, built around a walled courtyard with an outdoor bath. Choose one if you like privacy more than a view.',
    shot: 'S06',
  },
  {
    id: 'bund-villa',
    name: 'Bund Villa',
    priceFrom: 'from USD 1,450 a night',
    description:
      'Two villas at the quiet end of the bank, each with two bedrooms, a private pool and a butler. They suit a family, or two couples travelling together.',
    shot: 'S08',
  },
];
