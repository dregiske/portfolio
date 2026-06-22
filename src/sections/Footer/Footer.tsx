import { ArrowUp } from "lucide-react";
import "./Footer.css";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span>
          © {new Date().getFullYear()} Andre Giske. All rights reserved.
        </span>
        <a href="#hero" className="footer__top" aria-label="Back to top">
          <span className="footer__top-label">Back to top ↑</span>
          <ArrowUp className="footer__top-icon" size={18} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
};
