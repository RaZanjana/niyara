import { pageHref } from './routes';

export const gettingHere = [
  'By car, it is about four hours from Colombo airport. We send our own drivers, and they know where to stop for tea.',
  'By train, the intercity from Colombo Fort takes around four hours. We will meet you on the platform at Anuradhapura.',
  'Sigiriya is under two hours away by road, Trincomalee about two, and Kandy a little over three.',
];

export const worthKnowing = [
  'Rooms are ready from two in the afternoon and yours until noon. If your flight is late in the day, ask us and we will work something out.',
  'Every room is on the ground floor, and the paths are step-free from the gate to the water.',
  'Pack light cotton, a hat, something white for the temples, and sandals that slip off easily.',
  'The Wi-Fi reaches every room. It stops at the pool, on purpose.',
];

export const footerLinks = [
  { label: 'Rooms', href: pageHref('rooms') },
  { label: 'Dining', href: pageHref('dining') },
  { label: 'Things to do', href: pageHref('experiences') },
  { label: 'The pool and the spa', href: pageHref('wellness') },
  { label: 'Photographs', href: pageHref('photographs') },
  { label: 'Offers', href: pageHref('offers') },
  { label: 'Gift a stay', href: pageHref('gifts') },
  { label: 'Celebrations', href: pageHref('celebrations') },
];

export const legalLinks = [
  { label: 'Privacy', href: pageHref('privacy') },
  { label: 'Terms', href: pageHref('terms') },
  { label: 'Work with us', href: pageHref('careers') },
  { label: 'Press', href: pageHref('press') },
];

export const newsletter = {
  label:
    'A few times a year we write about the place: what is in flower, what the kitchen is cooking, when the rains have come. Would you like to hear from us?',
  button: 'Yes, please',
};

export const signOff = 'We will keep a lamp lit for you.';
