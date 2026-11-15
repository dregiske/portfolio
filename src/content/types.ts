import type { Tone } from "@/constants/tones";

/**
 * An image file in `public/`, with its intrinsic pixel size so the page can
 * reserve its space before the bytes arrive. `scripts/optimize-images.sh`
 * writes a `.webp` beside every `.jpg`; `Photo` picks between them.
 */
export type ImageAsset = { src: string; width: number; height: number };

export type Project = {
  name: string;
  description: string;
  /** The live site. Its host is shown as the card's domain pill. */
  link: string;
  tools: string[];
  image: ImageAsset;
};

export type Skill = {
  name: string;
  /** Proficiency, 0–100. Sets the size of the skill's node. */
  level: number;
};

export type Social = {
  name: string;
  url: string;
  /** Path to the icon in `public/`. */
  icon: string;
  tone: Tone;
};
