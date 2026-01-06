'use client';

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { MENU_BUTTON_SIZE } from "@/constants/theme";

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
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-40 transition-all duration-300",
        isScrolled
          ? "py-3 bg-background/80 backdrop-blur-md shadow-sm"
          : "py-5 bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-8">
          {navItems.map((item, key) => (
            <a
              key={key}
              href={item.href}
              className="text-foreground/80 hover:text-primary transition-colors duration-300"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Mobile Nav */}
		<button
		  onClick={() => setIsMenuOpen((prev) => !prev)}
		  className="md:hidden p-2 text-foreground z-50"
		  aria-label={isMenuOpen ? "Close menu" : "Open menu"}
		>
		  {isMenuOpen ? <X size={MENU_BUTTON_SIZE} /> : <Menu size={MENU_BUTTON_SIZE} />}
		</button>

        <div className={cn(
			"fixed inset-0 bg-background/95 backdrop-blur-md z-40 flex flex-col",
			"items-center justify-center transition-all duration-300 md:hidden",
			isMenuOpen 
			  ? "opacity-100 pointer-events-auto"
			  : "opacity-0 pointer-events-none"
		  )}
		>
		  <div className="flex flex-col space-y-8 text-xl items-center">
		    {navItems.map((item, key) => (
              <a
                key={key}
                href={item.href}
                className="text-foreground/80 hover:text-primary transition-colors duration-300"
				onClick={() => setIsMenuOpen(false)}
              >
            	{item.name}
              </a>
            ))}
		  </div>
		  
        </div>
      </div>
    </nav>
	
  );
};
