import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./Card.css";

type CardProps = {
  /** Element to render as — e.g. "article" for semantic cards. Defaults to "div". */
  as?: ElementType;
  /**
   * "glass" = tinted, blurred surface over the live background.
   * "scrim" = no blur, a dimmed fill instead — for cards shown several at a
   * time, where a backdrop blur over the animated background would make the
   * compositor re-blur that whole area every frame.
   */
  variant?: "glass" | "scrim";
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>;

/**
 * Rounded container. Owns the surface (radius, border, fill); callers add
 * padding and layout via `className`.
 */
export function Card({
  as: Component = "div",
  variant = "glass",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Component className={cn("card", `card--${variant}`, className)} {...rest}>
      {children}
    </Component>
  );
}
