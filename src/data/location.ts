/** Places guests travel to and from. The `id` links each one to its road on the map. */
export type DestinationId = 'sacred-city' | 'mihintale' | 'wilpattu' | 'colombo';

interface Destination {
  id: DestinationId;
  name: string;
  travelTime: string;
}

export const locationIntro = {
  heading: 'Anuradhapura was built on water. So are we.',
  text: 'Two thousand years ago, the kings of this city dug reservoirs to carry their people through the dry months. Hundreds of them are still full today. Niyara sits on the bank of one, far enough from the road that the loudest thing at breakfast is usually a kingfisher.',
  listLabel: 'By car from the hotel',
  note: 'Tell us your flight and we will have a driver waiting.',
};

export const destinations: Destination[] = [
  { id: 'sacred-city', name: 'The Sacred City', travelTime: '20 minutes' },
  { id: 'mihintale', name: 'Mihintale', travelTime: '35 minutes' },
  { id: 'wilpattu', name: 'Wilpattu National Park', travelTime: '1 hour' },
  { id: 'colombo', name: 'Colombo airport', travelTime: '4 hours' },
];
