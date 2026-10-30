import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether a CSS media query currently matches. Reactive, so components that
 * branch on it (e.g. grid on mobile, carousel on desktop) re-render when the
 * viewport crosses the breakpoint.
 *
 * Pass a raw media string. For the layout breakpoint, use `useIsWide` from
 * `@/lib/breakpoint` rather than spelling out a width here.
 *
 * The page is prerendered at build time, where there is no viewport, so the
 * server snapshot is `false`. React hydrates against that and then re-renders
 * with the real answer, rather than reporting a mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
