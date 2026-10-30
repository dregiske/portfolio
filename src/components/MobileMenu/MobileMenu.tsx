import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { NAV_SECTIONS } from "@/constants/sections";
import { useIsWide } from "@/lib/breakpoint";
import { cn } from "@/lib/utils";
import "./MobileMenu.css";

const noSubscribe = () => () => {};

/**
 * The compact layout's navigation: a glass button in the top bar that opens a
 * full-screen glass cover with the same four links the nav pill shows when
 * wide, stacked in the middle of the screen. Both swap at the site
 * breakpoint, so exactly one of them is ever on screen.
 *
 * The cover is portalled to <body>. The top bar lives inside the hero, whose
 * stacking context the later sections paint over — a fixed cover left in
 * there would slide under them. Portals don't exist when prerendering, so it
 * only mounts on the client, after hydration; closed, it's invisible anyway.
 *
 * Open, it behaves as a modal dialog: focus moves into it and Tab can't leave
 * it, the page behind can't scroll, and Escape, the ✕ or a tap on empty glass
 * closes it — handing focus back to the menu button. Closed, it's `inert`.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isClient = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
  // Widening past the breakpoint hides the menu; don't leave it open behind
  // the scenes to reappear on the way back down.
  const wide = useIsWide();
  const isOpen = open && !wide;

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) menuButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();

    // Hold the page still underneath. Overflow on <html> rather than <body>:
    // <html> is the scroller here.
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !coverRef.current) return;
      // Keep Tab cycling inside the cover.
      const items = coverRef.current.querySelectorAll<HTMLElement>("a, button");
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={menuButtonRef}
        type="button"
        className="mobile-menu__button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setOpen(true)}
      >
        <Menu className="mobile-menu__icon" aria-hidden="true" />
      </button>

      {isClient &&
        createPortal(
          <div
            ref={coverRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className={cn(
              "mobile-menu__cover",
              isOpen && "mobile-menu__cover--open",
            )}
            inert={!isOpen}
            // Only a press on the glass itself, not on a link or the ✕.
            onClick={(e) => {
              if (e.target === e.currentTarget) close(true);
            }}
          >
            <button
              ref={closeRef}
              type="button"
              className="mobile-menu__button mobile-menu__close"
              aria-label="Close menu"
              onClick={() => close(true)}
            >
              <X className="mobile-menu__icon" aria-hidden="true" />
            </button>

            <nav aria-label="Sections" className="mobile-menu__links">
              {NAV_SECTIONS.map((section, i) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="mobile-menu__link"
                  style={{ "--i": i } as CSSProperties}
                  onClick={() => close(false)}
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
