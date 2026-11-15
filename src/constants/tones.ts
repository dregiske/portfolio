/**
 * The blue shade ladder — the single source of truth for tone names across the
 * UI. Every tone is the same blue family a step further toward the page's ink,
 * so a set of them reads as one material seen at different depths rather than
 * as five different colors.
 *
 * Each name has a `tone-{name}` class in `src/index.css`, which gives the
 * element `--tone-ink` (text) and `--tone-surface` (fill). Use `toneClass`
 * rather than spelling the class out.
 *
 * Listed shallowest-first, so anything that cycles through them (project tags,
 * skill nodes) walks down the ladder in order.
 *
 * To add a shade: add its name here, and a matching `@utility tone-{name}` plus
 * an entry in the `@source inline(…)` list in index.css.
 */
export const TONES = ["frost", "ice", "sky", "azure", "cobalt"] as const;

export type Tone = (typeof TONES)[number];

/** The class that puts an element on a rung of the ladder. */
export const toneClass = (tone: Tone) => `tone-${tone}`;

/** The rung for the i-th item of a list, cycling down the ladder. */
export const toneAt = (i: number): Tone => TONES[i % TONES.length];
