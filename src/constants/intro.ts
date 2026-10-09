/* ---------------------------------------------------------------------------
   Hero intro choreography
   ---------------------------------------------------------------------------
   The opening sequence as data, in one place, so its rhythm can be tuned
   without touching a component. Five typed lines: the greeting, the name, and
   the three lines of the tagline, each with its own start and its own speed.

   The delays are *chained* — each one was derived from where the line before it
   finishes, with the next starting about a quarter of the way back into it. The
   small overlap is deliberate: strictly sequential lines read like a terminal
   replaying a log, while a slight lead reads like someone typing ahead of
   themselves. The consequence is that these numbers are not independent. Edit
   the copy or a `cps` and the ones below it want recomputing, or the overlaps
   drift.

   Measured end-to-end: ~4.55s on desktop, ~4.93s on mobile (whose tagline
   lines break at different words and so are a little longer).
   ------------------------------------------------------------------------- */

export type TypeLine = {
  /** ms after the intro clock starts before the first character appears. */
  delay: number;
  /** Characters per second — the *average*; each keystroke is jittered. */
  cps: number;
};

export type Entrance = {
  delay: number;
  duration: number;
};

export const INTRO = {
  /** Short and breezy — it's an aside, so it goes first and goes quickly. */
  greeting: { delay: 180, cps: 16 } satisfies TypeLine,

  /**
   * Slowest line on the page, by a wide margin. The name is the one piece of
   * type everything else is arranged around, and at 8 cps you watch it being
   * written rather than watch it appear.
   */
  title: { delay: 692, cps: 8 } satisfies TypeLine,

  /**
   * One entry per tagline line, in order. The speeds step down and then up —
   * 30, 25, 34 — so the three lines of one sentence don't drone at a single
   * rate; the middle line is the slowest and the short sign-off is the briskest.
   *
   * A 3-tuple rather than an array so that the line sets in `Hero.tsx` can be
   * tuples too, and a copy edit that adds a fourth line fails to compile
   * instead of silently running without a pace.
   */
  tagline: [
    { delay: 1798, cps: 30 },
    { delay: 2988, cps: 25 },
    { delay: 4334, cps: 34 },
  ] as readonly [TypeLine, TypeLine, TypeLine],

  /**
   * ARCHIVED — the portrait's slide-in entrance, parked while we measure what
   * it costs. `Reveal` is still in `src/components/Reveal/`; see the note in
   * `Hero.tsx` for how to wire it back up.
   *
   * Worth remembering if it does come back: the portrait is the
   * largest-contentful-paint element, and an element at `opacity: 0` doesn't
   * count as painted, so every millisecond of this delay lands on LCP.
   */
  portrait: { delay: 260, duration: 760 } satisfies Entrance,
} as const;
