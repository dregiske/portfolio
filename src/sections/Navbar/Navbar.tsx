import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/Button/Button";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import "./Navbar.css";

const navItems = [
  { name: "Home", href: "#hero" },
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
];

export const MENU_BUTTON_SIZE = 24;

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "navbar",
          isScrolled ? "navbar--scrolled" : "navbar--top",
        )}
      >
        <div className="navbar__inner">
          {/* Logo */}
          <a href="#hero" className="navbar__logo">
            A.G.
          </a>

          {/* Desktop Nav */}
          <div className="navbar__links">
            {navItems.map((item) => (
              <a key={item.name} href={item.href} className="navbar__link">
                {item.name}
              </a>
            ))}
          </div>

          {/* Right cluster */}
          <div className="navbar__right">
            <ThemeToggle />
            <span className="navbar__year">2026</span>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="navbar__menu-btn"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X size={MENU_BUTTON_SIZE} />
              ) : (
                <Menu size={MENU_BUTTON_SIZE} />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      <div
        className={cn(
          "navbar__overlay",
          isMenuOpen ? "navbar__overlay--open" : "navbar__overlay--closed",
        )}
      >
        <div className="navbar__overlay-links">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="navbar__link"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </>
  );
};
