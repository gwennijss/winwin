// Renders a post to an MP4, frame by frame, at twice the size and scaled down
// for clean edges. <post> is the post's folder, such as cube-post.
//
//   pnpm render <post>                    →  out/<post>.mp4
//   pnpm render <post> --stills 0,1.5,2   →  out/stills/*.png, for checking
//   pnpm render <post> --stills 0.6:1.4:0.05  (from:to:step)
//   pnpm render <post> --scale 1          →  faster, rougher

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpeg from "ffmpeg-static";
import { chromium } from "playwright";
import { serve } from "./serve.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, "out");
mkdirSync(out, { recursive: true });
const post = process.argv[2];
if (!post || post.startsWith("--") || !existsSync(path.join(root, post, "index.html"))) {
  console.error("Say which post to render, for example: pnpm render cube-post");
  process.exit(1);
}

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const scale = Number(arg("scale", "2"));
const stills = arg("stills");
const name = arg("name", post);

const port = 4400 + Math.floor(Math.random() * 400);
const server = await serve(port);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: scale });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto(`http://127.0.0.1:${port}/${post}/`);
await page.evaluate(() => window.ready);
const stage = page.locator("#stage");
const { loop, fps } = await page.evaluate(() => ({ loop: window.LOOP, fps: window.FPS }));

const draw = (t) => page.evaluate((time) => window.renderAt(time), t);

if (stills) {
  const dir = path.join(out, "stills");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const times = stills.includes(":")
    ? (() => {
        // from:to:step
        const [a, b, step] = stills.split(":").map(Number);
        const list = [];
        for (let t = a; t <= b + 1e-9; t += step) list.push(Number(t.toFixed(4)));
        return list;
      })()
    : stills.split(",").map(Number);
  for (const [i, t] of times.entries()) {
    await draw(t);
    const file = path.join(dir, `${String(i).padStart(3, "0")}-${t}s.png`);
    await stage.screenshot({ path: file });
    console.log(file);
  }
} else {
  const file = path.join(out, `${name}.mp4`);
  const encoder = spawn(
    ffmpeg,
    [
      "-hide_banner", "-loglevel", "error", "-y",
      "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
      "-vf", "scale=1080:1350:flags=lanczos,format=yuv420p",
      "-c:v", "libx264", "-preset", "slow", "-crf", "16",
      "-profile:v", "high", "-movflags", "+faststart",
      file,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const frames = Math.round(loop * fps);
  const started = Date.now();
  for (let i = 0; i < frames; i++) {
    await draw(i / fps);
    const shot = await stage.screenshot({ type: "jpeg", quality: 95 });
    if (!encoder.stdin.write(shot)) await new Promise((r) => encoder.stdin.once("drain", r));
    if (i % 30 === 0) process.stdout.write(`\rframe ${i}/${frames}`);
  }
  encoder.stdin.end();
  await new Promise((r) => encoder.on("close", r));
  console.log(`\r${file} — ${frames} frames, ${loop}s, in ${Math.round((Date.now() - started) / 1000)}s`);
}

await browser.close();
server.close();
