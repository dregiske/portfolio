import { INTRO } from "@/constants/intro";
import { PHOTOS, PROFILE, TAGLINE } from "@/content/profile";
import { TopBar } from "@/components/TopBar/TopBar";
import { PortraitCard } from "@/components/PortraitCard/PortraitCard";
import { Typewriter } from "@/components/Typewriter/Typewriter";
import "./Hero.css";

/**
 * The opening: the name as a full-width wordmark across the top, and the
 * tagline at the foot, each of its lines typing itself at its own pace — the
 * timings all live in `@/constants/intro` and the copy in `@/content/profile`,
 * so this section stays a description of *where* things go.
 *
 * Wide, the portrait hangs off the bottom-right corner, straddling the seam
 * with About, and the tagline writes across it. Compact, it sits centred
 * between the wordmark and the tagline — it comes before the tagline in the
 * markup for that, and wide positions it absolutely, so order doesn't matter
 * there.
 */
export const Hero = () => {
  return (
    <section id="hero" className="hero">
      <div className="hero__inner">
        <TopBar />

        {/* Written in title case and lowercased by CSS, so screen readers and
            search results get the name properly capitalised. */}
        <h1 className="hero__wordmark">{PROFILE.name}</h1>

        <PortraitCard {...PHOTOS.portrait} className="hero__portrait" />

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
              <Typewriter key={i} text={TAGLINE[set][i]} {...pace} />
            ))}
          </p>
        ))}
      </div>
    </section>
  );
};
