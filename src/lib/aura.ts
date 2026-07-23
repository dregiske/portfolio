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

/** Per-blob drift: phase offset plus its own horizontal/vertical periods. */
export type AuraDrift = { rad: number; ph: number; ax: number; ay: number };

/**
 * Randomized drift paths, generated once per mount. Kept separate from the
 * colors so a theme switch recolors the clouds without teleporting them.
 */
export function createAuraDrift(): AuraDrift[] {
  return BLOB_RADII.map((rad, i) => ({
    rad,
    ph: i * 1.7,
    ax: 0.4 + Math.random() * 0.5,
    ay: 0.4 + Math.random() * 0.5,
  }));
}

export function renderAura(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  drift: AuraDrift[],
  base: string,
  blobs: ResolvedColor[],
  m: MorphState,
  t: number,
) {
  // Clouds fill the hero, thin out as the globe forms, and roll back in for
  // Contact — so the site opens and closes on the same weather.
  const fade = Math.max(1 - Math.min(1, m.p), Math.min(1, m.s));

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);
  if (fade <= 0.01) return;

  drift.forEach((b, i) => {
    const color = blobs[i % blobs.length];
    const cx = W * (0.5 + Math.sin(t * b.ax + b.ph) * 0.34) + m.mx * 16 * (i % 2 ? 1 : -1);
    const cy = H * (0.5 + Math.cos(t * b.ay + b.ph) * 0.36) + m.my * 12;
    const rad = b.rad * Math.max(W, H) * 0.9;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${(0.85 * fade).toFixed(3)})`);
    g.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, 7);
    ctx.fill();
  });
}
