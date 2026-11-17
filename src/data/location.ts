/** Places guests travel to and from, with the time by car from the hotel. */
interface Destination {
  name: string;
  travelTime: string;
}

export const locationIntro = {
  heading: 'Anuradhapura was built on water. So are we.',
  text: 'Two thousand years ago, the kings of this city dug reservoirs to carry their people through the dry months. Hundreds of them are still full today. Niyara sits on the bank of one, far enough from the road that the loudest thing at breakfast is usually a kingfisher.',
  /** Where Anuradhapura is on the map, shown as a small caption over the film. */
  coordinates: '8°21′ N, 80°23′ E',
  region: 'North Central Province, Sri Lanka',
  listLabel: 'By car from the estate',
  note: 'Tell us your flight and we will have a driver waiting.',
};

export const destinations: Destination[] = [
  { name: 'The Sacred City', travelTime: '20 minutes' },
  { name: 'Mihintale', travelTime: '35 minutes' },
  { name: 'Wilpattu National Park', travelTime: '1 hour' },
  { name: 'Colombo airport', travelTime: '4 hours' },
];
