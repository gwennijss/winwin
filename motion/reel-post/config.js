/**
 * Win Win — reel post (Instagram 4:5).
 *
 * A reel that runs from top to bottom: a word, a creator video, a word, a
 * video, and so on, so that every video stands between two words and shares
 * them with its neighbours. It jumps from one video to another in quick
 * steps, now one on, now two, now one back; quick flicks take turns with
 * longer rests. The reel is wrapped round a drum, so whatever nears the top
 * or the bottom edge gets smaller, and on every jump the whole thing draws
 * back, blurs and springs forward again. The ground is light with dark
 * words; on a few videos it flashes violet.
 *
 * Everything that is meant to be swapped lives in this file.
 */

export const CANVAS = { width: 1080, height: 1350 };
export const FPS = 30;

/** One count of the Win Win rhythm, in seconds (as in the logo animation). */
export const BEAT = 0.25;

/** Win Win colours (from the label palette). */
export const COLOURS = {
  violet: "#593CFF",
  dark: "#252526",
  light: "#F3F6FF",
  violetDark: "#1D0F66",
  violetLight: "#C9C0FF",
};

/** The looks the post can take. A clip marked `flash` gets the second. */
export const SCENES = {
  base: { background: COLOURS.light, ink: COLOURS.dark },
  flash: { background: COLOURS.violet, ink: COLOURS.light },
};

/**
 * The words between the videos, in turn down the reel: what creator content
 * gets done. Keep them short; they are set as large as the longest allows.
 */
export const WORDS = ["Gezien", "Gedeeld", "Gekocht"];

/** Small print in the margins, left and right of the video. */
export const CAPTION = {
  left: ["Creator", "content"],
  right: ["Door", "Win Win"],
};

/** Sizes as seen when the reel rests on a video, in pixels. */
export const REEL = {
  /** The video: an upright 2:3, half the post's width. */
  video: { width: 540, height: 780 },
  /** Height of a capital letter in the words above and below the video. */
  capHeight: 176,
  /** Room between the video and the ink of the words, above and below alike. */
  gap: 46,
  /** The widest a word may be; the letters get smaller if one is wider. */
  maxWordWidth: 1000,
  /** Radius of the drum the reel is wrapped round: smaller bends it more. */
  radius: 760,
  /** How far everything draws back on a jump, as a share of its size. */
  zoomOut: 0.17,
  /** Seconds it takes to spring forward and come to rest after landing. */
  settle: 0.3,
  /** Motion blur at full speed, in pixels, and the speed (videos a second) that counts as full. */
  blur: 30,
  blurSpeed: 9,
  /** Soft focus while drawn back, in pixels. */
  soften: 1.8,
};

/** A jump takes this many counts, however far it goes: a quarter of a second. */
export const JUMP_BEATS = 1;

/**
 * The rhythm: rest on a video for `hold` counts, then jump `jump` videos on
 * (or back, when negative). Quick flicks of half a count take turns with
 * longer rests, like a reel being spun and caught. The jumps must add up to
 * a multiple of the number of clips, so the loop ends where it began.
 */
export const STEPS = [
  { hold: 3, jump: 1 },
  { hold: 1, jump: 1 },
  { hold: 0.5, jump: 1 },
  { hold: 2, jump: 2 },
  { hold: 0.5, jump: -1 },
  { hold: 0.5, jump: 2 },
  { hold: 2.5, jump: 1 },
  { hold: 0.5, jump: 1 },
  { hold: 1, jump: 2 },
  { hold: 0.5, jump: -1 },
  { hold: 2, jump: 2 },
  { hold: 0.5, jump: 1 },
  { hold: 0.5, jump: 1 },
  { hold: 2.5, jump: 2 },
  { hold: 0.5, jump: -1 },
  { hold: 1, jump: 2 },
  { hold: 0.5, jump: 1 },
  { hold: 2.5, jump: 1 },
];

/**
 * The clips, in the order they stand on the reel. `start` is the second in
 * the source video where the clip begins. The video is shown zoomed in;
 * `focus` is where the crop sits vertically, 0 = top, 1 = bottom, chosen so
 * that subtitles burnt into the footage fall outside it. `flash: true` turns
 * the ground violet while the reel is on that clip. Keep the count a
 * multiple of the number of words.
 */
export const CLIPS = [
  { file: "de-kuyper_alexandra-jue_instagram.mp4", start: 37.6, focus: 0.15 },
  { file: "kka_leticia_tiktok.mp4", start: 11.6, focus: 0.75 },
  { file: "socialdeal_annabel-jansen_tiktok.mp4", start: 0.3, focus: 0.1 },
  { file: "de-kuyper_charmaine-gemin_instagram.mp4", start: 0.2, focus: 0.2, flash: true },
  { file: "socialdeal_parel-jansen_tiktok.mp4", start: 13.3, focus: 0.2 },
  { file: "de-kuyper_annabel-jansen_instagram.mp4", start: 11.3, focus: 0.5 },
  { file: "socialdeal_larissa-borgs_tiktok.mp4", start: 16.3, focus: 0.2 },
  { file: "de-kuyper_cassidy-jansen_instagram.mp4", start: 0.0, focus: 0.1, flash: true },
  { file: "socialdeal_anouk-jansen_tiktok.mp4", start: 0.2, focus: 0.0 },
];

/** Seconds of footage cut per clip. */
export const CLIP_SECONDS = 2.5;

/** Short id for a clip's frame folder. */
export const clipId = (clip) => clip.file.replace(/\.[^.]+$/, "");
