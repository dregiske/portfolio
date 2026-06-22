import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./Pill.css";

type PillProps = {
  href: string;
  variant?: "solid" | "outline";
  className?: string;
  children: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

/** Pill-shaped link/CTA. `className` can override padding etc. (merged via cn). */
export function Pill({
  href,
  variant = "solid",
  className,
  children,
  ...rest
}: PillProps) {
  return (
    <a
      href={href}
      className={cn(
        "pill",
        variant === "solid" ? "pill--solid" : "pill--outline",
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  );
}
