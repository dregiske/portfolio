import type { Tone } from "@/constants/tones";
import "./SectionHeader.css";

type SectionHeaderProps = {
  /** Two-digit index, e.g. "01" */
  index: string;
  /** Eyebrow label, e.g. "Work" */
  eyebrow: string;
  /** Heading text before the accent word, e.g. "Featured" */
  title: string;
  /** Italic, color-accented final word, e.g. "projects" */
  accent: string;
  tone: Tone;
  className?: string;
};

export function SectionHeader({
  index,
  eyebrow,
  title,
  accent,
  tone,
  className = "",
}: SectionHeaderProps) {
  const color = `section-header--${tone}`;
  return (
    <div className={`section-header ${className}`}>
      <div className={`section-header__eyebrow ${color}`}>
        {index} — {eyebrow}
      </div>
      <h2 className="section-header__title">
        {title} <span className={`section-header__accent ${color}`}>{accent}</span>
      </h2>
    </div>
  );
}
