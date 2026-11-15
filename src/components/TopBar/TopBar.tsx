import { sectionHref } from "@/constants/sections";
import { PROFILE } from "@/content/profile";
import { NavPill } from "@/components/NavPill/NavPill";
import "./TopBar.css";

/**
 * Wordmark + nav pill, across the top of the hero. It scrolls away with the
 * hero, so nothing crowds the page further down. Compact, the pill is hidden
 * and `MobileMenu`'s button — fixed to the screen, not part of this bar —
 * takes its place at the right end of the row.
 */
export function TopBar() {
  return (
    <div className="top-bar">
      <a
        href={sectionHref("hero")}
        className="top-bar__logo"
        aria-label="Back to top"
      >
        {PROFILE.monogram}
      </a>
      <NavPill />
    </div>
  );
}
