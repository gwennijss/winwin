"use client";

import type { ReactNode } from "react";
import { PortraitStage, usePlayback } from "../story/kit";
import { StatBlocks, STATS_STILL, type Pair } from "./StatBlocks";

type Props = {
  client: string;
  pairs: [Pair, Pair];
  /** What plays under the results. */
  footage: ReactNode;
};

/** The results on a portrait video, with the controls to pause and scrub. */
export function StatsStage({ client, pairs, footage }: Props) {
  const playback = usePlayback(STATS_STILL);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16">
      <PortraitStage playback={playback}>
        {footage}
        <StatBlocks
          client={client}
          pairs={pairs}
          onTimeline={playback.follow}
        />
      </PortraitStage>

      <section className="flex max-w-[52ch] flex-col gap-4">
        <h2 className="text-lg font-medium">Hoe het zich opbouwt</h2>
        <ol className="flex list-decimal flex-col gap-3 pl-5 text-sm leading-relaxed text-[rgb(var(--ink)/0.55)]">
          <li>De naam van de klant springt bovenin tevoorschijn in een paars blok.</li>
          <li>
            Onderin komen twee blokken omhoog, een paars en een licht, en de
            cijfers rollen erin, teken voor teken.
          </li>
          <li>
            Bij de wissel ruilen de blokken van formaat, zoals het blok in het
            logo: het brede wordt smal en het smalle breed. De cijfers rollen
            intussen door naar het volgende paar.
          </li>
          <li>
            Na vijfenhalve seconde rollen de cijfers weg en zakken de blokken
            terug. De video heeft het beeld dan anderhalve seconde alleen, en
            de ronde begint opnieuw.
          </li>
        </ol>
        <p className="text-sm leading-relaxed text-[rgb(var(--ink)/0.55)]">
          In elk paar staat het lange cijfer in het brede blok: eerst links,
          daarna rechts.
        </p>
      </section>
    </div>
  );
}
