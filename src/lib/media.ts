import { existsSync } from "node:fs";
import path from "node:path";
import type { Media } from "@/components/winwin-logo/geometry";

/** The shapes that can carry a picture, and the kinds of file looked for. */
const PICTURED = ["square", "portrait", "landscape", "post"] as const;
const KINDS = ["jpg", "jpeg", "png", "webp", "avif"];

/**
 * Pictures for inside the block: any of square, portrait, landscape or post,
 * as an image file in `public/media`. Without them the block stays plain.
 * Runs on the server only.
 */
export function findMedia(): Media {
  const media: Media = {};
  for (const name of PICTURED) {
    const kind = KINDS.find((ext) =>
      existsSync(path.join(process.cwd(), "public", "media", `${name}.${ext}`)),
    );
    if (kind) media[name] = `/media/${name}.${kind}`;
  }
  return media;
}
