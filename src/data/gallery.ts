import type { ShotId } from './shots';

interface GallerySlide {
  shot: ShotId;
  title: string;
  caption: string;
}

export const galleryIntro = {
  heading: 'Have a look around.',
  hint: 'The pictures change by themselves. Move across one to look into it, and it will wait for you.',
};

/** The gallery reuses pictures from the rest of the page, in the order of a day. */
export const gallerySlides: GallerySlide[] = [
  {
    shot: 'S20',
    title: 'First light, from the bank',
    caption:
      'Six in the morning on the path along the bank. There is water on both sides, which is what the word niyara means.',
  },
  {
    shot: 'S05',
    title: 'The verandah of pavilion eleven',
    caption:
      'Shutters folded back, daybed made up. Most people get no further than this before lunch.',
  },
  {
    shot: 'S10',
    title: 'The pool at midday',
    caption: 'Twenty-five metres of green stone, with the rice fields at the far end.',
  },
  {
    shot: 'S03',
    title: 'The courtyard',
    caption:
      'The first thing you see when you come through the gate: brick, lime plaster and a long channel of still water.',
  },
  {
    shot: 'S14',
    title: 'The old tree',
    caption:
      'Nobody knows how old it is. The restaurant was built around it, not the other way round.',
  },
  {
    shot: 'S18',
    title: 'Dinner at The Ambalama',
    caption: 'The lamps are lit at dusk, one table at a time.',
  },
  {
    shot: 'S19',
    title: 'The water after dark',
    caption: 'No road, no town, and on a clear night more stars than you may have seen in years.',
  },
];
