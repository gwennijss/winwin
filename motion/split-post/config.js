/**
 * Win Win — split post (Instagram 4:5).
 *
 * One flat colour, two blocks of words in opposite corners and a creator
 * video in the middle, wedged between them: it reaches into the last line of
 * the upper words and the first line of the lower ones, and the words lie on
 * top. At the end of a scene every line slides towards the middle, faster
 * and faster, and the video draws in; at full speed, with every line
 * centred, it cuts to the next scene, which opens out from the middle and
 * settles. Every scene has its own colour and its own social format for the
 * video, and the layout swaps sides from one scene to the next.
 *
 * Everything that is meant to be swapped lives in this file.
 */

export const CANVAS = { width: 1080, height: 1350 };
export const FPS = 30;

/** Width the clips are cut at, so the video stays sharp at its size here. */
export const FRAME_WIDTH = 1080;

/** One count of the Win Win rhythm, in seconds (as in the logo animation). */
export const BEAT = 0.25;

export const TIMING = {
  /** Time on each scene, from cut to cut. */
  scene: 10 * BEAT,
  /**
   * How quickly the slide fades out after a cut and builds up before one, per
   * second (measured from the reference). At 4.6 a scene is still for about
   * a second.
   */
  rate: 4.6,
  /** Share of the way to the middle the big words have come at a cut: 1 = centred. */
  converge: 1,
  /** The same for the small print. At 0 it stays put, a still frame round the motion, and never crosses the words. */
  convergeSmall: 0,
  /** Motion blur on the sliding words, as a share of how far they move in a frame. 0 = none. */
  blur: 0.24,
  /** How much smaller the video comes in after a cut (0.2 = at 80 %), and how much it draws in before one. */
  videoIn: 0.2,
  videoOut: 0.1,
  /** How much closer the picture inside the video starts after a cut, so it settles back as the frame opens. */
  zoomIn: 0.14,
};

/** Win Win colours (from the label palette). */
export const COLOURS = {
  violet: "#593CFF",
  dark: "#252526",
  light: "#F3F6FF",
  violetDark: "#1D0F66",
  violetLight: "#C9C0FF",
};

/** Social formats for the video, width : height. All upright, so each fills the room between the words. */
export const FORMATS = {
  "9:16": 9 / 16, // TikTok, Reels, Stories
  "2:3": 2 / 3, // Pinterest
  "3:4": 3 / 4, // Instagram grid
  "4:5": 4 / 5, // Instagram feed
};

/**
 * The scenes, in order. Keep the count even, so the sides keep swapping
 * across the loop. `clip.start` is the second in the source video where the
 * clip begins; `clip.focus` is where the crop sits vertically (0 = top,
 * 1 = bottom), and `clip.zoom` how far it is cropped in. Both are chosen so
 * subtitles burnt into the footage fall outside it.
 */
export const SCENES = [
  {
    top: ["Waar", "content"],
    bottom: ["campagne", "wordt"],
    background: COLOURS.violet,
    ink: COLOURS.light,
    format: "3:4",
    clip: { file: "kka_annabel-jansen_tiktok.mp4", creator: "Annabel Jansen", brand: "KKA", start: 9.0, focus: 0.3, zoom: 1 },
  },
  {
    top: ["Waar", "scrollen"],
    bottom: ["kopen", "wordt"],
    background: COLOURS.light,
    ink: COLOURS.dark,
    format: "9:16",
    clip: { file: "de-kuyper_may_instagram.mp4", creator: "May", brand: "De Kuyper", start: 1.2, focus: 0.5, zoom: 1 },
  },
  {
    top: ["Waar", "bereik"],
    bottom: ["omzet", "wordt"],
    background: COLOURS.dark,
    ink: COLOURS.light,
    format: "4:5",
    clip: { file: "one-institute_chloe_tiktok.mp4", creator: "Chloe", brand: "ONE Institute", start: 23.6, focus: 0.45, zoom: 1.5 },
  },
  {
    top: ["Waar", "viral"],
    bottom: ["normaal", "wordt"],
    background: COLOURS.light,
    ink: COLOURS.violet,
    format: "2:3",
    clip: { file: "socialdeal_midas-de-lange_tiktok.mp4", creator: "Midas de Lange", brand: "Social Deal", start: 17.2, focus: 0.25, zoom: 1.2 },
  },
];

/**
 * The words are as large as the longest line in any scene allows, so the size
 * is the same in every scene.
 */
export const TYPE = {
  /** Distance from one baseline to the next, as a share of the size (as in the reference). */
  leading: 0.84,
  /** In capitals or as written. Win Win sets its words as written. */
  caps: false,
};

export const LAYOUT = {
  /** Room between the edge of the post and the words. */
  margin: 40,
  /**
   * How far the video reaches into the line above and the line below, as a
   * share of the height of the small letters (of the capitals, if the words
   * are in capitals; about 0.3 in the reference).
   */
  overlap: 0.3,
};

/** The small print in the two corners the words leave free: two lines each, in Hanken Grotesk. */
export const SMALL = {
  top: ["Win Win", "Micromarketing"],
  bottom: ["Creators en merken", "winnen allebei"],
  size: 23,
};

/** Background darkening towards the bottom, 0 = one flat colour. */
export const SHADE = 0;

/** The clips, in scene order (used by prepare-media). */
export const CLIPS = SCENES.map((scene) => scene.clip);

/** Seconds of footage cut per clip: a scene and a little to spare. */
export const CLIP_SECONDS = TIMING.scene + 0.1;

/** Short id for a clip's frame folder. */
export const clipId = (clip) => clip.file.replace(/\.[^.]+$/, "");
