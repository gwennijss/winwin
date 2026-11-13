"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import WinLeft from "@/assets/logo/win-left.svg";
import WinRight from "@/assets/logo/win-right.svg";
import { BLOCK_OFFSET_X, BLOCK_RADIUS, STATES, WORD, wordDistance } from "@/components/winwin-logo/geometry";
import { BURST, FLOW, POP, SNAP } from "@/components/winwin-logo/motion";
import { BEAT } from "@/components/winwin-logo/timeline";
import { useStill } from "@/deck/motion";
import { between, CAP, CARET, REGULAR, REGULAR_SPACE, REGULAR_WIDTH, SHARP, SHARP_WIDTH, wordPath } from "../making";
import { Corner, FW, PH, Stage, VIOLET } from "../parts";

/**
 * How the logo was made, in five steps, each a page of its own so that
 * whoever presents sets the pace:
 *
 * 1. one word, WIN, typed in Helvetica, large;
 * 2. a second WIN shoots out of the first, and the view pulls back to hold both;
 * 3. the letters are made heavier: they draw a breath, thinner, and swell past their weight;
 * 4. a diamond spins in between the words and throws them apart;
 * 5. the view goes in close, a radius is drawn into every corner, the view
 *    pulls back, and the ground turns violet. That is the logo, and the
 *    violet says so: there is no step after it.
 *
 * All five are one drawing in different states, so a page starts where the
 * page before ended. Every step is a move that cannot be missed.
 */

/** Everything that changes between the first step and the last. */
type State = {
  /** How many letters of the first word have been typed. */
  letters: number;
  /** The second word: 0 is under the first, 1 is next to it. */
  split: number;
  /** 0 is the regular weight of Helvetica, 1 the weight of the logo. Below 0 is thinner still, above 1 heavier. */
  bold: number;
  /** 0 is a word space between the words, 1 the room the diamond needs. */
  push: number;
  /** How much further apart the words are thrown than where they end up. */
  fling: number;
  /** The diamond's size (1 is its own), and how far it still has to turn. */
  diamond: number;
  spin: number;
  /** 0 is sharp corners, 1 the radius of the logo; above 1 is rounder still. */
  round: number;
  /** The exact vectors of the logo, laid over the drawing at the very end. */
  done: number;
  /** How large the drawing is shown: px per unit of the logo's drawing. */
  cam: number;
  /** A short push of the view, as when a key is struck. */
  bump: number;
  /** What the view is centred on: 0 is the whole drawing, 1 the diamond. */
  focus: number;
  /** The violet ground that opens from the diamond when the logo is there. */
  final: number;
};

const START: State = { letters: 0, split: 0, bold: 0, push: 0, fling: 0, diamond: 0, spin: -540, round: 0, done: 0, cam: 3.6, bump: 0, focus: 0, final: 0 };

/** Where the drawing stands at the end of each step; 0 is before the first. */
const STEPS: State[] = [
  START,
  { ...START, letters: 3 },
  { ...START, letters: 3, split: 1, cam: 2.4 },
  { ...START, letters: 3, split: 1, bold: 1, cam: 2.2 },
  { ...START, letters: 3, split: 1, bold: 1, push: 1, diamond: 1, spin: 0, cam: 1.9 },
  { ...START, letters: 3, split: 1, bold: 1, push: 1, diamond: 1, spin: 0, round: 1, done: 1, cam: 2, final: 1 },
];

/** The space between the two heavy words before the diamond is there. */
const HEAVY_SPACE = 44;
/** The room between the words in the logo, and where the diamond stands in it. */
const LOGO_GAP = wordDistance(STATES.diamond);
/** The corner radius of the letters in the logo, and how far it tucks the I and the N in. */
const LETTER_RADIUS = 4.41;
const TUCK = SHARP_WIDTH - WORD.width;

/** Where on the page the middle of the letters stands. */
const CY = PH / 2 - 20;
/** Side of the violet block before it grows, in px, and how far it has to grow to cover the page. */
const SEED = 40;
const REACH = (Math.hypot(FW, PH) / SEED) * 1.15;

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Everything the drawing needs for a state. */
function frame(s: State) {
  const word = between(REGULAR, SHARP, s.bold);
  const width = mix(REGULAR_WIDTH, SHARP_WIDTH, s.bold);
  const tuck = TUCK * Math.min(1, s.round);
  // Rounding the corners tucks the I and the N in, so the first word ends a
  // little earlier and the room up to the second word grows by as much.
  const edge = width - tuck;
  const gap = mix(mix(REGULAR_SPACE, HEAVY_SPACE, s.bold), LOGO_GAP - TUCK, s.push) + tuck + s.fling;
  const second = s.split * (edge + gap);
  const total = second + edge;
  const side = STATES.diamond.w * s.diamond;
  const typed = Math.round(s.letters);
  // Only the letters that have been typed are drawn.
  const first = { ...word, I: typed > 1 ? word.I : [], N: typed > 2 ? word.N : [] };
  const radius = LETTER_RADIUS * s.round;
  const scale = s.cam * (1 + s.bump);
  const middle = edge + gap / 2 + BLOCK_OFFSET_X * s.push;
  const centre = mix(total / 2, middle, s.focus);
  return {
    root: `translate(${FW / 2} ${CY}) scale(${scale}) translate(${-centre} ${-CAP / 2})`,
    first: typed > 0 ? wordPath(first as typeof word, radius, 0, tuck) : "",
    second: s.split > 0.001 ? wordPath(word, radius, second, tuck) : "",
    diamond: {
      transform: `translate(${middle} ${CAP / 2}) rotate(${45 + s.spin})`,
      x: -side / 2,
      y: -side / 2,
      width: side,
      height: side,
      rx: Math.min(BLOCK_RADIUS * s.round, side / 2),
    },
    caret: `translate(${CARET[typed]} 0)`,
    drawing: 1 - s.done,
    done: s.done,
    // The violet block opens from where the diamond stands on the page.
    cover: `translate(${FW / 2 + (middle - centre) * scale} ${CY}) rotate(${45 + 90 * s.final}) scale(${s.final * REACH})`,
  };
}

const LINES = [
  "We beginnen met één woord: WIN, in Helvetica.",
  "Win-win: er schuift een tweede WIN uit.",
  "We maken de letters zwaarder.",
  "Ertussen komt een ruit. Die duwt de woorden opzij.",
  "In elke hoek trekken we een ronding.",
];
const LAST_LINE = "Dit is het logo.";

function Making({ step }: { step: 1 | 2 | 3 | 4 | 5 }) {
  const still = useStill();
  const root = useRef<SVGGElement>(null);
  const first = useRef<SVGPathElement>(null);
  const second = useRef<SVGPathElement>(null);
  const diamond = useRef<SVGGElement>(null);
  const rect = useRef<SVGRectElement>(null);
  const caret = useRef<SVGGElement>(null);
  const drawing = useRef<SVGGElement>(null);
  const done = useRef<SVGGElement>(null);
  const cover = useRef<SVGRectElement>(null);
  // Whether the logo has arrived: the last page says so in so many words.
  const [arrived, setArrived] = useState(false);
  const there = step === 5 && (still || arrived);

  // A page starts where the page before ended. In the PDF it shows its own end.
  const start = frame(still ? STEPS[step] : STEPS[step - 1]);

  useEffect(() => {
    if (still) return;
    const s: State = { ...STEPS[step - 1] };
    const draw = () => {
      const f = frame(s);
      root.current?.setAttribute("transform", f.root);
      first.current?.setAttribute("d", f.first);
      second.current?.setAttribute("d", f.second);
      diamond.current?.setAttribute("transform", f.diamond.transform);
      for (const [name, value] of Object.entries(f.diamond)) {
        if (name !== "transform") rect.current?.setAttribute(name, String(value));
      }
      caret.current?.setAttribute("transform", f.caret);
      drawing.current?.setAttribute("opacity", String(f.drawing));
      done.current?.setAttribute("opacity", String(f.done));
      cover.current?.setAttribute("transform", f.cover);
    };
    const timeline = gsap.timeline({ onUpdate: draw, delay: step === 1 ? 3 * BEAT : BEAT / 2 });
    const end = STEPS[step];

    if (step === 1) {
      // Typed: a letter every two counts, and the page gives a little with each key.
      [1, 2, 3].forEach((n, i) => {
        const at = i * 2 * BEAT;
        timeline.set(s, { letters: n, bump: 0.035 }, at);
        timeline.to(s, { bump: 0, duration: 1.5 * BEAT, ease: "power2.out" }, at);
      });
    } else if (step === 2) {
      // The second word shoots out past its place and comes back, while the
      // view pulls back to hold the two of them.
      timeline.to(s, { split: 1, duration: 4 * BEAT, ease: BURST }, 0);
      timeline.to(s, { cam: end.cam, duration: 4 * BEAT, ease: FLOW }, 0);
    } else if (step === 3) {
      // Heavier. First a breath in: the letters go thinner than they were.
      // Then they swell past the weight of the logo, and settle on it.
      timeline.to(s, { bold: -0.3, duration: 2 * BEAT, ease: "power2.inOut" }, 0);
      timeline.to(s, { bold: 1.28, duration: 1.5 * BEAT, ease: "power3.in" }, 2 * BEAT);
      timeline.to(s, { bold: 1, duration: 2.5 * BEAT, ease: "power3.out" }, 3.5 * BEAT);
      timeline.to(s, { cam: end.cam * 1.06, duration: 1.5 * BEAT, ease: "power3.in" }, 2 * BEAT);
      timeline.to(s, { cam: end.cam, duration: 2.5 * BEAT, ease: "power3.out" }, 3.5 * BEAT);
    } else if (step === 4) {
      // The diamond comes out of nothing with a spin, half as large again as
      // it will be, and throws the words apart before everything settles.
      timeline.to(s, { diamond: 1.55, duration: 2 * BEAT, ease: POP }, 0);
      timeline.to(s, { diamond: 1, duration: 3 * BEAT, ease: FLOW }, 2 * BEAT);
      timeline.to(s, { spin: 0, duration: 6 * BEAT, ease: "power2.out" }, 0);
      timeline.to(s, { push: 1, duration: 2.5 * BEAT, ease: "power3.out" }, 0.04);
      timeline.to(s, { fling: 54, duration: 2 * BEAT, ease: "power3.out" }, 0.04);
      timeline.to(s, { fling: 0, duration: 3.5 * BEAT, ease: FLOW }, 2 * BEAT);
      timeline.to(s, { cam: end.cam, duration: 4 * BEAT, ease: FLOW }, 0);
    } else {
      // In close, so the corners are large enough to see what happens to them.
      timeline.to(s, { cam: 4.4, focus: 1, duration: 3 * BEAT, ease: FLOW }, 0);
      // The radius goes too far, and is drawn back to the one of the logo.
      timeline.to(s, { round: 2.6, duration: 2.5 * BEAT, ease: "power2.out" }, 3 * BEAT);
      timeline.to(s, { round: 1, duration: 2.5 * BEAT, ease: FLOW }, 5.5 * BEAT);
      // And back out, to the whole of it.
      timeline.to(s, { cam: 1.9, focus: 0, duration: 4 * BEAT, ease: FLOW }, 9 * BEAT);
      timeline.to(s, { done: 1, duration: BEAT, ease: "none" }, 12 * BEAT);
      // This is it: the ground turns violet from the diamond outward, and the
      // logo comes a step forward.
      timeline.call(() => setArrived(true), [], 14 * BEAT);
      timeline.to(s, { final: 1, duration: 3 * BEAT, ease: SNAP }, 14 * BEAT);
      timeline.to(s, { cam: end.cam, duration: 3 * BEAT, ease: BURST }, 14 * BEAT);
    }
    return () => void timeline.kill();
  }, [still, step]);

  const right = WORD.width + LOGO_GAP;
  return (
    <>
      <svg className="winwin-logo absolute inset-0" width={FW} height={PH} viewBox={`0 0 ${FW} ${PH}`} role="img" aria-label="Win Win, in wording">
        {step === 5 && <rect ref={cover} x={-SEED / 2} y={-SEED / 2} width={SEED} height={SEED} transform={start.cover} style={{ fill: VIOLET }} />}
        <g ref={root} transform={start.root} fill="currentColor">
          <g ref={drawing} opacity={start.drawing}>
            <path ref={first} d={start.first} />
            <path ref={second} d={start.second} />
            <g ref={diamond} transform={start.diamond.transform}>
              <rect ref={rect} x={start.diamond.x} y={start.diamond.y} width={start.diamond.width} height={start.diamond.height} rx={start.diamond.rx} />
            </g>
          </g>
          {/* The line that waits for the next letter. */}
          {step === 1 && !still && (
            <g ref={caret} transform={start.caret}>
              <rect x={0} y={-10} width={3} height={CAP + 20} opacity={0.7} style={{ animation: "deck-caret 1s linear infinite" }} />
            </g>
          )}
          {/* The logo itself, as drawn: it takes over once the corners are round. */}
          {step === 5 && (
            <g ref={done} opacity={start.done}>
              <WinLeft aria-hidden />
              <g transform={`translate(${right} 0)`}>
                <WinRight aria-hidden />
              </g>
              <g transform={`translate(${WORD.width + LOGO_GAP / 2 + BLOCK_OFFSET_X} ${CAP / 2}) rotate(45)`}>
                <rect x={-STATES.diamond.w / 2} y={-STATES.diamond.h / 2} width={STATES.diamond.w} height={STATES.diamond.h} rx={BLOCK_RADIUS} />
              </g>
            </g>
          )}
        </g>
      </svg>
      <div className="absolute flex items-center" style={{ left: 60, bottom: 58, gap: 28 }}>
        <span className="t-sign tabular" style={{ opacity: 0.6 }}>
          {step} / 5
        </span>
        <motion.span key={there ? "last" : "line"} style={{ fontSize: 30, lineHeight: "40px" }} initial={still ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: there ? 0.3 : 0.1, duration: 0.4, ease: "easeOut" }}>
          {there ? LAST_LINE : LINES[step - 1]}
        </motion.span>
      </div>
      <div className="absolute flex" style={{ right: 60, bottom: 70, gap: 8 }}>
        {LINES.map((_, i) => (
          <span key={i} style={{ width: 44, height: 3, background: i < step ? "rgb(243 246 255 / 0.9)" : "rgb(243 246 255 / 0.2)" }} />
        ))}
      </div>
    </>
  );
}

const page = (step: 1 | 2 | 3 | 4 | 5) => {
  function Step() {
    return (
      <Stage tone="dark">
        <Making step={step} />
        <Corner />
      </Stage>
    );
  }
  return Step;
};

export const slides: Record<string, ComponentType> = {
  "logo-stap-1": page(1),
  "logo-stap-2": page(2),
  "logo-stap-3": page(3),
  "logo-stap-4": page(4),
  "logo-stap-5": page(5),
};
