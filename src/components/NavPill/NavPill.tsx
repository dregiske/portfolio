import { NAV_SECTIONS } from "@/constants/sections";
import { cn } from "@/lib/utils";
import "./NavPill.css";

/**
 * The floating anchor nav: one opaque pill holding the four content sections.
 * Hidden on small screens, where the scroll indicator already lists all five.
 */
export function NavPill({ className }: { className?: string }) {
  return (
    <nav className={cn("nav-pill", className)} aria-label="Sections">
      {NAV_SECTIONS.map((section) => (
        <a key={section.id} href={`#${section.id}`} className="nav-pill__link">
          {section.label}
        </a>
      ))}
    </nav>
  );
}
