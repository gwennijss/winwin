/**
 * Win Win — cube post (Instagram 4:5).
 *
 * The background is one flat colour. The words stand on the sides of an
 * unseen cube as wide as the post, and in the middle the block from the logo
 * is a cube of its own with a creator video on each side. Every two seconds
 * the two turn a quarter together, as one: same moment, same speed. Halfway
 * through the turn the whole background changes colour. The scenes take
 * turns: a violet one with the name (WIN, the block, WIN) and a dark one
 * with the claim.
 *
 * Everything that is meant to be swapped lives in this file.
 */

export const CANVAS = { width: 1080, height: 1350 };
export const FPS = 30;

/** One count of the Win Win rhythm, in seconds (as in the logo animation). */
export const BEAT = 0.25;

export const TIMING = {
  /** Time on each scene, turn included. */
  period: 8 * BEAT,
  /** The turn, of the words and the block alike. */
  turn: 3 * BEAT,
};

/** Win Win colours (from the label palette). */
export const COLOURS = {
  violet: "#593CFF",
  dark: "#252526",
  light: "#F3F6FF",
  violetDark: "#1D0F66",
  violetLight: "#C9C0FF",
};

/**
 * The two scenes, in turn. The words are set in Trabat as large as the post's
 * width and the room around the block allow.
 */
export const SCENES = {
  logo: {
    background: COLOURS.violet,
    ink: COLOURS.light,
    top: ["Win"],
    bottom: ["Win"],
    /** In capitals the name runs from edge to edge, like the logo. */
    caps: true,
    /** Side of the block, in pixels. */
    block: 460,
    /** Small print under the block: two lines left, two lines right. */
    caption: {
      left: ["Micromarketing", "met creators"],
      right: ["Het product", "is de campagne"],
    },
  },
  claim: {
    background: COLOURS.dark,
    ink: COLOURS.light,
    /** The lower words fade into the lighter violet, as if lit from above. */
    inkBottom: COLOURS.violetLight,
    top: ["Creators", "winnen."],
    bottom: ["Merken", "winnen."],
    caps: false,
    block: 364,
  },
};

export const LAYOUT = {
  /** Room above the top words and below the bottom ones. */
  margin: 34,
  /** The widest the words may be: nearly the full post. */
  titleWidth: 1012,
  /** Distance from one line to the next, as a share of the letter height. */
  leading: 1.12,
  /** Room between the words and the block. */
  padding: 36,
  /** Room between the block and the small print under it, if a scene has any. */
  captionGap: 16,
};

/**
 * The clips, one per scene, in order. `start` is the second in the source
 * video where the clip begins; each clip runs for 2.75 seconds.
 * `focus` is where the square crop sits vertically, 0 = top, 1 = bottom. It
 * is chosen so that subtitles burnt into the footage fall outside the block.
 * Keep the count even, so the two scenes keep taking turns.
 */
export const CLIPS = [
  { file: "de-kuyper_may_instagram.mp4", start: 11.1, focus: 0.35 },
  { file: "one-institute_julia-solee_tiktok.mp4", start: 25.8, focus: 0.24 },
  { file: "kka_annabel-jansen_tiktok.mp4", start: 4.2, focus: 0.4 },
  { file: "socialdeal_midas-de-lange_tiktok.mp4", start: 9.2, focus: 0.3 },
  { file: "luminair_charissa-bellamore_tiktok.mp4", start: 14.0, focus: 0.33 },
  { file: "de-kuyper_anton-hoynck-van-papendrecht_instagram.mp4", start: 59.5, focus: 0.2 },
  { file: "socialdeal_isabel-de-grave_tiktok.mp4", start: 15.9, focus: 0.36 },
  { file: "kka_parel-jansen_tiktok.mp4", start: 4.5, focus: 0.78 },
  { file: "one-institute_amaya-ogbondah_instagram.mp4", start: 9.6, focus: 0.27 },
  { file: "luminair_isabelle-van-den-broek_tiktok.mp4", start: 12.0, focus: 0.35 },
];

/** Seconds of footage cut per clip: a full period plus half a turn either side. */
export const CLIP_SECONDS = TIMING.period + TIMING.turn;

/** Short id for a clip's frame folder. */
export const clipId = (clip) => clip.file.replace(/\.[^.]+$/, "");
