import type { MorphState } from "@/lib/useScrollMorph";

/**
 * The dot field: one population of small squares that is, in turn, every
 * section's artwork.
 *
 *   01 Me       a perspective wave field receding to the horizon
 *   02 About    a slowly rotating Fibonacci-sphere globe
 *   03 Projects three rope-like currents flowing across the screen
 *   04 Skills   a three-layer parallax starfield
 *   05 Contact  the hero's wave, mirrored to the top of the screen
 *
 * Nothing is created or destroyed between states — every dot travels from where
 * it was to where it's going, on a curled arc, on its own staggered schedule.
 * That is what makes the transitions read as one fluid rather than four scenes.
 *
 * All per-dot constants are precomputed into typed arrays by `createDotField`;
 * `renderDotField` is a single tight loop over them.
 *
 * Performance is the whole design of this file: ~7,000 dots at 30fps is 200k
 * dot-updates a second, so anything hoistable out of the inner loop is hoisted.
 * See `renderDotField` for the three things that buy the most — skipping legs
 * that can't contribute, table-driven wave terms, and a sine lookup.
 */

export type DotFieldSize = { gx: number; gz: number };

/** Grid size by viewport width — ~7k dots on desktop, far fewer on phones. */
export function gridForWidth(width: number): DotFieldSize {
  if (width < 480) return { gx: 60, gz: 36 };
  if (width < 768) return { gx: 72, gz: 44 };
  return { gx: 108, gz: 66 };
}

/* ── fast trig ──────────────────────────────────────────────────────────────
   Inside the dot loop sine is called millions of times a second, and its result
   is never worth more than a fraction of a pixel: a 4096-entry table turns a
   polynomial evaluation into a memory load, and its worst-case error (~8e-4
   radians) moves a dot by well under a hundredth of a pixel.

   The mask does the wrapping for free. `& TRIG_MASK` runs the float through
   ToInt32 first, which truncates and wraps two's-complement, so negative and
   arbitrarily large phases land on the right entry with no modulo.

   Values computed once per frame — the globe's spin and radius — deliberately
   stay on Math.sin. They aren't hot, and quantizing a whole-sphere rotation
   would read as judder where per-dot quantization is invisible noise. */
const TRIG_SIZE = 4096;
const TRIG_MASK = TRIG_SIZE - 1;
const TRIG_SCALE = TRIG_SIZE / (Math.PI * 2);
const TRIG_QUARTER = TRIG_SIZE >> 2;
const SIN = new Float32Array(TRIG_SIZE);
for (let k = 0; k < TRIG_SIZE; k++) {
  SIN[k] = Math.sin((k / TRIG_SIZE) * Math.PI * 2);
}
const fsin = (x: number) => SIN[(x * TRIG_SCALE) & TRIG_MASK];
const fcos = (x: number) => SIN[(x * TRIG_SCALE + TRIG_QUARTER) & TRIG_MASK];

export interface DotField {
  gx: number;
  gz: number;
  N: number;
  /** Unit sphere positions (02) and per-dot departure timing. */
  UX: Float32Array;
  UY: Float32Array;
  UZ: Float32Array;
  /** Stagger field: neighbouring dots depart together, like a parcel of fluid. */
  ST: Float32Array;
  /** Swirl field: how much each dot's path bends mid-flight. */
  CURL: Float32Array;
  /** Stagger for the globe → streams leg, grouped by stream. */
  STQ: Float32Array;
  /**
   * Bounds of the two stagger fields. A leg whose driver hasn't passed the
   * earliest departure hasn't started for any dot; one past the latest arrival
   * is over for all of them. Both cases let the loop skip whole stages.
   */
  stMin: number;
  stMax: number;
  stqMin: number;
  stqMax: number;
  /** Stream lanes (03): baseline, amplitude, frequency, phase, speed, thickness. */
  SY: Float32Array;
  SAMP: Float32Array;
  SFR: Float32Array;
  SPH: Float32Array;
  SSP: Float32Array;
  STH: Float32Array;
  STP: Float32Array;
  LANE: Int16Array;
  OFF: Float32Array;
  FX0: Float32Array;
  DSZ: Float32Array;
  DAL: Float32Array;
  /** Starfield (04): scatter position, depth layer, twinkle, wander radius. */
  SX0: Float32Array;
  SY0: Float32Array;
  LAY: Int8Array;
  SSZ: Float32Array;
  SAL: Float32Array;
  TWS: Float32Array;
  TWP: Float32Array;
  DRA: Float32Array;
  /**
   * Wave-field terms that vary only down a column, only across a row, or only
   * along a diagonal — see the table-driven wave in `renderDotField`. The
   * static ones are filled here; the `_` scratch ones are refilled per frame.
   */
  FX: Float32Array;
  PERSP: Float32Array;
  WAMP: Float32Array;
  WSZ: Float32Array;
  WAL: Float32Array;
  _colSin: Float32Array;
  _colX: Float32Array;
  _rowSin: Float32Array;
  _rowY: Float32Array;
  _rowY2: Float32Array;
  _diagSin: Float32Array;
}

/** Number of stream lanes, bunched into 3 bands so they read as thick ropes. */
const K = 14;

export function createDotField({ gx, gz }: DotFieldSize): DotField {
  const N = gx * gz;

  const UX = new Float32Array(N);
  const UY = new Float32Array(N);
  const UZ = new Float32Array(N);
  const ST = new Float32Array(N);
  const CURL = new Float32Array(N);
  const STQ = new Float32Array(N);

  // Fibonacci sphere: the golden angle spaces the points evenly, so the globe
  // has no visible poles or seams as it turns.
  const ga = Math.PI * (3 - Math.sqrt(5));
  let stMin = Infinity;
  let stMax = -Infinity;
  for (let n = 0; n < N; n++) {
    const yy = 1 - (n / (N - 1)) * 2;
    const rr = Math.sqrt(Math.max(0, 1 - yy * yy));
    const phi = n * ga;
    UX[n] = Math.cos(phi) * rr;
    UY[n] = yy;
    UZ[n] = Math.sin(phi) * rr;
    const i0 = n % gx;
    const j0 = (n / gx) | 0;
    const st =
      0.2 +
      (Math.sin(i0 * 0.09 + j0 * 0.05) + Math.cos(j0 * 0.13 - i0 * 0.04)) * 0.08 +
      Math.random() * 0.08;
    ST[n] = st;
    if (st < stMin) stMin = st;
    if (st > stMax) stMax = st;
    CURL[n] = Math.sin(i0 * 0.07 + 1.3) * Math.cos(j0 * 0.06);
  }

  const bands = [
    0.2 + Math.random() * 0.06,
    0.46 + Math.random() * 0.06,
    0.72 + Math.random() * 0.06,
  ];
  const SY = new Float32Array(K);
  const SAMP = new Float32Array(K);
  const SFR = new Float32Array(K);
  const SPH = new Float32Array(K);
  const SSP = new Float32Array(K);
  const STH = new Float32Array(K);
  const STP = new Float32Array(K);
  /** Each stream leaves the globe as one group, staggered stream by stream. */
  const LST = new Float32Array(K);
  for (let k = 0; k < K; k++) {
    SY[k] = bands[k % bands.length] + (Math.random() - 0.5) * 0.05;
    SAMP[k] = 0.03 + Math.random() * 0.09;
    SFR[k] = 0.004 + Math.random() * 0.007;
    SPH[k] = Math.random() * 6.283;
    SSP[k] = 26 + Math.random() * 62;
    STH[k] = 8 + Math.random() * 30;
    STP[k] = 0.15 + Math.random() * 0.5;
    LST[k] = Math.random() * 0.35;
  }

  const LANE = new Int16Array(N);
  const OFF = new Float32Array(N);
  const FX0 = new Float32Array(N);
  const DSZ = new Float32Array(N);
  const DAL = new Float32Array(N);
  let stqMin = Infinity;
  let stqMax = -Infinity;
  for (let n = 0; n < N; n++) {
    const k = Math.floor(Math.random() * K);
    LANE[n] = k;
    OFF[n] = (Math.random() - 0.5) * STH[k];
    FX0[n] = Math.random();
    // Shared stream timing plus a soft sweep across the sphere patch, so a
    // whole region of the globe peels away together.
    const stq =
      LST[k] + (Math.sin(UX[n] * 1.3 + UZ[n] * 1.0) + 1) * 0.03 + Math.random() * 0.03;
    STQ[n] = stq;
    if (stq < stqMin) stqMin = stq;
    if (stq > stqMax) stqMax = stq;
    // Depth cue used by every state: bigger squares are brighter.
    const dep = Math.random();
    DSZ[n] = 1.0 + dep * 2.1;
    DAL[n] = 0.12 + dep * 0.8;
  }

  const SX0 = new Float32Array(N);
  const SY0 = new Float32Array(N);
  const LAY = new Int8Array(N);
  const SSZ = new Float32Array(N);
  const SAL = new Float32Array(N);
  const TWS = new Float32Array(N);
  const TWP = new Float32Array(N);
  const DRA = new Float32Array(N);
  for (let n = 0; n < N; n++) {
    SX0[n] = Math.random() * 1.06 - 0.03;
    SY0[n] = Math.random() * 0.92 + 0.03;
    const lay = Math.floor(Math.random() * 3);
    LAY[n] = lay;
    const d2 = (lay + Math.random()) / 3; // nearer layer = bigger + brighter
    SSZ[n] = 1.0 + d2 * 2.1;
    // ~38% of the dots fade out entirely here, for a sparser sky.
    SAL[n] = Math.random() < 0.38 ? 0 : 0.12 + d2 * 0.8;
    TWS[n] = 0.5 + Math.random();
    TWP[n] = Math.random() * 6.283;
    DRA[n] = (6 + lay * 6) * (0.6 + Math.random() * 0.8); // nearer stars wander further
  }

  // Wave-field terms that depend on the column or the row alone.
  const FX = new Float32Array(gx);
  for (let i = 0; i < gx; i++) FX[i] = i / (gx - 1) - 0.5;
  const PERSP = new Float32Array(gz);
  const WAMP = new Float32Array(gz);
  const WSZ = new Float32Array(gz);
  const WAL = new Float32Array(gz);
  for (let j = 0; j < gz; j++) {
    const fz = j / (gz - 1);
    PERSP[j] = 0.32 + fz * 0.75;
    WAMP[j] = 10 + fz * 26;
    WSZ[j] = 1.0 + fz * 2.1;
    WAL[j] = 0.12 + fz * 0.8;
  }

  return {
    gx,
    gz,
    N,
    UX,
    UY,
    UZ,
    ST,
    CURL,
    STQ,
    stMin,
    stMax,
    stqMin,
    stqMax,
    SY,
    SAMP,
    SFR,
    SPH,
    SSP,
    STH,
    STP,
    LANE,
    OFF,
    FX0,
    DSZ,
    DAL,
    SX0,
    SY0,
    LAY,
    SSZ,
    SAL,
    TWS,
    TWP,
    DRA,
    FX,
    PERSP,
    WAMP,
    WSZ,
    WAL,
    _colSin: new Float32Array(gx),
    _colX: new Float32Array(gx),
    _rowSin: new Float32Array(gz),
    _rowY: new Float32Array(gz),
    _rowY2: new Float32Array(gz),
    _diagSin: new Float32Array(gx + gz - 1),
  };
}

/**
 * One pass over every dot. The four morph legs are applied in scroll order and
 * each one folds into the running position/size/alpha, so a dot caught between
 * two states is genuinely between them rather than snapping to the later one.
 * That chaining is why this stays a single loop instead of four functions.
 *
 * Three things keep it cheap:
 *
 *  1. **Legs that can't contribute are skipped.** A leg whose driver hasn't
 *     reached the earliest dot's departure hasn't started; one that has run
 *     past the last dot's arrival lands every dot exactly on its target, which
 *     discards everything computed before it. Since the reader spends nearly
 *     all their time parked in a settled section, this is what turns four
 *     transitions' worth of arithmetic into one state's worth.
 *  2. **The wave field is table-driven.** Its three sines vary along a column,
 *     a row and a diagonal respectively, so ~350 sines per frame replace 21,000
 *     — with no approximation at all.
 *  3. **The rest of the per-dot trig goes through a lookup table** (see `fsin`).
 */
export function renderDotField(
  ctx: CanvasRenderingContext2D,
  f: DotField,
  m: MorphState,
  t: number,
  W: number,
  H: number,
  dotColor: string,
) {
  const {
    gx,
    gz,
    N,
    UX,
    UY,
    UZ,
    ST,
    CURL,
    STQ,
    SY,
    SAMP,
    SFR,
    SPH,
    SSP,
    STP,
    LANE,
    OFF,
    FX0,
    DSZ,
    DAL,
    SX0,
    SY0,
    LAY,
    SSZ,
    SAL,
    TWS,
    TWP,
    DRA,
    FX,
    PERSP,
    WAMP,
    WSZ,
    WAL,
    _colSin: CSIN,
    _colX: CX_,
    _rowSin: RSIN,
    _rowY: RY,
    _rowY2: RY2,
    _diagSin: DSIN,
  } = f;

  const { p, q, r, s, mx, my } = m;
  const bandMin = -W * 0.08;
  const bandW = W * 1.16;

  // Which legs are live this frame. `xAny` — the driver has passed the earliest
  // departure, so at least one dot has moved. `xAll` — it has passed the last
  // arrival, so every dot sits exactly on that leg's target and whatever came
  // before is discarded. A leg is dead when a later one is complete.
  const pAny = p > f.stMin;
  const pAll = p >= f.stMax + 0.55;
  const qAny = q > f.stqMin;
  const qAll = q >= f.stqMax + 0.45;
  const rAny = r > f.stMin;
  const rAll = r >= f.stMax + 0.55;
  const sAny = s > f.stMin;
  const sAll = s >= f.stMax + 0.55;

  const deadStars = sAll;
  const deadStream = rAll || deadStars;
  const deadGlobe = qAll || deadStream;
  const doWave2 = sAny;
  const doStars = rAny && !deadStars;
  const doStream = qAny && !deadStream;
  const doGlobe = pAny && !deadGlobe;
  /** The wave as leg 01's *source* — gone once every dot has left it. */
  const doWave1 = !(pAll || deadGlobe);
  /** Leg 05 aims back at the wave, so its terms outlive their use as a source. */
  const needWave = doWave1 || doWave2;

  // Globe: left of center, gently breathing, on a slow tilted spin. Once per
  // frame, so this stays on the exact trig.
  const cx = W * 0.34;
  const cy = H * 0.5;
  const R = Math.min(W, H) * 0.3 * (1 + 0.02 * Math.sin(t * 0.8));
  const rot = t * 0.12;
  const tilt = 0.38;
  const cosR = Math.cos(rot);
  const sinR = Math.sin(rot);
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);

  // — the wave field, hoisted ————————————————————————————————————————
  // Of its three sines, one varies only with the column, one only with the row
  // and one only with i+j; the perspective baseline is a row term too. Filling
  // three short tables costs ~350 sines and removes all of them from the loop.
  const halfW = W * 0.5;
  const mx34 = mx * 34;
  const my22 = my * 22;
  if (needWave) {
    for (let i = 0; i < gx; i++) {
      CSIN[i] = Math.sin(i * 0.45 + t);
      CX_[i] = FX[i] * W * 1.25;
    }
    const t115 = t * 1.15;
    for (let j = 0; j < gz; j++) {
      RSIN[j] = Math.sin(j * 0.5 + t115);
      const drop = (j / (gz - 1)) * H * 0.78;
      RY[j] = H * 0.5 + drop - my22;
      RY2[j] = H * 0.5 - drop - my22;
    }
    const t07 = t * 0.7;
    for (let d = 0, dn = gx + gz - 1; d < dn; d++) DSIN[d] = Math.sin(d * 0.3 + t07);
  }

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = dotColor;

  // globalAlpha is canvas state, and in the wave states a whole row of dots
  // shares one value — so quantize it and only write on a real change.
  let lastA = -1;
  ctx.globalAlpha = 1;

  let i = 0;
  let j = 0;
  for (let n = 0; n < N; n++) {
    let sx = 0;
    let sy = 0;
    let size = 0;
    let alpha = 0;

    // — 01 · wave field (the hero look) ————————————————————————————
    let wave = 0;
    let wx = 0;
    let wsize = 0;
    let walpha = 0;
    if (needWave) {
      wave = (CSIN[i] + RSIN[j] + DSIN[i + j]) * WAMP[j];
      wx = halfW + PERSP[j] * (CX_[i] - mx34);
      wsize = WSZ[j];
      walpha = WAL[j];
    }

    if (doGlobe) {
      // — 02 · globe (rotate around Y, tilt around X, project) ——————————
      const ux = UX[n];
      const uy = UY[n];
      const uz = UZ[n];
      const x1 = ux * cosR + uz * sinR;
      const z1 = -ux * sinR + uz * cosR;
      const y2 = uy * cosT - z1 * sinT;
      const z2 = uy * sinT + z1 * cosT;
      // Living surface: the shell ripples so the sphere never looks frozen.
      const rip = 1 + 0.05 * fsin(t * 0.9 + n * 0.15) + 0.03 * fsin(t * 1.7 + n * 0.05);
      const gsx = cx + x1 * R * rip + mx * 18;
      const gsy = cy - y2 * R * rip + my * 18;
      const gsize = 1.0 + (z2 + 1) * 1.05;
      const galpha = 0.12 + (z2 + 1) * 0.4;

      if (!doWave1) {
        // Every dot has arrived: the flight's curl and flutter have decayed to
        // nothing and only the settled drift is left.
        sx = gsx + fsin(t * 0.8 + i * 0.05 + j * 0.07) * 2.2;
        sy = gsy + fcos(t * 0.7 + i * 0.06 + j * 0.04) * 2.2;
        size = gsize;
        alpha = galpha;
      } else {
        // Per-dot eased progress: smoothstep over the coherent stagger field.
        let pe = (p - ST[n]) / 0.55;
        pe = pe < 0 ? 0 : pe > 1 ? 1 : pe;
        if (pe <= 0) {
          sx = wx;
          sy = RY[j] + wave;
          size = wsize;
          alpha = walpha;
        } else {
          pe = pe * pe * (3 - 2 * pe);
          const flux = pe * (1 - pe);
          const drift = pe * 2.2;
          const wy = RY[j] + wave;

          // Arc the flight: bend perpendicular to the direction of travel,
          // peaking at the halfway point.
          const dxg = gsx - wx;
          const dyg = gsy - wy;
          const invg = 1 / Math.sqrt(dxg * dxg + dyg * dyg + 1);
          const curl = CURL[n] * 110 * fsin(pe * Math.PI);
          sx =
            wx +
            dxg * pe -
            dyg * invg * curl +
            fsin(t * 1.5 + i * 0.16 + j * 0.11) * 14 * flux +
            fsin(t * 0.8 + i * 0.05 + j * 0.07) * drift;
          sy =
            wy +
            dyg * pe +
            dxg * invg * curl +
            fcos(t * 1.3 + i * 0.12 + j * 0.17) * 14 * flux +
            fcos(t * 0.7 + i * 0.06 + j * 0.04) * drift;
          size = wsize + (gsize - wsize) * pe;
          alpha = walpha + (galpha - walpha) * pe;
        }
      }
    } else if (doWave1) {
      sx = wx;
      sy = RY[j] + wave;
      size = wsize;
      alpha = walpha;
    }

    // — 03 · globe → currents ————————————————————————————————————
    if (doStream) {
      let qe = (q - STQ[n]) / 0.45;
      qe = qe < 0 ? 0 : qe > 1 ? 1 : qe;
      qe = qe * qe * (3 - 2 * qe);
      if (qe > 0.001) {
        const k = LANE[n];
        let fxp = FX0[n] * bandW + t * SSP[k] * qe;
        fxp = ((fxp % bandW) + bandW) % bandW + bandMin;
        const cyL =
          SY[k] * H +
          fsin(fxp * SFR[k] + t * STP[k] + SPH[k]) * SAMP[k] * H +
          fsin(fxp * SFR[k] * 0.35 + t * 0.18 + SPH[k]) * SAMP[k] * H * 0.5;
        const fyp = cyL + OFF[n] + fsin(t * 1.3 + n * 0.7) * 1.8 + my * 14;
        if (qe >= 1) {
          sx = fxp;
          sy = fyp;
          size = DSZ[n];
          alpha = DAL[n];
        } else {
          const dxc = fxp - sx;
          const dyc = fyp - sy;
          const invc = 1 / Math.sqrt(dxc * dxc + dyc * dyc + 1);
          // Head straight for the lane — just a whisper of curl so it stays organic.
          const curlq = CURL[n] * 36 * fsin(qe * Math.PI);
          const fluxq = qe * (1 - qe);
          sx = sx + dxc * qe - dyc * invc * curlq + fsin(t * 1.4 + i * 0.14 + j * 0.1) * 5 * fluxq;
          sy = sy + dyc * qe + dxc * invc * curlq + fcos(t * 1.2 + i * 0.1 + j * 0.15) * 5 * fluxq;
          size = size + (DSZ[n] - size) * qe;
          alpha = alpha + (DAL[n] - alpha) * qe;
        }
      }
    }

    // — 04 · currents → starfield ————————————————————————————————
    if (doStars) {
      let re = (r - ST[n]) / 0.55;
      re = re < 0 ? 0 : re > 1 ? 1 : re;
      re = re * re * (3 - 2 * re);
      if (re > 0.001) {
        const lay = LAY[n];
        const dra = DRA[n];
        const twp = TWP[n];
        const tws = TWS[n];
        // Slow fluid wander: layered sine orbits, so no star ever stands still.
        const px2 =
          SX0[n] * W +
          mx * (7 + lay * 11) +
          fsin(t * 0.45 * tws + twp) * dra +
          fsin(t * 0.22 + twp * 1.7) * dra * 0.5;
        const py2 =
          SY0[n] * H +
          my * (5 + lay * 8) +
          fcos(t * 0.36 * tws + twp * 1.3) * dra * 0.8 +
          fcos(t * 0.18 + twp * 2.1) * dra * 0.4;
        const tw = 0.72 + 0.28 * fsin(t * tws + twp);
        if (re >= 1) {
          sx = px2;
          sy = py2;
          size = SSZ[n];
          alpha = SAL[n] * tw;
        } else {
          const dxs = px2 - sx;
          const dys = py2 - sy;
          const invs = 1 / Math.sqrt(dxs * dxs + dys * dys + 1);
          const curlr = CURL[n] * 120 * fsin(re * Math.PI);
          const fluxr = re * (1 - re);
          sx = sx + dxs * re - dys * invs * curlr + fsin(t * 1.3 + i * 0.13 + j * 0.09) * 10 * fluxr;
          sy = sy + dys * re + dxs * invs * curlr + fcos(t * 1.1 + i * 0.09 + j * 0.14) * 10 * fluxr;
          size = size + (SSZ[n] - size) * re;
          alpha = alpha + (SAL[n] * tw - alpha) * re;
        }
      }
    }

    // — 05 · starfield → top wave (01's field, mirrored upward) ——————
    if (doWave2) {
      let se = (s - ST[n]) / 0.55;
      se = se < 0 ? 0 : se > 1 ? 1 : se;
      se = se * se * (3 - 2 * se);
      if (se > 0.001) {
        const wy2 = RY2[j] + wave;
        if (se >= 1) {
          sx = wx;
          sy = wy2;
          size = wsize;
          alpha = walpha;
        } else {
          const dxw = wx - sx;
          const dyw = wy2 - sy;
          const invw = 1 / Math.sqrt(dxw * dxw + dyw * dyw + 1);
          const curls = CURL[n] * 110 * fsin(se * Math.PI);
          const fluxs = se * (1 - se);
          sx = sx + dxw * se - dyw * invw * curls + fsin(t * 1.5 + i * 0.16 + j * 0.11) * 14 * fluxs;
          sy = sy + dyw * se + dxw * invw * curls + fcos(t * 1.3 + i * 0.12 + j * 0.17) * 14 * fluxs;
          size = size + (wsize - size) * se;
          alpha = alpha + (walpha - alpha) * se;
        }
      }
    }

    // Advance the column/row cursor — cheaper than a modulo and a divide, and
    // this is the last use of i/j for the dot.
    if (++i === gx) {
      i = 0;
      j++;
    }

    // Nothing to see: fully-faded dots (the starfield blanks ~38% of them) and
    // anything the wave has thrown past the viewport.
    if (alpha < 0.004) continue;
    if (sx < -4 || sy < -4 || sx > W || sy > H) continue;
    let a = (alpha * 255) | 0;
    if (a > 255) a = 255;
    if (a !== lastA) {
      lastA = a;
      ctx.globalAlpha = a / 255;
    }
    ctx.fillRect(sx, sy, size, size);
  }
  ctx.globalAlpha = 1;
}
