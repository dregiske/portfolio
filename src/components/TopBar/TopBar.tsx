import { NavPill } from "@/components/NavPill/NavPill";
import { MobileMenu } from "@/components/MobileMenu/MobileMenu";
import "./TopBar.css";

/**
 * Wordmark + nav, across the top of the hero: the nav pill when wide, the
 * dropdown menu when compact. It scrolls away with the hero, so nothing
 * crowds the artwork further down.
 *
 * ARCHIVED — the theme toggle. The site is dark-only for the redesign; the
 * component is untouched in `src/components/ThemeToggle/`. To restore it,
 * import it here, render `<ThemeToggle />` after `<NavPill />`, and put the
 * `localStorage` check back in `index.html`'s pre-paint script.
 */
export function TopBar() {
  return (
    <div className="top-bar">
      <a href="#hero" className="top-bar__logo" aria-label="Back to top">
        AG
      </a>
      <div className="top-bar__actions">
        {/* One or the other, swapped at the site breakpoint. */}
        <NavPill />
        <MobileMenu />
      </div>
    </div>
  );
}
