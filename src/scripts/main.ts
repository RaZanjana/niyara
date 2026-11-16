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
import { initLocation, initPoolRipples, initScroller } from './ui/small-interactions';
import { initBookingForm, initNewsletterForm } from './ui/enquiry';
import { initGallery } from './ui/gallery';
import { initMenu } from './ui/menu';
import { initRooms } from './ui/rooms';

const scroll = initSmoothScroll();

initMenu(scroll);
initRooms();
initGallery();
initScroller();
initLocation();
initPoolRipples();
initBookingForm();
initNewsletterForm();

// Last, because it measures the page, and the pieces above can change its height.
initScrollScenes();
