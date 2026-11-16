# Niyara

The homepage of Niyara, a small hotel on the bank of an old reservoir near
Anuradhapura, Sri Lanka. The page follows one day at the hotel, from dawn to
night, and tells it through light, color and slow movement as you scroll.

## Run it

You need [Node.js](https://nodejs.org) 22.12 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:4321.

The first run takes a minute or two longer, because it draws the stand-in
frames for the opening film (see "Pictures and film" below).

## Commands

| Command                | What it does                                                   |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | Starts the site on your computer and reloads when you save.    |
| `npm run build`        | Builds the finished site into the `dist` folder.               |
| `npm run preview`      | Serves the built site, to check it before it goes live.        |
| `npm run verify`       | Runs every check below, then builds. Run this before you push. |
| `npm run format`       | Tidies the code layout (Prettier).                             |
| `npm run lint`         | Looks for common mistakes (ESLint).                            |
| `npm run check`        | Checks the types in every file (TypeScript).                   |
| `npm test`             | Runs the unit tests (Vitest).                                  |
| `npm run placeholders` | Draws the stand-in film frames. Add `-- --force` to redraw.    |

GitHub runs `npm run verify` on every push and pull request.

## What it is built with

- **Astro** builds the page into plain HTML and CSS. No framework is sent to the browser.
- **GSAP** (with ScrollTrigger and SplitText) runs the scroll animation.
- **Lenis** smooths wheel scrolling on desktop.
- **TypeScript**, in strict mode, everywhere.

## Where things are

```
src/
  data/         All words, prices, links and colors. Edit content here.
  components/
    ui/         Small shared pieces (a picture, a section heading, the map).
    layout/     Header, menu and footer.
    sections/   One file per section of the homepage, in page order.
  layouts/      The page shell: head tags, fonts, header, footer.
  pages/        One file per page. index.astro is the homepage.
  scripts/
    lib/        Shared helpers (animation setup, color math, the film player).
    scenes/     Things that move because the visitor scrolls.
    ui/         Things that respond to a click, a tap or a key.
    main.ts     Switches everything on. Start reading here.
  styles/       Design tokens (colors, type, spacing) and base styles.
  assets/images Photographs, named by shot ID.
scripts/        Build helpers (the stand-in film frames).
docs/           How the site works and how to add pictures.
```

## Common changes

| I want to...                     | Edit                                             |
| -------------------------------- | ------------------------------------------------ |
| Change wording, prices or FAQs   | The matching file in `src/data/`                 |
| Change phone, email or address   | `src/data/site.ts`                               |
| Change the menu links            | `src/data/navigation.ts`                         |
| Change a time-of-day color       | `src/data/themes.ts`                             |
| Change type sizes or spacing     | `src/styles/tokens.css`                          |
| Add a photograph                 | Drop the file in `src/assets/images/`            |
| Connect a booking engine         | `booking.engineUrl` in `src/data/site.ts`        |
| Let search engines list the site | `allowIndexing` in `src/data/site.ts`            |
| Reorder or add a section         | `src/data/scenes.ts` and `src/pages/index.astro` |

## Pictures and film

No real pictures are in the project yet. Each photograph shows as a flat block
with its shot ID until its file is added, and the opening film plays drawn
stand-in frames of the right number, size and weight.

See [docs/assets.md](docs/assets.md) for how to add the real ones.

## Before the site goes public

- The phone number, email and address in `src/data/site.ts` are made up. Replace them.
- The site asks search engines not to list it. Set `allowIndexing` to `true` when ready.
- The booking and newsletter forms open an email to the hotel. Connect real services first.
- Set the `SITE_URL` setting to the real web address when building.

## More

- [docs/architecture.md](docs/architecture.md) explains how the page works and why.
- [docs/assets.md](docs/assets.md) explains pictures and the opening film.
