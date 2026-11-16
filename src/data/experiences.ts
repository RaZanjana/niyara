import type { ShotId } from './shots';

interface Experience {
  title: string;
  text: string;
  shot: ShotId;
}

export const experiencesIntro = {
  heading: 'Go out early, and be back in time for a swim.',
  text: 'The ancient city is at its best before nine, while the stone is still cool and the light is low. We can arrange any of these with a guide, a driver, or just a bicycle and a good map. Or you can do none of them. Plenty of guests don’t.',
  plannerNote:
    'Not sure where to begin? Tell us how long you are staying and what you like, and we will put your days together for you.',
};

export const experiences: Experience[] = [
  {
    title: 'The old city by bicycle',
    text: 'Leave at six with Sunil, who has guided here for twenty years. You will have the great stupas almost to yourself, and be back for breakfast by ten.',
    shot: 'S21',
  },
  {
    title: 'A walk along the reservoirs',
    text: 'Follow the old canal from one village reservoir to the next, with a man whose family has looked after the water here for generations.',
    shot: 'S12',
  },
  {
    title: 'Mihintale at sunset',
    text: 'Climb the long stone stair under the frangipani trees and watch the plain turn gold. Take the steps slowly. Everyone does.',
    shot: 'S22',
  },
  {
    title: 'A day in Wilpattu',
    text: 'Sri Lanka’s largest national park is an hour away. Leopards if you are lucky, forest lakes and painted storks if you are not.',
    shot: 'S23',
  },
  {
    title: 'Lunch in the rice fields',
    text: 'Rice, lake fish and seven or eight curries, cooked over a wood fire by the women of the next village and eaten in the shade.',
    shot: 'S13',
  },
];
