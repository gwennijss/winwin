// A small static server for the motion folder, used for previewing in a
// browser and by the renderer.
//
//   pnpm preview   →  http://localhost:4321/<post>/?play  (cube-post, reel-post, split-post, billboard-post)

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".otf": "font/otf",
  ".woff2": "font/woff2",
};

export function serve(port = 4321) {
  const server = createServer((request, response) => {
    const url = new URL(request.url, "http://localhost");
    let file = path.join(root, decodeURIComponent(url.pathname));
    if (!file.startsWith(root)) {
      response.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!existsSync(file)) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(file).pipe(response);
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4321);
  await serve(port);
  console.log(`Preview: http://localhost:${port}/<post>/?play (cube-post, reel-post, split-post, billboard-post)`);
}
