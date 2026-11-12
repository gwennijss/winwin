/**
 * Win Win — billboard post (Instagram 4:5).
 *
 * A billboard on a wall, seen from across the street. It starts as nothing
 * but words: JOUW MERK. HUN FEED. WIN WIN. Then each line is pushed open, as
 * the two WINs are by the block in the logo, and a creator video shows in a
 * lying bar in the gap, until every line runs from edge to edge. The gap is
 * somewhere else on every line. The gaps close and open again in other
 * places with other videos. To end, the upper lines leave and the last line
 * becomes the logo: WIN, the diamond, WIN, as large as the board. Then it
 * all comes back for the loop. Meanwhile the camera moves in slowly.
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

/** The billboard, in pixels on the post. */
export const BOARD = {
  left: 40,
  top: 350,
  width: 1000,
  /** Room between the edge of the board and the words. */
  padding: 38,
  /** Room between two lines. */
  lineGap: 34,
  background: COLOURS.violet,
  ink: COLOURS.light,
  /** Sets the words in capitals. */
  caps: true,
  /**
   * How wide the gap in the longest line opens, in letter heights. It sets
   * the size of the letters, which is the same on every line; the shorter
   * lines open wider, so that every line ends up as wide as the board.
   */
  narrowestGap: 1.4,
  /** Room between a video and the words next to it, in letter heights, as round the block in the logo. */
  breathing: 0.16,
};

/**
 * The logo the last line ends as: the block as a diamond between the two
 * words. Sizes in letter heights, from the logo as drawn.
 */
export const LOGO = {
  /** Side of the diamond. */
  side: 0.641,
  /** Room between the diamond's points and the words. */
  gap: 0.2,
  /** How far the diamond turns to land on its point. */
  turn: 135,
  /** The tallest the letters may get, as a share of the board's height. */
  maxHeight: 0.46,
};

/**
 * The lines, top to bottom.
 *
 * `opens` says where the line opens, first time and second time round, as
 * the words before the gap and the words after it: ["Jouw merk.", ""] puts
 * the video at the end of the line, ["", "Hun feed."] at the start, ["Win",
 * "Win"] between the two words.
 *
 * `clips` are the videos that show in the gap, first and second time:
 * `start` is the second in the source video, `focus` where the strip that
 * is shown sits in the picture, 0 = top, 1 = bottom.
 *
 * The shorter the line, the wider its bar, and creator footage is upright:
 * the bar in the top line shows two fifths of the picture's height, the one
 * in the middle a fifth, the one in WIN WIN a seventh. So pick moments that
 * fit such a strip for four seconds. A head and shoulders fits the top
 * line; the wide bars want people who are small in the picture, a view, a
 * table. A face that fills the frame gets cut in half.
 */
export const LINES = [
  {
    text: "Jouw merk.",
    opens: [
      ["Jouw merk.", ""],
      ["", "Jouw merk."],
    ],
    clips: [
      { file: "luminair_isabelle-van-den-broek_tiktok.mp4", start: 12.0, focus: 0.42 },
      { file: "kka_annabel-jansen_tiktok.mp4", start: 4.2, focus: 0.25 },
    ],
  },
  {
    text: "Hun feed.",
    opens: [
      ["", "Hun feed."],
      ["Hun feed.", ""],
    ],
    clips: [
      { file: "de-kuyper_charmaine-gemin_instagram.mp4", start: 21.6, focus: 0.52 },
      { file: "de-kuyper_cassidy-jansen_instagram.mp4", start: 12.8, focus: 0.5 },
    ],
  },
  {
    text: "Win Win",
    /** This line ends as the logo. */
    logo: true,
    opens: [
      ["Win", "Win"],
      ["Win", "Win"],
    ],
    clips: [
      { file: "socialdeal_isabel-de-grave_tiktok.mp4", start: 17.2, focus: 0.45 },
      { file: "socialdeal_midas-de-lange_tiktok.mp4", start: 9.2, focus: 0.3 },
    ],
  },
];

/** When things happen, in counts. */
export const TIMING = {
  /** Nothing but words to begin with. */
  closed: 3,
  /** Each line starts this long after the one above it. */
  stagger: 1,
  /** A gap opens in this long, a little too far and back. */
  open: 3,
  /** The first videos stay this long, counted from when the first line opens. */
  firstHold: 12,
  /** A gap closes in this long. */
  close: 2,
  /** Closed for this long before it opens somewhere else. */
  pause: 0.5,
  /** The second videos stay this long, counted from when the first line reopens. */
  secondHold: 12,
  /** The upper lines leave in this long, one half a count after the other. */
  leave: 2.5,
  /** The last line turns into the logo in this long, starting a count after the first line leaves. */
  logo: 4,
  /** The logo stands this long. */
  logoHold: 6,
  /** Everything comes back in this long. */
  back: 3,
  /** The whole loop. */
  loop: 44,
};

/** The camera moves in from the first size to the second over the loop, and back at the end. */
export const CAMERA = { from: 1.02, to: 1.085 };

/** Seconds of footage cut per clip. */
export const CLIP_SECONDS = 4.5;

/** Every clip, for cutting the footage. */
export const CLIPS = LINES.flatMap((line) => line.clips);

/** Short id for a clip's frame folder. */
export const clipId = (clip) => clip.file.replace(/\.[^.]+$/, "");
