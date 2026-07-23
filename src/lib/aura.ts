import type { MorphState } from "@/lib/useScrollMorph";
import type { ResolvedColor } from "@/lib/themeColors";

/**
 * The soft cloud layer: a handful of huge radial gradients drifting on sine
 * paths over a flat base. It's rendered into a buffer ~1/3 of the viewport and
 * stretched back up by CSS — at that resolution the upscale *is* the blur, for
 * a fraction of the fill cost of a real one.
 */

/** Blob radii as a fraction of the larger viewport axis, back-to-front. */
const BLOB_RADII = [0.62, 0.64, 0.5, 0.55, 0.46];

export const AURA_BLOB_COUNT = BLOB_RADII.length;

/**
 * Steps the fade is quantized to before a gradient is rebuilt. A gradient is a
 * shader the canvas has to compile; the clouds are 0.62 viewports across and
 * pure haze, so nobody can see 1/48th of an alpha step.
 */
const FADE_STEPS = 48;

/** Per-blob drift: phase offset plus its own horizontal/vertical periods. */
export type AuraDrift = { rad: number; ph: number; ax: number; ay: number };

/**
 * The cloud layer's whole state: the drift paths, generated once so a theme
 * switch recolors the clouds without teleporting them, plus the gradient cache
 * and enough of the last frame to know when nothing needs repainting.
 */
export type Aura = {
  drift: AuraDrift[];
  grad: (CanvasGradient | null)[];
  step: number;
  w: number;
  h: number;
  base: string;
  blobs: ResolvedColor[] | null;
  /** True once a frame has been painted with no clouds left on it. */
  blank: boolean;
};

export function createAura(): Aura {
  return {
    drift: BLOB_RADII.map((rad, i) => ({
      rad,
      ph: i * 1.7,
      ax: 0.4 + Math.random() * 0.5,
      ay: 0.4 + Math.random() * 0.5,
    })),
    grad: BLOB_RADII.map(() => null),
    step: -1,
    w: 0,
    h: 0,
    base: "",
    blobs: null,
    blank: false,
  };
}

export function renderAura(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  aura: Aura,
  base: string,
  blobs: ResolvedColor[],
  m: MorphState,
  t: number,
) {
  // Clouds fill the hero, thin out as the globe forms, and roll back in for
  // Contact — so the site opens and closes on the same weather.
  const fade = Math.max(1 - Math.min(1, m.p), Math.min(1, m.s));

  // Gone for the middle of the site. Once the base has been laid down over the
  // last of them there is nothing left to repaint until they return.
  if (fade <= 0.01) {
    if (aura.blank && aura.base === base && aura.w === W && aura.h === H) return;
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);
    aura.blank = true;
    aura.base = base;
    aura.w = W;
    aura.h = H;
    return;
  }
  aura.blank = false;

  // Gradients are built at the origin and moved into place by the transform, so
  // they survive the blobs drifting; only a real change in size, palette or
  // fade step costs a rebuild. Parked in the hero, that's zero per frame.
  const step = Math.round(fade * FADE_STEPS);
  if (aura.step !== step || aura.w !== W || aura.h !== H || aura.blobs !== blobs) {
    const alpha = ((0.85 * step) / FADE_STEPS).toFixed(3);
    const span = Math.max(W, H) * 0.9;
    for (let i = 0; i < aura.drift.length; i++) {
      const c = blobs[i % blobs.length];
      const rad = aura.drift[i].rad * span;
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
      g.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${alpha})`);
      g.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
      aura.grad[i] = g;
    }
    aura.step = step;
    aura.w = W;
    aura.h = H;
    aura.blobs = blobs;
  }
  aura.base = base;

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  const span = Math.max(W, H) * 0.9;
  for (let i = 0; i < aura.drift.length; i++) {
    const b = aura.drift[i];
    const cx = W * (0.5 + Math.sin(t * b.ax + b.ph) * 0.34) + m.mx * 16 * (i % 2 ? 1 : -1);
    const cy = H * (0.5 + Math.cos(t * b.ay + b.ph) * 0.36) + m.my * 12;
    const rad = b.rad * span;
    ctx.setTransform(1, 0, 0, 1, cx, cy);
    ctx.fillStyle = aura.grad[i] as CanvasGradient;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, 7);
    ctx.fill();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
