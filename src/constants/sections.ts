/**
 * The five sections of the page, in scroll order — the single source of truth
 * for the nav pill, the scroll indicator, the section eyebrows, and the morph
 * engine's scroll boundaries. `id` is the anchor contract (`#about`, …).
 */
export type SectionMeta = {
  /** Anchor id on the <section> element. */
  id: string;
  /** Short label in the nav pill / scroll indicator. */
  label: string;
  /** Two-digit index shown in the indicator and the section eyebrow. */
  num: string;
  /** All-caps eyebrow word, e.g. "WORK" for Projects. */
  eyebrow: string;
};

export const SECTIONS: readonly SectionMeta[] = [
  { id: "hero", label: "Me", num: "01", eyebrow: "ME" },
  { id: "about", label: "About", num: "02", eyebrow: "ABOUT" },
  { id: "projects", label: "Projects", num: "03", eyebrow: "WORK" },
  { id: "skills", label: "Skills", num: "04", eyebrow: "STACK" },
  { id: "contact", label: "Contact", num: "05", eyebrow: "CONTACT" },
] as const;

/** The four sections the nav pill links to (everything but the hero). */
export const NAV_SECTIONS = SECTIONS.filter((s) => s.id !== "hero");
