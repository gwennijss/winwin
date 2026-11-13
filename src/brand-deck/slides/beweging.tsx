"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import gsap from "gsap";
import { MarkLoader } from "@/components/system/MarkLoader";
import { PushLabel } from "@/components/system/PushLabel";
import { VariantStage } from "@/components/variants/VariantStage";
import { VARIANTS } from "@/components/variants/variants";
import { Lockup, type LockupHandle } from "@/components/winwin-logo/Lockup";
import { Mark, type MarkHandle } from "@/components/winwin-logo/Mark";
import { MARK_SHAPES, STATES, WORD, type Pose, type StateName } from "@/components/winwin-logo/geometry";
import { BURST, FLOW, SNAP } from "@/components/winwin-logo/motion";
import { BEAT, morphPose, type LogoTimeline } from "@/components/winwin-logo/timeline";
import { Fade, Rule, useStill } from "@/deck/motion";
import { Corner, DARK, FW, LIGHT, LILAC, LogoLoop, PAD, PH, Plane, PW, Stage, VIOLET } from "../parts";

/* ───────────────────────────── De lus ───────────────────────────── */

/**
 * The loop as a score, count by count. It follows `STEPS` in the logo's
 * timeline: a move is a bar, a rest is a gap, and the one accent is violet.
 */
const SCORE: { kind: "rest" | "flow" | "accent"; beats: number; to?: StateName; name?: string }[] = [
  { kind: "rest", beats: 1 },
  { kind: "flow", beats: 4, to: "square", name: "De draai" },
  { kind: "flow", beats: 2, to: "portrait", name: "Omhoog" },
  { kind: "rest", beats: 1 },
  { kind: "accent", beats: 3, to: "landscape", name: "Het accent" },
  { kind: "rest", beats: 1 },
  { kind: "flow", beats: 2, to: "post", name: "Ingeknepen" },
  { kind: "rest", beats: 1 },
  { kind: "flow", beats: 2, to: "diamond", name: "Terug op de punt" },
  { kind: "rest", beats: 1 },
];
const TOTAL = SCORE.reduce((sum, s) => sum + s.beats, 0);
/** The count each part of the score starts on. */
const STARTS = SCORE.map((_, i) => SCORE.slice(0, i).reduce((sum, s) => sum + s.beats, 0));

/**
 * The logo's loop is the page. Under it, small, the score it plays: which
 * move falls on which count, with a line that runs along.
 */
function Lus() {
  const still = useStill();
  const head = useRef<HTMLDivElement>(null);
  const [logo, setLogo] = useState<LogoTimeline | null>(null);
  const left = 60;
  const width = FW - 2 * left;
  const beat = width / TOTAL;
  const W = 1640;

  useEffect(() => {
    if (!logo) return;
    const sync = () => {
      if (head.current) head.current.style.transform = `translateX(${(logo.timeline.time() / logo.timeline.duration()) * width}px)`;
    };
    gsap.ticker.add(sync);
    return () => gsap.ticker.remove(sync);
  }, [logo, width]);

  return (
    <Stage tone="dark">
      <Corner />
      <Fade at={2} className="t-sign mute absolute" style={{ right: 60, top: 48 }}>
        {TOTAL} tellen · 4,5 seconden · en dan opnieuw
      </Fade>
      <div className="absolute" style={{ left: (FW - W) / 2, top: (PH - 110 - W * 0.24) / 2 }}>
        <LogoLoop width={W} onReady={setLogo} />
      </div>

      {/* The score: small, along the bottom. */}
      <Fade at={3} className="absolute" style={{ left, bottom: 44, width, height: 58 }}>
        {SCORE.map((s, i) => {
          if (s.kind === "rest") return null;
          return (
            <div key={i} className="absolute" style={{ left: STARTS[i] * beat + 3, top: 0, width: s.beats * beat - 6 }}>
              <div className="t-sign whitespace-nowrap" style={{ fontSize: 16, lineHeight: "22px", fontWeight: 400, color: s.kind === "accent" ? LIGHT : "var(--mute)" }}>
                {s.name}
              </div>
              <div style={{ height: 6, marginTop: 10, background: s.kind === "accent" ? VIOLET : "rgb(243 246 255 / 0.18)", borderRadius: 3 }} />
            </div>
          );
        })}
        {Array.from({ length: TOTAL + 1 }, (_, n) => (
          <div key={n} className="absolute" style={{ left: n * beat, top: 46, width: 1, height: n % 4 === 0 ? 10 : 5, background: "rgb(243 246 255 / 0.3)" }} />
        ))}
        {/* The line that runs along with the logo. */}
        {!still && <div ref={head} className="absolute" style={{ left: -1, top: 26, width: 2, height: 30, background: LILAC }} />}
      </Fade>
    </Stage>
  );
}

/* ───────────────────────────── Drie regels ───────────────────────────── */

/** The block pushes: the lockup going from the square to the landscape and back, the words giving way. */
function PushDemo() {
  const still = useStill();
  const lockup = useRef<LockupHandle>(null);
  useEffect(() => {
    if (still) return;
    const pose: Pose = { ...STATES.square };
    const draw = () => lockup.current?.draw(pose);
    let wide = false;
    const timer = window.setInterval(() => {
      wide = !wide;
      morphPose(pose, wide ? STATES.landscape : STATES.square, draw);
    }, 6 * BEAT * 1000);
    return () => {
      window.clearInterval(timer);
      gsap.killTweensOf(pose);
    };
  }, [still]);
  return (
    <div style={{ width: 560 }}>
      <Lockup ref={lockup} initial={still ? STATES.landscape : STATES.square} className="block w-full" />
    </div>
  );
}

/** On the count: eight counts, an accent that takes three of them and a connecting move that takes two. */
function BeatDemo() {
  const still = useStill();
  const root = useRef<HTMLDivElement>(null);
  const travel = 330;
  useEffect(() => {
    if (still || !root.current) return;
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ repeat: -1, defaults: { immediateRender: false } });
      const ticks = gsap.utils.toArray<HTMLElement>("[data-tick]");
      ticks.forEach((tick, i) => {
        timeline.set(tick, { opacity: 1, scaleY: 1.8 }, i * BEAT);
        timeline.to(tick, { opacity: 0.3, scaleY: 1, duration: BEAT * 0.9, ease: "power2.out" }, i * BEAT);
      });
      timeline.fromTo("[data-accent]", { x: 0 }, { x: travel, duration: 3 * BEAT, ease: BURST }, BEAT);
      timeline.fromTo("[data-flow]", { x: 0 }, { x: travel, duration: 2 * BEAT, ease: FLOW }, BEAT);
      timeline.fromTo("[data-accent]", { x: travel }, { x: 0, duration: 3 * BEAT, ease: BURST }, 5 * BEAT);
      timeline.fromTo("[data-flow]", { x: travel }, { x: 0, duration: 2 * BEAT, ease: FLOW }, 5 * BEAT);
      timeline.to({}, { duration: 0 }, 8 * BEAT);
    }, root);
    return () => ctx.revert();
  }, [still]);
  const row = (name: string, attr: Record<string, string>, color: string) => (
    <div className="flex items-center" style={{ gap: 20 }}>
      <span className="t-sign mute" style={{ width: 110 }}>
        {name}
      </span>
      <div className="relative" style={{ width: travel + 44, height: 44 }}>
        <div className="absolute" style={{ left: 0, right: 0, top: 21.5, height: 1, background: "var(--line)" }} />
        <div {...attr} className="absolute" style={{ left: 0, top: 0, width: 44, height: 44, background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
  return (
    <div ref={root} className="flex flex-col" style={{ gap: 18, width: 560 }}>
      {row("Accent", { "data-accent": "" }, VIOLET)}
      {row("Doorloop", { "data-flow": "" }, LIGHT)}
      <div className="flex items-end" style={{ gap: 0, marginLeft: 130, height: 26 }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={{ width: (travel + 44) / 8 }}>
            <div data-tick="" style={{ width: 3, height: 12, background: LILAC, opacity: 0.3, transformOrigin: "bottom" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Soft by nature: pressed flat it squirts out sideways, squeezed from the sides it bulges up. */
function SoftDemo() {
  const still = useStill();
  const mark = useRef<MarkHandle>(null);
  useEffect(() => {
    if (still) return;
    const pose: Pose = { ...MARK_SHAPES.portrait, gap: 0 };
    const draw = () => mark.current?.draw(pose);
    let flat = false;
    const timer = window.setInterval(() => {
      flat = !flat;
      morphPose(pose, { ...(flat ? MARK_SHAPES.landscape : MARK_SHAPES.portrait), gap: 0 }, draw);
    }, 6 * BEAT * 1000);
    return () => {
      window.clearInterval(timer);
      gsap.killTweensOf(pose);
    };
  }, [still]);
  return (
    <div className="flex items-center justify-center" style={{ width: 560, height: 220 }}>
      <Mark ref={mark} initial={still ? MARK_SHAPES.landscape : MARK_SHAPES.portrait} className="size-[200px]" />
    </div>
  );
}

const RULES: { title: string; text: string; demo: ReactNode }[] = [
  { title: "Het blok duwt", text: "Het blok is het enige dat uit zichzelf beweegt. Woorden en labels worden er als één geheel door opzijgeduwd.", demo: <PushDemo /> },
  { title: "Alles op de tel", text: "Een accent haalt uit en schiet door, een doorloop glijdt. Alles begint en eindigt op een tel van een kwart seconde.", demo: <BeatDemo /> },
  { title: "Zacht van aard", text: "Breedte en hoogte bewegen nooit gelijk op. Platgedrukt wordt het blok breed, van opzij ingeknepen wordt het hoog.", demo: <SoftDemo /> },
];

/** The three rules of the motion, each next to the thing itself doing it. */
function Principes() {
  const rowH = PH / RULES.length;
  return (
    <Plane tone="dark">
      {RULES.map((r, i) => (
        <div key={r.title} className="absolute" style={{ left: 0, top: i * rowH, width: PW, height: rowH }}>
          {i > 0 && <Rule at={0.5 + i * 0.4} className="absolute" style={{ left: 0, top: 0 }} />}
          <Fade at={1 + i * 0.6} className="absolute flex items-center justify-center" style={{ left: 0, top: 0, width: 760, height: rowH }}>
            {r.demo}
          </Fade>
          <Fade at={1.5 + i * 0.6} className="absolute" style={{ left: 800, right: PAD, top: rowH / 2 - 86 }}>
            <div className="f-label tabular" style={{ fontSize: 30, lineHeight: "30px", color: LILAC }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="t-card" style={{ marginTop: 12 }}>
              {r.title}
            </div>
            <div className="t-aside mute" style={{ marginTop: 10 }}>
              {r.text}
            </div>
          </Fade>
        </div>
      ))}
    </Plane>
  );
}

/* ───────────────────────────── Win, iets, win ───────────────────────────── */

/** The two that say most about what Win Win does: reach that grows, and the jackpot. */
const FEATURED = ["reach", "jackpot"];

/** One way of playing with the middle, looping in its own cell. */
function Cell({ id, n, x, y, w, h, stage, at }: { id: string; n: number; x: number; y: number; w: number; h: number; stage: number; at: number }) {
  const still = useStill();
  const v = VARIANTS.find((variant) => variant.id === id)!;
  const big = stage > 600;
  return (
    <div className="absolute overflow-hidden" style={{ left: x, top: y, width: w, height: h }}>
      <Fade at={at} className="absolute flex items-center justify-center" style={{ left: 0, right: 0, top: 0, height: h - (big ? 190 : 150) }}>
        <div style={{ width: stage }}>
          <VariantStage variant={v} still={still} className="block w-full" />
        </div>
      </Fade>
      <Fade at={at + 0.5} className="absolute" style={{ left: big ? 60 : 36, right: big ? 60 : 30, bottom: big ? 56 : 26 }}>
        <div className="flex items-baseline" style={{ gap: 14 }}>
          <span className="t-sign tabular mute">{String(n).padStart(2, "0")}</span>
          <span className="t-card" style={big ? undefined : { fontSize: 28, lineHeight: "34px" }}>
            {v.title}
          </span>
        </div>
        <div className={big ? "t-aside mute" : "t-sign mute"} style={{ marginTop: 6, fontWeight: 400, minHeight: big ? 64 : 48 }}>
          {v.note}
        </div>
      </Fade>
    </div>
  );
}

/** Reach and jackpot, together and large. */
function Twee() {
  const top = 110;
  const w = FW / 2;
  return (
    <Stage tone="dark">
      <Corner />
      <Rule at={0.5} className="absolute" style={{ left: 0, top, width: FW }} />
      <Rule vertical at={1} className="absolute" style={{ left: w, top, height: PH - top }} />
      {FEATURED.map((id, i) => (
        <Cell key={id} id={id} n={i + 1} x={i * w} y={top} w={w} h={PH - top} stage={760} at={1.5 + i * 0.5} />
      ))}
    </Stage>
  );
}

/* ───────────────────────────── Laders ───────────────────────────── */

/** Px per unit of the logo's drawing, for the loader on the page. */
const LOADER_U = 0.86;
/**
 * Nothing loaded yet: the square. Everything loaded: a block as wide as the
 * page allows, with the words pushed out to the edges. Much wider than the
 * landscape of the logo: loading is the one place where the block may take
 * all the room there is.
 */
const EMPTY: Pose = STATES.square;
const FULL: Pose = { ...STATES.landscape, w: (PW - 2 * PAD) / LOADER_U - 2 * WORD.width - 2 * STATES.landscape.gap };
const STAGES = [
  { to: 0.12, counts: 2 },
  { to: 0.31, counts: 3 },
  { to: 0.44, counts: 2 },
  { to: 0.82, counts: 4 },
  { to: 1, counts: 3 },
];
const between = (progress: number): Pick<Pose, "w" | "gap"> => ({
  w: EMPTY.w + progress * (FULL.w - EMPTY.w),
  gap: EMPTY.gap + progress * (FULL.gap - EMPTY.gap),
});

/** The page loader of the site, with its count large enough for a slide. */
function PageLoader({ width }: { width: number }) {
  const still = useStill();
  const lockup = useRef<LockupHandle>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (still) return;
    const pose: Pose = { ...EMPTY };
    const progress = { value: 0 };
    const draw = () => {
      lockup.current?.draw(pose);
      if (count.current) count.current.textContent = String(Math.round(progress.value)).padStart(3, "0");
    };
    const timeline = gsap.timeline({ repeat: -1, onUpdate: draw, defaults: { immediateRender: false } });
    let at = BEAT;
    let loaded = 0;
    for (const stage of STAGES) {
      const duration = stage.counts * BEAT;
      timeline.fromTo(pose, between(loaded), { ...between(stage.to), duration, ease: FLOW }, at);
      timeline.fromTo(progress, { value: loaded * 100 }, { value: stage.to * 100, duration, ease: FLOW }, at);
      at += duration + BEAT;
      loaded = stage.to;
    }
    // Done: the block closes in from the edges and spins onto its point.
    const logo: Pose = { ...STATES.diamond, rot: 225 };
    timeline.fromTo(pose, { ...FULL }, { ...logo, duration: 4 * BEAT, ease: BURST }, at);
    at += 4 * BEAT + 4 * BEAT;
    timeline.fromTo(pose, { ...logo }, { ...EMPTY, rot: 360, duration: 2 * BEAT, ease: FLOW }, at);
    timeline.set(progress, { value: 0 }, at + BEAT);
    at += 2 * BEAT;
    timeline.set(pose, { rot: 0 }, at);
    timeline.to({}, { duration: 0 }, at + BEAT);
    return () => void timeline.kill();
  }, [still]);

  return (
    <div className="flex flex-col items-center" style={{ width }}>
      <Lockup ref={lockup} initial={still ? { ...EMPTY, ...between(0.82) } : EMPTY} className="block w-full" />
      <span ref={count} className="t-figure tabular" style={{ fontSize: 44, lineHeight: "44px", color: LILAC, marginTop: -40 }}>
        {still ? "082" : "000"}
      </span>
    </div>
  );
}

/** The page loader above, the small loader in four sizes below. */
function Laders() {
  const still = useStill();
  const split = 640;
  const small = (size: number) => (
    <div style={{ width: size, height: size }}>{still ? <Mark className="size-full" initial={MARK_SHAPES.diamond} /> : <MarkLoader className="size-full" />}</div>
  );
  return (
    <Plane tone="dark">
      <Fade at={0.5} className="absolute flex items-center justify-center" style={{ left: 0, top: 0, width: PW, height: split }}>
        <PageLoader width={1000 * LOADER_U} />
      </Fade>
      <Fade at={2} className="t-sign mute absolute" style={{ left: PAD, top: 44 }}>
        Paginalader
      </Fade>
      <Rule at={1.5} className="absolute" style={{ left: 0, top: split, width: PW }} />
      <Fade at={2.5} className="t-sign mute absolute" style={{ left: PAD, top: split + 40 }}>
        Kleine lader
      </Fade>
      <Fade at={3} className="absolute flex items-center" style={{ left: PAD, right: PAD, top: split + 110, height: 240, gap: 110 }}>
        {small(36)}
        {small(72)}
        {small(150)}
        <span className="ml-auto flex items-center" style={{ gap: 20, height: 84, padding: "0 40px", background: LIGHT, color: DARK, fontSize: 28, fontWeight: 600 }}>
          {small(28)}
          Versturen
        </span>
        <span className="flex items-center" style={{ gap: 20, height: 84, padding: "0 40px", background: VIOLET, color: LIGHT, fontSize: 28, fontWeight: 600 }}>
          {small(28)}
          Laden
        </span>
      </Fade>
    </Plane>
  );
}

/* ───────────────────────────── Knoppen en navigatie ───────────────────────────── */

const NAV = ["Werk", "Creators", "Over ons", "Contact"];
const PAGES = ["Creators", "Cases", "Over ons"];
/** Side of the covering block before it grows, in px. */
const SEED = 40;

/** Going from page to page: the diamond bursts open until it covers the frame, the page changes underneath, and the block turns on and shrinks away. */
function Transition({ width, height }: { width: number; height: number }) {
  const still = useStill();
  const cover = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const [page, setPage] = useState(0);
  const [touched, setTouched] = useState(false);

  const next = useCallback(() => {
    if (busy.current || !cover.current) return;
    busy.current = true;
    const reach = (Math.hypot(width, height) / SEED) * 1.1;
    gsap
      .timeline({ onComplete: () => void (busy.current = false) })
      .set(cover.current, { scale: 0, rotation: 45, autoAlpha: 1 })
      .to(cover.current, { scale: reach, rotation: 135, duration: 3 * BEAT, ease: SNAP })
      .add(() => setPage((current) => (current + 1) % PAGES.length))
      .to(cover.current, { scale: 0, rotation: 225, duration: 2 * BEAT, ease: FLOW }, `+=${BEAT}`)
      .set(cover.current, { autoAlpha: 0 });
  }, [width, height]);

  useEffect(() => {
    const el = cover.current;
    return () => gsap.killTweensOf(el);
  }, []);

  // Left alone, it shows itself every few seconds.
  useEffect(() => {
    if (still || touched) return;
    const timer = window.setInterval(next, 16 * BEAT * 1000);
    return () => window.clearInterval(timer);
  }, [still, touched, next]);

  return (
    <div className="ww--dark relative overflow-hidden" style={{ width, height, background: DARK, color: LIGHT }}>
      <span className="t-sign mute absolute" style={{ left: 40, top: 32 }}>
        /{PAGES[page].toLowerCase().replace(" ", "-")}
      </span>
      <div className="f-title absolute" style={{ left: 36, bottom: 24, fontSize: 132, lineHeight: "132px" }}>
        {PAGES[page]}
      </div>
      <div className="absolute" style={{ right: 40, bottom: 44 }}>
        <PushLabel
          rest={MARK_SHAPES.diamond}
          hover={MARK_SHAPES.landscape}
          onClick={() => {
            setTouched(true);
            next();
          }}
          className="text-[26px] font-semibold"
        >
          Volgende pagina
        </PushLabel>
      </div>
      <div ref={cover} aria-hidden className="pointer-events-none invisible absolute" style={{ left: "50%", top: "50%", width: SEED, height: SEED, marginLeft: -SEED / 2, marginTop: -SEED / 2, background: LIGHT, borderRadius: 1 }} />
    </div>
  );
}

/** Navigation, two buttons and the page transition, all live: hover, press and click. */
function Interactie() {
  return (
    <Plane tone="light">
      <Fade at={1} className="t-sign mute absolute" style={{ left: PAD, top: 44 }}>
        Navigatie
      </Fade>
      <Fade at={1.5} className="absolute flex" style={{ left: PAD, top: 104, gap: 56, fontSize: 44, fontWeight: 600, letterSpacing: "-0.01em" }}>
        {NAV.map((item, index) => (
          <PushLabel key={item} rest={index === 0 ? MARK_SHAPES.diamond : MARK_SHAPES.none} hover={index === 0 ? MARK_SHAPES.landscape : MARK_SHAPES.bud}>
            {item}
          </PushLabel>
        ))}
      </Fade>
      <Rule at={1.5} className="absolute" style={{ left: 0, top: 232, width: PW }} />
      <Fade at={2} className="t-sign mute absolute" style={{ left: PAD, top: 268 }}>
        Knoppen
      </Fade>
      <Fade at={2.5} className="absolute flex items-center" style={{ left: PAD, top: 322, gap: 24 }}>
        <PushLabel rest={MARK_SHAPES.diamond} hover={MARK_SHAPES.landscape} className="bg-[rgb(var(--ink))] px-[44px] py-[26px] text-[30px] font-semibold text-[var(--background)]">
          Werk met ons
        </PushLabel>
        <PushLabel rest={MARK_SHAPES.square} hover={MARK_SHAPES.portrait} press={MARK_SHAPES.diamond} className="border border-[rgb(var(--ink)/0.30)] px-[44px] py-[26px] text-[30px] font-semibold">
          Bekijk cases
        </PushLabel>
        <PushLabel rest={MARK_SHAPES.diamond} hover={MARK_SHAPES.landscape} className="bg-[#593CFF] px-[44px] py-[26px] text-[30px] font-semibold text-[#F3F6FF]">
          Plan een gesprek
        </PushLabel>
      </Fade>
      <Rule at={2.5} className="absolute" style={{ left: 0, top: 480, width: PW }} />
      <Fade at={3} className="t-sign mute absolute" style={{ left: PAD, top: 516 }}>
        Paginaovergang
      </Fade>
      <Fade at={3.5} className="absolute" style={{ left: PAD, top: 572 }}>
        <Transition width={PW - 2 * PAD} height={436} />
      </Fade>
    </Plane>
  );
}

export const slides: Record<string, ComponentType> = {
  "beweging-lus": Lus,
  "beweging-principes": Principes,
  "beweging-twee": Twee,
  "beweging-laders": Laders,
  "beweging-interactie": Interactie,
};
