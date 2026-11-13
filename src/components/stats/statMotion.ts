import gsap from "gsap";
import { BEAT } from "../winwin-logo/timeline";

/** A number of counts, in seconds. */
const counts = (n: number) => n * BEAT;

/** The ways one result can make way for the next, to compare on the stats page. */
export const STAT_MOTIONS = [
  {
    key: "roll",
    name: "Rollen",
    note: "Zoals in het voorbeeld: in elke kolom rolt het oude teken omhoog weg met het nieuwe er direct achteraan, kolom na kolom van links naar rechts.",
  },
  {
    key: "count",
    name: "Teller",
    note: "Elk cijfer draait als een kilometerteller door tot het op zijn getal staat. De rechter cijfers draaien het langst.",
  },
  {
    key: "decode",
    name: "Ontcijferen",
    note: "Elk teken is eerst een wisselend, vaag cijfer en klikt van links naar rechts vast op het echte getal.",
  },
  {
    key: "block",
    name: "Blok",
    note: "Een paars vlak schuift van links over het getal, het getal wisselt eronder, en het vlak schuift er rechts weer af.",
  },
] as const;

export type StatMotion = (typeof STAT_MOTIONS)[number]["key"];

/** How long one result has the screen, in counts. */
export const STAT_COUNTS = 11;

/** How many digits a digit in the counter passes before it lands on its own. */
export const counterRun = (digit: number) => 7 + 3 * digit;

/**
 * How far a glyph has to move to be out of sight, as a percentage of its own
 * height. The edge it moves behind is the height of a capital, but leaves
 * room under the baseline for the tail of a comma, and a per cent sign stands a
 * little taller than a capital, so it takes half as much again either way.
 */
const BELOW = 155;
const ABOVE = -145;

/** A caption in full, wiped away to the left, and waiting to grow in from the right. */
const SHOWN = "inset(0% 0% 0% 0%)";
const WIPED = "inset(0% 100% 0% 0%)";
const WAITING = "inset(0% 0% 0% 100%)";

/** One result on screen: its number, glyph by glyph, and its caption. */
export type StatRow = {
  row: HTMLElement;
  /** The glyphs of the number, each behind an edge of its own. */
  glyphs: HTMLElement[];
  caption: HTMLElement;
};

type Shared = {
  /** A violet block as large as the results, which the "block" motion wipes across. */
  block: HTMLElement;
};

/** The same stand-in for the same glyph at the same moment, every time. */
function standIn(glyph: number, tick: number): string {
  let hash = Math.imul(glyph + 1, 374761393) ^ Math.imul(tick + 1, 668265263);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  return String(((hash ^ (hash >>> 16)) >>> 0) % 10);
}

/** Shows a number part-way through being deciphered. */
function decipher(row: StatRow, finals: string[], progress: number) {
  const tick = Math.floor(progress * 16);
  const total = row.glyphs.length;
  row.glyphs.forEach((glyph, index) => {
    const appears = 0.02 + (0.4 * index) / total;
    const locks = 0.45 + (0.55 * (index + 1)) / total;
    const locked = progress >= locks;
    glyph.style.visibility = progress >= appears ? "inherit" : "hidden";
    glyph.style.opacity = locked ? "" : "0.4";
    const shown = locked ? finals[index] : standIn(index, tick);
    if (glyph.textContent !== shown) glyph.textContent = shown;
  });
}

/** How far below its edge a glyph waits before the counter runs it in. */
const counterStart = (glyph: HTMLElement) =>
  glyph.dataset.run === undefined
    ? BELOW
    : (Number(glyph.dataset.run) + 1) * 100 + (BELOW - 100);

/**
 * Builds one round of results on the timeline: each in turn takes the place
 * of the one before, and the first takes over from the last, so the round
 * loops. Returns a function that puts back anything changed outside the
 * timeline.
 */
export function addStats(
  timeline: gsap.core.Timeline,
  motion: StatMotion,
  rows: StatRow[],
  { block }: Shared,
): () => void {
  const last = rows[rows.length - 1];
  const finals = rows.map((row) =>
    row.glyphs.map((glyph) => glyph.textContent ?? ""),
  );
  const swaps = motion === "decode" || motion === "block";

  // Every round starts with the last result standing and the others out of
  // sight, ready to come in.
  timeline.set(block, { scaleX: 0 }, 0);
  rows.forEach((row) => {
    const standing = row === last;
    timeline.set(row.row, { autoAlpha: swaps && !standing ? 0 : 1 }, 0);
    timeline.set(
      row.caption,
      { clipPath: swaps || standing ? SHOWN : WAITING },
      0,
    );
    timeline.set(
      row.glyphs,
      {
        yPercent: (_index: number, glyph: HTMLElement) => {
          if (swaps || standing) return 0;
          return motion === "count" ? counterStart(glyph) : BELOW;
        },
      },
      0,
    );
  });

  // The decipher motion writes into the glyphs, so their columns are held
  // at their own width: a stand-in of another width does not push the rest.
  if (motion === "decode") {
    rows.forEach((row) => {
      const size = parseFloat(getComputedStyle(row.glyphs[0]).fontSize);
      row.glyphs.forEach((glyph) => {
        const column = glyph.parentElement as HTMLElement;
        column.style.width = `${(column.offsetWidth / size).toFixed(4)}em`;
        glyph.style.textAlign = "center";
      });
    });
    timeline.call(decipher, [last, finals[rows.length - 1], 1], 0);
  }

  rows.forEach((to, index) => {
    const from = rows[(index + rows.length - 1) % rows.length];
    const at = counts(index * STAT_COUNTS);

    if (motion === "block") {
      // The block slides across from the left until it covers number and
      // caption, they change underneath, and it slides off to the right.
      timeline.fromTo(
        block,
        { scaleX: 0, transformOrigin: "0% 50%" },
        { scaleX: 1, duration: counts(1.75), ease: "power3.inOut" },
        at,
      );
      timeline.set(from.row, { autoAlpha: 0 }, at + counts(1.75));
      timeline.set(to.row, { autoAlpha: 1 }, at + counts(1.75));
      timeline.set(block, { transformOrigin: "100% 50%" }, at + counts(1.75));
      timeline.to(
        block,
        { scaleX: 0, duration: counts(1.75), ease: "power3.inOut" },
        at + counts(2),
      );
      return;
    }

    // The caption hangs from the right-hand end of the number. The old one
    // is wiped away towards the left, the new one grows in from the right.
    timeline.fromTo(
      from.caption,
      { clipPath: SHOWN },
      { clipPath: WIPED, duration: counts(1.25), ease: "power2.inOut" },
      at,
    );
    timeline.fromTo(
      to.caption,
      { clipPath: WAITING },
      { clipPath: SHOWN, duration: counts(1.5), ease: "power2.inOut" },
      at + counts(1.5),
    );

    if (motion === "roll") {
      // One column at a time, like a strip being pulled up: the old glyph
      // goes out at the top as the new one comes in at the bottom.
      const roll = { duration: 0.45, ease: "power4.inOut" };
      const columns = Math.max(from.glyphs.length, to.glyphs.length);
      for (let column = 0; column < columns; column++) {
        const start = at + column * 0.08;
        if (from.glyphs[column]) {
          timeline.fromTo(
            from.glyphs[column],
            { yPercent: 0 },
            { yPercent: ABOVE, ...roll },
            start,
          );
        }
        if (to.glyphs[column]) {
          timeline.fromTo(
            to.glyphs[column],
            { yPercent: BELOW },
            { yPercent: 0, ...roll },
            start,
          );
        }
      }
      return;
    }

    if (motion === "count") {
      timeline.fromTo(
        from.glyphs,
        { yPercent: 0 },
        {
          yPercent: ABOVE,
          duration: counts(1.25),
          ease: "power2.in",
          stagger: counts(0.1),
        },
        at,
      );
      let digit = 0;
      to.glyphs.forEach((glyph) => {
        const counted = glyph.dataset.run !== undefined;
        timeline.fromTo(
          glyph,
          { yPercent: counterStart(glyph) },
          {
            yPercent: 0,
            duration: counted ? counts(3 + 0.6 * digit) : counts(1.75),
            ease: "power3.out",
          },
          at + counts(counted ? 0.75 : 1.25),
        );
        if (counted) digit++;
      });
      return;
    }

    // Deciphering: the old number fades, the new one shows up as changing
    // digits and locks from left to right.
    timeline.to(
      from.row,
      { autoAlpha: 0, duration: counts(1), ease: "none" },
      at,
    );
    timeline.set(to.row, { autoAlpha: 1 }, at + counts(1));
    const state = { progress: 0 };
    timeline.fromTo(
      state,
      { progress: 0 },
      {
        progress: 1,
        duration: counts(3.5),
        ease: "none",
        onUpdate: () => decipher(to, finals[index], state.progress),
      },
      at + counts(1),
    );
  });

  timeline.to({}, { duration: 0 }, counts(rows.length * STAT_COUNTS));

  return () => {
    rows.forEach((row, index) => {
      row.glyphs.forEach((glyph, place) => {
        glyph.style.visibility = "";
        glyph.style.opacity = "";
        glyph.style.textAlign = "";
        (glyph.parentElement as HTMLElement).style.width = "";
        if (motion === "decode") glyph.textContent = finals[index][place];
      });
    });
  };
}
