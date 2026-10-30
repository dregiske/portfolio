import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * Whether the reader has asked the OS to reduce motion. Reactive, so animation
 * effects that depend on it tear down and re-run when the preference flips.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
