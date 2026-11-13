import type { Metadata } from "next";
import { Suspense } from "react";
import { Gate } from "./Gate";

export const metadata: Metadata = {
  title: "Win Win · Brand Presentation",
  robots: { index: false, follow: false },
};

/**
 * The gate of the live site: the name, and one field for the password. It
 * shows nothing of the brand yet, like the first pages of the presentation
 * behind it: the brand's dark and light, and a plain sans.
 */
export default function Page() {
  return (
    <main
      className="fixed inset-0 z-50 flex flex-col bg-[#252526] px-6 py-7 text-[#F3F6FF] sm:px-[60px] sm:py-12"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: "-0.006em" }}
    >
      <div className="flex justify-between text-[15px] font-medium sm:text-[18px]">
        <span>Brand Presentation</span>
        <span className="text-[#F3F6FF]/55">Win Win</span>
      </div>
      <div className="flex flex-1 items-center">
        <Suspense>
          <Gate />
        </Suspense>
      </div>
      <h1 className="text-[22vw] leading-[0.9] font-medium tracking-[-0.055em] sm:text-[200px]">Win Win</h1>
    </main>
  );
}
