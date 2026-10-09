import type { ElementType } from "react";
import { cn } from "@/lib/utils";
import { useTypewriter } from "@/lib/useTypewriter";
import "./Typewriter.css";

type TypewriterProps = {
  /** The element to render. Defaults to a span. */
  as?: ElementType;
  text: string;
  /** ms from the start of the intro before the first character lands. */
  delay: number;
  /** Mean characters per second. */
  cps: number;
  className?: string;
};

/**
 * One line of text that types itself out, left to right.
 *
 * The reveal has to not move anything. The hero puts the text and the portrait
 * in one centred flex row, so a line that *grew* as it typed would drag the
 * portrait sideways for the whole animation and re-wrap the tagline on nearly
 * every keystroke — a full relayout per character, on a page whose scroll
 * engine goes out of its way never to touch layout mid-frame.
 *
 * So the line renders twice. A transparent "ghost" holds the full text in
 * normal flow: it fixes the final box and the final line breaks before the
 * first character shows, and it stays the copy that selection, search engines
 * and screen readers see. Over it, in the same grid cell, an `aria-hidden`
 * overlay paints the revealed prefix. Nothing reflows, and because neither
 * copy splits the text into per-character spans, kerning survives — which the
 * title, at `tracking-[-0.04em]`, would otherwise visibly lose.
 *
 * Once the line is finished both copies are dropped for plain text, so the
 * resting state is exactly the markup that was there before the animation.
 */
export function Typewriter({
  as: Tag = "span",
  text,
  delay,
  cps,
  className,
}: TypewriterProps) {
  const { count, started, done } = useTypewriter(text, { delay, cps });

  // Resting state: no duplication, no overlay, no grid — just the text.
  if (done) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag className={cn("typewriter", className)}>
      <span className="typewriter__ghost">{text}</span>
      <span className="typewriter__ink" aria-hidden="true">
        {text.slice(0, count)}
        {/* The caret belongs to whichever line is mid-type, so it sits inline
            at the write head and leaves with the line's last character. */}
        {started && <span className="typewriter__caret" />}
      </span>
    </Tag>
  );
}
