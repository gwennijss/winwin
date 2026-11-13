"use client";

import { useEffect, useRef, type ComponentType, type ReactNode } from "react";
import { useAnimationFrame } from "motion/react";
import WinWord from "@/assets/logo/win-left.svg";
import { STATES, WORD, extent, type StateName } from "@/components/winwin-logo/geometry";
import { Fade, flow, useStill } from "@/deck/motion";
import { Block, Corner, DARK, Field, FW, LIGHT, LILAC, LiveTag, LogoStill, Picture, Stage, VIOLET } from "../parts";

/**
 * The website, after a reference the client brought: one page in two parts.
 * On the left a violet panel that stays where it is, with the logo's own
 * words running through it at full height; between every two words the block
 * stands in another of its formats, as a window on the work. On the right a
 * light column that scrolls, section by section. The words move with the
 * scroll and keep drifting when it rests.
 */

const W = 1760;
const H = 900;
/** The panel on the left and the column on the right. */
const LEFT = 1010;
const RIGHT = W - LEFT;
const PAD = 30;
const INNER = RIGHT - 2 * PAD;

/* ───────────────────────────── The running words ───────────────────────────── */

/** The height of the letters in the panel, and the px per unit of the logo's drawing that gives. */
const LETTER = 290;
const U = LETTER / WORD.height;

/** One round of the run: after every WIN the block in another format, some with the work in it. */
const RUN: { state: StateName; n?: number; position?: string }[] = [
  { state: "diamond" },
  { state: "portrait", n: 4, position: "50% 30%" },
  { state: "landscape", n: 5, position: "50% 38%" },
  { state: "square" },
  { state: "post", n: 7, position: "50% 30%" },
];

/** The width of one round for letters this tall, so the run can start over unseen. */
export const roundOf = (letter: number) => RUN.reduce((sum, r) => sum + ((WORD.width + extent(STATES[r.state]) + 2 * STATES[r.state].gap) * letter) / WORD.height, 0);

const ROUND = roundOf(LETTER);

/** One round of the logo's words with the block between them, the letters as tall as given. Wrap it in `winwin-logo` for its colour. */
export function Run({ letter = LETTER }: { letter?: number }) {
  const u = letter / WORD.height;
  return (
    <>
      {RUN.map((r, i) => {
        const pose = STATES[r.state];
        return (
          <div key={i} className="flex shrink-0 items-center">
            <WinWord width={WORD.width * u} height={letter} aria-hidden />
            <div className="flex shrink-0 items-center justify-center" style={{ width: extent(pose) * u, margin: `0 ${pose.gap * u}px` }}>
              <Block state={r.state} unit={u}>
                {r.n !== undefined && <Picture n={r.n} live={false} position={r.position} />}
              </Block>
            </div>
          </div>
        );
      })}
    </>
  );
}

/**
 * The run on its own, drifting to the left at a steady pace, for a banner.
 * It fills the width of what it is put in; in the PDF it stands still.
 */
export function Running({ letter, height, speed, start = 0 }: { letter: number; height: number; speed: number; start?: number }) {
  const still = useStill();
  const track = useRef<HTMLDivElement>(null);
  const round = roundOf(letter);
  useAnimationFrame((ms) => {
    if (still || !track.current) return;
    track.current.style.transform = `translate3d(${-((start + (ms / 1000) * speed) % round)}px, 0, 0)`;
  });
  return (
    <div ref={track} className="winwin-logo absolute flex items-center" style={{ left: 0, top: 0, height, transform: `translate3d(${-start}px, 0, 0)`, willChange: "transform" }}>
      <Run letter={letter} />
      <Run letter={letter} />
    </div>
  );
}

/* ───────────────────────────── The column ───────────────────────────── */

const Title = ({ children }: { children: ReactNode }) => (
  <div className="f-title" style={{ fontSize: 46, lineHeight: "50px", padding: "26px 0 18px" }}>
    {children}
  </div>
);

const More = () => (
  <span style={{ fontSize: 16, lineHeight: "22px", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>Lees meer »</span>
);

/** A picture of the work with the label on it, as it stands on the video itself. */
function Shot({ n, h, position, tag, live = false }: { n: number; h: number; position?: string; tag?: ReactNode; live?: boolean }) {
  return (
    <div className="relative overflow-hidden" style={{ width: INNER, height: h, background: "#111" }}>
      <Picture n={n} live={live} position={position} />
      {tag && (
        <div className="absolute" style={{ left: 18, bottom: 18 }}>
          {tag}
        </div>
      )}
    </div>
  );
}

const FIGURES = [
  ["4,1M", "weergaven"],
  ["74%", "uitgekeken"],
  ["12", "creators"],
  ["+38%", "meer bereik"],
];

const CHANNELS = [
  ["Instagram", "Reels · feed · stories", "9:16 · 4:5 · 1:1"],
  ["TikTok", "Video", "9:16"],
  ["YouTube", "Video · Shorts", "16:9 · 9:16"],
  ["LinkedIn", "Post · video", "1:1 · 16:9"],
  ["Snapchat", "Spotlight", "9:16"],
];

const WORK: [number, string, string][] = [
  [1, "Boost", "50% 30%"],
  [8, "Creators", "50% 30%"],
  [3, "Content", "50% 50%"],
  [5, "Resultaten", "50% 35%"],
];

/** The column once. It is laid out twice under each other, so the scroll can start over unseen. */
function Column({ first }: { first: boolean }) {
  const tile = (INNER - 20) / 2;
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      {/* The navigation, and the newest work. */}
      <section data-stop>
        <div className="flex items-start justify-between" style={{ paddingTop: 24, fontSize: 19, lineHeight: "25px", fontWeight: 600 }}>
          <div>
            <div>↳ Werk</div>
            <div>↳ Creators</div>
            <div>↳ Over ons</div>
          </div>
          <span style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>Contact »</span>
        </div>
        <div style={{ height: 34 }} />
        <Title>Nieuw werk</Title>
        <Shot n={7} h={440} position="50% 32%" live={first} tag={<LiveTag size={15}>De Kuyper</LiveTag>} />
        <div style={{ padding: "16px 0 26px", width: 520 }}>
          <div className="t-cap" style={{ fontSize: 17, lineHeight: "23px", letterSpacing: "0.04em" }}>
            Twaalf creators zetten de zomer in voor De Kuyper
          </div>
          <More />
        </div>
        <Shot n={4} h={330} position="50% 40%" />
        <div style={{ padding: "16px 0 30px", width: 520 }}>
          <div className="t-cap" style={{ fontSize: 17, lineHeight: "23px", letterSpacing: "0.04em" }}>
            Eén campagne, in het formaat van elk kanaal
          </div>
          <More />
        </div>
      </section>

      {/* The results, on the brand's dark. */}
      <section data-stop>
        <Title>Resultaten</Title>
        <div className="ww--dark grid grid-cols-2" style={{ width: INNER, height: 420, background: DARK, color: LIGHT }}>
          {FIGURES.map(([value, caption], i) => (
            <div key={caption} className="relative" style={{ borderLeft: i % 2 ? "1px solid var(--line)" : undefined, borderTop: i > 1 ? "1px solid var(--line)" : undefined }}>
              <div className="absolute" style={{ left: 26, bottom: 22 }}>
                <div className="f-label" style={{ fontSize: 104, lineHeight: "96px", color: LILAC }}>
                  {value}
                </div>
                <div className="t-cap" style={{ marginTop: 4, opacity: 0.84 }}>
                  {caption}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 34 }} />
      </section>

      {/* Where the work runs, and in which format. */}
      <section data-stop>
        <Title>Kanalen</Title>
        <div style={{ borderBottom: "1px solid var(--line)" }}>
          {CHANNELS.map(([name, what, formats]) => (
            <div key={name} className="flex items-center" style={{ height: 62, borderTop: "1px solid var(--line)" }}>
              <span className="shrink-0" style={{ width: 9, height: 9, background: VIOLET, borderRadius: 1, marginRight: 16 }} />
              <span className="shrink-0" style={{ width: 200, fontSize: 22, lineHeight: "28px", fontWeight: 600 }}>
                {name}
              </span>
              <span className="mute min-w-0 flex-1" style={{ fontSize: 17, lineHeight: "24px", fontWeight: 500 }}>
                {what}
              </span>
              <span className="tabular shrink-0 text-right" style={{ fontSize: 17, lineHeight: "24px", fontWeight: 500 }}>
                {formats}
              </span>
            </div>
          ))}
        </div>
        <div style={{ height: 38 }} />
      </section>

      {/* The work, as a grid. */}
      <section data-stop>
        <Title>Werk</Title>
        <div className="grid grid-cols-2" style={{ gap: "0 20px" }}>
          {WORK.map(([n, service, position]) => (
            <div key={service} style={{ paddingBottom: 26 }}>
              <div className="relative overflow-hidden" style={{ width: tile, height: tile, background: "#111" }}>
                <Picture n={n} live={false} position={position} />
              </div>
              <div className="t-cap" style={{ marginTop: 12, fontSize: 17, letterSpacing: "0.04em" }}>
                De Kuyper
              </div>
              <div className="mute" style={{ fontSize: 16, lineHeight: "20px", fontWeight: 500 }}>
                {service}
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 30 }} />
      </section>
    </div>
  );
}

/* ───────────────────────────── The page ───────────────────────────── */

/** Seconds the column rests on a section, and takes to get to the next. */
const REST = 1.3;
const MOVE = 1.7;
/** Before the first scroll: the page has to stand first. */
const WAIT = 2.6;
/** How far the words move per px of scroll, and how fast they drift on their own, in px a second. */
const PULL = 0.5;
const DRIFT = 64;
/** Where the run stands at rest: far enough in for the first block to show. */
const START = WORD.width * U * 0.42;

function Website() {
  const still = useStill();
  const run = useRef<HTMLDivElement>(null);
  const column = useRef<HTMLDivElement>(null);
  const once = useRef<HTMLDivElement>(null);
  /** Where each section starts, and how tall the column is once. */
  const stops = useRef<number[]>([0]);
  const height = useRef(0);

  useEffect(() => {
    const measure = () => {
      const el = once.current;
      if (!el) return;
      height.current = el.offsetHeight;
      stops.current = Array.from(el.querySelectorAll<HTMLElement>("[data-stop]")).map((s) => s.offsetTop);
    };
    measure();
    void document.fonts?.ready.then(measure);
  }, []);

  useAnimationFrame((ms) => {
    if (still || !height.current) return;
    const t = Math.max(0, ms / 1000 - WAIT);
    const marks = stops.current;
    const step = REST + MOVE;
    const round = Math.floor(t / (marks.length * step));
    const within = t - round * marks.length * step;
    const i = Math.min(marks.length - 1, Math.floor(within / step));
    const local = within - i * step;
    const from = marks[i];
    const to = i + 1 < marks.length ? marks[i + 1] : height.current;
    const y = from + (to - from) * (local < REST ? 0 : flow((local - REST) / MOVE));
    if (column.current) column.current.style.transform = `translate3d(0, ${-y}px, 0)`;
    const x = (START + (round * height.current + y) * PULL + (ms / 1000) * DRIFT) % ROUND;
    if (run.current) run.current.style.transform = `translate3d(${-x}px, 0, 0)`;
  });

  return (
    <Stage tone="dark">
      <Corner />
      <div className="absolute" style={{ left: (FW - W) / 2, top: 120, width: W, height: H }}>
        {/* The panel that stays. */}
        <Field tone="violet" from="left" at={0.5} style={{ left: 0, top: 0, width: LEFT, height: H }}>
          <div className="winwin-logo absolute flex items-center" ref={run} style={{ left: 0, top: 96, height: 660, transform: `translate3d(${-START}px, 0, 0)`, willChange: "transform" }}>
            <Run />
            <Run />
          </div>
          <div className="absolute" style={{ left: PAD - 17, top: 16 }}>
            <LogoStill width={150} />
          </div>
          <div className="t-sign absolute" style={{ left: 372, top: 24, opacity: 0.84 }}>
            Influencer agency
          </div>
          <div className="t-sign absolute text-right" style={{ right: PAD, top: 24, opacity: 0.84 }}>
            Elk kanaal, elk formaat
          </div>
          <Fade at={4} className="absolute" style={{ left: PAD, bottom: 26, width: 560, fontSize: 23, lineHeight: "30px", fontWeight: 500 }}>
            <span className="t-cap" style={{ fontSize: 12, letterSpacing: "0.08em", opacity: 0.7, marginRight: 14, verticalAlign: "0.2em" }}>
              Over ons
            </span>
            Win Win is een influencer agency. Wij koppelen merken aan creators, en maken werk dat past in elk formaat en op elk kanaal.
          </Fade>
        </Field>
        {/* The column that scrolls. */}
        <Field tone="light" from="bottom" at={1.5} style={{ left: LEFT, top: 0, width: RIGHT, height: H }}>
          <div ref={column} style={{ willChange: "transform" }}>
            <div ref={once}>
              <Column first />
            </div>
            <Column first={false} />
          </div>
        </Field>
      </div>
    </Stage>
  );
}

export const slides: Record<string, ComponentType> = {
  "toep-website": Website,
};
