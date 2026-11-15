import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * The OS "reduce motion" preference, as a media query. The one spelling of it:
 * code outside React (canvas engines, effects that read it once) uses this
 * with `matchMedia`; components use the hook below.
 */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Whether the reader has asked the OS to reduce motion. Reactive, so animation
 * effects that depend on it tear down and re-run when the preference flips.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
