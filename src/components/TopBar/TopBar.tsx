import { NavPill } from "@/components/NavPill/NavPill";
import "./TopBar.css";

/**
 * Wordmark + nav, across the top of the hero. It scrolls away with the hero on
 * purpose: past the fold the scroll indicator at the foot of the page is the
 * navigation, and nothing should crowd the artwork.
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
        <NavPill />
      </div>
    </div>
  );
}
