"use client";

import { VariantStage } from "./VariantStage";
import { VARIANTS } from "./variants";

/** All variants side by side, each looping in its own tile. */
export function VariantGallery() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {VARIANTS.map((variant, index) => (
        <section
          key={variant.id}
          className="flex flex-col gap-4 border border-[rgb(var(--ink)/0.10)] p-6 sm:p-8"
        >
          <header className="flex items-baseline gap-3 font-mono text-[11px] tracking-wide text-[rgb(var(--ink)/0.45)]">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2 className="text-[rgb(var(--ink)/0.80)]">{variant.title}</h2>
          </header>
          <div className="flex h-[300px] items-center justify-center overflow-hidden">
            <VariantStage variant={variant} className="w-full max-w-[640px]" />
          </div>
          <p className="max-w-[52ch] text-sm leading-relaxed text-[rgb(var(--ink)/0.50)]">
            {variant.note}
          </p>
        </section>
      ))}
    </div>
  );
}
