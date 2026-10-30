import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import type { ScrollMorph } from "@/lib/useScrollMorph";
import "./Footer.css";

/**
 * The page's last word. It waits just below the fold and rides `morph.end` up
 * over the final stretch of scrolling, taking the progress line's place.
 *
 * Like the indicator, the transform is written straight to the node every frame
 * rather than going through state — it's the same number the whole page is
 * already animating from.
 */
export function Footer({ morph }: { morph: ScrollMorph }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // Skipped when unchanged: the engine ticks every frame, but the footer only
    // moves over the last stretch of the page, and a redundant style write
    // still costs a style recalculation. See ScrollIndicator for the same idea.
    let last = -1;
    return morph.subscribe((state) => {
      const el = ref.current;
      if (!el) return;
      const hidden = Math.round((1 - state.end) * 1000);
      if (hidden === last) return;
      last = hidden;
      el.style.transform = `translateY(${hidden / 10}%)`;
    });
  }, [morph]);

  return (
    <footer ref={ref} className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__meta">
          {/* The year is baked in at build time by the prerender, so a visit
              in a later year than the last deploy legitimately differs. */}
          <span className="site-footer__copyright" suppressHydrationWarning>
            © {new Date().getFullYear()} Andre Giske
          </span>
          <p>Thanks for scrolling this far!</p>
          <a href="#hero" className="site-footer__top">
            Back to top
            <ArrowUp className="site-footer__top-glyph" />
          </a>
        </div>
      </div>
    </footer>
  );
}
