import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import type { DeckMedia } from "./parts";

/**
 * The campaign footage for the deck: `public/media/stats.mp4` and the stills
 * in `public/media/stills`. Both are clients' material and stay out of the
 * repository; without them the deck shows a stand-in. The printed version
 * holds those stills too, so it is made here (`pnpm pdf`) and not checked in;
 * without it the deck leaves the download button out. The animated posts are
 * in `public/media/posts`, each as `name.mp4` with a still `name.jpg` beside
 * it, and stay out of the repository for the same reason. The photos in
 * `public/media/photos` are single frames chosen from the footage, cut for
 * the page that shows them: also kept out. Runs on the server only.
 */
export function findDeckMedia(): DeckMedia {
  const media = path.join(process.cwd(), "public", "media");
  const stills = path.join(media, "stills");
  const posts = path.join(media, "posts");
  const photos = path.join(media, "photos");
  return {
    posts: existsSync(posts)
      ? readdirSync(posts)
          .filter((file) => file.endsWith(".mp4"))
          .map((file) => file.slice(0, -4))
      : [],
    photos: existsSync(photos)
      ? readdirSync(photos)
          .filter((file) => file.endsWith(".jpg"))
          .map((file) => file.slice(0, -4))
      : [],
    pdf: existsSync(path.join(process.cwd(), "public", "deck", "Win-Win-Brand-Presentation.pdf")),
    video: existsSync(path.join(media, "stats.mp4")) ? "/media/stats.mp4" : undefined,
    stills: existsSync(stills)
      ? readdirSync(stills)
          .filter((file) => /\.(jpe?g|png|webp)$/.test(file))
          .sort()
          .map((file) => `/media/stills/${file}`)
      : [],
  };
}
