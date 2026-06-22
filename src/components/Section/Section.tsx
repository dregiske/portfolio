import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./Section.css";

type SectionProps = {
  /** Anchor id for nav links, e.g. "about". */
  id?: string;
  /** Extra classes on the outer <section> (e.g. "overflow-hidden"). */
  className?: string;
  /** Extra classes on the centered inner column. */
  innerClassName?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>;

/**
 * Standard page section: vertical rhythm + horizontal padding on the outer
 * <section>, wrapping a centered max-width inner column. Section content (header
 * + body) goes straight inside.
 */
export function Section({
  id,
  className,
  innerClassName,
  children,
  ...rest
}: SectionProps) {
  return (
    <section id={id} className={cn("section", className)} {...rest}>
      <div className={cn("section__inner", innerClassName)}>{children}</div>
    </section>
  );
}
