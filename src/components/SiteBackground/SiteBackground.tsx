import { useEffect, useRef } from "react";
import type { ScrollMorph } from "@/lib/useScrollMorph";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { watchThemeColors, type ResolvedColor } from "@/lib/themeColors";
import { createAuraDrift, renderAura, AURA_BLOB_COUNT } from "@/lib/aura";
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
/** ~30fps. The morphs are slow and the dots are 1–3px; 60fps buys nothing. */
const FRAME_MS = 33;

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

    const drift = createAuraDrift();
    let field: DotField = createDotField(gridForWidth(window.innerWidth));

    const resize = () => {
      auraCanvas.width = Math.max(1, Math.round(window.innerWidth * AURA_SCALE));
      auraCanvas.height = Math.max(1, Math.round(window.innerHeight * AURA_SCALE));
      // Deliberately DPR-1: thousands of 1–3px squares at DPR 2 cost 4× the
      // fill for no visible gain, and the softness suits the field.
      dotsCanvas.width = window.innerWidth;
      dotsCanvas.height = window.innerHeight;
      const grid = gridForWidth(window.innerWidth);
      if (grid.gx !== field.gx || grid.gz !== field.gz) field = createDotField(grid);
    };
    resize();

    // Two clocks: the clouds drift at half the speed of the dots.
    let auraT = 0;
    let dotsT = 0;

    const draw = (still = false) => {
      if (!still) {
        auraT += 0.012;
        dotsT += 0.024;
      }
      renderAura(
        auraCtx,
        auraCanvas.width,
        auraCanvas.height,
        drift,
        base,
        blobs,
        state,
        auraT,
      );
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

    // Colors live in CSS tokens so both themes share one vocabulary; the probe
    // resolves them to numbers the canvas can use, and re-resolves on toggle.
    const stopWatching = watchThemeColors(AURA_TOKENS, (colors) => {
      base = colors["--aura-base"].css;
      blobs = Array.from(
        { length: AURA_BLOB_COUNT },
        (_, i) => colors[`--aura-blob-${i + 1}` as AuraToken],
      );
      dotColor = colors["--dot-color"].css;
      if (reduced) draw(true);
    });

    draw(true);

    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      last = now;
      draw();
    };

    // Reduced motion: no loop and no clock — repaint a correct still frame
    // whenever the reader's scroll position (and so the morph state) changes.
    let unsubscribe: (() => void) | undefined;
    if (reduced) {
      unsubscribe = morph.subscribe(() => draw(true));
    } else {
      raf = requestAnimationFrame(tick);
    }

    const onResize = () => {
      resize();
      if (reduced) draw(true);
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
      <canvas ref={auraRef} className="site-bg site-bg--aura" aria-hidden="true" />
      <canvas ref={dotsRef} className="site-bg site-bg--dots" aria-hidden="true" />
    </>
  );
}
