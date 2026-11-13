import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { Footage } from "@/components/case/Footage";
import type { Pair } from "@/components/stats/StatBlocks";
import { StatsStage } from "@/components/stats/StatsStage";

export const metadata: Metadata = {
  title: "Win Win — Stats",
};

/**
 * Stand-in results: the figures are made up, to have numbers of the right
 * length to look at. The long result of each pair goes in the wide block:
 * on the left in the first pair, on the right in the second.
 */
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

/** A video in `public/media/stats.mp4` plays under the results, if it is there. */
function findVideo(): string | undefined {
  const there = existsSync(
    path.join(process.cwd(), "public", "media", "stats.mp4"),
  );
  return there ? "/media/stats.mp4" : undefined;
}

export default function StatsPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-6 pt-28 pb-24 sm:px-10">
      <header className="flex flex-col gap-5">
        <h1 className="max-w-[16ch] text-5xl font-semibold tracking-tight sm:text-7xl">
          Stats op een video.
        </h1>
        <p className="max-w-[60ch] text-[rgb(var(--ink)/0.50)]">
          De video blijft waar je naar kijkt. Een klein deel van het beeld
          wordt gekaapt: bovenin de klant, onderin twee blokken met elk een
          cijfer, die van formaat ruilen voor de twee volgende. Alle vier de
          cijfers zijn binnen zes seconden gezien.{" "}
          <Link
            href="/stats/groot"
            className="underline underline-offset-4 transition-colors hover:text-[rgb(var(--ink))]"
          >
            De eerdere verkenning met één groot cijfer
          </Link>{" "}
          staat er nog.
        </p>
      </header>

      <StatsStage
        client="De Kuyper"
        pairs={PAIRS}
        footage={<Footage video={findVideo()} />}
      />
    </main>
  );
}
