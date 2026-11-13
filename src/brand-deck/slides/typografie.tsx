"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";
import { Fade, Lines, Rise, Rule } from "@/deck/motion";
import { Cross, DARK, DEEP, Field, LabelDivider, LIGHT, LILAC, PAD, PH, Plane, PW, Tag, Tick, type Tone, VIOLET } from "../parts";

const TRABAT = "var(--font-trabat)";
const SEMI = "var(--font-trabat-semi)";
const HANKEN = "var(--font-hanken)";

type Row = { size: number; sample: string; weight?: number; tracking?: string; upper?: boolean };

/**
 * A typeface page: the letter large, its character set beside it, and below
 * a waterfall of the sizes it is used at, each with its size in the margin.
 */
function Face({ family, note, glyphs, rows, weight = 400, glyphStyle }: { family: string; note: string; glyphs: string[]; rows: Row[]; weight?: number; glyphStyle?: CSSProperties }) {
  const top = 560;
  const rowH = (PH - top - 40) / rows.length;
  return (
    <Plane tone="light">
      <Rise at={0.5} y={30} className="absolute" style={{ left: PAD - 14, top: 34, fontFamily: family, fontSize: 420, lineHeight: "430px", fontWeight: weight, letterSpacing: "-0.02em" }}>
        Aa
      </Rise>
      <Fade at={2.5} className="t-sign mute absolute" style={{ left: PAD, top: 478 }}>
        {note}
      </Fade>
      <Lines at={1.5} stagger={0.3} className="absolute" lines={glyphs} style={{ left: 660, top: 92, fontFamily: family, fontSize: 60, lineHeight: "74px", fontWeight: weight, ...glyphStyle }} />
      {rows.map((r, i) => (
        <div key={r.size} className="absolute" style={{ left: PAD, right: PAD, top: top + i * rowH, height: rowH }}>
          <Rule at={2.5 + i * 0.4} />
          <Fade at={3.5 + i * 0.4} className="t-sign tabular mute absolute" style={{ left: 0, top: 18 }}>
            {r.size} px
          </Fade>
          <Fade
            at={3.5 + i * 0.4}
            className="absolute whitespace-nowrap"
            style={{ left: 130, right: 0, top: (rowH - r.size * 1.1) / 2, fontFamily: family, fontSize: r.size, lineHeight: `${r.size * 1.1}px`, letterSpacing: r.tracking, fontWeight: r.weight ?? weight, textTransform: r.upper ? "uppercase" : undefined }}
          >
            {r.sample}
          </Fade>
        </div>
      ))}
    </Plane>
  );
}

function Trabat() {
  return (
    <Face
      family={SEMI}
      note="Trabat Display Semi Condensed · Gian Studio · één gewicht"
      glyphs={["ABCDEFGHIJKLM", "NOPQRSTUVWXYZ", "abcdefghijklm", "nopqrstuvwxyz", "0123456789 %+€&"]}
      glyphStyle={{ fontSize: 54, letterSpacing: "0.005em" }}
      rows={[
        { size: 124, sample: "Twaalf creators" },
        { size: 80, sample: "Creators, campagnes, content" },
        { size: 44, sample: "Twaalf creators, één proefrit." },
      ]}
    />
  );
}

function Hanken() {
  return (
    <Face
      family={HANKEN}
      note="Hanken Grotesk · open source, SIL OFL · Regular, Medium en SemiBold"
      glyphs={["ABCDEFGHIJKLM", "NOPQRSTUVWXYZ", "abcdefghijklm", "nopqrstuvwxyz", "0123456789 %+€&"]}
      glyphStyle={{ letterSpacing: "-0.01em" }}
      rows={[
        { size: 56, sample: "Wij gaven twaalf creators een week de sleutels.", weight: 500, tracking: "-0.015em" },
        { size: 30, sample: "En zetten hun beste video’s door, op elk kanaal waar het publiek zit.", tracking: "-0.005em" },
        { size: 18, sample: "Keer bekeken · Proefritten · Uitgekeken", weight: 600, tracking: "0.09em", upper: true },
      ]}
    />
  );
}

/* ───────────────────────────── Twee breedtes ───────────────────────────── */

/**
 * The two widths of Trabat, each on a ground it is used on: the semi
 * condensed one for nearly everything, the condensed one only for a figure
 * over a video. At the same size, so the width is the only difference.
 */
function Breedtes() {
  const h = PH / 2;
  const rows: { tone: Tone; family: string; name: string; where: string; sample: string }[] = [
    { tone: "dark", family: SEMI, name: "Semi Condensed", where: "Titels, labels en alles wat je van een afstand leest", sample: "Twaalf creators, één proefrit." },
    { tone: "violet", family: TRABAT, name: "Condensed", where: "Alleen voor cijfers over een video", sample: "4,1M 74% +38% 12" },
  ];
  return (
    <Plane tone="dark">
      {rows.map((r, i) => (
        <Field key={r.name} tone={r.tone} at={0.5 + i} style={{ left: 0, top: i * h, width: PW, height: h }}>
          <Rise at={2.5 + i} y={20} className="absolute whitespace-nowrap" style={{ left: PAD - 3, top: h / 2 - 96, fontFamily: r.family, fontSize: i ? 150 : 94, lineHeight: i ? "150px" : "104px" }}>
            {r.sample}
          </Rise>
          <Fade at={3.5 + i} className="absolute flex items-baseline" style={{ left: PAD, bottom: 44, gap: 18 }}>
            <span className="t-card" style={{ fontFamily: r.family, fontSize: 34, lineHeight: "38px" }}>
              {r.name}
            </span>
            <span className="t-sign" style={{ opacity: 0.7 }}>
              {r.where}
            </span>
          </Fade>
        </Field>
      ))}
      <Fade at={5} className="t-sign absolute" style={{ right: PAD, top: h + 44, opacity: 0.85 }}>
        Ongeveer een achtste smaller
      </Fade>
    </Plane>
  );
}

/* ───────────────────────────── Hiërarchie ───────────────────────────── */

const SCALE: { name: string; spec: string; node: ReactNode; h: number }[] = [
  { name: "Display", spec: "Trabat Semi Condensed · 150 px", h: 210, node: <span style={{ fontFamily: SEMI, fontSize: 150, lineHeight: "150px", letterSpacing: "-0.012em" }}>Win, win.</span> },
  { name: "Titel", spec: "Trabat Semi Condensed · 58 px", h: 132, node: <span style={{ fontFamily: SEMI, fontSize: 58, lineHeight: "60px" }}>Twaalf creators, één proefrit.</span> },
  { name: "Cijfer op beeld", spec: "Trabat Condensed · 72 px", h: 144, node: <span style={{ fontFamily: TRABAT, fontSize: 72, lineHeight: "72px", color: LILAC }}>4,1M</span> },
  {
    name: "Label",
    spec: "Trabat Semi Condensed · 32 px, in het vak",
    h: 132,
    node: (
      <Tag size={22}>
        Boost
        <LabelDivider />
        BYD
      </Tag>
    ),
  },
  { name: "Tekst", spec: "Hanken Grotesk Regular · 24 px", h: 132, node: <span style={{ fontSize: 24, lineHeight: "34px", display: "block", width: 720, whiteSpace: "normal" }}>BYD wilde elektrisch rijden dichterbij brengen. Wij gaven twaalf creators een week de sleutels.</span> },
  { name: "Bijschrift", spec: "Hanken Grotesk SemiBold · 16 px, kapitalen, 9% gespatieerd", h: 100, node: <span className="t-cap">Keer bekeken</span> },
];

/** Every style in use, with its name and values at the right. */
function Hierarchie() {
  const gap = (PH - 60 - SCALE.reduce((sum, r) => sum + r.h, 0)) / (SCALE.length - 1);
  const tops = SCALE.map((_, i) => 30 + SCALE.slice(0, i).reduce((sum, r) => sum + r.h + gap, 0));
  return (
    <Plane tone="dark">
      {SCALE.map((r, i) => (
        <div key={r.name} className="absolute" style={{ left: PAD, right: PAD, top: tops[i], height: r.h }}>
          <Fade at={1.5 + i * 0.4} className="absolute flex items-end whitespace-nowrap" style={{ left: 0, bottom: 26 }}>
            {r.node}
          </Fade>
          <Fade at={2 + i * 0.4} className="t-sign absolute text-right" style={{ right: 0, bottom: 26 }}>
            <div>{r.name}</div>
            <div className="mute" style={{ fontWeight: 400 }}>
              {r.spec}
            </div>
          </Fade>
          <Rule at={1 + i * 0.4} className="absolute" style={{ left: 0, bottom: 0 }} />
        </div>
      ))}
    </Plane>
  );
}

/* ───────────────────────────── Wel en niet ───────────────────────────── */

const BODY = "BYD wilde elektrisch rijden dichterbij brengen. Wij gaven twaalf creators een week de sleutels en zetten hun beste video’s door.";

/** The two-line label that was dropped: shown once, crossed out. */
function TwoLine() {
  const line = (text: string) => (
    <span className="f-title flex items-center" style={{ height: 50, padding: "4px 16px 0", background: LIGHT, color: DARK, fontSize: 32, lineHeight: 1 }}>
      {text}
    </span>
  );
  return (
    <span className="inline-flex items-stretch">
      <span className="flex items-center justify-center" style={{ width: 62, background: VIOLET }}>
        <span style={{ width: 16, height: 30, background: DEEP, borderRadius: 1 }} />
      </span>
      <span className="flex flex-col items-start">
        {line("De juiste creators")}
        {line("voor je merk")}
      </span>
    </span>
  );
}

const PAIRS: { rule: string; good: ReactNode; bad: ReactNode; why: string }[] = [
  {
    rule: "Lopende tekst in Hanken",
    why: "Niet in Trabat",
    good: <span style={{ fontSize: 24, lineHeight: "34px", display: "block" }}>{BODY}</span>,
    bad: <span style={{ fontFamily: SEMI, fontSize: 27, lineHeight: "32px", display: "block" }}>{BODY}</span>,
  },
  {
    rule: "Titels met een hoofdletter aan het begin",
    why: "Niet in kapitalen",
    good: <span style={{ fontFamily: SEMI, fontSize: 58, lineHeight: "60px", display: "block" }}>Twaalf creators, één proefrit.</span>,
    bad: <span style={{ fontFamily: SEMI, fontSize: 50, lineHeight: "54px", display: "block", textTransform: "uppercase", letterSpacing: "0.03em" }}>Twaalf creators, één proefrit.</span>,
  },
  {
    rule: "Een label is één regel",
    why: "Geen label van twee regels",
    good: (
      <Tag size={26}>
        Boost
        <LabelDivider />
        BYD
      </Tag>
    ),
    bad: <TwoLine />,
  },
];

/** Three rules, each shown right on the left and wrong on the right. */
function Regels() {
  const w = PW / 2;
  const head = 96;
  const rowH = (PH - head) / PAIRS.length;
  return (
    <Plane tone="light">
      <Field tone="dark" from="right" at={0.5} style={{ left: w, top: 0, width: w, height: PH }} />
      {[
        { label: "Wel", x: 0, icon: <Tick size={24} color={VIOLET} /> },
        { label: "Niet", x: w, icon: <Cross size={22} color={LILAC} /> },
      ].map((c) => (
        <Fade key={c.label} at={1.5} className={`absolute flex items-center ${c.x ? "ww--dark" : ""}`} style={{ left: c.x + PAD, top: 40, gap: 14, color: c.x ? LIGHT : DARK }}>
          {c.icon}
          <span className="t-card" style={{ fontSize: 34, lineHeight: "38px" }}>
            {c.label}
          </span>
        </Fade>
      ))}
      {PAIRS.map((p, i) => (
        <div key={p.rule} className="absolute" style={{ left: 0, top: head + i * rowH, width: PW, height: rowH }}>
          <Rule at={1.5 + i * 0.5} className="absolute" style={{ left: 0, top: 0, width: w }} />
          <Rule at={1.5 + i * 0.5} className="absolute" style={{ left: w, top: 0, width: w, background: "rgb(243 246 255 / 0.16)" }} />
          <Fade at={2.5 + i * 0.6} className="absolute flex items-center" style={{ left: PAD, width: w - 2 * PAD, top: 36, height: rowH - 120 }}>
            <div>{p.good}</div>
          </Fade>
          <Fade at={3 + i * 0.6} className="t-sign mute absolute" style={{ left: PAD, bottom: 30 }}>
            {p.rule}
          </Fade>
          <Fade at={3 + i * 0.6} className="ww--dark absolute flex items-center" style={{ left: w + PAD, width: w - 2 * PAD, top: 36, height: rowH - 120, color: LIGHT, opacity: 0.9 }}>
            <div>{p.bad}</div>
          </Fade>
          <Fade at={3.5 + i * 0.6} className="t-sign absolute" style={{ left: w + PAD, bottom: 30, color: "rgb(243 246 255 / 0.56)" }}>
            {p.why}
          </Fade>
        </div>
      ))}
    </Plane>
  );
}

export const slides: Record<string, ComponentType> = {
  "type-trabat": Trabat,
  "type-breedtes": Breedtes,
  "type-hanken": Hanken,
  "type-hierarchie": Hierarchie,
  "type-regels": Regels,
};
