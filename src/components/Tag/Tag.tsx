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
  /** Pastel tone for the background + text color. */
  tone: Tone;
  /** Render a small leading status dot (e.g. the hero badge). */
  dot?: boolean;
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
  dot = false,
  className,
  children,
  ...rest
}: TagProps) {
  return (
    <Component className={cn("tag", `tag--${tone}`, className)} {...rest}>
      {dot && <span className="tag__dot" />}
      {children}
    </Component>
  );
}
