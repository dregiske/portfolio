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
