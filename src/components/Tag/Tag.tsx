import type { ReactNode } from "react";
import { toneClass, type Tone } from "@/constants/tones";
import { cn } from "@/lib/utils";
import "./Tag.css";

type TagProps = {
  /** Rung of the blue shade ladder used for the fill + text color. */
  tone: Tone;
  className?: string;
  children: ReactNode;
};

/** Small rounded-full label, tinted by its tone. */
export function Tag({ tone, className, children }: TagProps) {
  return <span className={cn("tag", toneClass(tone), className)}>{children}</span>;
}
