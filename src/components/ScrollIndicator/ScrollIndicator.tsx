import { useEffect, useRef, useState } from "react";
import { SECTIONS } from "@/constants/sections";
import type { ScrollMorph } from "@/lib/useScrollMorph";
import { cn } from "@/lib/utils";
import "./ScrollIndicator.css";

/**
 * The page's persistent navigation: a progress line over the five sections,
 * with the current one lit. It rides the same morph engine as the background,
 * so the line eases exactly in step with the artwork.
 *
 * The fill width is written straight to the node — it changes every frame, and
 * only the active index (four changes over a whole page) goes through state.
 *
 * At the bottom of the page it hands off to the footer: `end` lifts it clear and
 * fades it out as the footer rises into the space it leaves.
 */

/** How far the footer pushes the indicator up, in px, over the full reveal. */
const LIFT = 36;

export function ScrollIndicator({ morph }: { morph: ScrollMorph }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    return morph.subscribe((state) => {
      if (fillRef.current) {
        fillRef.current.style.width = `${(state.frac * 100).toFixed(2)}%`;
      }
      if (rootRef.current) {
        const { end } = state;
        rootRef.current.style.transform = `translateY(${(-end * LIFT).toFixed(1)}px)`;
        rootRef.current.style.opacity = `${(1 - end).toFixed(3)}`;
        // Once it's faded past legibility its links stop being clickable, so a
        // reader at the bottom can't hit an anchor they can no longer see.
        rootRef.current.style.pointerEvents = end > 0.6 ? "none" : "";
      }
      setActive(state.active);
    });
  }, [morph]);

  return (
    <div ref={rootRef} className="scroll-indicator">
      <div className="scroll-indicator__inner">
        <div className="scroll-indicator__track">
          <div ref={fillRef} className="scroll-indicator__fill" />
        </div>
        <nav className="scroll-indicator__items" aria-label="Page progress">
          {SECTIONS.map((section, i) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={i === active ? "true" : undefined}
              className={cn(
                "scroll-indicator__item",
                i === active && "scroll-indicator__item--active",
              )}
            >
              <span className="scroll-indicator__label">{section.label}</span>
              <span className="scroll-indicator__num">{section.num}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
