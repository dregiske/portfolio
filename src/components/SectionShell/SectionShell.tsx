import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./SectionShell.css";

type SectionShellProps = {
  /** Anchor id — must match the entry in `SECTIONS`. */
  id: string;
  /** Display heading, e.g. "Projects". */
  title: string;
  className?: string;
  children?: ReactNode;
};

/**
 * A content section: at least a full viewport tall, entirely transparent, and
 * centred on a fixed measure. Every section is a window onto the one background
 * behind the page — none of them paint a surface of their own.
 *
 * ARCHIVED — the `02 — ABOUT` eyebrow above each title. To restore, render
 * `<Eyebrow num={…} label={…} />` before the `<h2>` (the numbers and words are
 * still on each entry in `SECTIONS`) and put `mt-3.5` back on the title.
 */
export function SectionShell({
  id,
  title,
  className,
  children,
}: SectionShellProps) {
  return (
    <section id={id} className={cn("section-shell", className)}>
      <div className="section-shell__inner">
        <h2 className="section-shell__title">{title}</h2>
        {children}
      </div>
    </section>
  );
}
