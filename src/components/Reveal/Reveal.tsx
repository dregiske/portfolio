import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./Reveal.css";

type RevealProps = {
  /** Edge the content travels in from. */
  from?: "right" | "left" | "up";
  /** ms before the move begins. */
  delay: number;
  /** ms the move takes. */
  duration: number;
  className?: string;
  children: ReactNode;
};

/**
 * Slides its children in from off-screen while fading them up.
 *
 * Deliberately a wrapper rather than something baked into `PortraitCard`: the
 * card describes what the photo *is*, and an entrance is a property of the
 * hero's choreography, not of the card.
 *
 * The animation is pure CSS — only `transform` and `opacity`, so it runs on the
 * compositor and never touches layout — which is also why reduced motion is
 * handled in the stylesheet instead of through `useReducedMotion`. There is no
 * JavaScript here to switch off, and a media query means no extra render.
 */
export function Reveal({
  from = "right",
  delay,
  duration,
  className,
  children,
}: RevealProps) {
  return (
    <div
      className={cn("reveal", `reveal--${from}`, className)}
      style={{
        "--reveal-delay": `${delay}ms`,
        "--reveal-duration": `${duration}ms`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
