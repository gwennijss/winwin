"use client";

import type { ComponentType } from "react";
import { Fade, Rise } from "@/deck/motion";
import { LogoInKleur } from "./logo";
import { Block, DARK, DEEP, Field, LIGHT, LILAC, PH, Plane, PW, VIOLET } from "../parts";

const rgbOf = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** Hue, saturation and lightness, the way a design tool shows them. */
function hslOf(hex: string) {
  const [r, g, b] = rgbOf(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  h = Math.round(h * 60);
  return `${h < 0 ? h + 360 : h}° ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** How far apart two colours are in brightness, as the accessibility guidelines measure it: 1 to 21. */
function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, bl] = rgbOf(hex).map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

/* ───────────────────────────── Palet ───────────────────────────── */

const COLOURS: { name: string; role: string; hex: string; ink: string; share: number }[] = [
  { name: "Violet", role: "Het merk. Het vak van een label, een knop, een accent.", hex: VIOLET, ink: LIGHT, share: 0.28 },
  { name: "Donker", role: "De grond. Het tekstvlak, de site, de video-overlay.", hex: DARK, ink: LIGHT, share: 0.2 },
  { name: "Licht", role: "Het papier. Het vak met tekst, lichte pagina’s.", hex: LIGHT, ink: DARK, share: 0.2 },
  { name: "Diep violet", role: "De ruit in het paarse vak.", hex: DEEP, ink: LIGHT, share: 0.16 },
  { name: "Zacht violet", role: "Cijfers op donker.", hex: LILAC, ink: DEEP, share: 0.16 },
];

/** Five colours, each a full-height plane: the name at the top, the values at the foot. */
function Palet() {
  const lefts = COLOURS.map((_, i) => COLOURS.slice(0, i).reduce((sum, c) => sum + c.share, 0) * PW);
  return (
    <Plane tone="dark">
      {COLOURS.map((c, i) => (
        <Field key={c.name} from="bottom" at={0.5 + i * 0.5} style={{ left: lefts[i], top: 0, width: c.share * PW + 1, height: PH, background: c.hex, color: c.ink }}>
          {c.hex === DARK && <div className="absolute" style={{ right: 0, top: 0, width: 1, height: PH, background: "rgb(243 246 255 / 0.16)" }} />}
          <Fade at={2.5 + i * 0.5} className="absolute" style={{ left: 32, right: 24, top: 36 }}>
            <div className="f-title" style={{ fontSize: i === 0 ? 72 : 44, lineHeight: i === 0 ? "74px" : "46px" }}>
              {c.name}
            </div>
            <div className="t-sign" style={{ marginTop: 14, fontWeight: 400, opacity: 0.72, maxWidth: 300 }}>
              {c.role}
            </div>
          </Fade>
          <Fade at={3 + i * 0.5} className="t-sign tabular absolute" style={{ left: 32, bottom: 34 }}>
            <div className="f-label" style={{ fontSize: 40, lineHeight: "44px", marginBottom: 8 }}>
              {c.hex.toUpperCase()}
            </div>
            <div style={{ opacity: 0.72, fontWeight: 400 }}>RGB {rgbOf(c.hex).join(" ")}</div>
            <div style={{ opacity: 0.72, fontWeight: 400 }}>HSL {hslOf(c.hex)}</div>
          </Fade>
        </Field>
      ))}
    </Plane>
  );
}

/* ───────────────────────────── Verhouding ───────────────────────────── */

/**
 * How much of each colour a composition holds, drawn to scale across the
 * plane. Roughly: the two neutrals carry it, violet is the accent.
 */
function Verhouding() {
  const a = PW * 0.5;
  const b = PW * 0.3;
  const c = PW - a - b;
  const cell = (pct: string, name: string) => (
    <Fade at={3.5} className="absolute" style={{ left: 32, bottom: 32 }}>
      <div className="t-figure tabular">{pct}</div>
      <div className="t-cap" style={{ marginTop: 8, opacity: 0.75 }}>
        {name}
      </div>
    </Fade>
  );
  return (
    <Plane tone="dark">
      <Field tone="dark" from="bottom" at={0.5} style={{ left: 0, top: 0, width: a, height: PH }}>
        <div className="absolute" style={{ right: 0, top: 0, width: 1, height: PH, background: "var(--line)" }} />
        {cell("50%", "Donker")}
      </Field>
      <Field tone="light" from="bottom" at={1} style={{ left: a, top: 0, width: b, height: PH }}>
        {cell("30%", "Licht")}
      </Field>
      <Field tone="violet" from="bottom" at={1.5} style={{ left: a + b, top: 0, width: c, height: PH * 0.6 }}>
        {cell("12%", "Violet")}
      </Field>
      <Field tone="deep" from="bottom" at={2} style={{ left: a + b, top: PH * 0.6, width: c, height: PH * 0.2 }}>
        {cell("4%", "Diep")}
      </Field>
      <Field tone="lilac" from="bottom" at={2.5} style={{ left: a + b, top: PH * 0.8, width: c, height: PH * 0.2 }}>
        {cell("4%", "Zacht")}
      </Field>
      <Rise at={4} y={16} className="t-statement absolute" style={{ left: 40, top: 40, width: a - 100 }}>
        Hoe minder violet, hoe harder het werkt.
      </Rise>
    </Plane>
  );
}

/* ───────────────────────────── Combinaties ───────────────────────────── */

const PAIRS: { name: string; bg: string; fg: string }[] = [
  { name: "Licht op donker", bg: DARK, fg: LIGHT },
  { name: "Donker op licht", bg: LIGHT, fg: DARK },
  { name: "Licht op violet", bg: VIOLET, fg: LIGHT },
  { name: "Violet op licht", bg: LIGHT, fg: VIOLET },
  { name: "Zacht violet op donker", bg: DARK, fg: LILAC },
  { name: "Licht op diep violet", bg: DEEP, fg: LIGHT },
  { name: "Zacht op diep violet", bg: DEEP, fg: LILAC },
  { name: "Diep violet op violet", bg: VIOLET, fg: DEEP },
];

const verdict = (ratio: number) => (ratio >= 4.5 ? "Alle tekst" : ratio >= 3 ? "Alleen grote tekst" : "Alleen als vorm: de ruit");

/** The pairings in use, each with a sample, its contrast and what it is fit for. */
function Combinaties() {
  const cols = 4;
  const w = PW / cols;
  const h = PH / 2;
  return (
    <Plane tone="dark">
      {PAIRS.map((p, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const ratio = contrast(p.bg, p.fg);
        const shape = ratio < 3;
        return (
          <Field key={p.name} from={row ? "bottom" : "top"} at={0.5 + i * 0.3} style={{ left: col * w, top: row * h, width: w + 1, height: h, background: p.bg, color: p.fg }}>
            {p.bg === DARK && <div className="absolute" style={{ right: 0, top: 0, width: 1, height: h, background: "rgb(243 246 255 / 0.16)" }} />}
            {p.bg === DARK && row === 0 && <div className="absolute" style={{ left: 0, bottom: 0, width: w, height: 1, background: "rgb(243 246 255 / 0.16)" }} />}
            <Fade at={2.5 + i * 0.3} className="absolute" style={{ left: 32, top: 26 }}>
              {shape ? (
                <div className="flex items-center justify-center" style={{ width: 150, height: 170 }}>
                  <Block unit={1.5} />
                </div>
              ) : (
                <div className="f-title" style={{ fontSize: 150, lineHeight: "170px" }}>
                  Aa
                </div>
              )}
            </Fade>
            <Fade at={3 + i * 0.3} className="absolute" style={{ left: 32, right: 20, bottom: 30 }}>
              <div className="f-label tabular" style={{ fontSize: 44, lineHeight: "46px" }}>
                {ratio.toFixed(1).replace(".", ",")}
              </div>
              <div className="t-sign" style={{ marginTop: 10 }}>
                {p.name}
              </div>
              <div className="t-sign" style={{ fontWeight: 400, opacity: 0.7 }}>
                {verdict(ratio)}
              </div>
            </Fade>
          </Field>
        );
      })}
    </Plane>
  );
}

export const slides: Record<string, ComponentType> = {
  "kleur-palet": Palet,
  "kleur-verhouding": Verhouding,
  "kleur-combinaties": Combinaties,
  "kleur-logo": LogoInKleur,
};
