import type { ReactNode } from "react";
import { sectionLabel, type SectionId } from "@/constants/sections";
import { cn } from "@/lib/utils";
import "./SectionShell.css";

type SectionShellProps = {
  /** Which entry in `SECTIONS` this is — sets the anchor and the heading. */
  id: SectionId;
  className?: string;
  children?: ReactNode;
};

/**
 * A content section: at least a full viewport tall, entirely transparent, and
 * centred on the content measure. Every section is a window onto the one
 * background behind the page — none of them paint a surface of their own.
 */
export function SectionShell({ id, className, children }: SectionShellProps) {
  return (
    <section id={id} className={cn("section-shell", className)}>
      <div className="section-shell__inner">
        <h2 className="section-shell__title">{sectionLabel(id)}</h2>
        {children}
      </div>
    </section>
  );
}
