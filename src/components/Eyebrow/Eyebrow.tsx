import { cn } from "@/lib/utils";
import "./Eyebrow.css";

type EyebrowProps = {
  /** Two-digit section index, e.g. "02". */
  num: string;
  /** All-caps label, e.g. "ABOUT". */
  label: string;
  className?: string;
};

/** Monospaced section marker: `02 — ABOUT`. */
export function Eyebrow({ num, label, className }: EyebrowProps) {
  return (
    <div className={cn("eyebrow", className)}>
      {num} — {label}
    </div>
  );
}
