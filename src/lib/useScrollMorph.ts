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

    // Section tops, refreshed on resize — reading five offsetTops per frame is
    // cheap, but only if the elements are already resolved.
    let els: (HTMLElement | null)[] = [];
    const resolveEls = () => {
      els = sections.map((s) => document.getElementById(s.id));
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
      if (els.length !== sections.length || els.some((el) => el === null)) {
        resolveEls();
      }
      const vh = window.innerHeight;
      const y = window.scrollY;
      const snap = st.reduced;

      if (snap) {
        st.mx = 0;
        st.my = 0;
      } else {
        st.mx += (tmx - st.mx) * POINTER_EASE;
        st.my += (tmy - st.my) * POINTER_EASE;
      }

      // Whole-page progress.
      const max = document.documentElement.scrollHeight - vh;
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

      // Each morph runs from one section's top to the next's, so a boundary is
      // fully resolved exactly when the next section lands at the top.
      const top = (i: number, fallback: number) => els[i]?.offsetTop ?? fallback;
      const aboutTop = top(1, vh);
      const projTop = top(2, aboutTop + vh);
      const skillsTop = top(3, projTop + vh);
      const contactTop = top(4, skillsTop + vh);

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
        // tracking the scrollbar rigidly.
        vp = vp * DAMPING + (tp - st.p) * STIFFNESS;
        st.p += vp;
        vq = vq * DAMPING + (tq - st.q) * STIFFNESS;
        st.q += vq;
        vr = vr * DAMPING + (tr - st.r) * STIFFNESS;
        st.r += vr;
        vs = vs * DAMPING + (ts - st.s) * STIFFNESS;
        st.s += vs;
      }

      // Scroll spy: the last section whose top has passed the viewport middle.
      const center = y + vh * 0.5;
      let active = 0;
      els.forEach((el, i) => {
        if (el && el.offsetTop <= center) active = i;
      });
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

    const start = () => {
      cancelAnimationFrame(raf);
      queued = false;
      st.reduced = reduceQuery.matches;
      resolveEls();
      if (st.reduced) {
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        update();
      } else {
        window.addEventListener("pointermove", onPointer, { passive: true });
        window.addEventListener("resize", resolveEls);
        loop();
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("resize", resolveEls);
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
