import { HERO_PHOTO_LINK } from "@/constants/links";
import { INTRO } from "@/constants/intro";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { TopBar } from "@/components/TopBar/TopBar";
import { PortraitCard } from "@/components/PortraitCard/PortraitCard";
import { Typewriter } from "@/components/Typewriter/Typewriter";
import "./Hero.css";

/** Exactly as many lines as `INTRO.tagline` has paces. */
type TaglineLines = readonly [string, string, string];

/**
 * The tagline, broken into lines by hand.
 *
 * The breaks are authored rather than left to the browser because each line
 * types itself separately, so the typing boundaries have to *be* the visual
 * boundaries. The lines never wrap: `.hero__tagline` sizes its type off the
 * hero's width, so a line that fits once fits at every width in its range.
 *
 * There are two sets because a phone gets more lines-per-word than a desktop
 * can afford: the wide set's longest line is ~22.4em, which at phone widths
 * would make the type too small to read. The type sizes in `Hero.css` are
 * derived from these longest lines — change the copy and re-measure them.
 */
const TAGLINE_LINES: { wide: TaglineLines; narrow: TaglineLines } = {
  /** >=640px. Longest line ~22.4em (Poppins 400, -0.02em tracking). */
  wide: [
    "CSE student at UC San Diego building backend",
    "systems and full-stack apps, feel free to",
    "connect!",
  ],
  /** <640px. Longest line ~18.3em. */
  narrow: [
    "CSE student at UC San Diego building",
    "backend systems and full-stack apps,",
    "feel free to connect!",
  ],
};

/**
 * The opening: the name as a full-width wordmark across the top, and the
 * tagline at the foot, each of its lines typing itself at its own pace — the
 * timings all live in `@/constants/intro`, so this section stays a description
 * of *what* is on screen rather than of how it arrives.
 *
 * The portrait hangs off the bottom-right corner, straddling the seam with
 * About: its top half in the hero, its bottom half over the next section. Its
 * slide-in entrance is still parked — to bring it back, wrap it in `<Reveal
 * from="right" {...INTRO.portrait}>` and move the `hero__portrait` positioning
 * onto the wrapper. It's above the fold, so an entrance delay lands on LCP.
 */
export const Hero = () => {
  // Matches the `sm` breakpoint, where `.hero__tagline` changes its type size
  // and the line breaks move with it.
  const wide = useMediaQuery("(min-width: 640px)");
  const taglineLines = wide ? TAGLINE_LINES.wide : TAGLINE_LINES.narrow;

  return (
    <section id="hero" className="hero">
      <div className="hero__inner">
        <TopBar />

        {/* Written in title case and lowercased by CSS, so screen readers and
            search results get the name properly capitalised. */}
        <h1 className="hero__wordmark">Andre Giske</h1>

        {/* One paragraph, three independently typed lines. Mapping over the
            paces rather than the strings is what ties each line to its own
            entry in the choreography. */}
        <p className="hero__tagline">
          {INTRO.tagline.map((pace, i) => (
            <Typewriter key={i} text={taglineLines[i]} {...pace} />
          ))}
        </p>

        <PortraitCard
          src={HERO_PHOTO_LINK}
          alt="Andre Giske"
          className="hero__portrait"
        />
      </div>
    </section>
  );
};
