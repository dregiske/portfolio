import { clsx, type ClassValue } from "clsx"

// No tailwind-merge: every caller joins BEM component classes with an optional
// extra class, so there are never conflicting utilities to resolve — and it
// was ~25 KB of the bundle for nothing.
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
