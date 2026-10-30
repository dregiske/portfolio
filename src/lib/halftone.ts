import type { MorphState } from "@/lib/useScrollMorph";
import type { ResolvedColor } from "@/lib/themeColors";

/**
 * The halftone layer: a fixed grid of round dots whose size follows a slow,
 * blobby noise field — dense patches, wide empty water between them.
 *
 * Every dot is printed three times, once per ink, each copy nudged vertically
 * (ink 1 above, ink 2 centred, ink 3 below). The copies are *added*, so where
 * they overlap they burn to white: big dots get white cores with colored
 * fringes, mid-sized ones read as plus/diamond shapes, small ones as specks.
 *
 * The work is split by what each side is good at:
 *
 *   CPU  one noise sample per *cell* (~7k on desktop) → a tiny density texture
 *   GPU  per pixel: look up its cell and the cells above/below, draw the dots
 *
 * Sampling noise per pixel in the shader would repeat the same answer a few
 * hundred times per cell; doing it once per cell keeps the CPU side well under
 * a millisecond and the shader down to three texture reads.
 *
 * The grid is pinned to the screen and the *image* moves under it — drifting
 * with time, sliding with scroll, swelling under the cursor — the way a real
 * halftone screen sits over a moving picture.
 */

export const HALFTONE = {
  /**
   * Grid pitch in CSS px: `CELL_MIN` on a viewport `CELL_MIN_AT` wide or
   * narrower, rising evenly to `CELL_MAX` at `CELL_MAX_AT` and up. Fluid
   * rather than one size per layout, so resizing the window grows the dots
   * instead of reshuffling the whole pattern at a breakpoint.
   */
  CELL_MIN: 11,
  CELL_MAX: 14,
  CELL_MIN_AT: 375,
  CELL_MAX_AT: 1100,
  /**
   * Dot radius at full density, as a fraction of the cell. 0.5 is neighbours
   * touching; the shader only looks one cell up and down, so going past it
   * would square off the dots' left and right edges. Kept below it so even
   * full dots stay separate — solid runs of touching dots burn to a white wall.
   */
  MAX_R: 0.4,
  /**
   * Vertical offset between consecutive inks, as a fraction of the cell. Wide
   * enough that each ink shows as its own fringe around the white overlap,
   * narrow enough that a column of dots doesn't smear into a vertical stripe.
   */
  CHANNEL_OFFSET: 0.14,
  /** Noise frequency per CSS px — lower means bigger blobs. */
  FREQ: 0.0035,
  /**
   * Noise below `LOW` prints nothing; `HIGH` and above prints full dots. These
   * leave ~60% of cells empty and ~6% at full size — mostly black, with
   * bright clusters, like the reference.
   */
  LOW: 0.52,
  HIGH: 0.85,
  /** How fast the field drifts, in noise units per second. */
  DRIFT: 0.05,
  /** How far the image under the grid slides per px of page scroll. */
  SCROLL_PARALLAX: 0.3,
  /** Cursor swell: radius in CSS px, and the density it adds at its centre. */
  POINTER_RADIUS: 220,
  POINTER_BOOST: 0.45,
  /**
   * The glitch: rows are grouped into bands of `GLITCH_BAND`, and on each of
   * `GLITCH_HZ` steps a second, each band has a `GLITCH` chance of tearing
   * sideways by up to `GLITCH_SHIFT` cells. 0 turns it off.
   */
  GLITCH: 0.035,
  GLITCH_HZ: 3,
  GLITCH_BAND: 3,
  GLITCH_SHIFT: 4,
  /** Backing-store resolution cap. Round dots want more than DPR 1, but DPR 3
   *  would be 9× the fill for nothing anyone can see. */
  MAX_DPR: 1.5,
  /**
   * Quiet zones — blocks of text the screen makes room for (see
   * `HalftoneFrame.quiet`). Inside one, dots shrink to `QUIET_FLOOR` of their
   * size, which leaves only specks too small to draw; they grow back to full
   * over `QUIET_FALLOFF` px past its edge. `QUIET_PAD` widens each zone beyond
   * the text's own box, so the clearing reaches past the outermost letters.
   */
  QUIET_PAD: 12,
  QUIET_FALLOFF: 72,
  QUIET_FLOOR: 0.08,
  /** Most quiet zones a frame will honour. */
  QUIET_MAX: 8,
} as const;

/** Everything a frame needs besides the shared morph state. */
export type HalftoneFrame = {
  /** Field clock, seconds. */
  t: number;
  /** Page scroll, CSS px. */
  scrollY: number;
  /** Cursor swell strength, 0..1 — 0 when there is no mouse over the page. */
  pointer: number;
  /** Whether rows may tear. Off under reduced motion. */
  glitch: boolean;
  /**
   * Quiet zones in viewport CSS px, already padded, four numbers apiece —
   * left, top, right, bottom — for the first `quietCount` of them.
   */
  quiet: Float32Array;
  quietCount: number;
};

export type Halftone = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  texture: WebGLTexture;
  u: {
    grid: WebGLUniformLocation | null;
    viewport: WebGLUniformLocation | null;
    dpr: WebGLUniformLocation | null;
    cell: WebGLUniformLocation | null;
    maxR: WebGLUniformLocation | null;
    offset: WebGLUniformLocation | null;
    ink: WebGLUniformLocation | null;
    overlap: WebGLUniformLocation | null;
  };
  /** Viewport, CSS px. */
  w: number;
  h: number;
  dpr: number;
  cell: number;
  cols: number;
  /** Includes one padding row above and one below the screen. */
  rows: number;
  /** Density per cell, row-major, 0..255. */
  data: Uint8Array;
  inks: Float32Array;
};

/* ── noise ──────────────────────────────────────────────────────────────────
   Value noise: a random value on every integer lattice point, smoothly
   interpolated between them. Cheaper than simplex and, at this frequency and
   two octaves, indistinguishable from it once it's been printed as dots. */

function hash(x: number, y: number): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function vnoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

/* ── shaders ──────────────────────────────────────────────────────────────── */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// Works in CSS px with a top-left origin so it agrees with the CPU side. highp
// where available: mediump can't resolve a pixel position past ~1000px.
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D uDensity;
uniform vec2 uGrid;
uniform vec2 uViewport;
uniform float uDpr;
uniform float uCell;
uniform float uMaxR;
uniform float uOffset;
uniform vec3 uInk[3];
uniform vec3 uOverlap;

void main() {
  vec2 p = vec2(gl_FragCoord.x, uViewport.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 ci = floor(p / uCell);
  // Edge softness: about one device pixel.
  float aa = 0.8 / uDpr;
  vec3 col = vec3(0.0);

  // The inks sit above and below their cell's centre, so a pixel can be
  // covered by the dots of the cells above and below it as well as its own.
  for (int dy = -1; dy <= 1; dy++) {
    vec2 c = ci + vec2(0.0, float(dy));
    // Texture row 0 is the padding row above the screen.
    float r = texture2D(uDensity, (c + vec2(0.5, 1.5)) / uGrid).r * uMaxR * uCell;
    if (r < 0.25) continue;
    vec2 centre = (c + 0.5) * uCell;
    for (int k = 0; k < 3; k++) {
      vec2 o = vec2(0.0, (float(k) - 1.0) * uOffset * uCell);
      float d = length(p - centre - o);
      col += uInk[k] * clamp((r - d) / aa + 0.5, 0.0, 1.0);
    }
  }

  // Premultiplied: the gaps stay transparent so the aura shows through.
  col = min(col, vec3(1.0));
  // The share all three inks have in common is the white; re-tint just that
  // part toward the overlap color. A lone ink barely changes, a full overlap
  // becomes exactly uOverlap.
  float w = min(col.r, min(col.g, col.b));
  col += w * (uOverlap - 1.0);
  gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
}
`;

/** A context whose shaders have been handed to the driver but may not have
 *  finished compiling yet. */
export type PendingHalftone = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  vs: WebGLShader;
  fs: WebGLShader;
  parallel: KHR_parallel_shader_compile | null;
};

function shader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

/**
 * Get a WebGL context on `canvas` and start compiling the shaders. Returns
 * null when WebGL isn't available — the caller then simply draws nothing, and
 * the layers beneath show alone.
 *
 * Nothing here asks how the compile went: the first status query blocks the
 * main thread until the driver is done, which on a phone is long enough to
 * hold up the page's first paint. Wait for `isHalftoneReady`, then call
 * `finishHalftone`.
 */
export function createHalftone(
  canvas: HTMLCanvasElement,
): PendingHalftone | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  // Lets the driver compile off the main thread, and lets us ask whether it's
  // done without waiting for it.
  const parallel = gl.getExtension("KHR_parallel_shader_compile");

  const vs = shader(gl, gl.VERTEX_SHADER, VERT);
  const fs = shader(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  return { gl, program, vs, fs, parallel };
}

/**
 * Whether `finishHalftone` can run without stalling. Without the parallel
 * compile extension there's no way to ask, so it's always "ready" and the
 * stall happens there instead — the same as it always did.
 */
export function isHalftoneReady(p: PendingHalftone): boolean {
  if (p.gl.isContextLost()) return false;
  if (!p.parallel) return true;
  return p.gl.getProgramParameter(p.program, p.parallel.COMPLETION_STATUS_KHR) === true;
}

/** Throw away a context that never finished setting up. */
export function discardHalftone(p: PendingHalftone) {
  const { gl } = p;
  if (gl.isContextLost()) return;
  gl.deleteShader(p.vs);
  gl.deleteShader(p.fs);
  gl.deleteProgram(p.program);
}

/**
 * Check the compiled program and build the rest of the pipeline on it.
 * Returns null if the shaders failed, after logging why.
 */
export function finishHalftone(p: PendingHalftone): Halftone | null {
  const { gl, program, vs, fs } = p;
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    for (const s of [vs, fs]) {
      const log = gl.getShaderInfoLog(s);
      if (log) console.warn("halftone shader:", log);
    }
    console.warn("halftone program:", gl.getProgramInfoLog(program));
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!linked) {
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);

  // One triangle that covers the whole screen.
  const buffer = gl.createBuffer();
  if (!buffer) return null;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Nearest + clamp: one texel is one cell, and non-power-of-two sizes are
  // only legal in WebGL 1 without mipmaps or wrapping.
  const texture = gl.createTexture();
  if (!texture) return null;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // Rows are `cols` bytes wide, which is rarely a multiple of 4.
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  const loc = (name: string) => gl.getUniformLocation(program, name);
  gl.uniform1i(loc("uDensity"), 0);

  return {
    gl,
    program,
    buffer,
    texture,
    u: {
      grid: loc("uGrid"),
      viewport: loc("uViewport"),
      dpr: loc("uDpr"),
      cell: loc("uCell"),
      maxR: loc("uMaxR"),
      offset: loc("uOffset"),
      ink: loc("uInk"),
      overlap: loc("uOverlap"),
    },
    w: 0,
    h: 0,
    dpr: 1,
    cell: HALFTONE.CELL_MAX,
    cols: 0,
    rows: 0,
    data: new Uint8Array(0),
    inks: new Float32Array(9),
  };
}

/** Size the backing store and the cell grid to a viewport of `w`×`h` CSS px. */
export function resizeHalftone(
  ht: Halftone,
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  dpr: number,
) {
  const { gl, u } = ht;
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  gl.viewport(0, 0, canvas.width, canvas.height);

  ht.w = w;
  ht.h = h;
  ht.dpr = dpr;
  const { CELL_MIN, CELL_MAX, CELL_MIN_AT, CELL_MAX_AT } = HALFTONE;
  const k = Math.min(1, Math.max(0, (w - CELL_MIN_AT) / (CELL_MAX_AT - CELL_MIN_AT)));
  ht.cell = CELL_MIN + (CELL_MAX - CELL_MIN) * k;
  ht.cols = Math.ceil(w / ht.cell);
  ht.rows = Math.ceil(h / ht.cell) + 2;
  ht.data = new Uint8Array(ht.cols * ht.rows);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.LUMINANCE,
    ht.cols,
    ht.rows,
    0,
    gl.LUMINANCE,
    gl.UNSIGNED_BYTE,
    ht.data,
  );

  gl.uniform2f(u.grid, ht.cols, ht.rows);
  gl.uniform2f(u.viewport, w, h);
  gl.uniform1f(u.dpr, dpr);
  gl.uniform1f(u.cell, ht.cell);
  gl.uniform1f(u.maxR, HALFTONE.MAX_R);
  gl.uniform1f(u.offset, HALFTONE.CHANNEL_OFFSET);
}

/**
 * Point the three inks, and the color their full overlap resolves to, at new
 * colors (e.g. after a token change).
 */
export function setHalftoneInks(
  ht: Halftone,
  inks: readonly ResolvedColor[],
  overlap: ResolvedColor,
) {
  for (let k = 0; k < 3; k++) {
    const c = inks[k];
    ht.inks[k * 3] = c ? c.r / 255 : 0;
    ht.inks[k * 3 + 1] = c ? c.g / 255 : 0;
    ht.inks[k * 3 + 2] = c ? c.b / 255 : 0;
  }
  ht.gl.uniform3fv(ht.u.ink, ht.inks);
  ht.gl.uniform3f(
    ht.u.overlap,
    overlap.r / 255,
    overlap.g / 255,
    overlap.b / 255,
  );
}

const smoothstep = (lo: number, hi: number, x: number) => {
  const t = x <= lo ? 0 : x >= hi ? 1 : (x - lo) / (hi - lo);
  return t * t * (3 - 2 * t);
};

export function renderHalftone(ht: Halftone, m: MorphState, f: HalftoneFrame) {
  const { gl, cols, rows, cell, data } = ht;
  const {
    FREQ, LOW, HIGH, DRIFT, SCROLL_PARALLAX, POINTER_RADIUS, POINTER_BOOST,
    GLITCH, GLITCH_HZ, GLITCH_BAND, GLITCH_SHIFT,
  } = HALFTONE;

  // Two octaves drifting in different directions, so the blobs change shape
  // as they travel instead of sliding past as rigid stamps.
  const ax = f.t * DRIFT;
  const ay = f.t * DRIFT * 0.6;
  const bx = -f.t * DRIFT * 1.3 + 31.7;
  const by = f.t * DRIFT * 0.9 + 11.3;
  const sy = f.scrollY * SCROLL_PARALLAX;

  const px = (0.5 + 0.5 * m.mx) * ht.w;
  const py = (0.5 + 0.5 * m.my) * ht.h;
  const r2 = POINTER_RADIUS * POINTER_RADIUS;
  const boost = POINTER_BOOST * f.pointer;

  const tearing = f.glitch && GLITCH > 0;
  const step = Math.floor(f.t * GLITCH_HZ);

  const { QUIET_FALLOFF: fall, QUIET_FLOOR: floor } = HALFTONE;
  const q = f.quiet;

  for (let j = 0; j < rows; j++) {
    // Row 0 is the padding row above the screen.
    const cy = (j - 0.5) * cell;
    let shift = 0;
    if (tearing) {
      const band = Math.floor((j - 1) / GLITCH_BAND);
      if (hash(band, step) < GLITCH) {
        shift = Math.round((hash(band + 7919, step) * 2 - 1) * GLITCH_SHIFT) * cell;
      }
    }
    const ny = (cy + sy) * FREQ;
    const dyp = cy - py;
    const row = j * cols;

    // Which quiet zones reach this row at all: a bitmask, so the cell loop
    // below does nothing extra on the (usual) rows no text is near.
    let near = 0;
    for (let k = 0; k < f.quietCount; k++) {
      if (cy > q[k * 4 + 1] - fall && cy < q[k * 4 + 3] + fall) near |= 1 << k;
    }

    for (let i = 0; i < cols; i++) {
      const cx = (i + 0.5) * cell;
      const nx = (cx + shift) * FREQ;
      const v =
        0.65 * vnoise(nx + ax, ny + ay) +
        0.35 * vnoise(nx * 2.03 + bx, ny * 2.03 + by);
      let d = smoothstep(LOW, HIGH, v);
      if (boost > 0) {
        const dx = cx - px;
        const qd = (dx * dx + dyp * dyp) / r2;
        if (qd < 1) d += boost * (1 - qd) * (1 - qd);
      }
      // Make room for text: scale the dot by how far the cell is from the
      // nearest quiet zone — `floor` inside it, easing back to 1 at `fall`.
      // After the cursor swell, so hovering can't refill the clearing.
      if (near !== 0 && d > 0) {
        let keep = 1;
        for (let k = 0; k < f.quietCount; k++) {
          if ((near & (1 << k)) === 0) continue;
          const o = k * 4;
          const ex = Math.max(q[o] - cx, 0, cx - q[o + 2]);
          const ey = Math.max(q[o + 1] - cy, 0, cy - q[o + 3]);
          const dist2 = ex * ex + ey * ey;
          if (dist2 >= fall * fall) continue;
          const s = smoothstep(0, fall, Math.sqrt(dist2));
          const z = floor + (1 - floor) * s;
          if (z < keep) keep = z;
        }
        d *= keep;
      }
      data[row + i] = d >= 1 ? 255 : (d * 255) | 0;
    }
  }

  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,
    0,
    0,
    cols,
    rows,
    gl.LUMINANCE,
    gl.UNSIGNED_BYTE,
    data,
  );
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/** Release the GPU resources. The canvas itself is the caller's. */
export function destroyHalftone(ht: Halftone) {
  const { gl } = ht;
  gl.deleteTexture(ht.texture);
  gl.deleteBuffer(ht.buffer);
  gl.deleteProgram(ht.program);
}
