import type { Metadata } from "next";
import { hanken, trabatSemi } from "../fonts";
import "@/brand-deck/deck.css";

export const metadata: Metadata = {
  title: "Win Win · Brand Presentation",
  description: "De merkidentiteit van Win Win, en hoe je ermee werkt.",
  robots: { index: false, follow: false },
};

/** The deck's own typefaces, next to the condensed Trabat the whole site has. */
export default function PresentationLayout({ children }: LayoutProps<"/presentatie">) {
  return <div className={`${hanken.variable} ${trabatSemi.variable}`}>{children}</div>;
}
