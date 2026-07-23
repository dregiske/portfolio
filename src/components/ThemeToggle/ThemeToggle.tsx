import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/Button/Button";
import "./ThemeToggle.css";

/**
 * Light/dark switch. The inline script in index.html already applied the stored
 * theme before first paint, so this reads the class it left behind rather than
 * re-deciding on mount — which would have meant a flash of the wrong theme.
 */
export const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
      className="theme-toggle"
    >
      {isDarkMode ? (
        <Sun className="theme-toggle__icon theme-toggle__icon--sun" />
      ) : (
        <Moon className="theme-toggle__icon theme-toggle__icon--moon" />
      )}
    </Button>
  );
};
