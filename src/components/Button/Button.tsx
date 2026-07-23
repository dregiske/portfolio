import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Tone } from "@/constants/tones";
import { cn } from "@/lib/utils";
import "./Button.css";

type ButtonProps = {
  /**
   * "solid" = filled pill CTA · "text" = bare label (+ arrow), underline on
   * hover · "ghost" = bare button, e.g. icon buttons.
   */
  variant?: "solid" | "text" | "ghost";
  /** Rung of the blue shade ladder. Defaults to the brand accent when omitted. */
  tone?: Tone;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Action button. Owns the shape + variant; layout (padding/alignment overrides)
 * comes from the caller via `className`. Use Pill for link-styled CTAs (`<a>`).
 */
export function Button({
  variant = "solid",
  tone,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn("btn", `btn--${variant}`, tone && `btn--${tone}`, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
