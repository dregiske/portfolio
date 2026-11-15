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
 * column it sits in, so a line that fits once fits at every width.
 *
 * One set for every width: wide, the tagline has its own column beside the
 * portrait, which is about as narrow (in ems) as a phone. The type size in
 * `Hero.css` is derived from the longest line, ~18.3em (Poppins 400, -0.02em
 * tracking). Change the copy and re-measure it.
 */
export const TAGLINE: TaglineLines = [
  "CSE student at UC San Diego building",
  "backend systems and full-stack apps,",
  "feel free to connect!",
];

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
