"use client";

import { createContext, useContext, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { Footage } from "@/components/case/Footage";
import { LabelDivider, LabelStill } from "@/components/labels/LabelStill";
import { SocialLabel } from "@/components/labels/SocialLabel";
import type { LabelColours } from "@/components/labels/palette";
import { BRAND, SHADE } from "@/components/labels/palette";
import { Lockup, type LockupHandle } from "@/components/winwin-logo/Lockup";
import { WinwinLogo } from "@/components/winwin-logo/WinwinLogo";
import { BLOCK_OFFSET_X, BLOCK_RADIUS, STATES, VIEW, WORD, extent, wordDistance, type Media, type Pose, type StateName } from "@/components/winwin-logo/geometry";
import type { LogoTimeline } from "@/components/winwin-logo/timeline";
import { counts, EASE, flow, useStill } from "@/deck/motion";

/**
 * The kit of the Win Win brand presentation.
 *
 *  - A 1920 × 1080 page in two parts. On the left the brand's own text panel,
 *    480 px wide: a label as its tab, a title in Trabat, a few sentences in
 *    Hanken. On the right one flat plane of 1440 × 1080 where the work stands.
 *  - No cards and no shadows. A field fills its part of the plane to the edge.
 *  - Everything that moves is one of the brand's own animations, or enters
 *    with the brand's curves, on the count the logo keeps.
 */

export const VIOLET = BRAND.violet;
export const DARK = BRAND.dark;
export const LIGHT = BRAND.light;
export const DEEP = SHADE.violetDark;
export const LILAC = SHADE.violetLight;

/** The text panel on the left, and the plane on the right. */
export const PANEL = 480;
export const PW = 1920 - PANEL;
export const PH = 1080;
/** The full width of the page, for pages without the panel. */
export const FW = 1920;
/** The inner margin of the plane. */
export const PAD = 72;

export type Tone = "dark" | "light" | "violet" | "deep" | "lilac";

/** The colour to draw in on each ground. */
export const INK: Record<Tone, string> = { dark: LIGHT, light: DARK, violet: LIGHT, deep: LIGHT, lilac: DEEP };
export const GROUND: Record<Tone, string> = { dark: DARK, light: LIGHT, violet: VIOLET, deep: DEEP, lilac: LILAC };

/* ───────────────────────────── Footage ───────────────────────────── */

/** The campaign footage the deck may show: a video and stills taken from it. */
export type DeckMedia = {
  video?: string;
  stills: string[];
  /** The animated posts that are there, by name: `/media/posts/name.mp4`, with a still `name.jpg` beside it. */
  posts?: string[];
  /** Whether the printed version is there to download. */
  pdf?: boolean;
};

export const MediaContext = createContext<DeckMedia>({ stills: [] });
export const useMedia = () => useContext(MediaContext);

/** The moment in the video each still was taken at, in seconds. */
export const STILL_AT = [0.5, 4.5, 6.5, 8.5, 10.5, 11.5, 13.5, 15.5, 17.5];

/**
 * The footage, filling whatever it is put in. `n` picks a moment: live it is
 * the video running from there, in the PDF and the overview it is the still
 * of that moment. Without footage it is the stand-in of drifting lights.
 */
export function Picture({ n = 0, live = true, position = "center" }: { n?: number; live?: boolean; position?: string }) {
  const still = useStill();
  const { video, stills } = useMedia();
  const ref = useRef<HTMLVideoElement>(null);
  const moment = STILL_AT[n % STILL_AT.length];

  useEffect(() => {
    const film = ref.current;
    if (!film) return;
    const start = () => {
      film.currentTime = moment;
      void film.play().catch(() => undefined);
    };
    if (film.readyState >= 1) start();
    else film.addEventListener("loadedmetadata", start, { once: true });
    return () => film.removeEventListener("loadedmetadata", start);
  }, [moment]);

  const image = stills.length ? stills[n % stills.length] : undefined;
  if (video && live && !still) {
    return (
      <video
        ref={ref}
        src={video}
        poster={image}
        muted
        loop
        playsInline
        className="absolute inset-0 size-full object-cover"
        style={{ objectPosition: position }}
      />
    );
  }
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element -- a fixed still, sized by the slide
    return <img src={image} alt="" draggable={false} className="absolute inset-0 size-full object-cover" style={{ objectPosition: position }} />;
  }
  return <Footage />;
}

/* ───────────────────────────── Grounds ───────────────────────────── */

/** The ground of a full page. */
export function Stage({ tone = "dark", children, style }: { tone?: Tone; children?: ReactNode; style?: CSSProperties }) {
  return (
    <div className={`ww ww--${tone}`} style={style}>
      {children}
    </div>
  );
}

/** The plane on the right: one flat ground, everything stands on it. Coordinates inside are 1440 × 1080. */
export const Plane = Stage;

/**
 * A rectangle of the plane: a colour or a picture, edge to edge. It opens
 * from one side with the brand's connecting curve.
 */
export function Field({
  at = 0,
  tone,
  from = "left",
  style,
  className,
  children,
}: {
  at?: number;
  tone?: Tone;
  from?: "bottom" | "left" | "top" | "right";
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}) {
  const still = useStill();
  const closed = { bottom: "inset(100% 0% 0% 0%)", top: "inset(0% 0% 100% 0%)", left: "inset(0% 100% 0% 0%)", right: "inset(0% 0% 0% 100%)" }[from];
  return (
    <motion.div
      className={`absolute overflow-hidden ${tone ? `ww--${tone}` : ""} ${className ?? ""}`}
      style={style}
      initial={still ? false : { clipPath: closed }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ delay: counts(at), duration: counts(3), ease: flow }}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────────── Labels ───────────────────────────── */

/** The label standing still, sized in px. The deck's own signage is made of these. */
export function Tag({ children, size = 22, colours, style, className }: { children: ReactNode; size?: number; colours?: LabelColours; style?: CSSProperties; className?: string }) {
  return (
    <span className={className} style={{ display: "inline-flex", fontSize: size, ...style }}>
      <LabelStill colours={colours}>{children}</LabelStill>
    </span>
  );
}

/** The label building itself, looping. In the PDF and the overview it stands still. */
export function LiveTag({ children, size = 22, colours, delay, style }: { children: ReactNode; size?: number; colours?: LabelColours; delay?: number; style?: CSSProperties }) {
  const still = useStill();
  return (
    <span style={{ display: "inline-flex", fontSize: size, ...style }}>
      {still ? (
        <LabelStill colours={colours}>{children}</LabelStill>
      ) : (
        <SocialLabel colours={colours} delay={delay}>
          {children}
        </SocialLabel>
      )}
    </span>
  );
}

export { LabelDivider };

/** The label on a violet ground, where the violet square would be lost: the square in the deep shade, the diamond in the soft one. */
export const ON_VIOLET: LabelColours = { tile: SHADE.violetDark, mark: SHADE.violetLight, box: BRAND.light, text: BRAND.dark };

/**
 * How much of the brand a page may show. The deck builds up to the brand, so
 * its own furniture does too:
 *  - `plain`: nothing of the brand yet. A plain sans, no logo, no label.
 *  - `logo`: the logo has been shown, so it may stand on the page. Still a plain sans.
 *  - `type`: the typefaces have been shown, so the page is set in them.
 *  - `full`: the label has been shown, so it becomes the page's signage.
 */
export type Level = "plain" | "logo" | "type" | "full";
export const LevelContext = createContext<Level>("full");
export const useLevel = () => useContext(LevelContext);

/** The section and title of a full page, set by the deck. */
export const CornerContext = createContext<{ n: string; chapter: string; title: string } | null>(null);

/**
 * On a full page the section and the page stand in the top left corner: as
 * plain text, and as a label once the deck has got to the label.
 */
export function Corner({ style, onViolet = false }: { style?: CSSProperties; onViolet?: boolean }) {
  const c = useContext(CornerContext);
  const level = useLevel();
  if (!c) return null;
  if (level !== "full") {
    return (
      <div className="t-sign pointer-events-none absolute flex" style={{ left: 60, top: 48, gap: 18, zIndex: 5, ...style }}>
        <span className="tabular" style={{ opacity: 0.56 }}>
          {c.n}
        </span>
        <span>{c.title}</span>
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute" style={{ left: 40, top: 40, zIndex: 5, ...style }}>
      <Tag size={20} colours={onViolet ? ON_VIOLET : undefined}>
        {c.chapter}
        <LabelDivider />
        {c.title}
      </Tag>
    </div>
  );
}

/* ───────────────────────────── The logo ───────────────────────────── */

/** Pixels per unit of the logo's own drawing, for a lockup of this width. */
export const unitOf = (width: number) => width / VIEW.width;
/** The width a lockup needs for its letters to be this tall. */
export const widthFor = (letterHeight: number) => (letterHeight * VIEW.width) / WORD.height;

/** The lockup standing still in one of its shapes. It takes the colour of the text around it. */
export function LogoStill({ state = "diamond", pose, width, media, style, className }: { state?: StateName; pose?: Pose; width: number; media?: Media; style?: CSSProperties; className?: string }) {
  const lockup = useRef<LockupHandle>(null);
  const picture = media?.[state];
  // A picture inside the block is only shown once the lockup is told to.
  useEffect(() => {
    if (picture) lockup.current?.draw(pose ?? STATES[state], { [state]: 1 });
  }, [picture, pose, state]);
  return (
    <div className={className} style={{ width, ...style }}>
      <Lockup ref={lockup} initial={pose ?? STATES[state]} media={media} className="block w-full" />
    </div>
  );
}

/**
 * Where the parts of a lockup are on the page, in px, for a lockup of this
 * width whose box starts at `left`, `top`.
 */
export function lockupBox(width: number, left: number, top: number, pose: Pose = STATES.diamond) {
  const u = unitOf(width);
  const cx = left + (VIEW.width / 2) * u;
  const cy = top + (VIEW.height / 2) * u;
  const half = (wordDistance(pose) / 2) * u;
  const word = WORD.width * u;
  const reach = (extent(pose) / 2) * u;
  const block = cx + BLOCK_OFFSET_X * u;
  return {
    u,
    cx,
    cy,
    /** Top and bottom of the letters. */
    top: cy - (WORD.height / 2) * u,
    bottom: cy + (WORD.height / 2) * u,
    leftWord: [cx - half - word, cx - half] as const,
    rightWord: [cx + half, cx + half + word] as const,
    /** The middle of the block, and its left and right edge. */
    block,
    blockLeft: block - reach,
    blockRight: block + reach,
    blockTop: cy - (pose.rot ? reach : (pose.h / 2) * u),
    blockBottom: cy + (pose.rot ? reach : (pose.h / 2) * u),
  };
}

/** The logo's loop, playing. In the PDF and the overview it rests on the diamond. */
export function LogoLoop({ width, onReady, style }: { width: number; onReady?: (logo: LogoTimeline) => void; style?: CSSProperties }) {
  const still = useStill();
  return (
    <div style={{ width, ...style }}>{still ? <Lockup className="block w-full" /> : <WinwinLogo className="block w-full" onReady={onReady} />}</div>
  );
}

/**
 * The block on its own, drawn as a plain shape: `unit` is px per unit of the
 * logo's drawing, so a block next to a lockup of the same unit matches it.
 */
export function Block({ state = "diamond", unit = 1, color = "currentColor", style, children }: { state?: StateName; unit?: number; color?: string; style?: CSSProperties; children?: ReactNode }) {
  const s = STATES[state];
  return (
    <div
      style={{
        width: s.w * unit,
        height: s.h * unit,
        background: color,
        borderRadius: BLOCK_RADIUS * unit,
        transform: s.rot ? `rotate(${s.rot}deg)` : undefined,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ───────────────────────────── Drawing aids ───────────────────────────── */

/** A measuring line across the plane with its name at one end. */
export function Guide({ y, label, at = 0, side = "left", below = false, color = "var(--accent)", from = 0, to = PW }: { y: number; label: string; at?: number; side?: "left" | "right"; below?: boolean; color?: string; from?: number; to?: number }) {
  const still = useStill();
  return (
    <>
      <motion.div
        aria-hidden
        className="absolute"
        style={{ left: from, width: to - from, top: y, height: 1, background: color, opacity: 0.55, transformOrigin: side }}
        initial={still ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: counts(at), duration: counts(3), ease: flow }}
      />
      <motion.div
        className="t-sign absolute"
        style={{ [side]: side === "left" ? from + 32 : PW - to + 32, top: below ? y + 10 : y - 34, color }}
        initial={still ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: counts(at + 2), duration: counts(2), ease: "linear" }}
      >
        {label}
      </motion.div>
    </>
  );
}

/** A measure between two points, drawn as a line with a tick at both ends and a value. */
export function Measure({ x, y, length, vertical = false, label, at = 0, color = "var(--accent)", labelSide = "after", big = false }: { x: number; y: number; length: number; vertical?: boolean; label: string; at?: number; color?: string; labelSide?: "before" | "after"; big?: boolean }) {
  const still = useStill();
  const tick = 14;
  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: y, width: vertical ? 1 : length, height: vertical ? length : 1, color }}
      initial={still ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: counts(at), duration: counts(2), ease: EASE }}
    >
      <span className="absolute" style={{ inset: 0, background: color }} />
      <span className="absolute" style={vertical ? { left: -tick / 2, top: 0, width: tick, height: 1, background: color } : { left: 0, top: -tick / 2, width: 1, height: tick, background: color }} />
      <span className="absolute" style={vertical ? { left: -tick / 2, bottom: 0, width: tick, height: 1, background: color } : { right: 0, top: -tick / 2, width: 1, height: tick, background: color }} />
      <span
        className={`${big ? "t-card" : "t-sign"} tabular absolute whitespace-nowrap`}
        style={
          vertical
            ? { top: "50%", transform: "translateY(-50%)", ...(labelSide === "after" ? { left: 18 } : { right: 18 }) }
            : { left: "50%", transform: "translateX(-50%)", ...(labelSide === "after" ? { top: 14 } : { bottom: 14 }) }
        }
      >
        {label}
      </span>
    </motion.div>
  );
}

/** The cross on a page of things not to do. */
export function Cross({ size = 28, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="square" aria-hidden>
      <path d="M5 5l18 18M23 5L5 23" />
    </svg>
  );
}

/** The tick on a page of things to do. */
export function Tick({ size = 28, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="square" aria-hidden>
      <path d="M4 15l7 7L24 7" />
    </svg>
  );
}

/* ───────────────────────────── A portrait video ───────────────────────────── */

/**
 * A portrait video, 9:16, as wide as given. Everything on it is sized in
 * 27ths of its width, as on the site: 40 px on 1080.
 */
export function Reel({ width, n = 0, live = true, style, children, radius = 0 }: { width: number; n?: number; live?: boolean; style?: CSSProperties; children?: ReactNode; radius?: number }) {
  return (
    <div className="relative overflow-hidden" style={{ width, height: (width * 16) / 9, fontSize: width / 27, borderRadius: radius, background: "#111", ...style }}>
      <Picture n={n} live={live} />
      {children}
    </div>
  );
}
