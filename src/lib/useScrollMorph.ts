/* eslint-disable react-hooks/immutability -- MorphState is intentionally a
   mutable value held outside React's data flow: it changes on every animation
   frame and is read from inside rAF callbacks. Routing it through setState
   would re-render the entire page 60 times a second to move some dots. */
import { useEffect, useState } from "react";
import type { SectionMeta } from "@/constants/sections";

/**
 * The one piece of state the whole page animates from: how far the reader has
 * scrolled, expressed as four spring-damped morph progresses (one per section
 * boundary), plus the eased pointer offset both canvases parallax against.
 *
 * It is a plain mutable object, deliberately: it changes every frame, and
 * pushing that through React state would re-render the page 60×/second. The
 * consumers (the background canvases, the scroll indicator) read it inside
 * their own animation frame and write straight to canvas/DOM.
 */
export type MorphState = {
  /** hero → globe (About). */
  p: number;
  /** globe → streams (Projects). */
  q: number;
  /** streams → starfield (Skills). */
  r: number;
  /** starfield → mirrored top wave (Contact). */
  s: number;
  /** Whole-page scroll fraction 0..1, lerp-smoothed — drives the progress line. */
  frac: number;
  /**
   * Footer reveal, 0..1 across the last `END_ZONE` pixels of the page. The
   * footer rides it up from below and the progress line rides it out of the way.
   */
  end: number;
  /** Index of the section under the viewport's midpoint. */
  active: number;
  /** Eased pointer position, −1..1 from the viewport center. */
  mx: number;
  my: number;
  /** True when the reader asked for reduced motion — morphs snap, nothing loops. */
  reduced: boolean;
};

export interface ScrollMorph {
  /** Stable object, mutated in place every tick. Never replaced. */
  state: MorphState;
  /** Called after each update. Returns an unsubscribe function. */
  subscribe: (fn: (state: MorphState) => void) => () => void;
}

/** The handle plus the subscriber set the driver loop notifies. */
type MorphEngine = ScrollMorph & {
  readonly subs: Set<(state: MorphState) => void>;
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Spring constants from the mockup: heavy damping, gentle pull — water, not rubber. */
const DAMPING = 0.88;
const STIFFNESS = 0.008;
/**
 * Below these, a spring is done — snap it onto its target. The renderer skips
 * a morph leg only once the morph is *exactly* complete, and a spring on its
 * own approaches the target asymptotically: it would keep two or three legs'
 * worth of per-dot work alive for a second-plus after every transition. The
 * snap is sub-pixel (dots flutter more than this) but ends that tail at once.
 */
const SETTLE_DIST = 0.002;
const SETTLE_VEL = 0.0003;
/** Lerp factor for the progress line, and for the pointer. */
const FRAC_EASE = 0.12;
const POINTER_EASE = 0.06;
/**
 * How much scrolling the footer's entrance is spread over. `.home__content`
 * reserves roughly this much empty space at the end of the page, so the reveal
 * plays out over a stretch with nothing to read in it.
 */
const END_ZONE = 180;

/**
 * Drives `MorphState` from the scroll position. Mount once, at the page level,
 * and pass the handle to everything that animates — one rAF loop for the whole
 * site, and every consumer sees exactly the same numbers on the same frame.
 */
export function useScrollMorph(sections: readonly SectionMeta[]): ScrollMorph {
  // Built once and never replaced: consumers hold on to `state` and read it
  // inside their own frames, so the identity has to be stable for the life of
  // the page. useState's initializer gives us exactly one.
  const [engine] = useState<MorphEngine>(() => {
    const subs = new Set<(state: MorphState) => void>();
    return {
      state: {
        p: 0,
        q: 0,
        r: 0,
        s: 0,
        frac: 0,
        end: 0,
        active: 0,
        mx: 0,
        my: 0,
        reduced: false,
      },
      subs,
      subscribe: (fn) => {
        subs.add(fn);
        return () => {
          subs.delete(fn);
        };
      },
    };
  });

  useEffect(() => {
    const st = engine.state;
    const subs = engine.subs;
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    /*
     * Nothing in the frame loop below reads layout, and that is the point.
     * `scrollY`, `offsetTop` and `scrollHeight` all force the browser to flush
     * style and layout before answering — and since the subscribers write to
     * the DOM every frame, layout is always dirty by the time the next frame
     * asks. Reading any of them per frame means relaying out five
     * full-viewport sections sixty times a second.
     *
     * So the scroll position arrives by event instead (scroll events are
     * dispatched before rAF in the same frame, so it is never stale), and the
     * page's measurements are cached until something can actually have changed
     * them. Layout then happens once per frame, at the browser's own time.
     */
    let y = window.scrollY;
    const onScroll = () => {
      y = window.scrollY;
    };

    let vh = window.innerHeight;
    let maxScroll = 0;
    let tops: number[] = [];
    const measure = () => {
      vh = window.innerHeight;
      const els = sections.map((s) => document.getElementById(s.id));
      // Each morph runs from one section's top to the next's, so a boundary is
      // fully resolved exactly when the next section lands at the top. Before
      // the sections exist, fall back to stacking them a viewport apart.
      tops = [];
      let prev = 0;
      els.forEach((el, i) => {
        prev = el ? el.offsetTop : i === 0 ? 0 : prev + vh;
        tops.push(prev);
      });
      maxScroll = document.documentElement.scrollHeight - vh;
      y = window.scrollY;
    };

    let tmx = 0;
    let tmy = 0;
    const onPointer = (e: PointerEvent) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    // Velocities for the four springs.
    let vp = 0;
    let vq = 0;
    let vr = 0;
    let vs = 0;

    const update = () => {
      const snap = st.reduced;

      if (snap) {
        st.mx = 0;
        st.my = 0;
      } else {
        st.mx += (tmx - st.mx) * POINTER_EASE;
        st.my += (tmy - st.my) * POINTER_EASE;
      }

      // Whole-page progress.
      const max = maxScroll;
      const frac = max > 0 ? clamp01(y / max) : 0;
      if (snap) {
        st.frac = frac;
      } else {
        st.frac += (frac - st.frac) * FRAC_EASE;
        if (Math.abs(frac - st.frac) < 0.0005) st.frac = frac;
      }

      // The last stretch of the page, eased the same way — 0 until the footer's
      // run-up, 1 at the very bottom. A page too short to scroll has no bottom
      // to reach, so it never reveals.
      const end = max > 0 ? clamp01(1 - (max - y) / END_ZONE) : 0;
      if (snap) {
        st.end = end;
      } else {
        st.end += (end - st.end) * FRAC_EASE;
        if (Math.abs(end - st.end) < 0.0005) st.end = end;
      }

      const aboutTop = tops[1] ?? vh;
      const projTop = tops[2] ?? aboutTop + vh;
      const skillsTop = tops[3] ?? projTop + vh;
      const contactTop = tops[4] ?? skillsTop + vh;

      const tp = aboutTop > 0 ? clamp01(y / aboutTop) : 0;
      const tq = clamp01((y - aboutTop) / Math.max(1, projTop - aboutTop));
      const tr = clamp01((y - projTop) / Math.max(1, skillsTop - projTop));
      const ts = clamp01((y - skillsTop) / Math.max(1, contactTop - skillsTop));

      if (snap) {
        st.p = tp;
        st.q = tq;
        st.r = tr;
        st.s = ts;
      } else {
        // Velocity + damping, so a morph overshoots and settles instead of
        // tracking the scrollbar rigidly — then a snap once it's effectively
        // there, so the tail doesn't outlive the eye's interest in it.
        vp = vp * DAMPING + (tp - st.p) * STIFFNESS;
        st.p += vp;
        if (Math.abs(tp - st.p) < SETTLE_DIST && Math.abs(vp) < SETTLE_VEL) {
          st.p = tp;
          vp = 0;
        }
        vq = vq * DAMPING + (tq - st.q) * STIFFNESS;
        st.q += vq;
        if (Math.abs(tq - st.q) < SETTLE_DIST && Math.abs(vq) < SETTLE_VEL) {
          st.q = tq;
          vq = 0;
        }
        vr = vr * DAMPING + (tr - st.r) * STIFFNESS;
        st.r += vr;
        if (Math.abs(tr - st.r) < SETTLE_DIST && Math.abs(vr) < SETTLE_VEL) {
          st.r = tr;
          vr = 0;
        }
        vs = vs * DAMPING + (ts - st.s) * STIFFNESS;
        st.s += vs;
        if (Math.abs(ts - st.s) < SETTLE_DIST && Math.abs(vs) < SETTLE_VEL) {
          st.s = ts;
          vs = 0;
        }
      }

      // Scroll spy: the last section whose top has passed the viewport middle.
      const center = y + vh * 0.5;
      let active = 0;
      for (let i = 0; i < tops.length; i++) {
        if (tops[i] <= center) active = i;
      }
      st.active = active;

      subs.forEach((fn) => fn(st));
    };

    let raf = 0;
    let queued = false;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      update();
    };
    /** Reduced motion: no loop — one frame per scroll/resize, coalesced. */
    const schedule = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(() => {
        queued = false;
        update();
      });
    };

    /** Anything that changes the page's height moves every boundary below it. */
    const remeasure = () => {
      measure();
      if (st.reduced) schedule();
    };
    const observer = new ResizeObserver(remeasure);

    const start = () => {
      cancelAnimationFrame(raf);
      queued = false;
      st.reduced = reduceQuery.matches;
      measure();
      // Registered first, so the cached scroll position is fresh before
      // anything that reacts to it runs.
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", remeasure);
      observer.observe(document.body);
      if (st.reduced) {
        window.addEventListener("scroll", schedule, { passive: true });
        update();
      } else {
        window.addEventListener("pointermove", onPointer, { passive: true });
        loop();
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("pointermove", onPointer);
    };
    const onPreferenceChange = () => {
      stop();
      start();
    };

    start();
    reduceQuery.addEventListener("change", onPreferenceChange);
    return () => {
      stop();
      reduceQuery.removeEventListener("change", onPreferenceChange);
    };
  }, [engine, sections]);

  return engine;
}
