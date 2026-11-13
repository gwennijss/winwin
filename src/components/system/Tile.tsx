import type { ReactNode } from "react";

type Props = {
  number: string;
  title: string;
  /** What it is and where on the site it would be used. */
  note: string;
  children: ReactNode;
  className?: string;
};

/** One application of the motion system, with a short explanation. */
export function Tile({ number, title, note, children, className }: Props) {
  return (
    <section
      className={`flex min-h-[420px] flex-col gap-6 border border-[rgb(var(--ink)/0.10)] p-6 sm:p-8 ${className ?? ""}`}
    >
      <header className="flex items-baseline gap-3 font-mono text-[11px] tracking-wide text-[rgb(var(--ink)/0.45)]">
        <span>{number}</span>
        <h2 className="text-[rgb(var(--ink)/0.80)]">{title}</h2>
      </header>
      <div className="flex flex-1 items-center justify-center">{children}</div>
      <p className="max-w-[52ch] text-sm leading-relaxed text-[rgb(var(--ink)/0.50)]">{note}</p>
    </section>
  );
}
