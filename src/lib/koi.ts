/**
 * Koi pond, ported from the koi scene of "ASCII Animals New Tab"
 * (https://github.com/Pawan-webdeveloper/Ascii-Animals-extension).
 *
 *   MIT License — Copyright (c) 2026 Pawan-webdeveloper
 *   Permission is hereby granted, free of charge, to any person obtaining a
 *   copy of this software and associated documentation files (the
 *   "Software"), to deal in the Software without restriction, including
 *   without limitation the rights to use, copy, modify, merge, publish,
 *   distribute, sublicense, and/or sell copies of the Software, and to permit
 *   persons to whom the Software is furnished to do so, subject to the
 *   following conditions: The above copyright notice and this permission
 *   notice shall be included in all copies or substantial portions of the
 *   Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 *
 * Changes from the original: only the koi are kept; the canvas is transparent
 * (no opaque water, no grid over empty space) so it sits over the site's own
 * background; no blurred "bokeh" foreground fish; settings are a constant
 * instead of chrome.storage; typed.
 *
 * How it works: each fish is a procedural shape (`sampleKoi`, in sprite units
 * — +u is the way it faces, v is lateral) sampled onto a coarse grid of cells.
 * Every cell it covers becomes one solid tinted pixel in a tiny buffer, which
 * is scaled up with smoothing off, then cut into tiles by erasing 1px grid
 * lines. Trails, ripples and the feeding splash are monospace glyphs.
 */

import { clamp, lerp } from "@/lib/math";

const TAU = Math.PI * 2;
const sq = (x: number) => x * x;
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const pick = <T,>(arr: readonly T[]) => arr[(Math.random() * arr.length) | 0];
const ell = (u: number, v: number, cu: number, cv: number, ru: number, rv: number) =>
  sq((u - cu) / ru) + sq((v - cv) / rv);
const angleDiff = (a: number, b: number) => {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
};

function hash2(i: number, j: number, s: number) {
  let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(s, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function vnoise(x: number, y: number, s: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const sx = xf * xf * (3 - 2 * xf);
  const sy = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s);
  const b = hash2(xi + 1, yi, s);
  const c = hash2(xi, yi + 1, s);
  const d = hash2(xi + 1, yi + 1, s);
  return lerp(lerp(a, b, sx), lerp(c, d, sx), sy);
}

export type RGB = readonly [number, number, number];
const mix = (c1: RGB, c2: RGB, t: number): RGB => [
  lerp(c1[0], c2[0], t),
  lerp(c1[1], c2[1], t),
  lerp(c1[2], c2[2], t),
];
const WHITE: RGB = [240, 244, 255];

/* ------------------------------------------------------------ settings -- */

export const KOI = {
  /** Fish on a 1440×900 screen; scales with area. */
  COUNT: 12,
  DENSITY: 1,
  SPEED: 1,
  SIZE: 1,
  /** How much near and far fish differ in size and brightness. */
  DEPTH: 0.6,
  SWAY: 0.5,
  /** Pixel cell, CSS px. */
  CELL: 9,
  TRAILS: true,
  /** How far a click reaches, and how far koi notice food, CSS px. */
  REACH: 220,
  /** A gentle shared drift (0 = none, ~0.5 = noticeable) and its direction
   *  in degrees (0 = toward the right, 90 = down). */
  CURRENT: 0,
  CURRENT_DIR: 0,
} as const;

const SPECIES = {
  radius: 13,
  speed: 6,
  phaseRate: 5,
  /** Tightest turning radius, in body lengths: cruising, and chasing food. */
  cruiseTurn: 0.33,
  chaseTurn: 0.2,
  /** How fast the wandering heading may drift, rad/s. */
  wander: 0.5,
  /** Seconds between bigger (but still curved) changes of course. */
  retarget: [6, 14] as const,
  /** At most this many koi go for the same pellet. */
  maxChasers: 3,
  trail: { chars: "~-~=", life: 1.8, at: [[-10, 0]] as const },
  variants: [
    { base: [236, 232, 226], patch: [214, 48, 36], thr: 0.5 },
    { base: [236, 232, 226], patch: [205, 45, 35], thr: 0.55, dark: [30, 30, 34] },
    { base: [244, 196, 44], patch: [250, 150, 30], thr: 0.72 },
    { base: [214, 220, 228], patch: [176, 186, 202], thr: 0.6 },
  ] as Palette[],
  /** The orange koi: its body comes from the page (`KoiInk.orange`). */
  orange: { patch: [255, 172, 72] as RGB, thr: 0.68 },
};

type Palette = { base: RGB; patch: RGB; thr: number; dark?: RGB };

/* -------------------------------------------------------------- shapes -- */

/** Nose-to-tail length of the koi shape, sprite units (see `sampleKoi`). */
const BODY = 21;

type Food = {
  x: number; y: number; vx: number; vy: number;
  age: number; life: number; tint: number; eaten?: boolean;
};

type Fish = {
  x: number;
  y: number;
  z: number;
  seed: number;
  pal: Palette;
  phase: number;
  rateMul: number;
  speedMul: number;
  heading: number;
  /** Current speed, px/s. 0 until the first step sets it to cruise. */
  speed: number;
  /** Wandering: the heading it would like, and how fast that drifts. */
  target: number;
  wv: number;
  retargetAt: number;
  /** Burst-and-glide: a few tail beats, then coasting. */
  gliding: boolean;
  modeUntil: number;
  /** The pellet it's after; a pellet it gave up on, ignored for a while. */
  food: Food | null;
  chaseT: number;
  chaseBest: number;
  skip: Food | null;
  skipUntil: number;
  fade: number;
  leaving: boolean;
  amp: number;
  /** Spine curvature from turning (sprite units), so the body trails the
   *  head's path instead of rotating rigidly. Signed: + bends toward +v. */
  bend: number;
  lastTrail: number;
  nextBite: number;
  /** Debug (`?koi=trace`): recent positions as x,y pairs, NaN = break. */
  path: number[];
};

/** Sampler output, reused to avoid allocations. */
const out = { r: 0, g: 0, b: 0, a: 1, shine: 0 };
function hit(c: RGB, a = 1, shine = 0, k = 1) {
  out.r = c[0] * k;
  out.g = c[1] * k;
  out.b = c[2] * k;
  out.a = a;
  out.shine = shine;
  return true;
}

/** Spine offset at `u`: zero from the head forward, growing behind it. The
 *  swim wave travels head → tail (`phase + u`: a crest moves toward -u as
 *  phase grows), and turning curves the body along the head's path. */
const SPINE_PIVOT = 6;
function spine(u: number, e: Fish) {
  const tw = clamp((8 - u) / 20, 0, 1);
  const behind = Math.max(0, SPINE_PIVOT - u);
  return e.amp * Math.sin(e.phase + u * 0.34) * tw * tw * 1.6 + e.bend * behind * behind;
}

function sampleKoi(u: number, v: number, e: Fish) {
  if (u < -12.6 || u > 8.4) return false;
  const P = e.pal;
  const vv = v - spine(u, e);
  const av = Math.abs(vv);
  let hw = 0;
  if (u > 3.6) hw = 3.0 * Math.sqrt(Math.max(0, 1 - sq((u - 3.6) / 4.7)));
  else if (u > -8) hw = 0.75 + 2.25 * Math.pow((u + 8) / 11.6, 1.25);
  if (av < hw) {
    if (u > 5.5 && u < 6.9 && av > hw - 1.15 && av < hw - 0.2) return hit([22, 22, 26]);
    const n = vnoise(u * 0.3 + e.seed * 7, vv * 0.42, e.seed);
    let c = n > P.thr ? P.patch : P.base;
    if (P.dark && vnoise(u * 0.45, vv * 0.5 + 9, e.seed + 3) > 0.68) c = P.dark;
    const k = hw - av < 0.65 ? 0.78 : av < 0.5 ? 1.05 : 1;
    return hit(c, 1, 0.2, k);
  }
  const fin = mix(P.base, WHITE, 0.25);
  if (u > 0.2 && u < 3.4 && ell(u + (av - hw) * 0.45, av, 1.6, hw + 1.1, 1.3, 1.3) < 1)
    return hit(fin, 0.55);
  if (u <= -7.4) {
    const t = -7.4 - u;
    const fw = 0.55 + t * 0.72;
    if (av < fw && !(t > 3.7 && av < (t - 3.7) * 1.1)) return hit(fin, 0.62);
  }
  return false;
}

/* ---------------------------------------------------------------- pond -- */

/**
 * What the koi leave on the page — trails, ripples, the splash when they eat,
 * and the food itself — plus the orange koi's body, which the site's accent
 * shares. Set from CSS tokens (`--koi-*`) by the caller; the other fish keep
 * their own natural colors in `SPECIES`.
 */
export type KoiInk = { trail: RGB; ripple: RGB; splash: RGB; food: RGB; orange: RGB };

export type KoiPond = {
  resize(): void;
  setInk(ink: KoiInk): void;
  /** Drop food at a viewport point (CSS px). */
  feed(clientX: number, clientY: number): void;
  start(): void;
  stop(): void;
  destroy(): void;
};

export function createKoiPond(
  world: HTMLCanvasElement,
  opts: {
    reducedMotion: () => boolean;
    /** Font family for the glyphs (trails, ripples). */
    fontFamily: string;
    /** Starting theme colors; change them later with `setInk`. */
    ink: KoiInk;
    trace?: boolean;
  },
): KoiPond {
  const ctx = world.getContext("2d")!;
  const lo = document.createElement("canvas");
  const loCtx = lo.getContext("2d")!;
  const grid = document.createElement("canvas");

  const R = {
    dpr: 1,
    W: 0,
    H: 0,
    cell: 9,
    cols: 0,
    rows: 0,
    line: 1,
    img: null as ImageData | null,
    buf: new Uint32Array(0),
    occ: new Int16Array(0),
    tLife: new Float32Array(0),
    tChar: new Uint8Array(0),
    font: "",
  };

  let fish: Fish[] = [];
  let seedCounter = 1;
  let simTime = 0;
  let raf = 0;
  let last = 0;
  const foods: Food[] = [];
  let ink = opts.ink;
  // One palette object shared by every orange fish, so re-inking recolors
  // the ones already swimming.
  const orangeKoi: Palette = { ...SPECIES.orange, base: ink.orange };
  const palettes = [...SPECIES.variants, orangeKoi];
  const ripples: {
    x: number; y: number; age: number; dur: number; maxR: number; chars: string; color: RGB;
  }[] = [];

  function resize() {
    R.dpr = window.devicePixelRatio || 1;
    R.W = Math.round(window.innerWidth * R.dpr);
    R.H = Math.round(window.innerHeight * R.dpr);
    R.cell = Math.max(4, Math.round(KOI.CELL * R.dpr));
    R.line = Math.max(1, Math.round(R.dpr));
    R.cols = Math.ceil(R.W / R.cell) + 1;
    R.rows = Math.ceil(R.H / R.cell) + 1;
    world.width = R.W;
    world.height = R.H;
    lo.width = R.cols;
    lo.height = R.rows;
    R.img = loCtx.createImageData(R.cols, R.rows);
    R.buf = new Uint32Array(R.img.data.buffer);
    const n = R.cols * R.rows;
    R.occ = new Int16Array(n);
    R.tLife = new Float32Array(n);
    R.tChar = new Uint8Array(n);
    R.font = `600 ${Math.round(R.cell * 1.02)}px ${opts.fontFamily}`;

    // Grid lines, erased out of the fish so they read as tiles. The empty
    // water gets no grid — that's the site's background showing through.
    grid.width = R.W;
    grid.height = R.H;
    const g = grid.getContext("2d")!;
    g.fillStyle = "#000";
    for (let i = 0; i <= R.cols; i++) g.fillRect(i * R.cell, 0, R.line, R.H);
    for (let j = 0; j <= R.rows; j++) g.fillRect(0, j * R.cell, R.W, R.line);

    syncPopulation(fish.length === 0);
  }

  const scaleFor = (e: Fish) =>
    KOI.SIZE * lerp(1 - KOI.DEPTH * 0.62, 1.12, e.z);

  function makeFish(o: { z?: number; fade?: number } = {}): Fish {
    const heading = rand(0, TAU);
    return {
      x: rand(0, R.W),
      y: rand(0, R.H),
      z: o.z ?? Math.pow(Math.random(), 0.85),
      seed: (seedCounter++ * 2654435761) >>> 16,
      pal: pick(palettes),
      phase: rand(0, TAU),
      rateMul: rand(0.85, 1.15),
      speedMul: rand(0.75, 1.25),
      heading,
      speed: 0,
      target: heading,
      wv: 0,
      retargetAt: rand(SPECIES.retarget[0], SPECIES.retarget[1]),
      gliding: Math.random() < 0.5,
      modeUntil: 0,
      food: null,
      chaseT: 0,
      chaseBest: Infinity,
      skip: null,
      skipUntil: 0,
      fade: o.fade ?? 0,
      leaving: false,
      amp: 0,
      bend: 0,
      lastTrail: -1,
      nextBite: 0,
      path: [],
    };
  }

  function syncPopulation(initial: boolean) {
    const area = (window.innerWidth * window.innerHeight) / (1440 * 900);
    const want = Math.max(1, Math.round(KOI.COUNT * KOI.DENSITY * clamp(area, 0.35, 2.2)));
    const live = fish.filter((e) => !e.leaving);
    for (let i = live.length; i < want; i++) fish.push(makeFish({ fade: initial ? 1 : 0 }));
    live.slice(want).forEach((e) => (e.leaving = true));
  }

  function addRipple(x: number, y: number, o: Partial<(typeof ripples)[number]> = {}) {
    ripples.push({
      x, y, age: 0,
      dur: o.dur ?? 0.9,
      maxR: o.maxR ?? 6,
      chars: o.chars ?? "·",
      color: o.color ?? ink.ripple,
    });
    if (ripples.length > 24) ripples.shift();
  }

  function feed(clientX: number, clientY: number) {
    const x = clientX * R.dpr;
    const y = clientY * R.dpr;
    const n = 6 + ((Math.random() * 4) | 0);
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU);
      const r = Math.sqrt(Math.random()) * 2.6 * R.cell;
      const s = rand(0.3, 1.2) * R.cell;
      foods.push({
        x: x + Math.cos(a) * r, y: y + Math.sin(a) * r,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        age: 0, life: rand(14, 18), tint: rand(0.85, 1.12),
      });
    }
    while (foods.length > 80) foods.shift();
    addRipple(x, y, { dur: 1.3, maxR: 7, chars: "~", color: ink.ripple });
  }

  /* ---------- simulation ---------- */

  function step(dt: number) {
    const sp = KOI.SPEED * (opts.reducedMotion() ? 0.3 : 1);
    simTime += dt * (opts.reducedMotion() ? 0.3 : 1);
    const t = simTime;
    traceTick = t - traceClock >= 0.1;
    if (traceTick) traceClock = t;
    const reachPx = KOI.REACH * R.dpr;
    const cur = (KOI.CURRENT_DIR * Math.PI) / 180;

    for (const f of foods) {
      f.age += dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.vx *= Math.pow(0.12, dt);
      f.vy *= Math.pow(0.12, dt);
    }
    for (let i = foods.length - 1; i >= 0; i--)
      if (foods[i].age > foods[i].life || foods[i].eaten) foods.splice(i, 1);
    for (const r of ripples) r.age += dt;
    while (ripples.length && ripples[0].age > ripples[0].dur) ripples.shift();

    // Who's after which pellet, so one pellet draws only a few koi.
    const chasers = new Map<Food, number>();
    for (const e of fish)
      if (e.food && !e.food.eaten) chasers.set(e.food, (chasers.get(e.food) ?? 0) + 1);

    for (const e of fish) {
      const x0 = e.x;
      const y0 = e.y;
      e.fade = e.leaving ? Math.max(0, e.fade - dt / 0.6) : Math.min(1, e.fade + dt / 0.9);
      const k = scaleFor(e);
      const L = BODY * k * R.cell; // body length, px
      const reach = SPECIES.radius * k * R.cell;
      const cruise =
        SPECIES.speed * e.speedMul * sp * (0.55 + 0.45 * e.z) * R.cell * k * 0.6;
      if (!e.speed) e.speed = cruise;

      // Wander: the wanted heading drifts (a damped random walk) and is kept
      // within reach of the current one, so a change of course is a curve —
      // never a U-turn on the spot.
      e.wv = clamp(e.wv + (rand(-1, 1) * 1.4 - e.wv * 0.9) * dt, -SPECIES.wander, SPECIES.wander);
      e.target += e.wv * dt;
      if (t >= e.retargetAt) {
        e.target += (Math.random() < 0.5 ? -1 : 1) * rand(0.4, 1);
        e.retargetAt = t + rand(SPECIES.retarget[0], SPECIES.retarget[1]);
      }
      e.target = e.heading + clamp(angleDiff(e.target, e.heading), -1.2, 1.2);
      let dx = Math.cos(e.target) + Math.cos(cur) * KOI.CURRENT;
      let dy = Math.sin(e.target) + Math.sin(cur) * KOI.CURRENT;

      // Food: pick the nearest pellet that isn't crowded or given up on, swim
      // to it on a curve, ease off on arrival. No progress for a few seconds
      // (it's inside the turning circle) → give up on it for a while; the koi
      // swims on and may loop back for it from further out.
      if (e.food && (e.food.eaten || !foods.includes(e.food) || e.leaving)) e.food = null;
      const hx = e.x + Math.cos(e.heading) * 6.5 * k * R.cell;
      const hy = e.y + Math.sin(e.heading) * 6.5 * k * R.cell;
      if (!e.food && !e.leaving && foods.length) {
        let bestD = reachPx * 2.6;
        for (const f of foods) {
          if (f.eaten || (f === e.skip && t < e.skipUntil)) continue;
          if ((chasers.get(f) ?? 0) >= SPECIES.maxChasers) continue;
          const d = Math.hypot(f.x - hx, f.y - hy);
          if (d < bestD) {
            bestD = d;
            e.food = f;
          }
        }
        if (e.food) {
          chasers.set(e.food, (chasers.get(e.food) ?? 0) + 1);
          e.chaseT = 0;
          e.chaseBest = Infinity;
        }
      }
      let chasing = false;
      let urge = 1;
      let arrive = 1;
      if (e.food) {
        const f = e.food;
        const d = Math.hypot(f.x - hx, f.y - hy) || 1;
        if (d < e.chaseBest - 0.15 * L) {
          e.chaseBest = d;
          e.chaseT = 0;
        } else e.chaseT += dt;
        if (e.chaseT > 3) {
          e.skip = f;
          e.skipUntil = t + 5;
          e.food = null;
        } else {
          chasing = true;
          const near = d <= reachPx;
          const pull = near ? 4 : 2;
          dx = dx * 0.3 + ((f.x - hx) / d) * pull;
          dy = dy * 0.3 + ((f.y - hy) / d) * pull;
          urge = near ? 2.2 : 1.6;
          arrive = clamp(d / (1.2 * L), 0.4, 1);
          if (d < (1.3 * k + 0.8) * R.cell && f.age > 0.4 && t >= e.nextBite) {
            f.eaten = true;
            e.food = null;
            e.nextBite = t + rand(0.5, 0.9);
            addRipple(f.x, f.y, { dur: 0.7, maxR: 2.5, chars: "°", color: ink.splash });
          }
        }
      }

      // Spacing: a gentle nudge away from fish within about a body length,
      // at a similar depth.
      for (const o of fish) {
        if (o === e || o.leaving || Math.abs(o.z - e.z) > 0.35) continue;
        const ox = e.x - o.x;
        const oy = e.y - o.y;
        const d = Math.hypot(ox, oy);
        const lim = (reach + SPECIES.radius * scaleFor(o) * R.cell) * 0.75;
        if (d > 0 && d < lim) {
          const w = sq(1 - d / lim) * (chasing ? 0.4 : 1.2);
          dx += (ox / d) * w;
          dy += (oy / d) * w;
        }
      }

      // Speed: burst-and-glide while cruising, steady while chasing, and
      // slower into a sharp turn (a koi brakes with its fins to turn tight).
      const want = Math.atan2(dy, dx);
      const off = Math.abs(angleDiff(want, e.heading));
      if (t >= e.modeUntil) {
        e.gliding = !e.gliding;
        e.modeUntil = t + (e.gliding ? rand(1.2, 2.8) : rand(0.7, 1.4));
      }
      const gait = chasing ? 1 : e.gliding ? 0.6 : 1.25;
      const vWant = cruise * gait * urge * arrive * lerp(1, 0.45, off / Math.PI);
      const tau = vWant > e.speed ? 0.5 : chasing ? 0.35 : 1.4; // coasting is slow to fade
      e.speed += (vWant - e.speed) * (1 - Math.exp(-dt / tau));

      // Turning: the tightest arc has a radius of a fraction of a body length,
      // so the turn rate is tied to speed — turning hard means slowing down,
      // and a koi can't pivot in place.
      const rMin = L * (chasing ? SPECIES.chaseTurn : SPECIES.cruiseTurn);
      const maxTurn = Math.max(e.speed / rMin, chasing ? 0.35 : 0.08) * dt;
      const dh = clamp(angleDiff(want, e.heading), -maxTurn, maxTurn);
      e.heading += dh;
      // The head leads the turn; the body curves back along its path (the
      // path's curvature in sprite units, soft-capped so it never folds).
      if (dt > 0) {
        const curve = (dh / dt / Math.max(e.speed, 1)) * k * R.cell;
        const bendWant = 0.012 * Math.tanh((0.5 * curve) / 0.012);
        e.bend += (bendWant - e.bend) * (1 - Math.exp(-dt / 0.15));
      }

      // Tail: beats faster the faster it swims, and rests while gliding.
      const ampWant = 1.3 * (0.35 + KOI.SWAY) * (e.gliding && !chasing ? 0.4 : 1);
      e.amp += (ampWant - e.amp) * (1 - Math.exp(-dt / 0.4));
      e.phase +=
        dt * SPECIES.phaseRate * e.rateMul * (0.55 + 0.45 * sp) *
        (0.35 + 0.65 * clamp(e.speed / cruise, 0, 2.5));

      e.x += Math.cos(e.heading) * e.speed * dt;
      e.y += Math.sin(e.heading) * e.speed * dt;

      // Wrap, re-entering at a fresh spot along the far edge.
      const m = reach + 4 * R.cell;
      if (e.x < -m) { e.x = R.W + m; e.y = rand(0, R.H); }
      else if (e.x > R.W + m) { e.x = -m; e.y = rand(0, R.H); }
      if (e.y < -m) { e.y = R.H + m; e.x = rand(0, R.W); }
      else if (e.y > R.H + m) { e.y = -m; e.x = rand(0, R.W); }
      if (opts.trace) recordPath(e, x0, y0);
    }

    fish = fish.filter((e) => !(e.leaving && e.fade <= 0));
  }

  /* ---------- debug trace ---------- */

  let traceClock = 0;
  let traceTick = false;
  function recordPath(e: Fish, x0: number, y0: number) {
    const p = e.path;
    if (Math.hypot(e.x - x0, e.y - y0) > R.W / 4) p.push(NaN, NaN); // wrapped
    if (!traceTick && p.length) return;
    p.push(e.x, e.y);
    if (p.length > 1200) p.splice(0, p.length - 1200);
  }

  function drawPaths() {
    ctx.lineWidth = 2 * R.dpr;
    for (const e of fish) {
      const p = e.path;
      const c = e.pal.base;
      ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},0.8)`;
      ctx.beginPath();
      let pen = false;
      for (let n = 0; n < p.length; n += 2) {
        if (Number.isNaN(p[n])) { pen = false; continue; }
        if (pen) ctx.lineTo(p[n], p[n + 1]);
        else ctx.moveTo(p[n], p[n + 1]);
        pen = true;
      }
      ctx.stroke();
    }
  }

  /* ---------- drawing ---------- */

  /** Paint one fish into a cell buffer. Fish are drawn far to near, so a
   *  nearer one simply overwrites; `occ` keeps trails from drawing over it. */
  function rasterize(e: Fish, order: number, buf: Uint32Array) {
    const k = scaleFor(e);
    const cx = e.x / R.cell;
    const cy = e.y / R.cell;
    const rad = (SPECIES.radius + 2) * k; // + room for a bent tail
    const i0 = Math.max(0, Math.floor(cx - rad));
    const i1 = Math.min(R.cols - 1, Math.ceil(cx + rad));
    const j0 = Math.max(0, Math.floor(cy - rad));
    const j1 = Math.min(R.rows - 1, Math.ceil(cy + rad));
    if (i0 > i1 || j0 > j1) return;

    const cs = Math.cos(e.heading) / k;
    const sn = Math.sin(e.heading) / k;
    // Far fish are dimmer: the original fades them into its dark water; over
    // a transparent canvas that's the same as lowering their alpha.
    const bright = lerp(0.38, 1, e.z);

    for (let j = j0; j <= j1; j++) {
      const dy = j + 0.5 - cy;
      for (let i = i0; i <= i1; i++) {
        const dx = i + 0.5 - cx;
        const u = dx * cs + dy * sn;
        const v = -dx * sn + dy * cs;
        if (!sampleKoi(u, v, e)) continue;
        const a = out.a * e.fade * bright;
        if (a <= 0.01) continue;
        const jit = 0.86 + 0.28 * hash2(i, j, e.seed);
        let r = out.r * jit;
        let g = out.g * jit;
        let b = out.b * jit;
        if (out.shine && hash2(i, j, e.seed ^ 77) < out.shine * 0.18) {
          r = lerp(r, 245, 0.65);
          g = lerp(g, 248, 0.65);
          b = lerp(b, 255, 0.65);
        }
        const idx = j * R.cols + i;
        const al = clamp(a * 255, 0, 255) | 0;
        buf[idx] = (al << 24) | (clamp(b, 0, 255) << 16) | (clamp(g, 0, 255) << 8) | clamp(r, 0, 255);
        if (a > 0.3) R.occ[idx] = order;
      }
    }
  }

  function emitTrail(e: Fish) {
    if (!KOI.TRAILS || e.fade < 0.5) return;
    const k = scaleFor(e);
    const [tu, tv0] = SPECIES.trail.at[0];
    const tv = tv0 + spine(tu, e);
    const c = Math.cos(e.heading);
    const s = Math.sin(e.heading);
    const i = Math.floor(e.x / R.cell + (tu * c - tv * s) * k);
    const j = Math.floor(e.y / R.cell + (tu * s + tv * c) * k);
    if (i < 0 || j < 0 || i >= R.cols || j >= R.rows) return;
    const idx = j * R.cols + i;
    if (idx === e.lastTrail) return;
    e.lastTrail = idx;
    if (Math.random() > 0.75) return;
    R.tLife[idx] = lerp(0.35, 0.9, e.z);
    R.tChar[idx] = (Math.random() * SPECIES.trail.chars.length) | 0;
  }

  function render(dt: number) {
    const W = R.cols * R.cell;
    const H = R.rows * R.cell;
    R.buf.fill(0);
    R.occ.fill(-1);

    const sorted = fish.slice().sort((a, b) => a.z - b.z);
    sorted.forEach((e, n) => {
      rasterize(e, n, R.buf);
      emitTrail(e);
    });

    // Pellets float on the surface, above the koi.
    for (const f of foods) {
      const i = Math.floor(f.x / R.cell);
      const j = Math.floor(f.y / R.cell);
      if (i < 0 || j < 0 || i >= R.cols || j >= R.rows) continue;
      const a = clamp(f.age / 0.18, 0, 1) * clamp((f.life - f.age) / 2.5, 0, 1);
      if (a <= 0.02) continue;
      const idx = j * R.cols + i;
      R.buf[idx] =
        ((clamp(a * 255, 0, 255) | 0) << 24) |
        (clamp(ink.food[2] * f.tint, 0, 255) << 16) |
        (clamp(ink.food[1] * f.tint, 0, 255) << 8) |
        clamp(ink.food[0] * f.tint, 0, 255);
      R.occ[idx] = 32000;
    }

    ctx.clearRect(0, 0, R.W, R.H);
    loCtx.putImageData(R.img!, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(lo, 0, 0, W, H);
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(grid, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    ctx.font = R.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const half = R.cell / 2 + R.line / 2;

    // Trails fade out underneath the fish.
    const tc = ink.trail;
    const chars = SPECIES.trail.chars;
    const decay = dt / SPECIES.trail.life;
    for (let idx = 0; idx < R.tLife.length; idx++) {
      const l = R.tLife[idx];
      if (l <= 0) continue;
      const nl = l - decay;
      R.tLife[idx] = nl;
      if (nl <= 0.02 || R.occ[idx] >= 0) continue;
      ctx.fillStyle = `rgba(${tc[0]},${tc[1]},${tc[2]},${(nl * 0.55).toFixed(3)})`;
      ctx.fillText(
        chars[R.tChar[idx] % chars.length],
        (idx % R.cols) * R.cell + half,
        ((idx / R.cols) | 0) * R.cell + half,
      );
    }

    for (const rp of ripples) {
      const p = clamp(rp.age / rp.dur, 0, 1);
      const radius = 0.6 + rp.maxR * (1 - Math.pow(1 - p, 2.2));
      const alpha = Math.pow(1 - p, 1.3) * 0.8;
      if (alpha <= 0.02) continue;
      const ci = rp.x / R.cell;
      const cj = rp.y / R.cell;
      const n = Math.max(8, Math.ceil(TAU * radius * 1.15));
      const seen = new Set<number>();
      ctx.fillStyle = `rgba(${rp.color[0] | 0},${rp.color[1] | 0},${rp.color[2] | 0},${alpha.toFixed(3)})`;
      for (let q = 0; q < n; q++) {
        const a = (q / n) * TAU;
        const i = Math.floor(ci + Math.cos(a) * radius);
        const j = Math.floor(cj + Math.sin(a) * radius);
        const key = i * 65536 + j;
        if (seen.has(key) || i < 0 || j < 0 || i >= R.cols || j >= R.rows) continue;
        seen.add(key);
        ctx.fillText(rp.chars[q % rp.chars.length], i * R.cell + half, j * R.cell + half);
      }
    }

    if (opts.trace) drawPaths();
  }

  function frame(now: number) {
    const dt = last ? clamp((now - last) / 1000, 0, 0.05) : 0.016;
    last = now;
    step(dt);
    render(dt);
    raf = requestAnimationFrame(frame);
  }

  return {
    resize,
    feed,
    setInk(next) {
      ink = next;
      orangeKoi.base = next.orange;
    },
    start() {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}
