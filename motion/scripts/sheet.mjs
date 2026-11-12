// Tiles out/stills/*.png into one contact sheet: node scripts/sheet.mjs [columns] [height]
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpeg from "ffmpeg-static";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = path.join(root, "out", "stills");
const count = readdirSync(dir).filter((f) => f.endsWith(".png")).length;
const columns = Number(process.argv[2] ?? 8);
const height = Number(process.argv[3] ?? 400);
const rows = Math.ceil(count / columns);
const out = path.join(root, "out", "sheet.jpg");
spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-pattern_type", "glob", "-i", path.join(dir, "*.png"),
  "-vf", `scale=-2:${height},tile=${columns}x${rows}:padding=6:color=white`, "-frames:v", "1", out], { stdio: "inherit" });
console.log(out);
