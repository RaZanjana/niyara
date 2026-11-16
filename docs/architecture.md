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
screen, it blends the two colors and writes the result to two CSS variables on
the page: `--page-bg` and `--page-ink` (a text color that is readable on it).
The body and the header use those variables.

The position is worked out from where the page is right now, not from what
happened before. So jumping with a menu link, or scrolling back up, always
lands on the right color.

## Scenes that hold still while you scroll

The opening film and the arrival gateway stay on screen while you scroll
through them. This is done with CSS `position: sticky`, which the browser
handles very smoothly, including on phones. The script only measures how far
through the scene you are, and moves things to match. The extra scroll
distance is a CSS variable called `--hold` on the scene.

## The opening film

A real video cannot be played smoothly forwards and backwards by scrolling. So
the film is saved as a row of still pictures (frames), and
`src/scripts/lib/frame-sequence.ts` draws the right one onto a canvas.

- Frames download in a spread-out order (every 16th, then every 8th, and so
  on), so the whole film is roughly playable within a moment and then sharpens.
- If a frame has not arrived yet, the nearest one that has is shown.
- Phones get a smaller, upright set with fewer frames.
- Visitors who turned on "save data" in their browser get one still picture.
- The numbers and sizes are in `src/data/frame-sequences.json`.

## Motion and accessibility

- All scroll animation is set up in `src/scripts/scenes/index.ts` inside one
  `gsap.matchMedia()` block. It runs again, cleanly, when the window crosses
  the phone and desktop width, or when the visitor changes their motion setting.
- With "reduce motion" on: no film, no held scenes, no fades. Section colors
  switch at once. Everything is still there to read and use.
- With scripts off: the page still shows every section, all three rooms and
  all photographs, and the header scrolls with the page. The two forms need
  scripts, but the phone, WhatsApp and email links beside them still work.
- The menu is a native `<dialog>`, the rooms are standard tabs with arrow
  keys, and the FAQs are native `<details>`. The browser does the hard parts.
- Content waiting to fade in is made transparent, never hidden, so the Tab key
  can always reach it.

## Pages that do not exist yet

`src/data/routes.ts` lists every page the site will have. A link to a page
that is not built yet goes to the matching section of the homepage instead.
When you build the page, set `built: true` and every link updates.

## Forms

There is no booking engine or mailing list service yet. To stay useful and
honest, both forms open an email to the hotel with the details filled in
(`src/scripts/ui/enquiry.ts`). Set `booking.engineUrl` in `src/data/site.ts`
and the booking form sends the dates there instead.

## Tests and checks

`npm run verify` runs, in order: the formatting check, the lint rules, the
type check, the unit tests and a full build. The unit tests cover the logic
that is easy to get wrong and hard to see: color math, contrast, frame
numbering, download order, dates, and that every menu link points at a section
that exists.

## Adding a new section

1. Add it to `src/data/scenes.ts` with a theme.
2. Create `src/components/sections/YourSection.astro`, wrapped in `<Scene id="...">`.
3. Add it to `src/pages/index.astro` in the same position.
4. If it needs movement, add a file in `src/scripts/scenes/` or `src/scripts/ui/`
   and switch it on in `scenes/index.ts` or `main.ts`.
