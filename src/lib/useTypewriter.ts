import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/* ---------------------------------------------------------------------------
   The intro clock
   ---------------------------------------------------------------------------
   One rAF loop and one `t0` for every line on the page, in the same spirit as
   `useScrollMorph`: a shared clock means the stagger between lines is exact,
   rather than three independent loops that each started whenever their own
   effect happened to run.

   The loop only exists while something is still typing — the last line to
   finish unsubscribes and the frame callback stops rescheduling itself. After
   the intro, this module costs nothing.
   ------------------------------------------------------------------------- */

type Tick = (elapsed: number) => void;

const subs = new Set<Tick>();
/** `performance.now()` at the moment the intro started; 0 until the clock runs. */
let t0 = 0;
let raf = 0;
let waitingForFonts = false;

/**
 * How long to wait for webfonts before starting anyway.
 *
 * Every face is `font-display: swap`, so Sora can land *after* typing has begun
 * and change the title's metrics underneath it. The ghost in `Typewriter` keeps
 * that from breaking the layout, but the box still visibly jumps. Starting on
 * final metrics avoids it — and the cap means a slow font CDN delays the intro
 * by at most this, instead of holding it hostage.
 */
const FONT_TIMEOUT = 500;

function fontsReady(): Promise<void> {
  if (!document.fonts) return Promise.resolve();
  return Promise.race([
    document.fonts.ready.then(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, FONT_TIMEOUT)),
  ]);
}

function frame() {
  // Checked before rescheduling, so the loop dies with its last subscriber.
  if (subs.size === 0) {
    raf = 0;
    return;
  }
  raf = requestAnimationFrame(frame);
  const elapsed = performance.now() - t0;
  subs.forEach((fn) => fn(elapsed));
}

function startClock() {
  if (raf !== 0) return;
  // Clock already established (a later line subscribing, or React's
  // StrictMode remount): rejoin it rather than restarting the intro.
  if (t0 !== 0) {
    raf = requestAnimationFrame(frame);
    return;
  }
  if (waitingForFonts) return;
  waitingForFonts = true;
  void fontsReady().then(() => {
    waitingForFonts = false;
    t0 = performance.now();
    if (subs.size > 0 && raf === 0) raf = requestAnimationFrame(frame);
  });
}

function subscribe(fn: Tick): () => void {
  subs.add(fn);
  startClock();
  return () => {
    subs.delete(fn);
  };
}

/* ---------------------------------------------------------------------------
   Keystroke schedule
   ------------------------------------------------------------------------- */

/** mulberry32 — small, fast, and seeded, so a line's cadence never changes. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a over the text, so each line gets its own cadence from its content. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * When each character appears, in ms from the intro clock's start.
 *
 * Built once per line rather than stepped per frame, which is what lets the
 * cadence be arbitrary: an evenly-spaced reveal reads as a machine, so each
 * keystroke is jittered and the punctuation gets the little pauses a person
 * takes. Per frame all that remains is walking a pointer up this array.
 */
function buildSchedule(text: string, delay: number, cps: number): Float64Array {
  const base = 1000 / cps;
  const rand = seeded(hash(text));
  const out = new Float64Array(text.length);
  let t = delay;

  for (let i = 0; i < text.length; i++) {
    // 0.55×–1.45× the mean interval: enough spread to feel uneven, not enough
    // to read as stuttering.
    t += base * (0.55 + rand() * 0.9);

    // The pauses are where the "organic" actually comes from — a breath at a
    // comma and a longer one at a full stop do more for the feel than the
    // per-character jitter does. They key off the *previous* character, because
    // the pause belongs after the punctuation, not before it: keying off the
    // current one hesitates on the way *to* the comma, which is backwards.
    const prev = i > 0 ? text[i - 1] : "";
    if (prev === " ") t += base * 0.25;
    else if (prev === "," || prev === ";") t += base * 2.2;
    else if (prev === "." || prev === "!" || prev === "?") t += base * 3;

    out[i] = t;
  }

  return out;
}

export type TypewriterState = {
  /** How many characters are currently revealed. */
  count: number;
  /** The line's delay has elapsed — it owns the caret from here until `done`. */
  started: boolean;
  /** Every character is out. */
  done: boolean;
};

/**
 * Drives one line of typed text. Returns only numbers — it touches no DOM, so
 * the reveal technique stays entirely the component's business.
 *
 * Reduced motion short-circuits to the finished state and never subscribes, so
 * no clock is started and nothing animates.
 */
export function useTypewriter(
  text: string,
  { delay, cps }: { delay: number; cps: number },
): TypewriterState {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  const schedule = useMemo(
    () => buildSchedule(text, delay, cps),
    [text, delay, cps],
  );

  useEffect(() => {
    if (reduced) {
      setStarted(true);
      setCount(text.length);
      return;
    }

    setStarted(false);
    setCount(0);

    // Both live across frames: `i` is the pointer into the schedule (monotonic,
    // so the walk is O(1) amortised) and the other two keep this from calling
    // setState on frames where nothing actually changed.
    let i = 0;
    let announced = false;
    let last = 0;

    let unsubscribe = () => {};
    unsubscribe = subscribe((elapsed) => {
      if (!announced && elapsed >= delay) {
        announced = true;
        setStarted(true);
      }
      while (i < schedule.length && schedule[i] <= elapsed) i++;
      if (i !== last) {
        last = i;
        setCount(i);
      }
      // Done — drop off the clock so the shared loop can stop.
      if (i >= schedule.length) unsubscribe();
    });

    return () => unsubscribe();
  }, [reduced, schedule, delay, text.length]);

  return { count, started, done: count >= text.length };
}
