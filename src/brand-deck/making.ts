/**
 * The making of the logo, as shapes that can turn into each other.
 *
 * The letters W, I and N are drawn with straight lines only, in Helvetica as
 * much as in the logo. So every stage of the logo is the same three outlines
 * with their corners in other places: the same number of corners, in the
 * same order. Going from one stage to the next is moving the corners.
 *
 * All sizes are in the units of the logo's own drawing, where a letter is
 * 106.84 tall.
 */

export type Point = [number, number];
/** The three letters of one word, each an outline. */
export type Word = { W: Point[]; I: Point[]; N: Point[] };

/** The height of a capital. */
export const CAP = 106.84;

/**
 * The logo before its corners were rounded, as drawn in Figma (the group
 * "WIN WIN" next to the board): Helvetica made heavier and tighter.
 */
export const SHARP: Word = {
  W: [
    [133.2, 0.05],
    [162.67, 0.07],
    [131.58, 106.86],
    [102.23, 106.78],
    [81.57, 42.85],
    [60.72, 106.81],
    [32.07, 106.79],
    [0, 0.1],
    [29.44, 0.02],
    [48.18, 69.18],
    [69.22, 0.03],
    [93.46, 0.1],
    [114.56, 69.76],
  ],
  N: [
    [318.97, 106.81],
    [293.45, 106.81],
    [243.03, 41.3],
    [242.92, 106.83],
    [214.49, 106.82],
    [214.49, 0.1],
    [244.6, 0.05],
    [290.3, 59.7],
    [290.53, 0],
    [318.97, 0.07],
  ],
  I: [
    [199.69, 106.76],
    [170.47, 106.84],
    [170.47, 0.07],
    [199.68, 0.02],
  ],
};

/** How wide the sharp word is, and the rounded one of the finished logo. */
export const SHARP_WIDTH = 318.97;

/**
 * The same word in plain Helvetica, the regular weight: where its corners
 * are when the word is set at the logo's height. Measured from the typeface
 * (2048 units to the em, capitals 1469 high), corner for corner in the order
 * of the outlines above.
 */
const EM = CAP / 1469;
const helvetica = (points: [number, number][], shift: number): Point[] =>
  points.map(([x, y]) => [(x + shift) * EM, (1469 - y) * EM]);

/** Where each letter starts in the word "WIN", in the typeface's units. */
const ADVANCE = { W: 0, I: 1933, N: 1933 + 569 };

export const REGULAR: Word = {
  W: helvetica(
    [
      [1687, 1469],
      [1905, 1469],
      [1519, 0],
      [1310, 0],
      [971, 1218],
      [630, 0],
      [421, 0],
      [37, 1469],
      [253, 1469],
      [530, 274],
      [862, 1469],
      [1078, 1469],
      [1410, 274],
    ],
    ADVANCE.W - 37,
  ),
  N: helvetica(
    [
      [1322, 0],
      [1099, 0],
      [346, 1189],
      [346, 0],
      [156, 0],
      [156, 1469],
      [391, 1469],
      [1133, 279],
      [1133, 1469],
      [1322, 1469],
    ],
    ADVANCE.N - 37,
  ),
  I: helvetica(
    [
      [402, 0],
      [201, 0],
      [201, 1469],
      [402, 1469],
    ],
    ADVANCE.I - 37,
  ),
};

/** How wide the plain word is, from the left of the W to the right of the N. */
export const REGULAR_WIDTH = (ADVANCE.N + 1322 - 37) * EM;
/** The space between two words in the plain typeface. */
export const REGULAR_SPACE = (569 + 37 + 156) * EM;
/** Where the typing line stands after each letter of the plain word. */
export const CARET = [0, (ADVANCE.I + 90 - 37) * EM, (ADVANCE.N + 60 - 37) * EM, REGULAR_WIDTH + 12];

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** A word part of the way between two others: 0 is the first, 1 the second. */
export function between(a: Word, b: Word, t: number): Word {
  const part = (p: Point[], q: Point[]): Point[] => p.map(([x, y], i) => [mix(x, q[i][0], t), mix(y, q[i][1], t)]);
  return { W: part(a.W, b.W), I: part(a.I, b.I), N: part(a.N, b.N) };
}

/**
 * An outline as a path, with every corner rounded to a radius: outward
 * corners and inward ones alike, as a corner radius does on a vector in
 * Figma. A radius of 0 gives the sharp outline.
 */
export function outline(points: Point[], radius: number, dx = 0): string {
  const n = points.length;
  if (!n) return "";
  const f = (v: number) => v.toFixed(2);
  if (radius <= 0.01) {
    return points.map(([x, y], i) => `${i ? "L" : "M"}${f(x + dx)} ${f(y)}`).join("") + "Z";
  }
  let d = "";
  for (let i = 0; i < n; i++) {
    const [px, py] = points[(i + n - 1) % n];
    const [x, y] = points[i];
    const [nx, ny] = points[(i + 1) % n];
    const inLen = Math.hypot(x - px, y - py);
    const outLen = Math.hypot(nx - x, ny - y);
    const ux = (px - x) / inLen;
    const uy = (py - y) / inLen;
    const vx = (nx - x) / outLen;
    const vy = (ny - y) / outLen;
    // The angle inside the corner, and how far from it the curve starts.
    const angle = Math.acos(Math.max(-1, Math.min(1, ux * vx + uy * vy)));
    const reach = Math.min(radius / Math.tan(angle / 2), inLen / 2, outLen / 2);
    const r = reach * Math.tan(angle / 2);
    const sweep = ux * vy - uy * vx < 0 ? 1 : 0;
    d += `${i ? "L" : "M"}${f(x + ux * reach + dx)} ${f(y + uy * reach)}`;
    d += `A${f(r)} ${f(r)} 0 0 ${sweep} ${f(x + vx * reach + dx)} ${f(y + vy * reach)}`;
  }
  return d + "Z";
}

/** The three letters of a word as one path. `tuck` moves the I and the N to the left. */
export function wordPath(word: Word, radius: number, dx = 0, tuck = 0): string {
  return outline(word.W, radius, dx) + outline(word.I, radius, dx - tuck) + outline(word.N, radius, dx - tuck);
}
