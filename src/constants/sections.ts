/**
 * The five sections of the page, in scroll order — the single source of truth
 * for section anchors, titles, the nav, and the morph engine's scroll
 * boundaries. `id` is the anchor contract (`#about`, …); `label` is the nav
 * text and, for every section but the hero, its heading.
 */
export const SECTIONS = [
  { id: "hero", label: "Me" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

/** Link target for a section, e.g. `#about`. */
export const sectionHref = (id: SectionId) => `#${id}`;

/** A section's display label, e.g. "Projects". */
export const sectionLabel = (id: SectionId) =>
  SECTIONS.find((s) => s.id === id)!.label;

/** The four sections the nav links to (everything but the hero). */
export const NAV_SECTIONS = SECTIONS.filter((s) => s.id !== "hero");
