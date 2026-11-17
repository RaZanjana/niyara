export const bookingIntro = {
  heading: 'When would you like to come?',
};

/** The two guest counters of the booking form. */
export const guestCounts = [
  { name: 'adults', label: 'Adults', hint: 'Aged 18 and over', min: 1, max: 20, start: 2 },
  { name: 'children', label: 'Children', hint: 'Aged 10 to 17', min: 0, max: 10, start: 0 },
] as const;

export const freeChildrenNote =
  'Children under 10 stay free. Bring them along; there is no need to count them here.';

/** Reasons to book on this site and not through a booking website. */
export const directBenefits = [
  {
    title: 'The lowest rate',
    text: 'You will not find it cheaper on a booking site. If you do, tell us and we will match it.',
  },
  {
    title: 'Breakfast for everyone',
    text: 'Served on the bank, for as long as you care to sit there.',
  },
  {
    title: 'A car from the airport',
    text: 'On us, in both directions, when you stay three nights or longer.',
  },
];

export const faqs = [
  {
    question: 'When is the best time to visit?',
    answer:
      'May to September is dry, hot and bright. From October to January the rains come, the reservoirs fill and everything turns green. Both are lovely. February to April is the quietest.',
  },
  {
    question: 'Is there a minimum stay?',
    answer:
      'No. Come for a night on your way north, or for a fortnight. You are welcome either way.',
  },
  {
    question: 'Can we bring children?',
    answer:
      'Of course, at any age. Cots and extra beds are free, the kitchen will cook for small appetites at any hour, and the Bund Villas give a family the most room.',
  },
  {
    question: 'What should we wear to the sacred sites?',
    answer:
      'Cover your shoulders and knees, and wear white if you have it. You will be asked to take off your shoes and hat at the entrance, so bring socks. The stone gets hot.',
  },
];
