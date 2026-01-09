"use client";
import { ArrowUp } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-2 px-12 bg-card relative border-t border-border mt-10 pt-2 flex flex-wrap items-center justify-between">
      <p>&copy; {new Date().getFullYear()} Andre Giske. All rights reserved.</p>
      <a
        href="#hero"
        className="p-2 rounded-full bg-primary/20 hover:bg-primary/50 text-primary transition-colors duration-300"
      >
        <ArrowUp />
      </a>
    </footer>
  );
};
