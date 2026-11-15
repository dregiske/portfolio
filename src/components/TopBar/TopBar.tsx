import { sectionHref } from "@/constants/sections";
import { PROFILE } from "@/content/profile";
import { NavPill } from "@/components/NavPill/NavPill";
import { MobileMenu } from "@/components/MobileMenu/MobileMenu";
import "./TopBar.css";

/**
 * Wordmark + nav, across the top of the hero: the nav pill when wide, the
 * dropdown menu when compact. It scrolls away with the hero, so nothing
 * crowds the artwork further down.
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
      <div className="top-bar__actions">
        {/* One or the other, swapped at the site breakpoint. */}
        <NavPill />
        <MobileMenu />
      </div>
    </div>
  );
}
