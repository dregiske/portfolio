/**
 * An image file in `public/`, with its intrinsic pixel size so the page can
 * reserve its space before the bytes arrive. `scripts/optimize-images.sh`
 * writes a `.webp` beside every `.jpg`; `Photo` picks between them.
 */
export type ImageAsset = { src: string; width: number; height: number };

export type Project = {
  name: string;
  /** One line under the title: what it is, readable in a glance. */
  summary: string;
  description: string;
  /** The live site. The whole card links here; its host is shown in the foot. */
  link: string;
  /** Most important first: a card shows the first few and counts the rest. */
  tools: string[];
  /** ~2:1 screenshots crop least. */
  image: ImageAsset;
  /** Shown as the wide card across the top of the section. One at a time. */
  featured?: boolean;
};

export type Skill = {
  name: string;
  /** Proficiency, 0–100. Sets the size of the skill's node. */
  level: number;
};

export type Social = {
  name: string;
  url: string;
  /** Path to a single-color SVG in `public/`, used as a mask so it can be
   *  painted any color (see `.contact__social-glyph`). */
  icon: string;
  /** The app's own colors: `brand` fills the circle (any CSS background, so
   *  a gradient works), `ink` paints the glyph on it. */
  brand: string;
  ink: string;
};
