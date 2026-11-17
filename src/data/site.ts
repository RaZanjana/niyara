/**
 * Facts about the hotel that are used in more than one place.
 *
 * NOTE: the contact details below are stand-ins. Replace the phone number,
 * WhatsApp number, email, address and social pages with real ones before the
 * site goes public.
 */
export const site = {
  name: 'Niyara',
  nameSinhala: 'නියර',
  title: 'Niyara | Private luxury villas on an ancient reservoir, Anuradhapura',
  description:
    'A private estate of twenty-two luxury villas and suites on the bank of a two-thousand-year-old reservoir, twenty minutes from the Sacred City of Anuradhapura, Sri Lanka.',
  language: 'en',

  /**
   * Keeps search engines from listing the site while it is unfinished.
   * Set to `true` when the site is ready to be found.
   */
  allowIndexing: false,

  contact: {
    phone: '+94 25 555 0142',
    phoneHref: 'tel:+94255550142',
    whatsappHref: 'https://wa.me/94255550142',
    email: 'stay@niyara.example',
    address: 'Old Puttalam Road, Anuradhapura, Sri Lanka',
    /** When someone answers the phone, in plain words. */
    hours: 'between seven in the morning and nine at night',
  },

  /**
   * The hotel's pages elsewhere, shown as "Follow us".
   * NOTE: these are stand-ins that point at each service's front page.
   * Replace each with the hotel's own page before the site goes public.
   */
  social: [
    { name: 'Instagram', href: 'https://www.instagram.com/' },
    { name: 'Facebook', href: 'https://www.facebook.com/' },
    { name: 'YouTube', href: 'https://www.youtube.com/' },
    { name: 'TikTok', href: 'https://www.tiktok.com/' },
  ],

  booking: {
    /**
     * Address of the booking engine. Leave it empty until one is connected.
     * While it is empty, the booking form writes an email enquiry instead.
     */
    engineUrl: '',
  },
} as const;
