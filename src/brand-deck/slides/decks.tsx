"use client";

import { useRef, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { useAnimationFrame } from "motion/react";
import { counts, Fade, Lines, Pop, Rise, Unfold, useStill } from "@/deck/motion";
import { Corner, DARK, DEEP, Field, LabelDivider, LIGHT, LILAC, LiveTag, LogoStill, PH, Photo, Stage, Tag, VIOLET } from "../parts";

/**
 * Win Win's own presentations: three pages of a campaign report. They are
 * built from what the brand puts over a video: the work runs to the edge of
 * the page, the label names it, a dark panel holds the text and results
 * stand in blocks of colour. Every page comes in with the brand's own moves,
 * the figures count up, and the pictures keep moving a little.
 *
 * The client, the figures and the creators' following are stand-ins.
 */

/* ───────────────────────────── What moves ───────────────────────────── */

/**
 * A figure that counts up to its value, with a comma for the decimals. In
 * the PDF and the overview it stands at its value.
 */
function Count({ to, decimals = 0, prefix = "", suffix = "", at = 0, dur = 6 }: { to: number; decimals?: number; prefix?: string; suffix?: string; at?: number; dur?: number }) {
  const still = useStill();
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef<number | null>(null);
  const text = (value: number) => prefix + value.toFixed(decimals).replace(".", ",") + suffix;

  useAnimationFrame((ms) => {
    if (still || !ref.current) return;
    from.current ??= ms;
    const t = Math.min(1, Math.max(0, ((ms - from.current) / 1000 - counts(at)) / counts(dur)));
    // Fast at first, then slowing into the value.
    const next = text(to * (1 - (1 - t) ** 4));
    if (ref.current.textContent !== next) ref.current.textContent = next;
  });

  return (
    <span ref={ref} className="tabular">
      {text(still ? to : 0)}
    </span>
  );
}

/**
 * A picture that comes in a little closer and settles, and then keeps
 * breathing slowly, so a page of stills does not stand dead still.
 */
function Drift({ at = 0, origin = "50% 40%", children }: { at?: number; origin?: string; children: ReactNode }) {
  const still = useStill();
  const ref = useRef<HTMLDivElement>(null);
  const from = useRef<number | null>(null);

  useAnimationFrame((ms) => {
    if (still || !ref.current) return;
    from.current ??= ms;
    const t = Math.max(0, (ms - from.current) / 1000 - counts(at));
    const settle = 0.12 * Math.exp(-t / 1.1);
    const breathe = 0.018 * (1 - Math.cos((2 * Math.PI * t) / 14));
    ref.current.style.transform = `scale(${(1 + settle + breathe).toFixed(4)})`;
  });

  return (
    <div ref={ref} className="absolute inset-0" style={{ transformOrigin: origin, willChange: "transform" }}>
      {children}
    </div>
  );
}

/** What a page of Win Win's own deck carries in its top right corner: the logo and the page number. */
function DeckSign({ page, ink = LIGHT }: { page: string; ink?: string }) {
  return (
    <Fade at={2} className="t-sign absolute flex items-center" style={{ right: 48, top: 38, color: ink, zIndex: 6, gap: 8 }}>
      <LogoStill width={160} />
      <span className="tabular">{page}</span>
    </Fade>
  );
}

/** A soft shade under the top edge, so the signage reads on any picture. */
const TopShade = ({ style }: { style: CSSProperties }) => (
  <div aria-hidden className="pointer-events-none absolute" style={{ top: 0, height: 200, background: "linear-gradient(rgb(13 13 14 / 0.46), rgb(13 13 14 / 0))", zIndex: 2, ...style }} />
);

/** A result in a block of colour: the figure, and under it what it counts. */
function Result({ left, right, bottom = 64, width, height, ground, ink, at, size, children, caption, top = false }: { left?: number; right?: number; bottom?: number; width: number; height: number; ground: string; ink: string; at: number; size: number; children: ReactNode; caption: string; top?: boolean }) {
  return (
    <Pop at={at} origin="left bottom" className="absolute flex flex-col justify-between" style={{ left, right, bottom, width, height, padding: "22px 26px", background: ground, color: ink, zIndex: 4 }}>
      {top && <div className="t-cap">{caption}</div>}
      <div className="f-label" style={{ fontSize: size, lineHeight: `${Math.round(size * 0.82)}px`, letterSpacing: "-0.01em" }}>
        {children}
      </div>
      {!top && <div className="t-cap">{caption}</div>}
    </Pop>
  );
}

/* ───────────────────────────── The work ───────────────────────────── */

const THIRDS = [
  { name: "may-sip", position: "50% 78%" },
  { name: "ch-cocktails", zoom: 1.5, origin: "50% 8%" },
  { name: "may-dance", position: "50% 50%" },
];

/** A case: three moments from the campaign side by side to the edge, the text panel under its label, and two results. */
function Work() {
  return (
    <Stage tone="dark" style={{ background: "#111" }}>
      {THIRDS.map((third, i) => (
        <Field key={third.name} from="bottom" at={i * 1.2} style={{ left: i * 640, top: 0, width: 640, height: PH, background: "#111" }}>
          <Drift at={i * 1.2}>
            <Photo name={third.name} n={i + 1} position={third.position} zoom={third.zoom} origin={third.origin} />
          </Drift>
        </Field>
      ))}
      <TopShade style={{ left: 0, right: 0 }} />
      <DeckSign page="15 / 24" />

      {/* The text panel: the label is its tab. */}
      <div className="absolute" style={{ left: 64, bottom: 64, width: 640, zIndex: 4 }}>
        <Pop at={4.5} origin="left bottom" style={{ display: "flex", width: "max-content" }}>
          <Tag size={22}>
            Case
            <LabelDivider />
            De Kuyper
          </Tag>
        </Pop>
        <Unfold at={5.5} origin="top left" style={{ background: DARK, color: LIGHT, padding: "40px 44px 44px", borderRadius: "0 5px 5px 5px" }}>
          <Lines at={7.5} className="f-title" style={{ fontSize: 64, lineHeight: "64px", letterSpacing: "-0.006em" }} lines={["Zomer in een fles."]} />
          {[
            ["Vraag", "Maak van een kant-en-klare cocktail hét drankje van de zomer."],
            ["Aanpak", "Twaalf creators, elk met een eigen moment: het park, het balkon, de boot."],
          ].map(([what, text], i) => (
            <Rise key={what} at={9 + i} className="grid" style={{ gridTemplateColumns: "124px 1fr", marginTop: i ? 14 : 28 }}>
              <span className="t-cap" style={{ paddingTop: 5, opacity: 0.56 }}>
                {what}
              </span>
              <span className="t-aside">{text}</span>
            </Rise>
          ))}
        </Unfold>
      </div>

      <Result right={304} width={240} height={176} ground={VIOLET} ink={LIGHT} at={10} size={104} caption="Weergaven">
        <Count to={4.1} decimals={1} suffix="M" at={10.5} />
      </Result>
      <Result right={64} width={240} height={176} ground={LIGHT} ink={DARK} at={11} size={104} caption="Uitgekeken">
        <Count to={74} suffix="%" at={11.5} />
      </Result>
      <Corner />
    </Stage>
  );
}

/* ───────────────────────────── The creators ───────────────────────────── */

const SIDE = 440;
const COL = 296;
const SHOT = 744;

const CREATORS: { name: string; photo: string; where: string; reach: number; ground: string; ink: string; zoom: number; origin: string }[] = [
  { name: "Annabel", photo: "an-bike", where: "Instagram", reach: 212, ground: VIOLET, ink: LIGHT, zoom: 1.45, origin: "46% 30%" },
  { name: "May", photo: "may-sip", where: "Instagram", reach: 96, ground: LIGHT, ink: DARK, zoom: 1.15, origin: "50% 30%" },
  { name: "Anton", photo: "at-anton", where: "TikTok", reach: 48, ground: DEEP, ink: LIGHT, zoom: 1.42, origin: "42% 0%" },
  { name: "Cassidy", photo: "ca-end", where: "TikTok", reach: 74, ground: LILAC, ink: DEEP, zoom: 1.42, origin: "50% 0%" },
  { name: "Alexandra", photo: "al-glass", where: "Instagram", reach: 131, ground: VIOLET, ink: LIGHT, zoom: 1.5, origin: "46% 0%" },
];

/** Five of the creators side by side to the top edge, each on a block of colour with the reach in it. */
function Creators() {
  return (
    <Stage tone="dark">
      <div className="absolute" style={{ left: 40, top: 156, width: SIDE - 44 }}>
        <Lines at={0.5} className="f-title" style={{ fontSize: 80, lineHeight: "76px", letterSpacing: "-0.01em", whiteSpace: "nowrap" }} lines={["Twaalf", "creators.", "Eén zomer."]} />
        <Fade at={4} className="t-aside" style={{ marginTop: 34, width: 350, opacity: 0.72 }}>
          Gekozen op wie er kijkt, niet op hoeveel. Dit zijn er vijf van de twaalf.
        </Fade>
      </div>
      <Rise at={5} className="absolute" style={{ left: 40, bottom: 40 }}>
        <div className="f-label" style={{ fontSize: 150, lineHeight: "122px", letterSpacing: "-0.01em", color: LILAC }}>
          <Count to={1.3} decimals={1} suffix="M" at={5.5} dur={8} />
        </div>
        <div className="t-cap" style={{ marginTop: 14 }}>
          Volgers samen
        </div>
      </Rise>

      {CREATORS.map((c, i) => {
        const left = SIDE + i * COL;
        const at = 1 + i * 0.8;
        return (
          <div key={c.name}>
            <Field from="top" at={at} style={{ left, top: 0, width: COL, height: SHOT, background: "#222" }}>
              <Drift at={at} origin={c.origin}>
                <Photo name={c.photo} n={i} zoom={c.zoom} origin={c.origin} />
              </Drift>
              <Pop at={at + 4} origin="left bottom" className="absolute" style={{ left: 18, bottom: 18, display: "flex" }}>
                <Tag size={18}>{c.name}</Tag>
              </Pop>
            </Field>
            <Field from="bottom" at={at + 1} style={{ left, top: SHOT, width: COL, height: PH - SHOT, background: c.ground, color: c.ink }}>
              <div className="t-cap absolute" style={{ left: 24, top: 26 }}>
                {c.where}
              </div>
              <div className="f-label absolute" style={{ left: 24, bottom: 26, fontSize: 124, lineHeight: "100px", letterSpacing: "-0.01em" }}>
                <Count to={c.reach} suffix="K" at={at + 2} />
              </div>
            </Field>
          </div>
        );
      })}
      <TopShade style={{ left: SIDE, right: 0 }} />
      <DeckSign page="09 / 24" />
      <Corner />
    </Stage>
  );
}

/* ───────────────────────────── The result ───────────────────────────── */

const SEAM = 800;

/** One figure as large as its panel, which reaches over the seam into the picture beside it; the other results in blocks under it. */
function Outcome() {
  return (
    <Stage tone="light">
      <Field from="right" at={0.5} style={{ left: SEAM, top: 0, width: 1920 - SEAM, height: PH, background: "#222" }}>
        <Drift at={0.5} origin="50% 30%">
          <Photo name="ca-end" n={5} position="50% 12%" />
        </Drift>
        <div className="absolute" style={{ right: 64, bottom: 64 }}>
          <LiveTag size={20} delay={2.5}>
            Boost
            <LabelDivider />
            De Kuyper
          </LiveTag>
        </div>
      </Field>
      <TopShade style={{ left: SEAM, right: 0 }} />
      <DeckSign page="17 / 24" />

      <Lines at={2} className="f-label absolute" style={{ left: 44, top: 190, fontSize: 520, lineHeight: "430px", letterSpacing: "-0.03em", color: VIOLET, whiteSpace: "nowrap", zIndex: 3 }} lines={[<Count key="n" to={4.1} decimals={1} suffix="M" at={2.5} dur={8} />]} />
      <div className="absolute" style={{ left: 64, top: 640 }}>
        <Lines at={4.5} className="f-title" style={{ fontSize: 88, lineHeight: "84px", letterSpacing: "-0.01em" }} lines={["weergaven"]} />
        <Fade at={6.5} className="t-aside" style={{ marginTop: 8, opacity: 0.62 }}>
          in zes weken, met twaalf creators
        </Fade>
      </div>

      <Result left={64} width={224} height={190} ground={DARK} ink={LIGHT} at={7} size={86} caption="Uitgekeken">
        <Count to={74} suffix="%" at={7.5} />
      </Result>
      <Result left={288} width={224} height={190} ground={VIOLET} ink={LIGHT} at={8} size={86} caption="Meer bereik">
        <Count to={38} prefix="+" suffix="%" at={8.5} />
      </Result>
      <Result left={512} width={224} height={190} ground={DEEP} ink={LIGHT} at={9} size={86} caption="Creators">
        <Count to={12} at={9.5} />
      </Result>
      <Corner />
    </Stage>
  );
}

export const slides: Record<string, ComponentType> = {
  "toep-deck-1": Work,
  "toep-deck-2": Creators,
  "toep-deck-3": Outcome,
};
