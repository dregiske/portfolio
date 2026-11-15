import type { ImageAsset } from "./types";

/** Who the site is about. Every place the page names its owner reads this. */
export const PROFILE = {
  name: "Andre Giske",
  /** The top bar's logo. */
  monogram: "AG",
  email: "andre.giske@yahoo.com",
  emailAlt: "andregiske1@gmail.com",
  resume: "/resume/Andre_Giske_Resume_2026.pdf",
} as const;

/** Exactly as many lines as `INTRO.tagline` has paces. */
export type TaglineLines = readonly [string, string, string];

/**
 * The hero tagline, broken into lines by hand.
 *
 * The breaks are authored rather than left to the browser because each line
 * types itself separately, so the typing boundaries have to *be* the visual
 * boundaries. The lines never wrap: `.hero__tagline` sizes its type off the
 * hero's width, so a line that fits once fits at every width in its range.
 *
 * There are two sets because a phone gets more lines-per-word than a desktop
 * can afford: the wide set's longest line is ~22.4em, which at phone widths
 * would make the type too small to read. They switch at the site breakpoint.
 * The type size in `Hero.css` is derived from these longest lines — change
 * the copy and re-measure them.
 */
export const TAGLINE: { wide: TaglineLines; narrow: TaglineLines } = {
  /** Wide layout. Longest line ~22.4em (Poppins 400, -0.02em tracking). */
  wide: [
    "CSE student at UC San Diego building backend",
    "systems and full-stack apps, feel free to",
    "connect!",
  ],
  /** Compact layout. Longest line ~18.3em. */
  narrow: [
    "CSE student at UC San Diego building",
    "backend systems and full-stack apps,",
    "feel free to connect!",
  ],
};

export const BIO = [
  "I'm a Computer Science & Engineering student with a keen interest in backend design and full-stack development. I love exploring new technologies and applying them to solve real-world problems.",
  "In my free time I work on personal projects, contribute to open-source, and surf the San Diego beaches. Always eager to connect, so reach out if you'd like to collaborate or just chat!",
] as const;

export const FOOTER_NOTE = "Thanks for scrolling this far!";

export const PHOTOS = {
  portrait: {
    src: "/hero/profile.jpg",
    width: 450,
    height: 800,
    alt: PROFILE.name,
  },
  /** About, first shot — shown at every width. */
  aboutGroup: {
    src: "/about/acm_group.jpg",
    width: 1100,
    height: 616,
    alt: `${PROFILE.name} with the ACM group at UC San Diego`,
  },
  /** About, second shot — wide layout only. */
  aboutParticipants: {
    src: "/about/acm_participants.jpg",
    width: 1100,
    height: 825,
    alt: "ACM event participants at UC San Diego",
  },
} satisfies Record<string, ImageAsset & { alt: string }>;
