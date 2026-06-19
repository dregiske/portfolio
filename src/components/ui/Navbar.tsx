import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { MENU_BUTTON_SIZE } from "@/constants/theme";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { name: "Home", href: "#hero" },
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
];

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
          "fixed top-0 left-0 w-full z-40 transition-all duration-300 border-b",
          isScrolled
            ? "py-4 bg-egg/80 backdrop-blur-md border-rule"
            : "py-5 bg-transparent border-transparent",
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            className="font-mono text-sm font-bold uppercase tracking-[0.14em] text-foreground"
          >
            A.G.
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-9 font-mono text-xs uppercase tracking-[0.12em]">
            {navItems.map((item, key) => (
              <a
                key={key}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-5">
            <ThemeToggle />
            <span className="hidden md:inline font-mono text-xs tracking-widest text-d-blue">
              2026
            </span>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="md:hidden p-1 text-foreground z-50"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X size={MENU_BUTTON_SIZE} />
              ) : (
                <Menu size={MENU_BUTTON_SIZE} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay — outside <nav> to avoid stacking context issues */}
      <div
        className={cn(
          "fixed inset-0 bg-egg/95 backdrop-blur-md z-40 flex flex-col",
          "items-center justify-center transition-all duration-300 md:hidden",
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        <div className="flex flex-col space-y-8 items-center font-mono text-base uppercase tracking-[0.12em]">
          {navItems.map((item, key) => (
            <a
              key={key}
              href={item.href}
              className="text-muted-foreground hover:text-primary transition-colors duration-300"
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
