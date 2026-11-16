# Pictures and the opening film

The project has no real pictures yet. This page explains how to add them.
The shot IDs (S03, S04 and so on) come from the "Niyara Property Bible and
Shot List".

## Photographs

1. Export the picture as a JPG at full quality, at least 2400 pixels wide.
2. Name it by its shot ID, for example `S04.jpg`.
3. Put it in `src/assets/images/`.

That is all. No code change is needed. The site finds the file by its name,
replaces the stand-in block, and makes smaller copies in modern formats for
phones and slow connections when it builds.

The list of shots the homepage uses, with the description read out to people
who cannot see the picture, is in `src/data/shots.ts`. If an important part of
a picture gets cropped, set `focus` for that shot (for example `'40% 50%'`
means "keep the area 40% from the left, halfway down").

## The opening film

The film is shown as a row of still frames, so that scrolling can play it
forwards and backwards. Two sets are needed:

| Set     | Frames | Size       | Folder                       | Target weight |
| ------- | ------ | ---------- | ---------------------------- | ------------- |
| Desktop | 150    | 1600 x 900 | `public/frames/hero/desktop` | under 6 MB    |
| Phone   | 60     | 720 x 1280 | `public/frames/hero/mobile`  | under 2 MB    |

Frames are named `0001.webp`, `0002.webp` and so on.

To make them from an 8 second film file with the free tool `ffmpeg`:

```bash
# Remove the stand-in frames first.
rm -rf public/frames/hero

mkdir -p public/frames/hero/desktop public/frames/hero/mobile

# Desktop: 150 frames, wide.
ffmpeg -i film.mp4 -vf "fps=150/8,scale=1600:900" \
  -c:v libwebp -quality 72 public/frames/hero/desktop/%04d.webp

# Phone: 60 frames, cut to an upright shape from the middle of the picture.
ffmpeg -i film.mp4 -vf "fps=60/8,crop=ih*9/16:ih,scale=720:1280" \
  -c:v libwebp -quality 72 public/frames/hero/mobile/%04d.webp
```

Then open `.gitignore` and delete the last line (`public/frames`), so the real
frames are saved with the project.

If the film has a different number of frames, change `count` in
`src/data/frame-sequences.json` to match.

### About the stand-in frames

Until the real film exists, `npm run placeholders` draws a simple sketch for
every frame. It runs by itself before `npm run dev` and `npm run build`. It
leaves a small marker file in each folder it fills, and it never touches a
folder that holds frames without that marker. So real frames are safe.
