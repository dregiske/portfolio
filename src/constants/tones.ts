/**
 * The blue shade ladder — the single source of truth for tone names across the
 * UI. Every tone is the same blue family a step further toward the page's ink,
 * so a set of them reads as one material seen at different depths rather than
 * as five different colors. Each has a soft surface (`bg-tone-{name}-subtle`)
 * and a matching ink (`text-tone-{name}`), defined in `src/index.css`.
 *
 * Listed shallowest-first, so anything that cycles through them (project tags,
 * skill nodes) walks down the ladder in order.
 *
 * To add a shade: add its name here AND its `--shade-{name}-h` / `-step` inputs
 * plus the `--tone-{name}` / `--tone-{name}-subtle` pair in index.css.
 * Everything else (Card, Tag, skill nodes, social circles) derives from this list.
 */
export const TONES = ["frost", "ice", "sky", "azure", "cobalt"] as const;

export type Tone = (typeof TONES)[number];
