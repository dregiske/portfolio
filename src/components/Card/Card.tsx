import type { ElementType, HTMLAttributes, ReactNode } from "react";
import type { Tone } from "@/constants/tones";
import { cn } from "@/lib/utils";
import "./Card.css";

type CardProps = {
  /** Element to render as — e.g. "article" for semantic cards. Defaults to "div". */
  as?: ElementType;
  /** "surface" = white card + border; "tinted" = soft color wash (set `tone`). */
  variant?: "surface" | "tinted";
  /** Wash color for the tinted variant. */
  tone?: Tone;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>;

/**
 * Rounded container shared across sections. Owns the surface tokens (radius,
 * border, background); callers add padding/layout via `className`.
 */
export function Card({
  as: Component = "div",
  variant = "surface",
  tone,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Component
      className={cn(
        "card",
        variant === "tinted" ? `card--tinted card--${tone}` : "card--surface",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
