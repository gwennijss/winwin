# Win Win

The Win Win logo animation and the motion system built on it, made with GSAP in Next.js.

```bash
pnpm install
pnpm dev
```

- `/` — the main lockup animation, with playback controls for reviewing it (space: play/pause, arrow keys: one frame, `h`: hide the controls).
- `/varianten` — eight other ways of playing with "WIN, something, WIN". Each one is defined in `src/components/variants/variants.ts`.
- `/system` — how the same motion carries through a site: loaders, navigation and buttons, the format window and a page transition.
- `/labels` — labels for social posts: a violet square with the logo's diamond and a box with a word.
- `/case` — text over a portrait case video: the label as the tab of a text panel, with the choices still open (how the label's text arrives, typefaces, panel colour) to switch between.

The "Licht" / "Donker" switch in the top right shows everything on a light or a dark ground.

The labels and the case page use Trabat Display, a commercial typeface that is not in this repository. Put the files in `src/app/fonts` first; see the note in that folder.

To show pictures inside the block, put image files in `public/media`; see the note in that folder.

## Where to change things

Everything lives in `src/components/winwin-logo`:

- `geometry.ts` — the shapes the block takes on and the space around them.
- `motion.ts` — the easing curves shared by the logo and the site.
- `timeline.ts` — the order of the shapes, the rhythm (everything starts and ends on a count of a quarter of a second) and the character of each move.
- `Lockup.tsx` — draws the words and the block. Each word is one solid object that takes its place from the block. `Mark.tsx` draws the block on its own.

The letter shapes in `src/assets/logo` are the vectors from Figma, unchanged.
