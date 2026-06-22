import type { AnchorHTMLAttributes, ElementType, HTMLAttributes, ReactNode } from "react";
import type { Tone } from "@/constants/tones";
import { cn } from "@/lib/utils";
import "./IconCircle.css";

/** Circle background: any pastel tone, or the plain card surface. */
export type IconCircleBg = Tone | "card";

type IconCircleProps = {
  /** Element to render as — e.g. "a" for a linked circle. Defaults to "span". */
  as?: ElementType;
  /** sm = 44px, md = 52px. */
  size?: "sm" | "md";
  /** Circle background: a soft tone wash or the plain card surface. */
  bg?: IconCircleBg;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement> &
  Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel">;

/**
 * Fixed-size circle that centers a single glyph or image. Owns the shape +
 * background; hover/transition behavior comes from the caller via `className`.
 */
export function IconCircle({
  as: Component = "span",
  size = "sm",
  bg = "card",
  className,
  children,
  ...rest
}: IconCircleProps) {
  return (
    <Component
      className={cn("icon-circle", `icon-circle--${size}`, `icon-circle--${bg}`, className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
