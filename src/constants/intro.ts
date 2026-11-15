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

   End to end: ~3.15s on desktop, ~3.53s on mobile (whose tagline lines break
   at different words and so are a little longer).
   ------------------------------------------------------------------------- */

export type TypeLine = {
  /** ms after the intro clock starts before the first character appears. */
  delay: number;
  /** Characters per second — the *average*; each keystroke is jittered. */
  cps: number;
};

export const INTRO = {
  /**
   * One entry per tagline line, in order. The speeds step down and then up —
   * 30, 25, 34 — so the three lines of one sentence don't drone at a single
   * rate; the middle line is the slowest and the short sign-off is the briskest.
   *
   * A 3-tuple rather than an array so that the line sets in the profile
   * content can be tuples too, and a copy edit that adds a fourth line fails to
   * compile instead of silently running without a pace.
   */
  tagline: [
    { delay: 400, cps: 30 },
    { delay: 1590, cps: 25 },
    { delay: 2936, cps: 34 },
  ] as readonly [TypeLine, TypeLine, TypeLine],
} as const;
