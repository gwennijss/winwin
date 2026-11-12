import type { Metadata } from "next";
import { VariantGallery } from "@/components/variants/VariantGallery";

export const metadata: Metadata = {
  title: "Win Win — Varianten",
};

export default function VariantsPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-6 pt-28 pb-24 sm:px-10">
      <header className="flex flex-col gap-5">
        <h1 className="max-w-[16ch] text-5xl font-semibold tracking-tight sm:text-7xl">
          Win, iets, win.
        </h1>
        <p className="max-w-[56ch] text-[rgb(var(--ink)/0.50)]">
          Acht manieren om met het midden te spelen. De woorden blijven steeds
          hele objecten; alleen wat ertussen gebeurt verandert.
        </p>
      </header>
      <VariantGallery />
    </main>
  );
}
