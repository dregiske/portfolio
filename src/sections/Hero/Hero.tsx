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
 * boundaries. Both sets below are the real wrap points, measured against the
 * actual font metrics — and they fall on different words, which is the whole
 * reason there are two: at 19px in a 440px box the first line reaches
 * "backend", while at a phone's 17px in ~342px it only gets to "building".
 * Reusing the desktop breaks on a phone would wrap them a second time.
 *
 * Changing this copy means re-deriving the breaks, and the delays in
 * `INTRO.tagline` with them.
 */
const TAGLINE_LINES: { wide: TaglineLines; narrow: TaglineLines } = {
  /** >=640px, 19px type, 440px box. */
  wide: [
    "CSE student at UC San Diego building backend",
    "systems and full-stack apps, feel free to",
    "connect!",
  ],
  /** <640px, 17px type, viewport minus the 24px gutters. */
  narrow: [
    "CSE student at UC San Diego building",
    "backend systems and full-stack apps,",
    "feel free to connect!",
  ],
};

/**
 * The opening. Five lines, each typing itself at its own pace and starting at
 * its own moment — the timings all live in `@/constants/intro`, so this section
 * stays a description of *what* is on screen rather than of how it arrives.
 */
export const Hero = () => {
  // Matches the `sm` breakpoint, where `.hero__tagline` steps 17px → 19px and
  // the line breaks move with it.
  const wide = useMediaQuery("(min-width: 640px)");
  const taglineLines = wide ? TAGLINE_LINES.wide : TAGLINE_LINES.narrow;

  return (
    <section id="hero" className="hero">
      <div className="hero__inner">
        <TopBar />

        <div className="hero__body">
          <div className="hero__intro">
            <Typewriter
              className="hero__greeting"
              text="hey, I'm"
              {...INTRO.greeting}
            />
            <Typewriter
              as="h1"
              className="hero__title"
              text="Andre Giske"
              {...INTRO.title}
            />

            {/* One paragraph, three independently typed lines. Mapping over the
                paces rather than the strings is what ties each line to its own
                entry in the choreography. */}
            <p className="hero__tagline">
              {INTRO.tagline.map((pace, i) => (
                <Typewriter
                  key={i}
                  text={taglineLines[i]}
                  {...pace}
                />
              ))}
            </p>
          </div>

          {/* Centred while it's stacked under the text; back in the row at lg.
              The slide-in entrance is parked while we measure what it costs —
              to put it back, wrap this in `<Reveal from="right"
              {...INTRO.portrait} className="shrink-0 self-center
              lg:self-auto">` and drop the classes here. The `shrink-0` has to
              move with it, onto whichever element is the flex item. */}
          <PortraitCard
            src={HERO_PHOTO_LINK}
            alt="Andre Giske"
            className="self-center lg:self-auto"
          />
        </div>
      </div>
    </section>
  );
};
