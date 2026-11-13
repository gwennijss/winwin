/**
 * Prints the brand presentation to PDF, one 1920 × 1080 page per slide.
 *
 *   pnpm pdf                                   build, start a local server, print
 *   BASE=http://localhost:3000 pnpm pdf        print from a server that is already running
 *
 * The PDF lands in public/deck/, so the download button in the deck serves
 * the printed version. It is printed with the Chrome that is installed on
 * this machine.
 */
import { spawn, execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const OUT = "public/deck/Win-Win-Brand-Presentation.pdf";
const PORT = 4174;
let base = process.env.BASE;
let server;

if (!base) {
  console.log("Building…");
  execSync("pnpm exec next build", { stdio: "inherit" });
  server = spawn("pnpm", ["exec", "next", "start", "-p", String(PORT)], { stdio: "ignore" });
  base = `http://localhost:${PORT}`;
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base + "/presentatie/print")).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
}

mkdirSync("public/deck", { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(base + "/presentatie/print", { waitUntil: "networkidle" });
  await page.waitForSelector(".print-page");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)))));
  });
  // The overlays over a video measure their type once the typefaces are in, and then stand still.
  await page.waitForTimeout(2500);
  await page.pdf({ path: OUT, width: "1920px", height: "1080px", printBackground: true, preferCSSPageSize: true });
  console.log(`Printed ${await page.locator(".print-page").count()} pages to ${OUT}`);
} finally {
  await browser.close();
  server?.kill();
}
