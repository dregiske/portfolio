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
    // The engine ticks every frame whether or not anything moved, and the
    // reader spends most of their time still. Writing a style property that
    // hasn't changed still invalidates layout, so each value is compared
    // against the last one written and skipped when it matches — a parked page
    // touches the DOM not at all.
    let lastFill = -1;
    let lastEnd = -1;
    let lastActive = -1;
    return morph.subscribe((state) => {
      const fill = Math.round(state.frac * 1000);
      if (fill !== lastFill && fillRef.current) {
        lastFill = fill;
        // scaleX, not width: width is a layout property, and this is the one
        // style on the page that changes on every frame of every scroll.
        fillRef.current.style.transform = `scaleX(${fill / 1000})`;
      }
      const end = Math.round(state.end * 1000);
      if (end !== lastEnd && rootRef.current) {
        const style = rootRef.current.style;
        const e = end / 1000;
        lastEnd = end;
        style.transform = `translateY(${(-e * LIFT).toFixed(1)}px)`;
        style.opacity = `${1 - e}`;
        // Once it's faded past legibility its links stop being clickable, so a
        // reader at the bottom can't hit an anchor they can no longer see.
        style.pointerEvents = e > 0.6 ? "none" : "";
      }
      if (state.active !== lastActive) {
        lastActive = state.active;
        setActive(state.active);
      }
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
