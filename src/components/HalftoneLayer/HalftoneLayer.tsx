import { useEffect, useRef, useState } from "react";
import type { ScrollMorph } from "@/lib/useScrollMorph";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { watchThemeColors } from "@/lib/themeColors";
import {
  HALFTONE,
  createHalftone,
  destroyHalftone,
  renderHalftone,
  resizeHalftone,
  setHalftoneInks,
} from "@/lib/halftone";

/** The three ink roles, in print order: top, middle, bottom. */
const INK_TOKENS = [
  "--halftone-ink-1",
  "--halftone-ink-2",
  "--halftone-ink-3",
] as const;
/** What the inks' full overlap — the white — is pulled down to. */
const OVERLAP_TOKEN = "--halftone-overlap";
const COLOR_TOKENS = [...INK_TOKENS, OVERLAP_TOKEN] as const;

/**
 * Redraw budget: ~60fps. The field moves slowly, so a 120Hz display doubling
 * the work would buy nothing visible.
 */
const FRAME_MS = 16;
/** Longest step the clock will take at once, so returning to a backgrounded
 *  tab resumes rather than teleporting. */
const MAX_STEP_MS = 100;
/** Time for the cursor swell to grow in, or die away when the mouse leaves. */
const POINTER_FADE_MS = 400;

/**
 * The halftone field, layered over the aura. All the drawing lives in
 * `@/lib/halftone`; this owns the canvas, the clock, and the inputs — scroll,
 * cursor, ink colors and reduced motion.
 */
export function HalftoneLayer({ morph }: { morph: ScrollMorph }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  // Bumped when the browser gives back a lost WebGL context, which re-runs the
  // effect and rebuilds everything on the fresh one.
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onLost = (e: Event) => e.preventDefault();
    const onRestored = () => setGeneration((g) => g + 1);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    const unlisten = () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };

    // No WebGL: draw nothing and let the aura carry the background alone.
    const ht = createHalftone(canvas);
    if (!ht) return unlisten;

    const state = morph.state;
    const frame = { t: 0, scrollY: window.scrollY, pointer: 0, glitch: !reduced };
    const draw = () => {
      if (ht.gl.isContextLost()) return;
      renderHalftone(ht, state, frame);
    };

    // Same guard as the aura: assigning canvas.width clears it, and mobile
    // browsers fire `resize` continuously while the URL bar slides.
    let lastW = 0;
    let lastH = 0;
    let lastDpr = 0;
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, HALFTONE.MAX_DPR);
      if (w === lastW && h === lastH && dpr === lastDpr) return;
      lastW = w;
      lastH = h;
      lastDpr = dpr;
      resizeHalftone(ht, canvas, w, h, dpr);
    };
    resize();

    const stopWatching = watchThemeColors(COLOR_TOKENS, (colors) => {
      setHalftoneInks(
        ht,
        INK_TOKENS.map((token) => colors[token]),
        colors[OVERLAP_TOKEN],
      );
      if (reduced) draw();
    });

    draw();

    // Scroll arrives by event and is cached, like `useScrollMorph` — reading
    // `scrollY` inside the frame would force a layout flush every frame.
    const onScroll = () => {
      frame.scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // The swell follows a real mouse only. A touch has no hover, and without a
    // pointer at all the eased position sits at the centre of the screen —
    // which would leave a permanent bump there.
    let pointerTarget = 0;
    const onPointer = (e: PointerEvent) => {
      pointerTarget = e.pointerType === "mouse" ? 1 : 0;
    };
    const onLeave = () => {
      pointerTarget = 0;
    };
    const root = document.documentElement;

    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = now - last;
      if (dt < FRAME_MS) return;
      last = now;
      const step = Math.min(dt, MAX_STEP_MS);
      frame.t += step / 1000;
      frame.pointer +=
        (pointerTarget - frame.pointer) * Math.min(1, step / POINTER_FADE_MS);
      draw();
    };

    // Reduced motion: no loop, no clock, no glitch, no swell — repaint a still
    // frame whenever the scroll position (and so the morph state) changes.
    let unsubscribe: (() => void) | undefined;
    if (reduced) {
      unsubscribe = morph.subscribe(draw);
    } else {
      window.addEventListener("pointermove", onPointer, { passive: true });
      root.addEventListener("mouseleave", onLeave);
      window.addEventListener("blur", onLeave);
      raf = requestAnimationFrame(tick);
    }

    const onResize = () => {
      resize();
      if (reduced) draw();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      unsubscribe?.();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      root.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      stopWatching();
      unlisten();
      if (!ht.gl.isContextLost()) destroyHalftone(ht);
    };
  }, [morph, reduced, generation]);

  return (
    <canvas
      ref={canvasRef}
      className="site-bg site-bg--halftone"
      aria-hidden="true"
    />
  );
}
