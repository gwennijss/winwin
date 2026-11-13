"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { BLOCK_RADIUS, STATES } from "@/components/winwin-logo/geometry";
import { counts, Fade, Lines, Rise, Rule, unfold, useStill } from "@/deck/motion";
import { Corner, DEEP, LiveTag, LogoStill, PH, Picture, Stage } from "../parts";

/**
 * Brand images: the brand on its own, with nothing to explain. Two of them,
 * and together they say the name: both sides win, and between them stands
 * the work. The first has the diamond, large; the second the work, seen
 * through it.
 */


/** The corner of the diamond, as a share of its side: the same as in the logo. */
const CORNER = BLOCK_RADIUS / STATES.diamond.w;

/**
 * The diamond at any size, with its middle at `cx`, `cy`. It turns in from
 * nothing and comes to rest on its point, the way it does in a label, but
 * slower: a shape this large takes its time.
 */
export function Diamond({ cx, cy, side, at = 0, dur = 6, style, children }: { cx: number; cy: number; side: number; at?: number; dur?: number; style?: CSSProperties; children?: ReactNode }) {
  const still = useStill();
  return (
    <motion.div
      className="absolute overflow-hidden"
      style={{ left: cx - side / 2, top: cy - side / 2, width: side, height: side, borderRadius: side * CORNER, ...style }}
      initial={still ? false : { scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 45 }}
      transition={{ delay: counts(at), duration: counts(dur), ease: unfold }}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────────── The diamond, large ───────────────────────────── */

/** The diamond far too large for the page, a line beside it, and the logo to sign it. */
function Ruit() {
  const split = 1160;
  const side = 1130;
  return (
    <Stage tone="violet">
      {/* Its point comes to rest against the line. */}
      <Diamond cx={split - side * Math.SQRT1_2 - 6} cy={PH / 2} side={side} at={0.5} style={{ background: DEEP }} />
      <Rule vertical at={3} dur={4} className="absolute" style={{ left: split, top: 0, width: 2, height: PH, background: DEEP, opacity: 0.7 }} />
      <Lines at={4} className="f-title absolute" style={{ left: split + 60, top: 96, fontSize: 90, lineHeight: "92px", letterSpacing: "-0.012em" }} lines={["Het merk wint.", "De creator wint."]} />
      <Rise at={7} y={14} className="t-aside absolute" style={{ left: split + 64, top: 336, width: 430, opacity: 0.9 }}>
        Wij koppelen merken aan creators, en maken werk dat past in elk formaat en op elk kanaal.
      </Rise>
      <Fade at={8} className="absolute" style={{ right: 26, bottom: 36 }}>
        <LogoStill width={400} />
      </Fade>
      <Corner />
    </Stage>
  );
}

/* ───────────────────────────── The work in the diamond ───────────────────────────── */

/** The line large on the soft violet, and the work seen through the diamond, with its label on it. */
function Venster() {
  const side = 900;
  const cx = 1490;
  const cy = 560;
  const inner = side * Math.SQRT2;
  return (
    <Stage tone="lilac">
      <Corner />
      <Lines at={0.5} className="f-title absolute" style={{ left: 60, top: 136, fontSize: 124, lineHeight: "120px", letterSpacing: "-0.014em" }} lines={["Ertussen", "staat het werk."]} />
      <Rise at={5} y={14} className="t-aside absolute" style={{ left: 66, bottom: 64, width: 450 }}>
        De post, de video, de campagne. Dat is wat tussen merk en creator staat, en het enige dat steeds anders is.
      </Rise>
      <Diamond cx={cx} cy={cy} side={side} at={1.5} style={{ background: "#111" }}>
        {/* The picture stands upright behind the turned block. */}
        <div className="absolute" style={{ left: (side - inner) / 2, top: (side - inner) / 2, width: inner, height: inner, transform: "rotate(-45deg)" }}>
          <Picture n={4} live={false} position="50% 22%" />
        </div>
      </Diamond>
      <div className="absolute" style={{ left: 930, bottom: 128 }}>
        <LiveTag size={62} delay={counts(7)}>
          De Kuyper
        </LiveTag>
      </div>
    </Stage>
  );
}

export const slides: Record<string, ComponentType> = {
  "toep-beeld-ruit": Ruit,
  "toep-beeld-venster": Venster,
};
