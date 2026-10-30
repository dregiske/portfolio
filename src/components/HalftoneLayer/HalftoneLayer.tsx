import { useEffect, useRef, useState } from "react";
import type { ScrollMorph } from "@/lib/useScrollMorph";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { watchThemeColors } from "@/lib/themeColors";
import {
  HALFTONE,
  type Halftone,
  type HalftoneFrame,
  createHalftone,
  destroyHalftone,
  discardHalftone,
  finishHalftone,
  isHalftoneReady,
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
 * The text the halftone makes room for: any element marked
 * `data-halftone-quiet`. Their page positions are measured once and again
 * only when something resizes (the observer on <body> catches content above
 * them changing height); each frame just shifts them by the cached scroll
 * offset, so following the text costs no layout reads at all.
 */
function watchQuietZones() {
  const { QUIET_MAX, QUIET_PAD: pad, QUIET_FALLOFF: fall } = HALFTONE;
  const els = Array.from(
    document.querySelectorAll<HTMLElement>("[data-halftone-quiet]"),
  ).slice(0, QUIET_MAX);
  // Page coordinates, padded; a zero-width entry is an element that isn't
  // rendered (e.g. hidden at this breakpoint) and is skipped.
  const page = new Float32Array(els.length * 4);

  const measure = () => {
    const sx = window.scrollX;
    const sy = window.scrollY;
    els.forEach((el, k) => {
      const r = el.getBoundingClientRect();
      const o = k * 4;
      if (r.width === 0 && r.height === 0) {
        page[o] = page[o + 2] = 0;
        return;
      }
      page[o] = r.left + sx - pad;
      page[o + 1] = r.top + sy - pad;
      page[o + 2] = r.right + sx + pad;
      page[o + 3] = r.bottom + sy + pad;
    });
  };
  measure();
  const observer = new ResizeObserver(measure);
  els.forEach((el) => observer.observe(el));
  observer.observe(document.body);

  return {
    /** Write this frame's on-screen zones into `frame`. */
    fill(frame: HalftoneFrame) {
      const h = window.innerHeight;
      let n = 0;
      for (let k = 0; k < els.length; k++) {
        const o = k * 4;
        if (page[o + 2] === 0) continue;
        const top = page[o + 1] - frame.scrollY;
        const bottom = page[o + 3] - frame.scrollY;
        // Out of reach of every visible row, falloff included.
        if (bottom < -fall || top > h + fall) continue;
        frame.quiet[n * 4] = page[o] - window.scrollX;
        frame.quiet[n * 4 + 1] = top;
        frame.quiet[n * 4 + 2] = page[o + 2] - window.scrollX;
        frame.quiet[n * 4 + 3] = bottom;
        n++;
      }
      frame.quietCount = n;
    },
    stop: () => observer.disconnect(),
  };
}

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
    const pending = createHalftone(canvas);
    if (!pending) return unlisten;

    // The shaders compile in the background; wait for them a frame at a time
    // rather than blocking the page's first paint on them.
    let stop: (() => void) | undefined;
    let poll = 0;
    const wait = () => {
      if (!isHalftoneReady(pending)) {
        poll = requestAnimationFrame(wait);
        return;
      }
      const ht = finishHalftone(pending);
      stop = ht ? runHalftone(ht, canvas, morph, reduced) : () => {};
    };
    wait();

    return () => {
      cancelAnimationFrame(poll);
      if (stop) stop();
      else discardHalftone(pending);
      unlisten();
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

/**
 * Drive a halftone whose shaders are ready: size it, feed it scroll, cursor
 * and ink colors, and run its clock. Returns the cleanup.
 */
function runHalftone(
  ht: Halftone,
  canvas: HTMLCanvasElement,
  morph: ScrollMorph,
  reduced: boolean,
) {
  const state = morph.state;
  const frame: HalftoneFrame = {
    t: 0,
    scrollY: window.scrollY,
    pointer: 0,
    glitch: !reduced,
    quiet: new Float32Array(HALFTONE.QUIET_MAX * 4),
    quietCount: 0,
  };
  const zones = watchQuietZones();
  const draw = () => {
    if (ht.gl.isContextLost()) return;
    zones.fill(frame);
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
  // Fades the layer in (see SiteBackground.css), so it eases into a page
  // that's already showing rather than popping on top of it.
  canvas.dataset.drawn = "";

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
    zones.stop();
    if (!ht.gl.isContextLost()) destroyHalftone(ht);
  };
}
