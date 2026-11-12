/**
 * Geometry of the Win Win lockup: two "WIN" words with a block between them
 * that takes on different shapes. Units are those of the logo vectors from
 * Figma, where one word is 317.46 wide and 106.84 tall.
 */

/** Size of one "WIN" word. */
export const WORD = { width: 317.46, height: 106.84 } as const;

/** Drawing area: fits the widest and the tallest shape the block takes on. */
export const VIEW = { width: 1000, height: 240 } as const;

/**
 * The block sits slightly right of the exact middle between the two words.
 * It balances the upright stem of the N against the slanted start of the W.
 * Taken from the logo as drawn in Figma.
 */
export const BLOCK_OFFSET_X = 4.88;

/** Corner radius of the block, as on the logo mark in Figma. */
export const BLOCK_RADIUS = 2.29;

export type Shape = {
  /** Block width. */
  w: number;
  /** Block height. */
  h: number;
  /** Block rotation in degrees. */
  rot: number;
};

/** A shape plus everything else that decides how the lockup looks. */
export type Pose = Shape & {
  /** Average space between the block and each word. */
  gap: number;
  /**
   * How wide the block counts as for the words. Left out, it follows the
   * block's real width as it turns. Set, it lets the block spin freely while
   * the words keep moving in one calm line.
   */
  reach?: number;
};

/**
 * The shapes the block moves through, with the sizes and the spacing they
 * have on the Figma board. The exceptions are the two upright formats: the
 * portrait is drawn a fifth larger so that it also pushes the words aside,
 * and the 4:5 post, which is not on the board, takes its width from it.
 */
export const STATES = {
  /** The logo itself. */
  diamond: { w: 68.49, h: 68.49, rot: 45, gap: 21.23 },
  /** Square, as tall as the letters. */
  square: { w: 106, h: 106, rot: 0, gap: 26.66 },
  /** Portrait: 106 by 198 on the board, scaled up by a fifth. */
  portrait: { w: 127.2, h: 237.6, rot: 0, gap: 36.66 },
  /** Landscape, as tall as the letters. */
  landscape: { w: 258, h: 106, rot: 0, gap: 31.16 },
  /** A standard social post, 4:5, as wide as the portrait. */
  post: { w: 127.2, h: 159, rot: 0, gap: 36.66 },
} as const satisfies Record<string, Pose>;

export type StateName = keyof typeof STATES;

/**
 * Pictures to show inside the block, one per shape: the address of an image
 * for each shape that has one. A shape without a picture stays plain.
 */
export type Media = Partial<Record<StateName, string>>;

/** How visible each picture is: 0 is hidden, 1 is fully shown. */
export type Screen = Partial<Record<StateName, number>>;

/** The state the logo rests in, and the one the loop starts and ends on. */
export const HOME: StateName = "diamond";

/**
 * How much room a shape takes up sideways, taking its rotation into account.
 *
 * This is deliberately not the exact width of the turned shape: that width
 * changes direction abruptly every quarter turn, which would make the words
 * stutter as they follow it. This version is exact whenever the shape is
 * upright, on its side or at 45 degrees, and changes smoothly in between.
 */
export function extent(shape: Shape): number {
  const angle = (shape.rot * Math.PI) / 180;
  const across = shape.w * Math.cos(angle);
  const along = shape.h * Math.sin(angle);
  const corners = shape.w * shape.h * Math.sin(2 * angle) ** 2;
  return Math.sqrt(across * across + along * along + corners);
}

/** Distance between the two words for a pose. */
export function wordDistance(pose: Pose): number {
  return (pose.reach ?? extent(pose)) + 2 * pose.gap;
}

/** Width of the whole lockup when it rests in a pose. */
export function lockupWidth(pose: Pose): number {
  return 2 * WORD.width + wordDistance(pose);
}

/**
 * Shapes for the mark on its own, in a box of 100 by 100: the same five as in
 * the logo, with the same proportions, sized to sit well in a small space.
 * `bud` is the diamond as it first appears, and `none` is no mark at all.
 */
export const MARK_SHAPES = {
  diamond: { w: STATES.diamond.w, h: STATES.diamond.h, rot: 45 },
  square: { w: 74, h: 74, rot: 0 },
  portrait: { w: 52, h: 97, rot: 0 },
  landscape: { w: 100, h: 41, rot: 0 },
  post: { w: 66, h: 82, rot: 0 },
  bud: { w: 36, h: 36, rot: 45 },
  none: { w: 0, h: 0, rot: 0 },
} as const satisfies Record<string, Shape>;
