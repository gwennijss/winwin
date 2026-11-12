// Cuts the clips in a post's config.js out of the source videos as frames, and
// copies the Trabat typeface in from the fonts installed on this Mac.
//
//   pnpm prepare-media <post> [--source <folder with the .mp4 files>]
//
// <post> is the post's folder, such as cube-post or reel-post. The source
// folder defaults to media/source. Frames go to media/frames/<post>/<clip>.

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpeg from "ffmpeg-static";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const post = process.argv[2];
if (!post || post.startsWith("--") || !existsSync(path.join(root, post, "config.js"))) {
  console.error("Say which post to prepare, for example: pnpm prepare-media cube-post");
  process.exit(1);
}
const { CLIPS, CLIP_SECONDS, FPS, clipId, FRAME_WIDTH = 720 } = await import(`../${post}/config.js`);
const flag = process.argv.indexOf("--source");
const source = flag > -1 ? path.resolve(process.argv[flag + 1]) : path.join(root, "media", "source");

// Fonts: Trabat is licensed, so it is copied from the system rather than kept in git.
const fonts = path.join(root, "fonts");
mkdirSync(fonts, { recursive: true });
for (const name of ["TrabatDisplay-Condensed.otf", "TrabatDisplay-SemiCondensed.otf"]) {
  const from = [path.join(homedir(), "Library", "Fonts", name), path.join("/Library/Fonts", name)].find(existsSync);
  if (!from) {
    console.error(`Missing typeface ${name}: install it, or put it in ${fonts}.`);
    process.exit(1);
  }
  copyFileSync(from, path.join(fonts, name));
}

let failed = false;
for (const clip of CLIPS) {
  const input = path.join(source, clip.file);
  if (!existsSync(input)) {
    console.error(`Missing source video: ${input}`);
    failed = true;
    continue;
  }
  const out = path.join(root, "media", "frames", post, clipId(clip));
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const result = spawnSync(
    ffmpeg,
    [
      "-hide_banner", "-loglevel", "error",
      "-ss", String(clip.start),
      "-i", input,
      "-t", String(CLIP_SECONDS + 0.2),
      "-vf", `fps=${FPS},scale=${FRAME_WIDTH}:-2:flags=lanczos`,
      "-q:v", "2",
      path.join(out, "%04d.jpg"),
    ],
    { stdio: "inherit" },
  );
  const count = existsSync(out) ? readdirSync(out).length : 0;
  if (result.status !== 0 || count === 0) {
    console.error(`Could not cut ${clip.file}`);
    failed = true;
  } else {
    console.log(`${clipId(clip)}: ${count} frames from ${clip.start}s`);
  }
}
process.exit(failed ? 1 : 0);
