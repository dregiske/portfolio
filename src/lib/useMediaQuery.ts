import { useEffect, useState } from "react";

/**
 * Whether a CSS media query currently matches. Reactive, so components that
 * branch on it (e.g. grid on mobile, carousel on desktop) re-render when the
 * viewport crosses the breakpoint.
 *
 * Pass a raw media string, e.g. `useMediaQuery("(min-width: 768px)")` for
 * Tailwind's `md` breakpoint.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
