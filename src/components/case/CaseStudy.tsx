"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  CaseOverlay,
  FACES as FACE_TYPE,
  READABLE,
  type CaseText,
  type PanelTone,
  type TitleFace,
} from "./CaseOverlay";
import { LABEL_TEXT_MOTIONS, type LabelTextMotion } from "./labelText";

/** The typefaces to try for the running text, with what each one brings. */
const BODY_FONTS = [
  {
    name: "Instrument Sans",
    family: "var(--font-instrument)",
    note: "Smal en strak. De letters zijn hoekiger dan die van Trabat, dus titel en leestekst zijn goed uit elkaar te houden, en er past veel tekst op een regel.",
  },
  {
    name: "Hanken Grotesk",
    family: "var(--font-hanken)",
    note: "Ronder en opener. Leest zacht, maar lijkt meer op Trabat, waardoor de titel minder afsteekt.",
  },
  {
    name: "Geist",
    family: "var(--font-geist-sans)",
    note: "Het lettertype van deze site. Neutraal en technisch, en breder: dezelfde tekst heeft een regel meer nodig.",
  },
] as const;

/** The widths of Trabat to compare inside the panel, narrowest first. */
const FACES: { face: TitleFace; name: string; note: string }[] = [
  {
    face: "condensed",
    name: "Condensed",
    note: "Dezelfde smalle Trabat als het label. Er past het meest op een regel, maar de ronde letters ogen ingeduwd.",
  },
  {
    face: "semi",
    name: "Semi Condensed",
    note: "De gekozen breedte. De ronde letters hebben weer lucht, en er past nog bijna evenveel op een regel als bij de smalle.",
  },
  {
    face: "regular",
    name: "Regular",
    note: "De gewone breedte. Het rondst, maar ruim een kwart breder dan de smalle, dus de titel moet het kleinst.",
  },
];

const TONES: { tone: PanelTone; name: string }[] = [
  { tone: "dark", name: "Donker vlak" },
  { tone: "light", name: "Licht vlak" },
];

type Props = {
  text: CaseText;
  /** What plays behind the text. */
  footage: ReactNode;
};

/** One of a row of choices. */
function Choice({
  chosen,
  onChoose,
  children,
}: {
  chosen: boolean;
  onChoose: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={chosen}
      onClick={onChoose}
      className={`cursor-pointer border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--ink))] ${
        chosen
          ? "border-[rgb(var(--ink)/0.80)] text-[rgb(var(--ink))]"
          : "border-[rgb(var(--ink)/0.14)] text-[rgb(var(--ink)/0.55)] hover:text-[rgb(var(--ink))]"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * The case overlay on a portrait video, with the things worth comparing next
 * to it: the typeface of the running text and the colour of the panel.
 */
export function CaseStudy({ text, footage }: Props) {
  const [face, setFace] = useState<TitleFace>("semi");
  const [font, setFont] = useState(1);
  const [tone, setTone] = useState<PanelTone>("dark");
  const [labelText, setLabelText] = useState<LabelTextMotion>("rise");
  const [caps, setCaps] = useState(false);
  const [playing, setPlaying] = useState(true);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const scrubber = useRef<HTMLInputElement>(null);

  // Keeps the scrubber level with the animation without redrawing the page
  // on every frame.
  const follow = useCallback((next: gsap.core.Timeline | null) => {
    timeline.current = next;
    if (!next) return;
    setPlaying(!next.paused());
    next.eventCallback("onUpdate", () => {
      if (scrubber.current) {
        scrubber.current.value = String(next.time() / next.duration());
      }
    });
  }, []);

  const toggle = () => {
    const now = timeline.current;
    if (!now) return;
    now.paused(!now.paused());
    setPlaying(!now.paused());
  };

  const scrub = (share: number) => {
    const now = timeline.current;
    if (!now) return;
    now.pause().time(share * now.duration());
    setPlaying(false);
  };

  const still = () => {
    timeline.current?.pause().time(READABLE);
    setPlaying(false);
  };

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16">
      <div className="flex flex-col gap-4">
        {/* A portrait video, 9:16. Everything on it is sized in 27ths of its
            width, so it looks the same at any size: 40 pixels on 1080. */}
        <div
          className="relative aspect-[9/16] w-[calc(min(82vh,900px)*9/16)] max-w-full overflow-hidden"
          style={{ containerType: "inline-size" }}
        >
          <div className="absolute inset-0 text-[calc(100cqw/27)]">
            {footage}
            {/* Clear of what the apps put over a video: the buttons down the
                right-hand side and the caption along the bottom. */}
            <div className="absolute bottom-[17%] left-[5.5%] w-[76%]">
              <CaseOverlay
                text={text}
                tone={tone}
                bodyFont={BODY_FONTS[font].family}
                face={face}
                caps={caps}
                labelText={labelText}
                onTimeline={follow}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] tracking-wide text-[rgb(var(--ink)/0.55)]">
          <button
            type="button"
            onClick={toggle}
            className="w-[5.5em] cursor-pointer text-left transition-colors hover:text-[rgb(var(--ink))]"
          >
            {playing ? "Pauze" : "Speel af"}
          </button>
          <input
            ref={scrubber}
            type="range"
            min={0}
            max={1}
            step={0.001}
            defaultValue={0}
            aria-label="Plek in de animatie"
            onChange={(event) => scrub(Number(event.target.value))}
            className="min-w-0 flex-1 accent-[#593CFF]"
          />
          <button
            type="button"
            onClick={still}
            className="cursor-pointer transition-colors hover:text-[rgb(var(--ink))]"
          >
            Eindbeeld
          </button>
        </div>
      </div>

      <div className="flex max-w-[52ch] flex-col gap-10">
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Tekst in het label</h2>
          <div className="flex flex-wrap gap-2">
            {LABEL_TEXT_MOTIONS.map((option) => (
              <Choice
                key={option.key}
                chosen={labelText === option.key}
                onChoose={() => setLabelText(option.key)}
              >
                {option.name}
              </Choice>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-[rgb(var(--ink)/0.55)]">
            {LABEL_TEXT_MOTIONS.find((option) => option.key === labelText)?.note}{" "}
            Kiezen speelt de animatie opnieuw af vanaf het begin.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Trabat in het tekstvlak</h2>
          {/* The three widths at one size, so the difference in width is
              the only difference. Choosing one sets it in the panel. */}
          <div className="flex flex-col">
            {FACES.map((option) => (
              <button
                key={option.face}
                type="button"
                aria-pressed={face === option.face}
                onClick={() => setFace(option.face)}
                className={`flex cursor-pointer flex-col gap-1 border-l-2 py-3 pl-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--ink))] ${
                  face === option.face
                    ? "border-[#593CFF] text-[rgb(var(--ink))]"
                    : "border-[rgb(var(--ink)/0.14)] text-[rgb(var(--ink)/0.55)] hover:text-[rgb(var(--ink))]"
                }`}
              >
                <span
                  className="text-[2rem] leading-none whitespace-nowrap"
                  style={{ fontFamily: FACE_TYPE[option.face].family }}
                >
                  Twaalf creators, één proefrit.
                </span>
                <span className="text-sm">{option.name}</span>
              </button>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-[rgb(var(--ink)/0.55)]">
            {FACES.find((option) => option.face === face)?.note} Het label
            blijft in de smalle.
          </p>
          <div className="flex flex-wrap gap-2">
            <Choice chosen={!caps} onChoose={() => setCaps(false)}>
              Kleine letters
            </Choice>
            <Choice chosen={caps} onChoose={() => setCaps(true)}>
              Hoofdletters
            </Choice>
          </div>
          <p className="text-sm leading-relaxed text-[rgb(var(--ink)/0.55)]">
            {caps
              ? "Alles in Trabat staat in hoofdletters, ook het label. De letters staan iets verder uit elkaar en de titel is een maat kleiner gezet."
              : "Zoals het lettertype getekend is: met een hoofdletter aan het begin."}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Lettertype van de leestekst</h2>
          <div className="flex flex-wrap gap-2">
            {BODY_FONTS.map((option, index) => (
              <Choice
                key={option.name}
                chosen={font === index}
                onChoose={() => setFont(index)}
              >
                {option.name}
              </Choice>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-[rgb(var(--ink)/0.55)]">
            {BODY_FONTS[font].note}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Kleur van het tekstvlak</h2>
          <div className="flex flex-wrap gap-2">
            {TONES.map((option) => (
              <Choice
                key={option.tone}
                chosen={tone === option.tone}
                onChoose={() => setTone(option.tone)}
              >
                {option.name}
              </Choice>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Hoe het zich opbouwt</h2>
          <ol className="flex list-decimal flex-col gap-3 pl-5 text-sm leading-relaxed text-[rgb(var(--ink)/0.55)]">
            <li>
              Het label bouwt zich op zoals op de labelpagina. De dienst en
              de klant zijn één tekst, met een blokje ertussen; hoe die
              tekst binnenkomt kies je hierboven.
            </li>
            <li>
              Het tekstvlak zakt uit de onderkant van het label, op de
              breedte van het label. Pas als het beneden is, wordt het
              breder naar rechts.
            </li>
            <li>
              Als het vlak stilstaat komt de tekst: de titel per regel omhoog
              vanachter een rand, de leestekst woord voor woord en de cijfers
              als laatste.
            </li>
            <li>
              Bij het weggaan verdwijnt eerst de tekst. Daarna wordt het lege
              vlak smaller en trekt het omhoog, en als laatste pakt het label
              zich in.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
