import { useEffect, useRef } from "react";
import type { ScrollMorph } from "@/lib/useScrollMorph";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { watchThemeColors, type ResolvedColor } from "@/lib/themeColors";
import { createAura, renderAura, AURA_BLOB_COUNT } from "@/lib/aura";

const AURA_TOKENS = [
  "--aura-base",
  "--aura-blob-1",
  "--aura-blob-2",
  "--aura-blob-3",
  "--aura-blob-4",
  "--aura-blob-5",
] as const;

type AuraToken = (typeof AURA_TOKENS)[number];

/** Buffer scale for the aura. Low resolution is the point: it *is* the blur. */
const AURA_SCALE = 0.35;
/**
 * Redraw budget. The clouds drift slowly enough that ~30fps is
 * indistinguishable from the display's full rate, and per pixel they are the
 * most expensive thing on the page.
 */
const AURA_FRAME_MS = 33;
/**
 * Clock speed, in animation units per millisecond, matching the cadence the
 * clouds were tuned at (one step per 30fps frame).
 */
const AURA_RATE = 0.012 / 33.3;
/** Longest step the clock will take at once, so returning to a backgrounded
 *  tab resumes rather than teleporting. */
const MAX_STEP_MS = 100;

/**
 * The bottom layer of the site background: soft clouds drifting over a flat
 * base. They fill the hero, clear out for the middle of the page, and roll back
 * in for Contact — see `renderAura` for the fade.
 */
export function AuraLayer({ morph }: { morph: ScrollMorph }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = morph.state;

    let base = "#0a0a0a";
    let blobs: ResolvedColor[] = [];

    const aura = createAura();

    // Assigning to canvas.width reallocates the backing store and clears it,
    // whether or not the number changed — and mobile browsers fire `resize`
    // continuously while the URL bar slides away. Only act on a real change.
    let lastW = 0;
    let lastH = 0;
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      canvas.width = Math.max(1, Math.round(w * AURA_SCALE));
      canvas.height = Math.max(1, Math.round(h * AURA_SCALE));
    };
    resize();

    let t = 0;
    const draw = (dt: number) => {
      t += AURA_RATE * dt;
      renderAura(ctx, canvas.width, canvas.height, aura, base, blobs, state, t);
    };
    /** Clock held still — for the reduced-motion path. */
    const drawStill = () => draw(0);

    // Colors live in CSS tokens so both themes share one vocabulary; the probe
    // resolves them to numbers the canvas can use, and re-resolves on toggle.
    const stopWatching = watchThemeColors(AURA_TOKENS, (colors) => {
      base = colors["--aura-base"].css;
      blobs = Array.from(
        { length: AURA_BLOB_COUNT },
        (_, i) => colors[`--aura-blob-${i + 1}` as AuraToken],
      );
      if (reduced) drawStill();
    });

    drawStill();

    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = now - last;
      if (dt >= AURA_FRAME_MS) {
        last = now;
        draw(Math.min(dt, MAX_STEP_MS));
      }
    };

    // Reduced motion: no loop and no clock — repaint a correct still frame
    // whenever the reader's scroll position (and so the morph state) changes.
    let unsubscribe: (() => void) | undefined;
    if (reduced) {
      unsubscribe = morph.subscribe(drawStill);
    } else {
      raf = requestAnimationFrame(tick);
    }

    const onResize = () => {
      resize();
      if (reduced) drawStill();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      unsubscribe?.();
      window.removeEventListener("resize", onResize);
      stopWatching();
    };
  }, [morph, reduced]);

  return (
    <canvas
      ref={canvasRef}
      className="site-bg site-bg--aura"
      aria-hidden="true"
    />
  );
}
