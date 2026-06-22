/**
 * Pastel tone families — the single source of truth for tone names across the
 * UI. Each tone has a soft surface (`bg-tone-{name}-subtle`) and a matching ink
 * (`text-tone-{name}`), with the actual colors defined in `src/index.css`.
 *
 * To add a tone: add its name here AND its `--tone-{name}` / `--tone-{name}-subtle`
 * vars in index.css. Everything else (Card, Tag, Blob, IconCircle, SectionHeader,
 * skill nodes) derives from this list.
 */
export const TONES = ["clay", "mint", "sky", "lilac", "butter"] as const;

export type Tone = (typeof TONES)[number];
