import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { Footage } from "@/components/case/Footage";
import type { Stat } from "@/components/stats/StatsOverlay";
import { StatsStory } from "@/components/stats/StatsStory";
import { anton, trabatSemi } from "../../fonts";

export const metadata: Metadata = {
  title: "Win Win — Stats, één groot cijfer",
};

/**
 * Stand-in results: the figures are made up, to have numbers of the right
 * length to look at.
 */
const STATS: Stat[] = [
  { value: "4,1M", caption: "weergaven" },
  { value: "+38%", caption: "meer bereik" },
  { value: "74%", caption: "kijkt tot het eind" },
];

/** A video in `public/media/stats.mp4` plays behind the results, if it is there. */
function findVideo(): string | undefined {
  const there = existsSync(
    path.join(process.cwd(), "public", "media", "stats.mp4"),
  );
  return there ? "/media/stats.mp4" : undefined;
}

/**
 * An earlier exploration: one result at a time as the main thing on a story,
 * with the video held back behind it.
 */
export default function LargeStatsPage() {
  return (
    <main
      className={`${trabatSemi.variable} ${anton.variable} mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-6 pt-28 pb-24 sm:px-10`}
    >
      <header className="flex flex-col gap-5">
        <h1 className="max-w-[16ch] text-5xl font-semibold tracking-tight sm:text-7xl">
          Eén groot cijfer.
        </h1>
        <p className="max-w-[56ch] text-[rgb(var(--ink)/0.50)]">
          Een eerdere verkenning: de cijfers van een campagne als hoofdzaak,
          met de video op de achtergrond. Vier manieren om van het ene cijfer
          naar het volgende te gaan, drie lettertypes en twee achtergronden.
        </p>
      </header>

      <StatsStory
        service="Boost"
        client="De Kuyper"
        stats={STATS}
        footage={<Footage video={findVideo()} />}
      />
    </main>
  );
}
