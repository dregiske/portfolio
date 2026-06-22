import type { Tone } from "@/constants/tones";
import { cn } from "@/lib/utils";
import "./Blob.css";

export type BlobSize = "sm" | "md" | "lg" | "xl";

type BlobProps = {
  color: Tone;
  size?: BlobSize;
  /** Positioning / opacity / z-index utilities, e.g. "-top-4 left-8 -z-10 opacity-50" */
  className?: string;
};

/**
 * Decorative pastel circle. Purely visual (aria-hidden); position, opacity and
 * stacking are controlled by the caller via `className`.
 */
export function Blob({ color, size = "md", className }: BlobProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("blob", `blob--${color}`, `blob--${size}`, className)}
    />
  );
}
