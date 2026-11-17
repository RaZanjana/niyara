# Pictures and films

Every picture and film on the site is made in Higgsfield. This page explains
how they get into the project. The shot IDs (S03, S04 and so on) come from the
"Niyara Property Bible and Shot List".

## The quick way

1. Download the pictures and films from Higgsfield into one folder. Keep the
   file names as they are.
2. Run:

   ```bash
   node scripts/import-media.mjs "/path/to/that/folder"
   ```

The script recognises each file by the Higgsfield job ID in its name. Those
IDs are listed in `scripts/media-sources.json`, and explained in
[picture-sources.md](picture-sources.md). The script then:

- saves each picture as `src/assets/images/<shot ID>.jpg`, at most 2400 pixels
  on its longest side, and
- cuts each film into frames under `public/frames/`, in a wide set for desktop
  and an upright set for phones.

It needs the free tool `ffmpeg` for the films (any copy will do: ffmpeg only
cuts the frames out, and the script saves them as WebP itself). Files that are
not in the folder are skipped, so you can import a few at a time.

## Replacing one picture

1. Make the new picture in Higgsfield and download it.
2. Put its job ID next to the shot ID in `scripts/media-sources.json`.
3. Run the import script on the folder that holds it.

You can also skip the script: save any JPG, PNG, WebP or AVIF as
`src/assets/images/<shot ID>.jpg` (or the matching ending) and the site uses it.

The site makes the smaller copies for phones and slow connections by itself
when it builds. No code change is needed.

The list of shots the homepage uses, with the description read out to people
who cannot see the picture, is in `src/data/shots.ts`. If an important part of
a picture gets cropped, set `focus` for that shot (for example `'40% 50%'`
means "keep the area 40% from the left, halfway down").

## Films

A film is shown as a row of still frames, so that scrolling can play it
forwards and backwards. There are three:

| Film       | Where              | Desktop frames     | Phone frames      |
| ---------- | ------------------ | ------------------ | ----------------- |
| Opening    | Top of the page    | 72, at 1440 x 810  | 36, at 612 x 1088 |
| Reservoirs | "Where we are"     | 132, at 1600 x 900 | 72, at 720 x 1280 |
| Dining     | The dining section | 40, at 1280 x 720  | 28, at 540 x 720  |

These numbers live in `src/data/frame-sequences.json`. For each film,
`scripts/media-sources.json` also says:

- `startSeconds`: where in the film to begin.
- `mobileFocusX`: which part of the wide picture the upright phone frames are
  cut from. 0 is the left edge, 1 is the right edge.
- `quality`: how hard the frames are compressed, from 1 to 100.
- `soften` (optional): a very slight blur before compressing. A generated
  film has a fine grain that costs a lot of bytes and cannot be seen at screen
  size. The opening film uses 0.7, which brings it within its budget.

The import script prints each film's total size against the `budgetKb` in
`frame-sequences.json`. If a film is over, lower `quality`, add `soften`, or
cut fewer frames (`count`). A slow camera move needs fewer frames than a fast one.

The dining film is optional. If its frames are not in the project, the dining
section cross-fades between its dusk and night photographs instead.

### Stand-in frames

If the opening film's frames are ever deleted, `npm run placeholders` draws a
simple sketch for every frame so the page still works. It runs by itself
before `npm run dev` and `npm run build`, and does nothing while the real
frames are in place.
