# How the site works

This page explains the main ideas, so that a new developer can find their way
around in a few minutes.

## The idea in one paragraph

The homepage is a list of **scenes** (sections). Each scene has a **theme**: a
small set of colors for one time of day. As the visitor scrolls, the page
background blends from one scene's color to the next, so the day passes without
any clock on screen. The page is plain HTML and CSS first. Scripts then add
movement on top, and only for visitors who have not asked for less motion.

## Three layers

| Layer     | Folder           | Job                                      |
| --------- | ---------------- | ---------------------------------------- |
| Content   | `src/data`       | The words, prices, links and colors.     |
| Structure | `src/components` | HTML and its styles, one file per piece. |
| Behavior  | `src/scripts`    | Movement and interaction.                |

The layers only meet in two places:

1. Components **import** content from `src/data`.
2. Scripts **find** elements through `data-` attributes, such as
   `data-gallery` or `data-room-tab`. Scripts never rely on class names, so
   styling can change without breaking behavior, and the other way round.

## Scenes and themes

- `src/data/scenes.ts` lists the scenes in page order, each with its theme.
- `src/data/themes.ts` defines the colors of each theme. The CSS for them is
  generated from this file, so the colors live in one place only.
- `src/components/ui/Scene.astro` is the wrapper every section uses. It adds
  the section's `id`, its theme, and the link to its heading for screen readers.

A unit test checks that every theme's text is readable on its background
(WCAG AA contrast). If you change a color and the text becomes hard to read,
the test fails.

## The blending background ("atmosphere")

`src/scripts/scenes/atmosphere.ts` reads each scene's background color, then
watches every boundary between two scenes. While a boundary crosses the
screen, it blends the two colors, paints the result onto `<body>`, and gives
the elements that take the page's colors (marked `data-tinted`: the header and
the back to top button) two CSS variables, `--page-bg` and `--page-ink` (a
text color that is readable on it).

It writes only when the color has changed, and never to `<html>`: a variable
changed there makes the browser work out the style of every element on the
page again, on every frame of scrolling, which phones feel.

The position is worked out from where the page is right now, not from what
happened before. So jumping with a menu link, or scrolling back up, always
lands on the right color.

Where the page goes from a dark scene to a light one, or the other way, the
blend is timed so that no words are left on the wrong ground: the page
lightens before the new words fade in, and darkens only after the old words
have faded out.

## The header

The header has no solid background. Behind it is a pane of frosted glass,
tinted with `--page-bg` and fading out downwards, so the film or picture under
it shows through and the bar takes its colors (`SiteHeader.astro`).

## Pictures that melt into the page ("ambient glow")

A picture never fades into a flat pale color. Behind each large picture lies a
tiny, blurred copy of the same picture, a little taller than the picture
itself (`components/ui/Ambient.astro`). The picture's top and bottom edges are
feathered, and what shows through is that glow. So the fade between a picture
and the page is made of the picture's own colors.

The blurred copies are made while the site is built (`src/lib/ambient.ts`) and
written straight into the page. Each is a few hundred bytes, blurred enough
to read as a wash of the picture's colors, and faded out at its own edges, so
a glow never ends in a line.

## Phones

What makes a phone stutter is avoided on purpose:

- Held scenes, and the scroll distances they take, are measured in screens:
  `--screen` (the screen at its largest) and `--sv` (one hundredth of it at
  its smallest). `scripts/lib/screen.ts` measures both once, in pixels, when
  the page opens, and again only when the phone is turned. Some phone
  browsers change their screen units while the address bar moves; the whole
  page would then change height under the scroll animations, and they would
  start in the wrong places, further down the page each time. On a phone the
  largest screen is at least the screen's own height, so the scene behind
  never shows through at the bottom. Text near the bottom of a held scene
  adds `--bars`, the height the bars can cover, so it is never hidden under
  them.
- Should the page change height for any other reason, the scroll animations
  are worked out again once it has settled.
- The header's frosted glass is a plain tint on touch screens: blurring a
  moving film behind it on every frame is too much for a phone.
- The color glows behind pictures are blurred once, while the site is built,
  and their own edges fade out. The browser blurs nothing, so they look the
  same on a phone as on a desktop.
- Nothing animates a blur filter.
- Phone film frames are 540 px wide, and fewer, so the three films hold about
  200 MB of pictures in memory, not 400.

## Scenes that hold still while you scroll

The opening film, the film of the reservoirs, the gateway, the card row and
(on a wide screen) the restaurant stay on screen while you scroll through
them. This is done with CSS `position: sticky`, which the browser handles very
smoothly, including on phones. The script only measures how far through the
scene you are, and moves things to match. The extra scroll distance is a CSS
variable called `--hold` on the scene.

### One scene dissolving into the next

The first three scenes (opening film, reservoirs from the air, gateway) are
joined like shots in a film. Each of the later two starts two screens early,
with a negative top margin (`--overlap`), and lies underneath the one before.
By the time the earlier scene has finished, the next is already in place
behind it, and the earlier one simply fades out. Nothing slides.

Because of this, a menu link to "Getting here" would land on the dissolve
itself. A negative `scroll-margin-top` on the scene moves the landing point
on to where its heading has appeared.

### The card row

In "Things to do" the row of cards sticks to the screen, and scrolling up or
down slides the cards sideways (`scripts/scenes/experiences.ts`). The script
measures how far the cards must travel and makes the section that much taller.
With reduced motion, or without scripts, the row is a normal sideways
scrolling area.

## The title card

While the opening film loads, a title card covers the page
(`components/layout/PageLoader.astro`, `scripts/ui/loader.ts`): the name
above its reflection, with the wordmark's water line between them growing as
the film's frames arrive, and a count beside it. When everything is in, the
line spreads to the edges of the screen and the dark parts along it, above
and below, onto the first frame of the film. The hero's own opening starts
as it parts (`loaderDone`).

- It waits for the heading typeface, the first picture, and every frame of
  the opening film. Other scripts can add their own work with
  `trackLoading(weight)`.
- It is shown for 1.9 seconds at least (0.8 on a second visit in the same
  session), and never waits longer than 9 seconds: on a slow connection the
  page opens anyway, and the film keeps loading behind it.
- While it is up, the page behind cannot be scrolled or reached with the
  keyboard. Screen readers hear "Loading Niyara".
- With reduced motion it fades. Without scripts it is never shown, and if the
  script fails it fades out by itself after 7 seconds.

## The films

A real video cannot be played smoothly forwards and backwards by scrolling. So
each film is saved as a row of still pictures (frames), and
`src/scripts/lib/frame-sequence.ts` draws the right one onto a canvas. There
are three: the opening, the reservoirs from the air, and the restaurant at
nightfall.

- Frames download in a spread-out order (every 16th, then every 8th, and so
  on), so the whole film is roughly playable within a moment and then sharpens.
- If a frame has not arrived yet, the nearest one that has is shown.
- Phones get a smaller, upright set with fewer frames.
- Visitors who turned on "save data" in their browser get one still picture.
- The numbers and sizes are in `src/data/frame-sequences.json`.

The opening film also moves a little by itself when the page loads, so the
first screen is alive before anyone scrolls (`scripts/scenes/hero.ts`). To
keep that smooth:

- the title card holds the page until its frames have arrived;
- its first 16 frames are fetched first, in order, before the spread-out pass
  (the `lead` option of the film player);
- the opening waits for those frames and for the heading typeface (at most
  1.8 seconds) before anything moves, so nothing starts and then stalls;
- everything in it moves by opacity and transform only;
- the film of the reservoirs does not start downloading until the opening
  film has finished, or the visitor starts to scroll.

## Rooms

Each kind of villa has several pictures (`shots` in `src/data/rooms.ts`).
They change with arrows on the picture, small pictures underneath, a swipe or
the arrow keys (`scripts/ui/rooms.ts`). Choosing another villa starts again
at its first picture.

## Loading order and caching

The page loads what it needs in order, so each part is ready before the
visitor reaches it and nothing competes with what is needed first
(`src/scripts/lib/loading-order.ts`):

1. the opening film, while the title card is up;
2. the film of the reservoirs, once the opening film is in or the visitor
   starts to scroll;
3. then, a few at a time, every picture further down the page in page order,
   and the restaurant's film.

Pictures are marked to load lazily, so without step 3 each would only be
fetched as the visitor came near it, and appear in front of them. Step 3
fetches exactly the size and format the browser would have chosen. Visitors
who asked their browser to save data skip it.

Everything is cached by the browser for a year: the pictures and scripts
under `/_astro/` because their names change with their content, and the film
frames because each film's addresses carry a fingerprint of its frames
(`0001.webp?v=…`, see `scripts/stamp-frames.mjs` and `vercel.json`). The
fingerprint is worked out again before every build, so a replaced film is
always fetched afresh.

## The gallery

The photographs change by themselves every few seconds, with a soft sweep
from one to the next (`scripts/ui/gallery.ts`, and the styles in
`Gallery.astro`). On a wide screen the picture and its list of photographs
share one row; on a phone they stack. The show waits while the pointer is on the picture, while
the keyboard is inside the gallery, while it is off screen, and when its
pause button is pressed. It does not start by itself for visitors who prefer
reduced motion.

## Back to top

Once the visitor is past the opening, a round button in the lower right
corner glides the page back to the top (`layout/BackToTop.astro`,
`scripts/ui/back-to-top.ts`). A gold ring around it fills as the page is
scrolled. It steps out of the way while a booking calendar or guests panel is
open.

## Booking

`components/ui/BookingForm.astro` is the form with the two dates and the
guests. It is used twice: in the booking section, and in the booking window.

- The date fields open a calendar drawn by the site (`scripts/ui/calendar.ts`),
  and the guests field opens two counters, for adults and for children aged 10
  to 17, with a note that younger children stay free (`scripts/ui/guests.ts`).
  Both match the page in every browser. The browser's own date and number
  inputs stay in the form, hidden, and carry the values.
- "Book a stay" opens the booking window (`layout/BookingModal.astro`,
  `scripts/ui/booking-modal.ts`). The button itself grows into the window, and
  shrinks back into the button when it closes.
- Without scripts, "Book a stay" is a link to the booking section, and the
  form shows the browser's own fields.

## Motion and accessibility

- All scroll animation is set up in `src/scripts/scenes/index.ts` inside one
  `gsap.matchMedia()` block. It runs again, cleanly, when the window crosses
  the phone and desktop width, or when the visitor changes their motion setting.
- With "reduce motion" on: no film, no held scenes, no dissolves, no sideways
  card travel, and the gallery waits to be played. Section colors switch at
  once. Everything is still there to read and use.
- With scripts off: the page still shows every section, all three rooms and
  all photographs, and the header scrolls with the page. The two forms need
  scripts, but the phone, WhatsApp and email links beside them still work.
- The menu and the booking window are native `<dialog>`s, the rooms are
  standard tabs with arrow keys, and the FAQs are native `<details>`. The
  browser does the hard parts. The calendar and the guests list follow the
  standard keyboard patterns for a date grid and a list box.
- Content waiting to fade in is made transparent, never hidden, so the Tab key
  can always reach it.

## Pages that do not exist yet

`src/data/routes.ts` lists every page the site will have. A link to a page
that is not built yet goes to the matching section of the homepage instead.
When you build the page, set `built: true` and every link updates.

## Forms

There is no booking engine yet. To stay useful and honest, the booking form
opens an email to the hotel with the details filled in
(`src/scripts/ui/enquiry.ts`). Set `booking.engineUrl` in `src/data/site.ts`
and the form sends the dates there instead.

## Tests and checks

`npm run verify` runs, in order: the formatting check, the lint rules, the
type check, the unit tests and a full build. The unit tests cover the logic
that is easy to get wrong and hard to see: color math, contrast, frame
numbering, download order, dates and the calendar's weeks, and that every menu
link points at a section that exists.

## Adding a new section

1. Add it to `src/data/scenes.ts` with a theme.
2. Create `src/components/sections/YourSection.astro`, wrapped in `<Scene id="...">`.
3. Add it to `src/pages/index.astro` in the same position.
4. If it needs movement, add a file in `src/scripts/scenes/` or `src/scripts/ui/`
   and switch it on in `scenes/index.ts` or `main.ts`.
