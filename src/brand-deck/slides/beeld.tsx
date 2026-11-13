"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import gsap from "gsap";
import { motion } from "motion/react";
import { CaseOverlay, READABLE, type CaseText } from "@/components/case/CaseOverlay";
import { VIOLET_LIGHT_MARK } from "@/components/labels/palette";
import { StatBlocks, STATS_STILL, type Pair } from "@/components/stats/StatBlocks";
import { Fade, Pop, Rise, Rule, useStill } from "@/deck/motion";
import { DEEP, LabelDivider, LILAC, LiveTag, Measure, PAD, PH, Plane, PW, Reel, Tag, VIOLET } from "../parts";

/* ───────────────────────────── Het label ───────────────────────────── */

/** The label, large and alone on the brand's dark, building itself and packing itself away. */
function Label() {
  return (
    <Plane tone="dark">
      <div className="absolute flex items-center justify-center" style={{ left: 0, top: 0, width: PW, height: PH - 80 }}>
        <LiveTag size={92}>Creators</LiveTag>
      </div>
      <Fade at={4} className="t-sign mute absolute text-center" style={{ left: 0, width: PW, bottom: 84 }}>
        Negen tellen opbouwen, twee seconden staan, en weer inpakken.
      </Fade>
    </Plane>
  );
}

/* ───────────────────────────── Opbouw van het label ───────────────────────────── */

/** The square of a label on its own, at a font size, with or without its diamond. */
function Vak({ size, mark = true }: { size: number; mark?: boolean }) {
  return (
    <span className="inline-flex items-center justify-center" style={{ fontSize: size, width: "2.4em", height: "2.4em", background: VIOLET, borderRadius: "0.05em" }}>
      {mark && <span style={{ width: "0.72em", height: "0.72em", background: DEEP, borderRadius: "0.03em", transform: "rotate(45deg)" }} />}
    </span>
  );
}

const STEPS: { n: string; title: string; text: string; node: ReactNode }[] = [
  { n: "Tel 0 tot 2", title: "Het vak", text: "Springt uit het niets: eerst de breedte, vlak daarna de hoogte.", node: <Vak size={30} mark={false} /> },
  { n: "Tel 0,5 tot 4", title: "De ruit", text: "Krijgt een tik als een tol, draait anderhalve slag en staat stil.", node: <Vak size={30} /> },
  { n: "Tel 4 tot 7", title: "Het woord", text: "Pas dan schuift het lichte vak eruit, met het woord erachteraan.", node: <Tag size={30}>Creators</Tag> },
];

/** The label on its measures, all in shares of the font size, and the three steps it builds itself in. */
function LabelOpbouw() {
  const size = 92;
  const h = 2.4 * size;
  // The label is the square, then the word at 1.45 em with its padding.
  const T = 150;
  const L = 250;
  const CH = 640;
  return (
    <Plane tone="dark">
      <Rise at={0.5} y={16} className="absolute" style={{ left: L, top: T }}>
        <Tag size={size}>Creators</Tag>
      </Rise>
      <Measure x={L - 44} y={T} length={h} vertical label="2,4 em" at={3} labelSide="before" />
      <Measure x={L} y={T + h + 40} length={h} label="Vierkant: 2,4 em" at={3.5} />
      <Measure x={L + h + 0.47 * 1.45 * size} y={T + h + 40} length={500} label="Het woord: 1,45 em" at={4} />
      <Measure x={L + h / 2 - 0.36 * size * 1.414} y={T - 40} length={0.72 * size * 1.414} label="Ruit: 0,72 em" at={4.5} labelSide="before" />
      <Fade at={5} className="t-sign absolute" style={{ left: L, top: T + h + 130, width: 900, color: LILAC, fontWeight: 400 }}>
        Ronding: 0,05 em. Het woord staat iets onder het midden, zodat de kapitalen zelf in het midden staan.
      </Fade>
      <Rule at={4} className="absolute" style={{ left: 0, top: CH, width: PW }} />
      {STEPS.map((s, i) => (
        <div key={s.title} className="absolute" style={{ left: i * (PW / 3), top: CH, width: PW / 3, height: PH - CH }}>
          {i > 0 && <Rule vertical at={4.5} className="absolute" style={{ left: 0, top: 0, height: PH - CH }} />}
          <Pop at={5 + i} origin="left center" className="absolute" style={{ left: 40, top: 48 }}>
            {s.node}
          </Pop>
          <Fade at={5.5 + i} className="absolute" style={{ left: 40, right: 36, top: 160 }}>
            <div className="t-cap" style={{ color: LILAC }}>
              {s.n}
            </div>
            <div className="t-card" style={{ marginTop: 8 }}>
              {s.title}
            </div>
            <div className="t-sign mute" style={{ marginTop: 8, fontWeight: 400 }}>
              {s.text}
            </div>
          </Fade>
        </div>
      ))}
    </Plane>
  );
}

/* ───────────────────────────── Labels gebruiken ───────────────────────────── */

const STACK = ["Creators", "Campagnes", "Content", "Community"];

const USES: { title: string; text: string; node: ReactNode }[] = [
  { title: "Alleen", text: "Eén woord dat benoemt wat je ziet. De ruit in het paarse vak staat in de diepe tint.", node: <LiveTag size={44}>Creators</LiveTag> },
  {
    title: "Met een blokje ertussen",
    text: "Twee dingen in één label: de dienst en de klant. Het blokje is het blok van het logo, in het klein.",
    node: (
      <Tag size={44}>
        Boost
        <LabelDivider />
        BYD
      </Tag>
    ),
  },
  {
    title: "Als stapel",
    text: "Elk label begint een tel na het vorige. Hier met de ruit in de zachte tint: dat mag ook, maar kies er één per beeld.",
    node: (
      <div className="flex flex-col items-start" style={{ gap: 10 }}>
        {STACK.map((word, i) => (
          <LiveTag key={word} size={27} delay={i * 0.25} colours={VIOLET_LIGHT_MARK}>
            {word}
          </LiveTag>
        ))}
      </div>
    ),
  },
];

/** The three ways a label is used, each live next to what it is for. */
function LabelGebruik() {
  const rowH = PH / USES.length;
  return (
    <Plane tone="dark">
      {USES.map((u, i) => (
        <div key={u.title} className="absolute" style={{ left: 0, top: i * rowH, width: PW, height: rowH }}>
          {i > 0 && <Rule at={0.5 + i * 0.4} className="absolute" style={{ left: 0, top: 0 }} />}
          <div className="absolute flex items-center" style={{ left: PAD + 20, top: 0, width: 680, height: rowH }}>
            {u.node}
          </div>
          <Fade at={1.5 + i * 0.6} className="absolute" style={{ left: 800, right: PAD, top: rowH / 2 - 70 }}>
            <div className="t-card">{u.title}</div>
            <div className="t-aside mute" style={{ marginTop: 10 }}>
              {u.text}
            </div>
          </Fade>
        </div>
      ))}
    </Plane>
  );
}

/* ───────────────────────────── Het tekstvlak ───────────────────────────── */

/** Stand-in text, as on the case page of the site: the campaign and its figures are made up. */
const CASE: CaseText = {
  service: "Boost",
  client: "BYD",
  title: ["Twaalf creators,", "één proefrit."],
  body: "BYD wilde elektrisch rijden dichterbij brengen. Wij gaven twaalf creators een week de sleutels en zetten hun beste video's door met Boost.",
  figures: [
    { value: "4,1 mln", caption: "keer bekeken" },
    { value: "+38%", caption: "proefritten" },
  ],
};

/* ───────────────────────────── Ontleed ───────────────────────────── */

/** A part of an overlay to point at: where to find it, which side its name goes, and what to say. */
type Pointer = { selector: string; index?: number; side: "left" | "right"; title: string; text: string };

/** Where a pointer starts, in px on the plane. */
type Mark = { x: number; y: number };

const REEL_W = 500;
const REEL_H = (REEL_W * 16) / 9;
const REEL_L = (PW - REEL_W) / 2;
const REEL_T = (PH - REEL_H) / 2 - 10;
/** How far outside the video a name stands, and how wide it may be. */
const REACH = 64;
const NAME_W = 300;

/**
 * A portrait video with an overlay on it, shown the way it is meant to be
 * seen first: the video plays and the overlay does its thing, with nothing
 * around it. Only then is it taken apart: the overlay stands still, and thin
 * lines come out of the video and name its parts.
 *
 * `wait` is how long it plays before that, in seconds, or "round" for one
 * whole round of the overlay. `holdAt` is the moment of the overlay at which
 * everything can be seen.
 */
function Dissection({
  n,
  pointers,
  holdAt,
  wait,
  Overlay,
}: {
  n: number;
  pointers: Pointer[];
  holdAt: number;
  wait: number | "round";
  /** What goes over the video. It hands over its animation when it has built it. */
  Overlay: ComponentType<{ onTimeline: (timeline: gsap.core.Timeline | null) => void }>;
}) {
  const still = useStill();
  const plane = useRef<HTMLDivElement>(null);
  const reel = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  // Counts up when the overlay hands over its animation, and when it is played again.
  const [ready, setReady] = useState(0);
  const [run, setRun] = useState(0);
  // The run in which the overlay has been taken apart, and where its parts were then.
  const [opened, setOpened] = useState(-1);
  const [marks, setMarks] = useState<Mark[]>([]);
  const open = (still && marks.length > 0) || opened === run;

  const follow = useCallback((next: gsap.core.Timeline | null) => {
    timeline.current = next;
    if (next) setReady((count) => count + 1);
  }, []);

  useEffect(() => {
    const now = timeline.current;
    if (!now || !ready) return;
    const measure = (): Mark[] => {
      if (!plane.current || !reel.current) return [];
      const base = plane.current.getBoundingClientRect();
      // The page may be shown scaled; what is measured on screen is brought back to its own px.
      const zoom = base.width / PW || 1;
      return pointers.map((p) => {
        const el = reel.current!.querySelectorAll(p.selector)[p.index ?? 0];
        if (!el) return { x: REEL_L, y: REEL_T };
        const r = el.getBoundingClientRect();
        return { x: ((p.side === "left" ? r.left : r.right) - base.left) / zoom, y: (r.top + r.height / 2 - base.top) / zoom };
      });
    };
    if (still) {
      now.pause().time(holdAt);
      const frame = requestAnimationFrame(() => setMarks(measure()));
      return () => cancelAnimationFrame(frame);
    }
    now.restart();
    const after = wait === "round" ? now.duration() + holdAt : wait;
    const call = gsap.delayedCall(after, () => {
      now.pause();
      setMarks(measure());
      setOpened(run);
    });
    return () => void call.kill();
  }, [ready, run, still, holdAt, wait, pointers]);

  // Names on the same side keep clear of each other.
  const tops = (() => {
    const out = marks.map((m) => m.y);
    for (const side of ["left", "right"] as const) {
      const order = pointers.map((p, i) => i).filter((i) => pointers[i].side === side && marks[i]).sort((a, b) => out[a] - out[b]);
      for (let k = 1; k < order.length; k++) out[order[k]] = Math.max(out[order[k]], out[order[k - 1]] + 96);
    }
    return out;
  })();

  return (
    <div ref={plane} className="absolute inset-0">
      <Fade at={0.5} className="absolute" style={{ left: REEL_L, top: REEL_T }}>
        <div ref={reel}>
          <Reel width={REEL_W} n={n}>
            <Overlay onTimeline={follow} />
          </Reel>
        </div>
      </Fade>

      {open && (
        <>
          <svg className="pointer-events-none absolute inset-0" width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`} fill="none" aria-hidden>
            {marks.map((m, i) => {
              const left = pointers[i].side === "left";
              const edge = left ? REEL_L - 20 : REEL_L + REEL_W + 20;
              const end = left ? REEL_L - REACH : REEL_L + REEL_W + REACH;
              return (
                <g key={i}>
                  <motion.path
                    d={`M${m.x} ${m.y}H${edge}L${end} ${tops[i]}`}
                    stroke={LILAC}
                    strokeWidth={1.5}
                    initial={still ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.15 + i * 0.25, duration: 0.6, ease: [0.6, 0, 0.25, 1] }}
                  />
                  <motion.circle cx={m.x} cy={m.y} r={5} fill={LILAC} initial={still ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.25, duration: 0.3 }} />
                </g>
              );
            })}
          </svg>
          {marks.map((m, i) => {
            const p = pointers[i];
            const left = p.side === "left";
            return (
              <motion.div
                key={p.title}
                className="t-sign absolute"
                style={{ top: tops[i] - 12, width: NAME_W, ...(left ? { left: REEL_L - REACH - 14 - NAME_W, textAlign: "right" } : { left: REEL_L + REEL_W + REACH + 14 }) }}
                initial={still ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.25, duration: 0.4 }}
              >
                <div>{p.title}</div>
                <div className="mute" style={{ fontWeight: 400 }}>
                  {p.text}
                </div>
              </motion.div>
            );
          })}
        </>
      )}

      {!still && (
        <button type="button" onClick={() => setRun((count) => count + 1)} className="t-sign mute absolute flex items-center transition-colors duration-200 hover:text-[#F3F6FF]" style={{ right: PAD, bottom: 44, gap: 10 }}>
          <svg width={14} height={14} viewBox="0 0 14 14" fill="currentColor" aria-hidden>
            <path d="M3 1.5v11l9-5.5z" />
          </svg>
          Speel opnieuw
        </button>
      )}
    </div>
  );
}

const CASE_PARTS: Pointer[] = [
  { selector: "span.font-display", side: "left", title: "Het label", text: "De dienst en de klant. Het tabblad van het vlak." },
  { selector: "h2", side: "right", title: "De titel", text: "Twee regels in Trabat, de bovenste het langst." },
  { selector: "p", side: "left", title: "De tekst", text: "Een paar zinnen in Hanken, ongeveer 150 tekens." },
  { selector: "dl", side: "right", title: "De cijfers", text: "Twee resultaten naast elkaar, in zacht violet." },
];

function CaseLayer({ onTimeline }: { onTimeline: (timeline: gsap.core.Timeline | null) => void }) {
  return (
    // Clear of what the apps put over a video: the buttons down the right and the caption along the bottom.
    <div className="absolute bottom-[17%] left-[5.5%] w-[76%]">
      <CaseOverlay text={CASE} bodyFont="var(--font-hanken)" onTimeline={onTimeline} />
    </div>
  );
}

/** The case overlay on a portrait video: first it builds itself, then it is taken apart. */
function Case() {
  return (
    <Plane tone="dark">
      <Dissection n={4} pointers={CASE_PARTS} holdAt={READABLE} wait={READABLE + 1.5} Overlay={CaseLayer} />
    </Plane>
  );
}

/* ───────────────────────────── Resultaten ───────────────────────────── */

/** Stand-in results, as on the stats page of the site. */
const PAIRS: [Pair, Pair] = [
  [
    { value: "4,1M", caption: "weergaven" },
    { value: "74%", caption: "uitgekeken" },
  ],
  [
    { value: "12", caption: "creators" },
    { value: "+38%", caption: "meer bereik" },
  ],
];

const STAT_PARTS: Pointer[] = [
  { selector: "[data-name]", side: "left", title: "De klant", text: "Springt bovenin tevoorschijn, in een paars blok." },
  { selector: "[data-format]", index: 0, side: "left", title: "Het brede blok", text: "Hier staat het lange cijfer. Het rolt erin, teken voor teken." },
  { selector: "[data-format]", index: 1, side: "right", title: "Het smalle blok", text: "Voor het volgende paar ruilen de blokken van formaat." },
];

function StatsLayer({ onTimeline }: { onTimeline: (timeline: gsap.core.Timeline | null) => void }) {
  return <StatBlocks client="De Kuyper" pairs={PAIRS} onTimeline={onTimeline} />;
}

/** The results over the campaign video: one whole round to watch, and then they are taken apart. */
function Stats() {
  return (
    <Plane tone="dark">
      <Dissection n={5} pointers={STAT_PARTS} holdAt={STATS_STILL} wait="round" Overlay={StatsLayer} />
    </Plane>
  );
}

export const slides: Record<string, ComponentType> = {
  "beeld-label": Label,
  "beeld-label-opbouw": LabelOpbouw,
  "beeld-label-gebruik": LabelGebruik,
  "beeld-case": Case,
  "beeld-stats": Stats,
};
