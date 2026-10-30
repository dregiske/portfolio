import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * The site's one layout breakpoint. Below it is the compact (phone) layout;
 * at and above it, the wide one. Every component that changes layout with the
 * viewport switches here, so they all collapse together.
 *
 * CSS gets it as the `wide:` variant (`@variant wide { … }` inside a rule),
 * from `--breakpoint-wide` in index.css — the only breakpoint the theme
 * defines, so a stray `sm:`/`md:`/`lg:` fails the build instead of quietly
 * adding a second threshold. This constant is that same value for the few
 * places that need it in JS; `checkBreakpoint` below verifies in development
 * that the two still agree. Change both together.
 *
 * Everything that merely *scales* with the viewport (type, gutters, spacing)
 * is fluid — `clamp()` and friends — and has no breakpoint at all.
 */
export const WIDE_MIN = "48rem";

export const WIDE_QUERY = `(min-width: ${WIDE_MIN})`;

/** Reactive: whether the wide layout is in effect. `false` when prerendering. */
export function useIsWide(): boolean {
  return useMediaQuery(WIDE_QUERY);
}

/** One-off read, for code that already runs on resize (e.g. canvas layouts). */
export function isWide(): boolean {
  return window.matchMedia(WIDE_QUERY).matches;
}

/** Development-only: complain if the CSS and JS breakpoints have drifted. */
export function checkBreakpoint() {
  const css = getComputedStyle(document.documentElement)
    .getPropertyValue("--breakpoint-wide")
    .trim();
  if (css !== WIDE_MIN) {
    console.error(
      `breakpoint mismatch: --breakpoint-wide is "${css}" in CSS but WIDE_MIN is "${WIDE_MIN}" in breakpoint.ts`,
    );
  }
}
