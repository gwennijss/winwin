import gsap from "gsap";
import { BRAND } from "../labels/palette";
import { POP } from "../winwin-logo/motion";
import { BEAT } from "../winwin-logo/timeline";

/** A number of counts, in seconds. */
const counts = (n: number) => n * BEAT;

/**
 * The ways the text can arrive in the label, to compare on the case page.
 * Each has to be done before the panel sets off, four counts after the box
 * starts to slide out.
 */
export const LABEL_TEXT_MOTIONS = [
  {
    key: "rise",
    name: "Omhoog",
    note: "De hele regel komt omhoog vanachter een rand, precies zoals de titel in het vlak.",
  },
  {
    key: "letters",
    name: "Letter voor letter",
    note: "Dezelfde beweging als de titel, maar elke letter apart, van links naar rechts.",
  },
  {
    key: "concertina",
    name: "Harmonica",
    note: "De letters komen samengedrukt uit het paarse vak en schuiven uit tot hun plek, de laatste letter voorop.",
  },
  {
    key: "decode",
    name: "Ontcijferen",
    note: "Elke letter is eerst een wisselend cijfer of teken in paars, en klikt van links naar rechts vast als letter.",
  },
  {
    key: "flap",
    name: "Omklappen",
    note: "Elke letter klapt om zijn eigen as naar voren, zoals op een vertrekbord.",
  },
] as const;

export type LabelTextMotion = (typeof LABEL_TEXT_MOTIONS)[number]["key"];

/** What stands in for a letter until it is deciphered. */
const GLYPHS = "0123456789#%&+=/<>?$";
/** How often a stand-in changes, per second. */
const FLICKER = 16;

/** The same stand-in for the same letter at the same moment, every time. */
function standIn(letter: number, tick: number): string {
  let hash = Math.imul(letter + 1, 374761393) ^ Math.imul(tick + 1, 668265263);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  return GLYPHS[((hash ^ (hash >>> 16)) >>> 0) % GLYPHS.length];
}

type Parts = {
  /** Everything that is seen of the text, as one. */
  line: HTMLElement;
  /** Every letter and the dividing block, in reading order. */
  pieces: HTMLElement[];
  /** The letters only. */
  letters: HTMLElement[];
  /** How far each piece's right-hand edge is from the left of the box, in pixels. */
  reach: number[];
  /** The font size of the text, in pixels. */
  size: number;
  /** How far down a piece has to be to be out of sight behind the edge, in pixels. */
  drop: number;
};

/**
 * Adds the arrival of the label's text to the timeline. `boxAt` is the count
 * on which the label's box starts to slide out. Returns a function that
 * puts back anything it changed outside the timeline.
 */
export function addLabelText(
  timeline: gsap.core.Timeline,
  motion: LabelTextMotion,
  { line, pieces, letters, reach, size, drop }: Parts,
  boxAt: number,
): () => void {
  // Every round starts with the line in place and nothing of it to see.
  timeline.set(
    line,
    { xPercent: 0, yPercent: motion === "rise" ? 112 : 0, autoAlpha: 1 },
    0,
  );

  if (motion === "rise") {
    timeline.to(
      line,
      { yPercent: 0, duration: counts(3), ease: "power3.out" },
      counts(boxAt + 1),
    );
    return () => undefined;
  }

  if (motion === "letters") {
    timeline.set(pieces, { y: drop }, 0);
    timeline.to(
      pieces,
      {
        y: 0,
        duration: counts(2.25),
        ease: "power3.out",
        stagger: { amount: counts(1.25) },
      },
      counts(boxAt + 0.75),
    );
    return () => undefined;
  }

  if (motion === "concertina") {
    // Each piece starts just out of sight behind the square. The last one
    // sets off first and has the furthest to go, so they never cross: they
    // spread like a concertina being pulled open.
    timeline.set(pieces, { x: (index: number) => -reach[index] }, 0);
    timeline.to(
      pieces,
      {
        x: 0,
        duration: counts(2.5),
        ease: POP,
        stagger: { each: counts(0.14), from: "end" },
      },
      counts(boxAt + 0.5),
    );
    return () => undefined;
  }

  if (motion === "flap") {
    timeline.set(
      pieces,
      {
        rotationX: -92,
        autoAlpha: 0,
        transformPerspective: size * 4,
        transformOrigin: "50% 60%",
      },
      0,
    );
    const from = counts(boxAt + 0.75);
    const each = counts(0.16);
    timeline.to(pieces, { autoAlpha: 1, duration: 0.01, stagger: each }, from);
    timeline.to(
      pieces,
      {
        rotationX: 0,
        duration: counts(2.25),
        ease: "back.out(1.6)",
        stagger: each,
      },
      from,
    );
    return () => undefined;
  }

  // Deciphering. Each letter shows up as a stand-in that keeps changing, and
  // locks into the real letter from left to right. The stand-ins are in the
  // brand's violet, so a locked letter is told apart at once. The block
  // between the words simply appears when its turn comes.
  const finals = letters.map((letter) => letter.textContent ?? "");
  const duration = counts(3.5);
  const from = counts(boxAt + 1);
  const others = pieces.filter((piece) => !letters.includes(piece));
  const turn = (index: number) => 0.4 + (0.6 * (index + 1)) / pieces.length;

  const show = (progress: number) => {
    const tick = Math.floor(progress * duration * FLICKER);
    letters.forEach((letter, index) => {
      const place = pieces.indexOf(letter);
      const appears = 0.02 + (0.45 * place) / pieces.length;
      const seen = progress >= appears;
      const locked = progress >= turn(place);
      letter.style.visibility = seen ? "inherit" : "hidden";
      letter.style.color = locked ? "" : BRAND.violet;
      const glyph = locked ? finals[index] : standIn(index, tick);
      if (letter.textContent !== glyph) letter.textContent = glyph;
    });
  };

  timeline.set(others, { autoAlpha: 0 }, 0);
  timeline.call(show, [0], 0);
  const state = { progress: 0 };
  timeline.fromTo(
    state,
    { progress: 0 },
    {
      progress: 1,
      duration,
      ease: "none",
      onUpdate: () => show(state.progress),
    },
    from,
  );
  others.forEach((piece) => {
    timeline.set(
      piece,
      { autoAlpha: 1 },
      from + duration * turn(pieces.indexOf(piece)),
    );
  });

  return () => {
    letters.forEach((letter, index) => {
      letter.style.visibility = "";
      letter.style.color = "";
      letter.textContent = finals[index];
    });
  };
}
