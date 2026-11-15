/* eslint-disable react-hooks/immutability -- MorphState is intentionally a
   mutable value held outside React's data flow: it changes on every animation
   frame and is read from inside rAF callbacks. Routing it through setState
   would re-render the entire page 60 times a second. */
import { useEffect, useState } from "react";
import type { SectionId } from "@/constants/sections";
import { clamp01 } from "@/lib/math";
import { REDUCED_MOTION_QUERY } from "@/lib/useReducedMotion";

/**
 * The one piece of state the page animates from: how far the reader has
 * scrolled, as spring-damped progresses across the section boundaries the
 * background cares about, plus the footer reveal and an eased pointer offset.
 *
 * It is a plain mutable object, deliberately: it changes every frame, and
 * pushing that through React state would re-render the page 60×/second. The
 * consumers (the aura, the footer) read it inside their own animation frame
 * and write straight to canvas/DOM.
 */
export type MorphState = {
  /** 0 in the hero → 1 once About reaches the top. */
  leaveHero: number;
  /** 0 until Skills reaches the top → 1 once Contact does. */
  reachContact: number;
  /**
   * Footer reveal, 0..1 across the last `--footer-zone` of the page. The
   * footer rides it up from below.
   */
  end: number;
  /** Eased pointer position, −1..1 from the viewport center. */
  mx: number;
  my: number;
  /** True when the reader asked for reduced motion — springs snap, nothing loops. */
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

/** Spring constants: heavy damping, gentle pull — water, not rubber. */
const DAMPING = 0.88;
const STIFFNESS = 0.008;
/**
 * Below these, a spring is done — snap it onto its target. A spring on its own
 * approaches the target asymptotically, which would keep the consumers
 * repainting for a second-plus after every transition.
 */
const SETTLE_DIST = 0.002;
const SETTLE_VEL = 0.0003;
/** Lerp factors for the footer reveal and for the pointer. */
const END_EASE = 0.12;
const POINTER_EASE = 0.06;

/** A damped spring chasing a target, one step per frame. */
type Spring = { value: number; vel: number };

function stepSpring(s: Spring, target: number) {
  s.vel = s.vel * DAMPING + (target - s.value) * STIFFNESS;
  s.value += s.vel;
  if (Math.abs(target - s.value) < SETTLE_DIST && Math.abs(s.vel) < SETTLE_VEL) {
    s.value = target;
    s.vel = 0;
  }
}

/** Progress of `y` from `from` to `to`, 0..1. */
const progress = (y: number, from: number, to: number) =>
  clamp01((y - from) / Math.max(1, to - from));

/** The section tops the engine measures. */
const BOUNDARIES: readonly SectionId[] = ["about", "skills", "contact"];

/**
 * Drives `MorphState` from the scroll position. Mount once, at the page level,
 * and pass the handle to everything that animates — one rAF loop for the whole
 * site, and every consumer sees exactly the same numbers on the same frame.
 */
export function useScrollMorph(): ScrollMorph {
  // Built once and never replaced: consumers hold on to `state` and read it
  // inside their own frames, so the identity has to be stable for the life of
  // the page. useState's initializer gives us exactly one.
  const [engine] = useState<MorphEngine>(() => {
    const subs = new Set<(state: MorphState) => void>();
    return {
      state: {
        leaveHero: 0,
        reachContact: 0,
        end: 0,
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
    const reduceQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    /*
     * Nothing in the frame loop below reads layout, and that is the point.
     * `scrollY`, `offsetTop` and `scrollHeight` all force the browser to flush
     * style and layout before answering — and since the subscribers write to
     * the DOM every frame, layout is always dirty by the time the next frame
     * asks.
     *
     * So the scroll position arrives by event instead (scroll events are
     * dispatched before rAF in the same frame, so it is never stale), and the
     * page's measurements are cached until something can actually have changed
     * them.
     */
    let y = window.scrollY;
    const onScroll = () => {
      y = window.scrollY;
    };

    let maxScroll = 0;
    let footerZone = 1;
    const tops: Record<string, number> = {};
    const measure = () => {
      const vh = window.innerHeight;
      // Before the sections exist, fall back to stacking them a viewport apart.
      BOUNDARIES.forEach((id, i) => {
        const el = document.getElementById(id);
        tops[id] = el ? el.offsetTop : (i + 1) * vh;
      });
      maxScroll = document.documentElement.scrollHeight - vh;
      // The same length `.home__content` reserves at the end of the page, so
      // the reveal plays out over a stretch with nothing to read in it.
      footerZone =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--footer-zone",
          ),
        ) || 1;
      y = window.scrollY;
    };

    let tmx = 0;
    let tmy = 0;
    const onPointer = (e: PointerEvent) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const leaveHero: Spring = { value: 0, vel: 0 };
    const reachContact: Spring = { value: 0, vel: 0 };

    const update = () => {
      const snap = st.reduced;

      if (snap) {
        st.mx = 0;
        st.my = 0;
      } else {
        st.mx += (tmx - st.mx) * POINTER_EASE;
        st.my += (tmy - st.my) * POINTER_EASE;
      }

      // The last stretch of the page — 0 until the footer's run-up, 1 at the
      // very bottom. A page too short to scroll never reveals.
      const end = maxScroll > 0 ? clamp01(1 - (maxScroll - y) / footerZone) : 0;
      if (snap) {
        st.end = end;
      } else {
        st.end += (end - st.end) * END_EASE;
        if (Math.abs(end - st.end) < 0.0005) st.end = end;
      }

      const tLeave = progress(y, 0, tops.about);
      const tReach = progress(y, tops.skills, tops.contact);
      if (snap) {
        leaveHero.value = tLeave;
        reachContact.value = tReach;
      } else {
        // Velocity + damping, so a morph overshoots and settles instead of
        // tracking the scrollbar rigidly.
        stepSpring(leaveHero, tLeave);
        stepSpring(reachContact, tReach);
      }
      st.leaveHero = leaveHero.value;
      st.reachContact = reachContact.value;

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
  }, [engine]);

  return engine;
}
