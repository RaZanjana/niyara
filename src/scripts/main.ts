/**
 * The page script. It runs once, after the page has loaded, and switches on
 * each piece of behavior. Every piece lives in its own file:
 *
 *   lib/      shared helpers (animation setup, color math, the film player)
 *   scenes/   things that move because the visitor scrolls
 *   ui/       things that respond to a click, a tap or a key
 *
 * Each `init...` function looks for its own elements and quietly does
 * nothing if they are not on the page.
 */
import { initSmoothScroll } from './lib/smooth-scroll';
import { initScrollScenes } from './scenes';
import { initCardHover, initPoolRipples, initScroller } from './ui/small-interactions';
import { initBookingModal } from './ui/booking-modal';
import { initCalendars } from './ui/calendar';
import { initBookingForms } from './ui/enquiry';
import { initGallery } from './ui/gallery';
import { initMenu } from './ui/menu';
import { initLoader } from './ui/loader';
import { initRooms } from './ui/rooms';
import { initSelects } from './ui/select';

const scroll = initSmoothScroll();

// First, so the title card is in charge before anything else starts loading.
initLoader(scroll);

initMenu(scroll);
initRooms();
initGallery();
initScroller();
initCardHover();
initPoolRipples();
initCalendars();
initSelects();
initBookingForms();
initBookingModal(scroll);

// Last, because it measures the page, and the pieces above can change its height.
initScrollScenes();
