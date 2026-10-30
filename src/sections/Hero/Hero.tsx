import { HERO_PHOTO_LINK } from "@/constants/links";
import { INTRO } from "@/constants/intro";
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
 * would make the type too small to read. They switch at the site breakpoint
 * (`@/lib/breakpoint`). The type size in `Hero.css` is derived from these
 * longest lines — change the copy and re-measure them.
 */
const TAGLINE_LINES: { wide: TaglineLines; narrow: TaglineLines } = {
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

/**
 * The opening: the name as a full-width wordmark across the top, and the
 * tagline at the foot, each of its lines typing itself at its own pace — the
 * timings all live in `@/constants/intro`, so this section stays a description
 * of *what* is on screen rather than of how it arrives.
 *
 * Wide, the portrait hangs off the bottom-right corner, straddling the seam
 * with About, and the tagline writes across it. Compact, it sits centred
 * between the wordmark and the tagline — it comes before the tagline in the
 * markup for that, and wide positions it absolutely, so order doesn't matter
 * there. Its slide-in entrance is still parked — to bring it back, wrap it in
 * `<Reveal from="right" {...INTRO.portrait}>` and move the `hero__portrait`
 * positioning onto the wrapper. It's above the fold, so an entrance delay
 * lands on LCP.
 */
export const Hero = () => {
  return (
    <section id="hero" className="hero">
      <div className="hero__inner">
        <TopBar />

        {/* Written in title case and lowercased by CSS, so screen readers and
            search results get the name properly capitalised. */}
        <h1 className="hero__wordmark">Andre Giske</h1>

        <PortraitCard
          src={HERO_PHOTO_LINK}
          alt="Andre Giske"
          className="hero__portrait"
        />

        {/* One paragraph, three independently typed lines. Mapping over the
            paces rather than the strings is what ties each line to its own
            entry in the choreography.

            Both line sets are rendered and CSS shows the one for the current
            layout (the other is `display: none`, so it's out of the
            accessibility tree too). Picking in JS would mean the prerendered
            page — which has no viewport — always shipped one set, then swapped
            it on hydration. */}
        {(["narrow", "wide"] as const).map((set) => (
          <p key={set} className={`hero__tagline hero__tagline--${set}`}>
            {INTRO.tagline.map((pace, i) => (
              <Typewriter key={i} text={TAGLINE_LINES[set][i]} {...pace} />
            ))}
          </p>
        ))}
      </div>
    </section>
  );
};
