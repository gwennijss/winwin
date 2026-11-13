"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import gsap from "gsap";
import { MarkLoader } from "@/components/system/MarkLoader";
import { Lockup, type LockupHandle } from "@/components/winwin-logo/Lockup";
import { STATES, WORD, extent, type Media, type Pose, type Screen, type StateName } from "@/components/winwin-logo/geometry";
import { BEAT, morphPose } from "@/components/winwin-logo/timeline";
import { Fade, Pop, Rise, Rule, useStill } from "@/deck/motion";
import { Block, Cross, DARK, DEEP, Field, Guide, LIGHT, lockupBox, LogoStill, Measure, PAD, PH, Plane, PW, type Tone, useMedia, VIOLET } from "../parts";

/** A measure as a share of the letter height, the way a Dutch reader writes it: 0,64 x. */
const x = (units: number, digits = 2) => `${(units / WORD.height).toFixed(digits).replace(".", ",")} x`;

/* ───────────────────────────── Opbouw ───────────────────────────── */

const FACTS: [string, string, string][] = [
  [x(STATES.diamond.w), "De ruit", "Een vierkant, een achtste slag gedraaid. De zijde is bijna twee derde van de letterhoogte."],
  [x(2.29, 2), "De ronding", "Dezelfde kleine ronding op elke hoek van het blok, in elke vorm."],
  [x(4.88, 2), "De balans", "Zo ver staat de ruit rechts van het midden, tussen de N en de W."],
];

/** The logo on its lines: the letter height as the measure for everything else. */
function Opbouw() {
  const W = 1240;
  const L = (PW - W) / 2;
  const T = 250;
  const b = lockupBox(W, L, T);
  const below = b.blockBottom + 44;
  return (
    <Plane tone="light">
      <Guide y={b.top} label="Kaphoogte" at={0.5} />
      <Guide y={b.bottom} label="Basislijn" at={1} below side="right" />
      <Fade at={2} className="absolute" style={{ left: L, top: T }}>
        <LogoStill width={W} />
      </Fade>
      <Measure x={b.leftWord[0] - 34} y={b.top} length={b.bottom - b.top} vertical label="x" at={4} labelSide="before" />
      <Measure x={b.leftWord[1]} y={below} length={b.blockLeft - b.leftWord[1]} label={x(STATES.diamond.gap + 4.88)} at={5} />
      <Measure x={b.blockLeft} y={b.blockTop - 40} length={b.blockRight - b.blockLeft} label={x(extent(STATES.diamond))} at={5.5} labelSide="before" />
      <Measure x={b.blockRight} y={below} length={b.rightWord[0] - b.blockRight} label={x(STATES.diamond.gap - 4.88)} at={6} />
      <Rule at={6} className="absolute" style={{ left: 0, top: 760, width: PW }} />
      {FACTS.map(([value, title, text], i) => (
        <div key={title} className="absolute" style={{ left: i * (PW / 3), top: 760, width: PW / 3, height: PH - 760 }}>
          {i > 0 && <Rule vertical at={6.5} className="absolute" style={{ left: 0, top: 0, height: PH - 760 }} />}
          <Fade at={7 + i * 0.5} className="absolute" style={{ left: 40, right: 40, top: 40 }}>
            <div className="t-figure tabular accent">{value}</div>
            <div className="t-sign" style={{ marginTop: 18 }}>
              {title}
            </div>
            <div className="t-sign mute" style={{ marginTop: 4, fontWeight: 400 }}>
              {text}
            </div>
          </Fade>
        </div>
      ))}
    </Plane>
  );
}

/* ───────────────────────────── Elk formaat ───────────────────────────── */

const CHANNELS: { state: StateName; name: string; where: string; tone: Tone }[] = [
  { state: "square", name: "Vierkant", where: "Instagram · LinkedIn", tone: "light" },
  { state: "portrait", name: "Staand", where: "Reels · TikTok · Shorts", tone: "dark" },
  { state: "landscape", name: "Liggend", where: "YouTube", tone: "dark" },
  { state: "post", name: "4:5", where: "De post in de feed", tone: "light" },
];

/** The four formats the block takes on, each with the channels it stands for. */
function Formaten() {
  const w = PW / 2;
  const h = PH / 2;
  return (
    <Plane tone="dark">
      {CHANNELS.map((c, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const W = 600;
        return (
          <Field key={c.state} tone={c.tone} from={col ? "right" : "left"} at={0.5 + i * 0.5} style={{ left: col * w, top: row * h, width: w, height: h }}>
            <Fade at={2.5 + i * 0.5} className="absolute" style={{ left: (w - W) / 2, top: (h - W * 0.24) / 2 - 24 }}>
              <LogoStill state={c.state} width={W} />
            </Fade>
            <Fade at={3.5 + i * 0.5} className="absolute flex items-baseline" style={{ left: 40, bottom: 30, gap: 16 }}>
              <span className="t-card" style={{ fontSize: 32, lineHeight: "36px" }}>
                {c.name}
              </span>
              <span className="t-sign mute">{c.where}</span>
            </Fade>
          </Field>
        );
      })}
    </Plane>
  );
}

/* ───────────────────────────── Vijf vormen ───────────────────────────── */

const k = (units: number) => (units / STATES.square.h).toFixed(2).replace(".", ",").replace(",00", "");

const SHAPES: { state: StateName; name: string; size: string }[] = [
  { state: "diamond", name: "De ruit", size: `${k(STATES.diamond.w)} × ${k(STATES.diamond.h)} x, op zijn punt` },
  { state: "square", name: "Vierkant", size: "1 × 1 x" },
  { state: "portrait", name: "Staand", size: `${k(STATES.portrait.w)} × ${k(STATES.portrait.h)} x` },
  { state: "landscape", name: "Liggend", size: `${k(STATES.landscape.w)} × 1 x` },
  { state: "post", name: "4:5", size: `${k(STATES.post.w)} × ${k(STATES.post.h)} x` },
];

/** The five shapes under each other, as on the board in Figma, all at one scale. */
function Vormen() {
  const W = 760;
  const rowH = PH / SHAPES.length;
  return (
    <Plane tone="dark">
      {SHAPES.map((s, i) => (
        <div key={s.state} className="absolute" style={{ left: 0, top: i * rowH, width: PW, height: rowH }}>
          {i > 0 && <Rule at={0.5 + i * 0.4} className="absolute" style={{ left: 0, top: 0 }} />}
          <Fade at={1 + i * 0.5} className="t-card absolute" style={{ left: PAD, top: rowH / 2 - 22, fontSize: 34, lineHeight: "40px" }}>
            {s.name}
          </Fade>
          <Rise at={1 + i * 0.5} y={12} className="absolute" style={{ left: (PW - W) / 2 + 20, top: (rowH - W * 0.24) / 2 }}>
            <LogoStill state={s.state} width={W} />
          </Rise>
          <Fade at={2 + i * 0.5} className="t-sign tabular mute absolute text-right" style={{ right: PAD, top: rowH / 2 - 12 }}>
            {s.size}
          </Fade>
        </div>
      ))}
    </Plane>
  );
}

/* ───────────────────────────── De ruit ───────────────────────────── */

/** The block alone, large in the violet square as in a label, and the three places it stands in for the logo. */
function Ruit() {
  const split = 860;
  const still = useStill();
  const rows: { name: string; note: string; node: ReactNode }[] = [
    {
      name: "Avatar",
      note: "Het paarse vak, de ruit in de diepe tint.",
      node: (
        <div className="flex items-center justify-center rounded-full" style={{ width: 132, height: 132, background: VIOLET, color: DEEP }}>
          <Block unit={0.72} />
        </div>
      ),
    },
    {
      name: "Favicon",
      note: "Hetzelfde vak, tot 16 px klein.",
      node: (
        <div className="flex items-center" style={{ height: 64, width: 300, padding: "0 20px", gap: 14, background: "rgb(243 246 255 / 0.08)", borderRadius: "14px 14px 0 0" }}>
          <div className="flex shrink-0 items-center justify-center" style={{ width: 26, height: 26, background: VIOLET, color: DEEP, borderRadius: 3 }}>
            <Block unit={0.15} />
          </div>
          <span className="t-sign" style={{ fontWeight: 500 }}>
            Win Win
          </span>
          <span className="mute ml-auto" style={{ fontSize: 22, lineHeight: 1 }}>
            ×
          </span>
        </div>
      ),
    },
    {
      name: "Lader",
      note: "De lus van het logo, gespeeld door het blok alleen.",
      node: (
        <div className="flex items-center" style={{ gap: 18, height: 72, padding: "0 30px", background: LIGHT, color: DARK }}>
          <div style={{ width: 26, height: 26 }}>{still ? <Block unit={0.26} style={{ margin: 4 }} /> : <MarkLoader className="size-full" />}</div>
          <span style={{ fontSize: 24, fontWeight: 600 }}>Versturen</span>
        </div>
      ),
    },
  ];
  const rowH = PH / rows.length;
  return (
    <Plane tone="violet">
      <div className="absolute flex items-center justify-center" style={{ left: 0, top: 0, width: split, height: PH, color: DEEP }}>
        <Pop at={1} dur={2}>
          <Block unit={5.2} />
        </Pop>
      </div>
      <Field tone="dark" from="right" at={0.5} style={{ left: split, top: 0, width: PW - split, height: PH }}>
        {rows.map((r, i) => (
          <div key={r.name} className="absolute" style={{ left: 0, right: 0, top: i * rowH, height: rowH }}>
            {i > 0 && <Rule at={2 + i * 0.4} className="absolute" style={{ left: 0, top: 0 }} />}
            <Fade at={3 + i * 0.6} className="absolute flex items-center" style={{ left: 56, top: 56, height: 140 }}>
              {r.node}
            </Fade>
            <Fade at={3.5 + i * 0.6} className="absolute" style={{ left: 56, right: 40, bottom: 44 }}>
              <div className="t-sign">{r.name}</div>
              <div className="t-sign mute" style={{ fontWeight: 400 }}>
                {r.note}
              </div>
            </Fade>
          </div>
        ))}
      </Field>
    </Plane>
  );
}

/* ───────────────────────────── In kleur ───────────────────────────── */

const WAYS: { tone: Tone; label: string; note: string }[] = [
  { tone: "dark", label: "Licht op donker", note: "Eerste keuze" },
  { tone: "light", label: "Donker op licht", note: "Op papier en lichte pagina’s" },
  { tone: "violet", label: "Licht op violet", note: "Als het merk mag knallen" },
];

/** The three colourways as three columns: the logo, the diamond alone, and what the pair is called. It stands in the chapter on colour. */
export function LogoInKleur() {
  const w = PW / WAYS.length;
  const W = 420;
  return (
    <Plane tone="dark">
      {WAYS.map((c, i) => (
        <Field key={c.label} tone={c.tone} from="bottom" at={0.5 + i * 0.5} style={{ left: i * w, top: 0, width: w, height: PH }}>
          {i === 1 && <div className="absolute" style={{ left: 0, top: 0, width: 1, height: PH, background: "var(--line)" }} />}
          <Fade at={3 + i * 0.5} className="absolute" style={{ left: (w - W) / 2, top: 300 }}>
            <LogoStill width={W} />
          </Fade>
          <Rule at={3 + i * 0.5} className="absolute" style={{ left: 40, right: 40, top: 540, width: w - 80 }} />
          <Pop at={4 + i * 0.5} className="absolute flex items-center justify-center" style={{ left: 0, width: w, top: 620, height: 160 }}>
            <Block unit={1.5} />
          </Pop>
          <Fade at={4.5 + i * 0.5} className="absolute" style={{ left: 40, bottom: 36 }}>
            <div className="t-sign">{c.label}</div>
            <div className="t-sign mute" style={{ fontWeight: 400 }}>
              {c.note}
            </div>
          </Fade>
        </Field>
      ))}
    </Plane>
  );
}

/* ───────────────────────────── Ruimte en formaat ───────────────────────────── */

function Ruimte() {
  const CH = 790;
  const W = 900;
  const L = (PW - W) / 2;
  const T = (CH - W * 0.24) / 2;
  const b = lockupBox(W, L, T);
  // The free space on every side: the diamond, on its point.
  const d = b.blockRight - b.blockLeft;
  const xs = [b.leftWord[0] - d, b.leftWord[0], b.rightWord[1], b.rightWord[1] + d];
  const ys = [b.top - d, b.top, b.bottom, b.bottom + d];
  const line = "rgb(89 60 255 / 0.4)";
  const sizes: { label: string; node: ReactNode }[] = [
    { label: "Scherm: minimaal 120 px breed", node: <LogoStill width={120 / 0.774} style={{ marginLeft: -17 }} /> },
    { label: "Druk: minimaal 30 mm breed", node: <LogoStill width={113 / 0.774} style={{ marginLeft: -16 }} /> },
    { label: "Kleiner: de ruit", node: <Block unit={0.34} style={{ margin: "6px 0 0 6px" }} /> },
  ];
  return (
    <Plane tone="light">
      <div className="absolute" style={{ left: xs[0], top: ys[0], width: xs[3] - xs[0], height: ys[3] - ys[0], background: "rgb(89 60 255 / 0.07)" }} />
      {xs.map((px, i) => (
        <Rule key={"x" + i} vertical at={0.5 + i * 0.3} className="absolute" style={{ left: px, top: 0, height: CH, background: line }} />
      ))}
      {ys.map((py, i) => (
        <Rule key={"y" + i} at={1 + i * 0.3} className="absolute" style={{ left: 0, top: py, width: PW, background: line }} />
      ))}
      {[
        [xs[0], ys[0]],
        [xs[2], ys[0]],
        [xs[0], ys[2]],
        [xs[2], ys[2]],
      ].map(([px, py], i) => (
        <Pop key={i} at={3.5 + i * 0.3} className="absolute flex items-center justify-center" style={{ left: px, top: py, width: d, height: d, color: "rgb(89 60 255 / 0.45)" }}>
          <Block unit={b.u} />
        </Pop>
      ))}
      <Fade at={2.5} className="absolute" style={{ left: L, top: T }}>
        <LogoStill width={W} />
      </Fade>
      <Rule at={3} className="absolute" style={{ left: 0, top: CH, width: PW }} />
      {sizes.map((s, i) => (
        <div key={s.label} className="absolute" style={{ left: i * (PW / 3), top: CH, width: PW / 3, height: PH - CH }}>
          {i > 0 && <Rule vertical at={4} className="absolute" style={{ left: 0, top: 0, height: PH - CH }} />}
          <Fade at={4.5 + i * 0.5} className="absolute" style={{ left: 40, top: 76 }}>
            {s.node}
          </Fade>
          <Fade at={5 + i * 0.5} className="t-sign mute absolute" style={{ left: 40, bottom: 36 }}>
            {s.label}
          </Fade>
        </div>
      ))}
    </Plane>
  );
}

/* ───────────────────────────── Het blok als venster ───────────────────────────── */

const WINDOWS: { name: string; where: string; state: StateName; still: number }[] = [
  { name: "Vierkant", where: "Instagram · LinkedIn", state: "square", still: 3 },
  { name: "Staand", where: "Reels · TikTok · Shorts", state: "portrait", still: 4 },
  { name: "Liggend", where: "YouTube", state: "landscape", still: 5 },
  { name: "4:5", where: "De post in de feed", state: "post", still: 7 },
];

/** Counts on each format while nobody has chosen one: a move and a rest. */
const CYCLE = 12 * BEAT;

/**
 * The block as a window onto the work: pick a channel and it takes on that
 * channel's format, with the move from the logo. Left alone it walks through
 * all of them. In the PDF it stands on the landscape.
 */
function Venster() {
  const still = useStill();
  const { stills } = useMedia();
  const media: Media = {};
  if (stills.length) for (const w of WINDOWS) media[w.state] = stills[w.still % stills.length];

  const startAt = still ? 2 : 0;
  const lockup = useRef<LockupHandle>(null);
  const pose = useRef<Pose>({ ...STATES[WINDOWS[startAt].state] });
  const screen = useRef<Screen>(Object.fromEntries(WINDOWS.map(({ state }, i) => [state, i === startAt ? 1 : 0])));
  const [active, setActive] = useState(startAt);
  const [chosen, setChosen] = useState(false);

  const draw = useCallback(() => lockup.current?.draw(pose.current, screen.current), []);

  const show = useCallback(
    (index: number) => {
      setActive(index);
      morphPose(pose.current, STATES[WINDOWS[index].state], draw);
      // The old picture goes at once; the new one comes in as the block lands.
      gsap.killTweensOf(screen.current);
      for (const { state } of WINDOWS) {
        const on = state === WINDOWS[index].state;
        gsap.to(screen.current, { [state]: on ? 1 : 0, duration: BEAT, delay: on ? 2 * BEAT : 0, ease: "none", onUpdate: draw });
      }
    },
    [draw],
  );

  useEffect(() => {
    draw();
    const moving = [pose.current, screen.current];
    return () => gsap.killTweensOf(moving);
  }, [draw]);

  useEffect(() => {
    if (chosen || still) return;
    const timer = window.setTimeout(() => show((active + 1) % WINDOWS.length), CYCLE * 1000);
    return () => window.clearTimeout(timer);
  }, [active, chosen, still, show]);

  const W = 1200;
  return (
    <Plane tone="dark">
      <Fade at={0.5} className="absolute" style={{ left: (PW - W) / 2, top: 290 }}>
        <div style={{ width: W }}>
          <Lockup ref={lockup} initial={STATES[WINDOWS[startAt].state]} media={media} className="block w-full" />
        </div>
      </Fade>
      <Fade at={2} className="absolute flex justify-center" style={{ left: 0, width: PW, bottom: 96, gap: 12 }}>
        {WINDOWS.map((w, i) => (
          <button
            key={w.name}
            type="button"
            aria-pressed={i === active}
            onClick={(e) => {
              e.stopPropagation();
              setChosen(true);
              show(i);
            }}
            className="t-sign flex items-center transition-colors duration-200"
            style={{
              height: 60,
              padding: "0 24px",
              gap: 12,
              border: `1px solid ${i === active ? LIGHT : "rgb(243 246 255 / 0.22)"}`,
              background: i === active ? LIGHT : "transparent",
              color: i === active ? DARK : "rgb(243 246 255 / 0.75)",
            }}
          >
            {w.name}
            <span style={{ opacity: 0.6, fontWeight: 400 }}>{w.where}</span>
          </button>
        ))}
      </Fade>
    </Plane>
  );
}

/* ───────────────────────────── Wat niet ───────────────────────────── */

const WRONG: { text: string; node: (W: number) => ReactNode }[] = [
  {
    text: "Geef het blok geen eigen kleur.",
    node: (W) => <LogoStill width={W} className="[&_rect]:!fill-[#593CFF]" />,
  },
  {
    text: "Maak geen blok in een eigen verhouding.",
    node: (W) => <LogoStill width={W} pose={{ w: 170, h: 150, rot: 0, gap: 26 }} />,
  },
  {
    text: "Laat het blok nooit weg.",
    node: (W) => <LogoStill width={W} pose={{ w: 0, h: 0, rot: 0, gap: 14 }} />,
  },
  {
    text: "Rek het logo niet uit en druk het niet in.",
    node: (W) => <LogoStill width={W} style={{ transform: "scaleX(0.72) scaleY(1.25)" }} />,
  },
  {
    text: "Zet het logo niet scheef.",
    node: (W) => <LogoStill width={W} style={{ transform: "rotate(-9deg)" }} />,
  },
  {
    text: "Geen schaduw, omlijning of effect.",
    node: (W) => <LogoStill width={W} style={{ filter: "drop-shadow(7px 7px 0 #593CFF)" }} />,
  },
];

/** Six ways to break the logo, each crossed out. */
function Niet() {
  const cols = 2;
  const w = PW / cols;
  const h = PH / 3;
  const W = 560;
  return (
    <Plane tone="light">
      {WRONG.map((item, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        return (
          <div key={item.text} className="absolute overflow-hidden" style={{ left: c * w, top: r * h, width: w, height: h }}>
            {c > 0 && <Rule vertical at={0.5} className="absolute" style={{ left: 0, top: 0, height: h }} />}
            {r > 0 && <Rule at={0.5 + r * 0.3} className="absolute" style={{ left: 0, top: 0 }} />}
            <Fade at={1.5 + i * 0.4} className="absolute" style={{ left: (w - W) / 2, top: (h - W * 0.24) / 2 - 26 }}>
              {item.node(W)}
            </Fade>
            <Fade at={2.5 + i * 0.4} className="absolute flex items-center" style={{ left: 36, bottom: 26, gap: 14 }}>
              <Cross size={22} color={VIOLET} />
              <span className="t-sign">{item.text}</span>
            </Fade>
          </div>
        );
      })}
    </Plane>
  );
}

export const slides: Record<string, ComponentType> = {
  "logo-opbouw": Opbouw,
  "logo-formaten": Formaten,
  "logo-vormen": Vormen,
  "logo-ruit": Ruit,
  "logo-ruimte": Ruimte,
  "logo-venster": Venster,
  "logo-niet": Niet,
};
