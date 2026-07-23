import { NavPill } from "@/components/NavPill/NavPill";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import "./TopBar.css";

/**
 * Wordmark + nav, across the top of the hero. It scrolls away with the hero on
 * purpose: past the fold the scroll indicator at the foot of the page is the
 * navigation, and nothing should crowd the artwork.
 */
export function TopBar() {
  return (
    <div className="top-bar">
      <a href="#hero" className="top-bar__logo" aria-label="Back to top">
        AG
      </a>
      <div className="top-bar__actions">
        <NavPill />
        <ThemeToggle />
      </div>
    </div>
  );
}
