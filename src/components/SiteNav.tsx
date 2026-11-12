"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Logo" },
  { href: "/varianten", label: "Varianten" },
  { href: "/system", label: "Systeem" },
  { href: "/labels", label: "Labels" },
  { href: "/case", label: "Case" },
];

/** Switches between the logo animation and the motion system built on it. */
export function SiteNav() {
  const pathname = usePathname();
  const [light, setLight] = useState(false);

  // The ground is set on the page itself so that everything on it follows.
  useEffect(() => {
    document.documentElement.dataset.ground = light ? "light" : "dark";
  }, [light]);

  return (
    <nav className="fixed inset-x-0 top-0 z-10 flex gap-5 px-6 py-5 font-mono text-[11px] tracking-wide sm:px-10">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? "page" : undefined}
          className={`transition-colors hover:text-[rgb(var(--ink))] ${
            pathname === link.href ? "text-[rgb(var(--ink))]" : "text-[rgb(var(--ink)/0.45)]"
          }`}
        >
          {link.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={() => setLight((now) => !now)}
        aria-pressed={light}
        className="ml-auto cursor-pointer text-[rgb(var(--ink)/0.45)] transition-colors hover:text-[rgb(var(--ink))]"
      >
        {light ? "Donker" : "Licht"}
      </button>
    </nav>
  );
}
