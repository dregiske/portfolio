import { useEffect, useRef } from "react";
import type { ScrollMorph } from "@/lib/useScrollMorph";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { watchThemeColors, type ResolvedColor } from "@/lib/themeColors";
import { createAura, renderAura, AURA_BLOB_COUNT } from "@/lib/aura";
import {
  createDotField,
  gridForWidth,
  renderDotField,
  type DotField,
} from "@/lib/dotField";
import "./SiteBackground.css";

const AURA_TOKENS = [
  "--aura-base",
  "--aura-blob-1",
  "--aura-blob-2",
  "--aura-blob-3",
  "--aura-blob-4",
  "--aura-blob-5",
  "--dot-color",
] as const;

type AuraToken = (typeof AURA_TOKENS)[number];

/** Buffer scale for the aura. Low resolution is the point: it *is* the blur. */
const AURA_SCALE = 0.35;
/**
 * Redraw budgets. The dots carry all the motion you actually track, and against
 * a page scrolling at the display's full rate a 30fps field reads as stepping
 * rather than flowing — so they get every frame the browser offers. The clouds
 * drift slowly enough that half that rate is indistinguishable, and they are
 * the more expensive of the two per pixel.
 */
const DOTS_FRAME_MS = 0;
const AURA_FRAME_MS = 33;
/**
 * Clock speed, in animation units per millisecond, matching the cadence the
 * field was tuned at (one step per 30fps frame). Advancing per *frame* instead
 * would make the artwork run at whatever rate the display happens to have.
 */
const DOTS_RATE = 0.024 / 33.3;
const AURA_RATE = 0.012 / 33.3;
/** Longest step the clocks will take at once, so returning to a backgrounded
 *  tab resumes rather than teleporting. */
const MAX_STEP_MS = 100;

/**
 * The whole site's background, in one fixed pair of canvases behind everything.
 *
 * Deliberately not per-section: sections are transparent and scroll over this,
 * so there is never a seam between them — the background is one continuous
 * piece of weather that the sections happen to sit in front of.
 */
export function SiteBackground({ morph }: { morph: ScrollMorph }) {
  const auraRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const auraCanvas = auraRef.current;
    const dotsCanvas = dotsRef.current;
    if (!auraCanvas || !dotsCanvas) return;
    const auraCtx = auraCanvas.getContext("2d");
    const dotsCtx = dotsCanvas.getContext("2d");
    if (!auraCtx || !dotsCtx) return;

    const state = morph.state;

    let base = "#0b1f4d";
    let blobs: ResolvedColor[] = [];
    let dotColor = "#ffffff";

    const aura = createAura();
    let field: DotField = createDotField(gridForWidth(window.innerWidth));

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
      auraCanvas.width = Math.max(1, Math.round(w * AURA_SCALE));
      auraCanvas.height = Math.max(1, Math.round(h * AURA_SCALE));
      // Deliberately DPR-1: thousands of 1–3px squares at DPR 2 cost 4× the
      // fill for no visible gain, and the softness suits the field.
      dotsCanvas.width = w;
      dotsCanvas.height = h;
      const grid = gridForWidth(w);
      if (grid.gx !== field.gx || grid.gz !== field.gz)
        field = createDotField(grid);
    };
    resize();

    // Two clocks: the clouds drift at half the speed of the dots.
    let auraT = 0;
    let dotsT = 0;

    const drawAura = (dt: number) => {
      auraT += AURA_RATE * dt;
      renderAura(
        auraCtx,
        auraCanvas.width,
        auraCanvas.height,
        aura,
        base,
        blobs,
        state,
        auraT,
      );
    };
    const drawDots = (dt: number) => {
      dotsT += DOTS_RATE * dt;
      renderDotField(
        dotsCtx,
        field,
        state,
        dotsT,
        dotsCanvas.width,
        dotsCanvas.height,
        dotColor,
      );
    };
    /** Both layers, clocks held still — for the reduced-motion path. */
    const drawStill = () => {
      drawAura(0);
      drawDots(0);
    };

    // Colors live in CSS tokens so both themes share one vocabulary; the probe
    // resolves them to numbers the canvas can use, and re-resolves on toggle.
    const stopWatching = watchThemeColors(AURA_TOKENS, (colors) => {
      base = colors["--aura-base"].css;
      blobs = Array.from(
        { length: AURA_BLOB_COUNT },
        (_, i) => colors[`--aura-blob-${i + 1}` as AuraToken],
      );
      dotColor = colors["--dot-color"].css;
      if (reduced) drawStill();
    });

    drawStill();

    // Each layer keeps its own budget, so the cheap-and-fluid one isn't held
    // back to the rate the expensive-and-slow one needs.
    let raf = 0;
    let lastDots = 0;
    let lastAura = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dotsDt = now - lastDots;
      if (dotsDt >= DOTS_FRAME_MS) {
        lastDots = now;
        drawDots(Math.min(dotsDt, MAX_STEP_MS));
      }
      const auraDt = now - lastAura;
      if (auraDt >= AURA_FRAME_MS) {
        lastAura = now;
        drawAura(Math.min(auraDt, MAX_STEP_MS));
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
    <>
      <canvas
        ref={auraRef}
        className="site-bg site-bg--aura"
        aria-hidden="true"
      />
      <canvas
        ref={dotsRef}
        className="site-bg site-bg--dots"
        aria-hidden="true"
      />
    </>
  );
}
