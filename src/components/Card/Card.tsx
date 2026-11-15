import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./Card.css";

type CardProps = {
  /** Element to render as — e.g. "article" for semantic cards. Defaults to "div". */
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>;

/**
 * Rounded container on a dimmed, unblurred fill. Owns the surface (radius,
 * fill); callers add padding and layout via `className`.
 *
 * No backdrop blur on purpose: cards come several at a time, and a blur over
 * the animated background would make the compositor re-blur that whole area
 * every frame.
 */
export function Card({
  as: Component = "div",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Component className={cn("card", className)} {...rest}>
      {children}
    </Component>
  );
}
