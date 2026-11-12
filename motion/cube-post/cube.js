import { CANVAS, CLIPS, CLIP_SECONDS, FPS, LAYOUT, SCENES, TIMING, clipId } from "./config.js";

/* global gsap, CustomEase */
gsap.registerPlugin(CustomEase);

// The Win Win motion language, as in the logo animation.
/** No wind-up, no overshoot: a smooth start and a soft landing. */
const FLOW = CustomEase.create("winwin-flow", "0.6, 0, 0.25, 1");

const W = CANVAS.width;
const H = CANVAS.height;
const N = CLIPS.length;
const LOOP = N * TIMING.period;
const LAST_FRAME = Math.floor(CLIP_SECONDS * FPS);
const TITLE_FONT = '"Trabat Semi Condensed"';
/** Room the two lines of small print take under the block, in a scene that has them. */
const captionRoom = (scene) => (scene.caption ? LAYOUT.captionGap + 55 : 0);

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const mod = (a, n) => ((a % n) + n) % n;

const kindOf = (scene) => (scene % 2 === 0 ? "logo" : "claim");

/* ------------------------------------------------------------------ layout */

/** Where each scene's words, block and caption go. Filled in by `measure`. */
const layout = { logo: null, claim: null };

/**
 * Puts the block, and the small print under it if the scene has any, as one
 * group in the middle of the room between the upper and the lower words.
 */
function middle(from, to, scene) {
  const caption = captionRoom(scene);
  const room = to - from - 2 * LAYOUT.padding - caption;
  const size = Math.min(scene.block, room);
  const group = size + caption;
  const top = from + (to - from - group) / 2;
  return { size, centre: top + size / 2, captionTop: top + size + LAYOUT.captionGap };
}

/**
 * Lays out one scene. The words are made as large as fits: no wider than the
 * title width, and no taller than leaves room for the block. Every line is
 * placed by where its ink is, not by its line box.
 */
function arrange(scene) {
  const text = (line) => (scene.caps ? line.toUpperCase() : line);
  const ctx = document.createElement("canvas").getContext("2d");
  const probe = 200;
  ctx.font = `${probe}px ${TITLE_FONT}`;
  const inked = [...scene.top, ...scene.bottom].map((line) => {
    const m = ctx.measureText(text(line));
    return {
      left: m.actualBoundingBoxLeft,
      width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
      ascent: m.actualBoundingBoxAscent,
      descent: m.actualBoundingBoxDescent,
    };
  });
  const topMetrics = inked.slice(0, scene.top.length);
  const bottomMetrics = inked.slice(scene.top.length);
  const rise = Math.max(...inked.map((m) => m.ascent));
  const tall = (metrics) => rise * (1 + (metrics.length - 1) * LAYOUT.leading) + metrics.at(-1).descent;
  const group = scene.block + captionRoom(scene) + 2 * LAYOUT.padding;
  const room = (H - 2 * LAYOUT.margin - group) / 2;
  const scale = Math.min(
    LAYOUT.titleWidth / Math.max(...inked.map((m) => m.width)),
    room / Math.max(tall(topMetrics), tall(bottomMetrics)),
  );

  const ascent = rise * scale;
  const step = ascent * LAYOUT.leading;
  const place = (lines, metrics, firstBaseline) =>
    lines.map((line, i) => ({
      text: text(line),
      x: W / 2 - (metrics[i].width * scale) / 2 + metrics[i].left * scale,
      y: firstBaseline + i * step,
    }));
  const topLines = place(scene.top, topMetrics, LAYOUT.margin + ascent);
  const topEnd = topLines.at(-1).y + topMetrics.at(-1).descent * scale;
  const lastDescent = bottomMetrics.at(-1).descent * scale;
  const bottomFirst = H - LAYOUT.margin - lastDescent - (scene.bottom.length - 1) * step;
  const bottomLines = place(scene.bottom, bottomMetrics, bottomFirst);
  const bottomStart = bottomFirst - ascent;
  return {
    fontSize: probe * scale,
    topLines,
    bottomLines,
    bottomStart,
    bottomEnd: H - LAYOUT.margin,
    ...middle(topEnd, bottomStart, scene),
  };
}

function measure() {
  layout.logo = arrange(SCENES.logo);
  layout.claim = arrange(SCENES.claim);
}

/* ------------------------------------------------------------------- state */

/**
 * Everything that is seen at time `t`, worked out from `t` alone, so any frame
 * can be drawn in any order. The turn into scene j is centred on j·period − 1
 * second, so the loop starts and ends with scene 0 at rest.
 */
function stateAt(t) {
  const P = TIMING.period;
  const u = mod(t + P / 2, LOOP);
  const step = Math.floor(u / P);
  const phase = u - step * P;
  // Time to the centre of the nearest turn, and which turn that is.
  const into = phase < P / 2 ? step : step + 1;
  const d = phase < P / 2 ? phase : phase - P;

  const half = TIMING.turn / 2;
  let from;
  let to;
  let turn = 0;
  if (Math.abs(d) < half) {
    from = mod(into - 1, N);
    to = mod(into, N);
    turn = (d + half) / TIMING.turn;
  } else {
    // At rest, with the next clip ready on the block's side.
    from = mod(d >= 0 ? into : into - 1, N);
    to = mod(from + 1, N);
  }

  // Seconds into each clip's stretch of footage. A clip is seen from the
  // start of the turn that brings it in until the end of the one that takes
  // it away.
  const clipTime = (c) => mod(u - c * P + half, LOOP);

  return { from, to, turn, clipTime };
}

/* --------------------------------------------------------------------- DOM */

const stage = document.getElementById("stage");
const wordCube = document.getElementById("word-cube");
const blockCube = document.getElementById("block-cube");
const SVG = "http://www.w3.org/2000/svg";

function element(tag, className, parent) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (parent) parent.appendChild(el);
  return el;
}

/** One side of the words' cube: built once, filled with a scene as needed. */
function makeFace(id) {
  const root = element("div", "face", wordCube);
  const words = document.createElementNS(SVG, "svg");
  words.setAttribute("class", "words");
  words.setAttribute("viewBox", `0 0 ${W} ${H}`);
  root.appendChild(words);
  const caption = element("div", "caption", root);
  return { root, words, caption, gradient: `lit-${id}`, kind: "", scene: -1 };
}

const faces = [makeFace(0), makeFace(1)];

/** The block's four sides; only the front and the right one carry a picture. */
const sides = ["front", "right", "back", "left"].map((name) => {
  const side = element("div", `side ${name}`, blockCube);
  const img = name === "front" || name === "right" ? element("img", "", side) : null;
  if (img) img.decoding = "sync";
  const dim = element("div", "dim", side);
  return { side, img, dim };
});

/** Fills a side of the words' cube with a scene: its words and small print. */
function fill(face, scene) {
  if (face.scene === scene) return;
  face.scene = scene;
  const kind = kindOf(scene);
  const look = SCENES[kind];
  const place = layout[kind];
  face.root.style.color = look.ink;

  if (face.kind !== kind) {
    face.kind = kind;
    const lower = look.inkBottom ? `url(#${face.gradient})` : look.ink;
    const line = ({ text, x, y }, fill) =>
      `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" font-size="${place.fontSize.toFixed(2)}" fill="${fill}">${text}</text>`;
    face.words.innerHTML =
      `<defs><linearGradient id="${face.gradient}" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="${place.bottomStart}" y2="${place.bottomEnd}">` +
      `<stop offset="0" stop-color="${look.ink}"/><stop offset="1" stop-color="${look.inkBottom ?? look.ink}"/></linearGradient></defs>` +
      place.topLines.map((l) => line(l, look.ink)).join("") +
      place.bottomLines.map((l) => line(l, lower)).join("");

    face.caption.innerHTML = "";
    face.caption.style.display = look.caption ? "" : "none";
    if (look.caption) {
      for (const lines of [look.caption.left, look.caption.right]) {
        const col = element("div", "", face.caption);
        for (const text of lines) element("span", "", col).textContent = text;
      }
      face.caption.style.top = `${place.captionTop}px`;
      face.caption.style.width = `${place.size}px`;
    }
  }
}

/* ------------------------------------------------------------------ render */

const frameUrl = (clip, time) => {
  const index = clamp(Math.floor(time * FPS) + 1, 1, LAST_FRAME);
  return `../media/frames/cube-post/${clipId(CLIPS[clip])}/${String(index).padStart(4, "0")}.jpg`;
};

/** Darkness of a surface turned `angle` degrees away from the viewer. */
const shadeFor = (angle, strength) =>
  clamp((1 - Math.cos((Math.abs(angle) * Math.PI) / 180)) * strength, 0, 0.9);

/** Draws the block, `angle` degrees into its turn from clip `from` to `to`. */
function drawBlock(s, angle, pending) {
  const a = layout[kindOf(s.from)];
  const b = layout[kindOf(s.to)];
  const share = angle / 90;
  const size = lerp(a.size, b.size, share);
  blockCube.style.top = `${lerp(a.centre, b.centre, share)}px`;
  // Turns about its own middle, with whichever side faces front flush with
  // the plane the words stand on.
  blockCube.style.transform = `translateZ(${-size / 2}px) rotateY(${-angle}deg)`;

  sides.forEach(({ side, img, dim }, i) => {
    side.style.width = side.style.height = `${size}px`;
    side.style.left = side.style.top = `${-size / 2}px`;
    side.style.transform = `rotateY(${i * 90}deg) translateZ(${size / 2}px)`;
    dim.style.opacity = shadeFor(i * 90 - angle, 0.5);
    if (img) {
      const clip = i === 0 ? s.from : s.to;
      img.style.objectPosition = `50% ${CLIPS[clip].focus * 100}%`;
      const url = frameUrl(clip, s.clipTime(clip));
      if (img.getAttribute("src") !== url) {
        img.setAttribute("src", url);
        pending.push(img.decode().catch(() => undefined));
      }
    }
  });
}

/** Draws time `t`. Resolves once every picture in it has been decoded. */
function renderAt(t) {
  const s = stateAt(t);
  const pending = [];
  const turning = s.turn > 0;
  // One angle for the words and the block: they turn as one.
  const angle = FLOW(s.turn) * 90;

  // One flat colour behind everything; halfway through the turn it becomes
  // the next scene's.
  stage.style.background = SCENES[kindOf(angle >= 45 ? s.to : s.from)].background;

  const [out, inn] = faces;
  fill(out, s.from);
  out.root.style.transform = `rotateY(0deg) translateZ(${W / 2}px)`;
  if (turning) {
    fill(inn, s.to);
    inn.root.style.display = "";
    inn.root.style.transform = `rotateY(90deg) translateZ(${W / 2}px)`;
  } else {
    inn.root.style.display = "none";
  }
  wordCube.style.transform = `translateZ(${-W / 2}px) rotateY(${-angle}deg)`;

  drawBlock(s, angle, pending);
  return Promise.all(pending);
}

/* -------------------------------------------------------------------- boot */

async function boot() {
  await Promise.all([
    document.fonts.load(`100px ${TITLE_FONT}`),
    document.fonts.load('500 22px "Hanken Grotesk"'),
    document.fonts.load('400 22px "Hanken Grotesk"'),
  ]);
  await document.fonts.ready;
  measure();
  await renderAt(0);
}

window.LOOP = LOOP;
window.FPS = FPS;
window.renderAt = renderAt;
window.ready = boot();

// Previewing in a browser: ?play plays it, ?t=3.5 shows one moment.
const params = new URLSearchParams(location.search);
window.ready.then(() => {
  if (params.has("t")) {
    renderAt(Number(params.get("t")));
    return;
  }
  if (!params.has("play")) return;
  const controls = document.getElementById("controls");
  const toggle = document.getElementById("toggle");
  const scrub = document.getElementById("scrub");
  const time = document.getElementById("time");
  controls.hidden = false;
  let playing = true;
  let at = 0;
  let last = performance.now();
  toggle.onclick = () => {
    playing = !playing;
    toggle.textContent = playing ? "Pauze" : "Speel af";
  };
  scrub.oninput = () => {
    at = Number(scrub.value) * LOOP;
    playing = false;
    toggle.textContent = "Speel af";
  };
  const tick = (now) => {
    if (playing) at = mod(at + (now - last) / 1000, LOOP);
    last = now;
    renderAt(at);
    scrub.value = String(at / LOOP);
    time.textContent = `${at.toFixed(2)}s / ${LOOP.toFixed(2)}s`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
