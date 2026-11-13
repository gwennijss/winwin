"use client";

import { useState, type ReactNode } from "react";
import { LabelDivider, LabelStill } from "../labels/LabelStill";
import { SHADE } from "../labels/palette";
import { Choice, PortraitStage, usePlayback } from "../story/kit";
import {
  StatsOverlay,
  STILL,
  type NumberFace,
  type Stat,
} from "./StatsOverlay";
import { STAT_MOTIONS, type StatMotion } from "./statMotion";

const FACES: { face: NumberFace; name: string; note: string }[] = [
  {
    face: "condensed",
    name: "Trabat Condensed",
    note: "De smalste Trabat, zo groot als de breedte toelaat. Hoger dan dit wordt een cijfer in Trabat niet.",
  },
  {
    face: "semi",
    name: "Trabat Semi Condensed",
    note: "De breedte van de titels in het tekstvlak. Breder, dus het cijfer wordt lager.",
  },
  {
    face: "tall",
    name: "Anton",
    note: "Geen lettertype van het merk, alleen ter vergelijking. Het voorbeeld gebruikt zo'n zware, heel smalle letter: daardoor is het cijfer daar zo hoog.",
  },
];

const GROUNDS = [
  {
    key: "violet",
    name: "Paars getint",
    note: "De video in tinten van het donkere paars, zoals het voorbeeld zijn groen heeft: bijna een effen vlak, waar het cijfer vanaf springt.",
  },
  {
    key: "colour",
    name: "In kleur, donker",
    note: "De video in zijn eigen kleuren, donkerder gemaakt. Het beeld van de campagne blijft herkenbaar, maar trekt meer aandacht.",
  },
] as const;

type Ground = (typeof GROUNDS)[number]["key"];

type Props = {
  service: string;
  client: string;
  stats: Stat[];
  /** What plays behind the results. */
  footage: ReactNode;
};

/**
 * Results on a story: a video in the background, held back so that the
 * number is the thing you look at, with the ways of changing from one
 * result to the next to compare next to it.
 */
export function StatsStory({ service, client, stats, footage }: Props) {
  const [motion, setMotion] = useState<StatMotion>("roll");
  const [face, setFace] = useState<NumberFace>("condensed");
  const [ground, setGround] = useState<Ground>("violet");
  const playback = usePlayback(STILL);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16">
      <PortraitStage playback={playback}>
        {/* The video is held back, so that the number comes first: either
            drained of its colour and steeped in the dark violet, or kept in
            colour under a dark veil. */}
        <div
          className="absolute inset-0"
          style={{
            filter:
              ground === "violet" ? "grayscale(1) contrast(1.2)" : undefined,
          }}
        >
          {footage}
        </div>
        {ground === "violet" ? (
          <>
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-multiply"
              style={{ background: "#3A22C8" }}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: SHADE.violetDark, opacity: 0.62 }}
            />
          </>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "rgb(37 37 38 / 0.68)" }}
          />
        )}
        {/* Clear of what the apps put over a story: the bar along the top
            and the reply field along the bottom. */}
        <div className="absolute top-[11%] left-[5.5%] text-[1.5em]">
          <LabelStill>
            {service}
            <LabelDivider />
            {client}
          </LabelStill>
        </div>
        <div className="absolute right-[5.5%] bottom-[33%] left-[5.5%]">
          <StatsOverlay
            stats={stats}
            motion={motion}
            face={face}
            onTimeline={playback.follow}
          />
        </div>
      </PortraitStage>

      <div className="flex max-w-[52ch] flex-col gap-10">
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Van het ene cijfer naar het volgende</h2>
          <div className="flex flex-wrap gap-2">
            {STAT_MOTIONS.map((option) => (
              <Choice
                key={option.key}
                chosen={motion === option.key}
                onChoose={() => setMotion(option.key)}
              >
                {option.name}
              </Choice>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-[rgb(var(--ink)/0.55)]">
            {STAT_MOTIONS.find((option) => option.key === motion)?.note}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Lettertype van het cijfer</h2>
          <div className="flex flex-wrap gap-2">
            {FACES.map((option) => (
              <Choice
                key={option.face}
                chosen={face === option.face}
                onChoose={() => setFace(option.face)}
              >
                {option.name}
              </Choice>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-[rgb(var(--ink)/0.55)]">
            {FACES.find((option) => option.face === face)?.note}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Video op de achtergrond</h2>
          <div className="flex flex-wrap gap-2">
            {GROUNDS.map((option) => (
              <Choice
                key={option.key}
                chosen={ground === option.key}
                onChoose={() => setGround(option.key)}
              >
                {option.name}
              </Choice>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-[rgb(var(--ink)/0.55)]">
            {GROUNDS.find((option) => option.key === ground)?.note}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Hoe het is opgezet</h2>
          <ul className="flex list-disc flex-col gap-3 pl-5 text-sm leading-relaxed text-[rgb(var(--ink)/0.55)]">
            <li>
              Eén cijfer tegelijk, zo groot dat het breedste cijfer de hele
              breedte vult. Elk cijfer staat 2,75 seconde.
            </li>
            <li>
              Wat het cijfer telt staat in hoofdletters onder het
              rechteruiteinde, en veegt mee met de wissel.
            </li>
            <li>
              Het label bovenin staat stil: hier is het cijfer wat beweegt.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
