import type {
  AnchorHTMLAttributes,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react";
import type { Tone } from "@/constants/tones";
import { cn } from "@/lib/utils";
import "./Tag.css";

type TagProps = {
  /** Element to render as — e.g. "a" for a linked pill. Defaults to "span". */
  as?: ElementType;
  /** Rung of the blue shade ladder used for the background + text color. */
  tone: Tone;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement> &
  Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel">;

/**
 * Small rounded-full label. Owns the pill shape + tone tint; callers tweak
 * size/spacing/casing via `className`.
 */
export function Tag({
  as: Component = "span",
  tone,
  className,
  children,
  ...rest
}: TagProps) {
  return (
    <Component className={cn("tag", `tag--${tone}`, className)} {...rest}>
      {children}
    </Component>
  );
}
