# Win Win motion

Social animations in the Win Win house style, rendered frame by frame from an
HTML page to MP4.

## cube-post (Instagram 4:5, 1080×1350, 20 s loop)

The background is one flat colour. The words stand on the sides of an unseen
cube as wide as the post, and the block in the middle is a cube of its own
with a creator video on each side. Every two seconds the two turn a quarter
together, as one: same moment, same speed, same camera. Halfway through the
turn the whole background changes colour. The violet scene carries the name
(WIN, the block, WIN); the dark scene carries the claim, with a smaller
block, because the words need the room there. All words are in Trabat.

Everything that is meant to be changed is in `cube-post/config.js`: the clips
(file, start second, crop), the claim (and whether it is in capitals), the small print under the block, the colours, the sizes and the
timing.

## reel-post (Instagram 4:5, 1080×1350, 10 s loop)

A reel that runs from top to bottom: a word, a creator video, a word, a
video, and so on, so every video stands between two words (Gezien, Gedeeld,
Gekocht) and shares them with its neighbours. It jumps from one video to
another in quick steps, one on, two on, one back, with quick flicks taking
turns with longer rests. The reel is wrapped round a drum, so whatever nears
the top or bottom edge gets smaller, and on every jump (the BURST of the logo
animation) the whole thing draws back, blurs and springs forward again. The
ground is light with dark words in Trabat Condensed; on the clips marked
`flash` it turns violet.

In `reel-post/config.js`: the clips, the words, the small print in the
margins, the sizes and the rhythm (`STEPS`: how long to rest on a video and
how many videos to jump).

## split-post (Instagram 4:5, 1080×1350, 10 s loop)

Four scenes of 2.5 s, each one flat colour with two blocks of words in
opposite corners ("Waar content / campagne wordt") and a creator video wedged
between them: centred across, it reaches into the last upper line and the
first lower one, and the words lie on top, as in the reference. The words are
as large as the longest line allows. Towards the end of a scene every line
slides towards the middle, faster and faster and with motion blur, and the
video draws in; at full speed, with every line centred, it cuts to the next
scene, which opens out from the middle and settles while the picture inside
the video eases back. The small print stays put. Every scene has its own
colour and its own upright social format (3:4, 9:16, 4:5, 2:3), and the sides
swap from one scene to the next.

In `split-post/config.js`: the scenes (words, colours, format, clip with its
crop and zoom), how far the video reaches into the words, the small print and
the timing (`rate`: how snappy the slide is; `converge`: how far towards the
middle; `blur`: the motion blur). Clips are cut at 1080 wide (`FRAME_WIDTH`).

## billboard-post (Instagram 4:5, 1080×1350, 11 s loop)

A billboard on a wall, seen from across the street. It starts as nothing but
words: JOUW MERK. HUN FEED. WIN WIN. Then each line is pushed open, as the
two WINs are by the block in the logo, and a creator video shows in a lying
bar in the gap, until every line runs from edge to edge. The gap is
somewhere else on every line (at the end, at the start, between two words).
The gaps close and open again in other places with other videos. To end,
the upper lines leave and the last line becomes the logo: WIN, the diamond,
WIN, as large as the board; then it all comes back for the loop. Every line
is set in the same size, so the shorter the line, the wider its bar. The
street (wall, canopy lights, pavement) is drawn in CSS; the camera moves in
slowly.

The footage is upright and the widest bar shows only a seventh of its
height, so the clips are moments that fit a strip: people who are small in
the picture, a head and shoulders with room around it, a wide view, a table.

In `billboard-post/config.js`: the lines, where each line opens, the clips
and their crop, the board's size and colours, the logo ending, the camera
and the timing.

## Use

`<post>` is the post's folder: `cube-post`, `reel-post`, `split-post` or
`billboard-post`.

```bash
pnpm install
pnpm prepare-media <post> --source <folder with the creator .mp4 files>
pnpm preview                             # http://localhost:4321/<post>/?play
pnpm render <post>                       # out/<post>.mp4
pnpm render <post> --stills 0:4:0.25     # out/stills/*.png, to check moments
node scripts/sheet.mjs                   # out/sheet.jpg, the stills side by side
```

`prepare-media` cuts each clip from its source video (by default from
`media/source`) and copies Trabat Display from `~/Library/Fonts`.

Footage, frames, renders and the Trabat files stay out of git (see
`.gitignore`): the repository is public.
