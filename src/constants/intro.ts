/* ---------------------------------------------------------------------------
   Hero intro choreography
   ---------------------------------------------------------------------------
   The opening sequence as data, in one place, so its rhythm can be tuned
   without touching a component. Three typed lines — the tagline under the
   static wordmark — each with its own start and its own speed.

   The delays are *chained* — each one was derived from where the line before it
   finishes, with the next starting about a quarter of the way back into it. The
   small overlap is deliberate: strictly sequential lines read like a terminal
   replaying a log, while a slight lead reads like someone typing ahead of
   themselves. The consequence is that these numbers are not independent. Edit
   the copy or a `cps` and the ones below it want recomputing, or the overlaps
   drift.

   Measured end-to-end before the wordmark redesign: ~4.55s on desktop, ~4.93s
   on mobile (whose tagline lines break at different words and so are a little
   longer). The tagline now starts 1398ms sooner, with its internal overlaps
   unchanged, so ~3.15s / ~3.53s.
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
  /**
   * ARCHIVED — the typed "hey, I'm" greeting. The static wordmark replaced it
   * in the redesign. To restore it, render a `Typewriter` with
   * `{...INTRO.greeting}` above the tagline and shift the tagline delays back
   * by 1398ms.
   *
   * Short and breezy — it's an aside, so it goes first and goes quickly.
   */
  greeting: { delay: 180, cps: 16 } satisfies TypeLine,

  /**
   * ARCHIVED — the typed name. The hero's name is now the static wordmark;
   * restore alongside `greeting`.
   *
   * Slowest line on the page, by a wide margin. At 8 cps you watch the name
   * being written rather than watch it appear.
   */
  title: { delay: 692, cps: 8 } satisfies TypeLine,

  /**
   * One entry per tagline line, in order. The speeds step down and then up —
   * 30, 25, 34 — so the three lines of one sentence don't drone at a single
   * rate; the middle line is the slowest and the short sign-off is the briskest.
   *
   * The delays are the original chain (1798, 2988, 4334) moved 1398ms earlier
   * now that nothing types before them — every overlap between the lines is
   * exactly what it was.
   *
   * A 3-tuple rather than an array so that the line sets in `Hero.tsx` can be
   * tuples too, and a copy edit that adds a fourth line fails to compile
   * instead of silently running without a pace.
   */
  tagline: [
    { delay: 400, cps: 30 },
    { delay: 1590, cps: 25 },
    { delay: 2936, cps: 34 },
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
