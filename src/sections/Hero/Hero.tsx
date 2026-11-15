import { INTRO } from "@/constants/intro";
import { sectionHref } from "@/constants/sections";
import { PHOTOS, PROFILE, TAGLINE } from "@/content/profile";
import { TopBar } from "@/components/TopBar/TopBar";
import { PortraitCard } from "@/components/PortraitCard/PortraitCard";
import { Typewriter } from "@/components/Typewriter/Typewriter";
import { Button } from "@/components/Button/Button";
import "./Hero.css";

/**
 * The opening, read top to bottom in one glance: who (the name, edge to edge
 * of the content measure), what (the tagline, each line typing itself at its
 * own pace) and what next (the two actions). Wide, the portrait takes its own
 * column beside the tagline, so no text ever sits on the photo. Compact, it
 * follows the actions.
 *
 * Timings live in `@/constants/intro` and the copy in `@/content/profile`, so
 * this section stays a description of *where* things go.
 */
export const Hero = () => {
  return (
    <section id="hero" className="hero">
      <div className="hero__inner">
        <TopBar />

        {/* Written in title case and lowercased by CSS, so screen readers and
            search results get the name properly capitalised. */}
        <h1 className="hero__wordmark">{PROFILE.name}</h1>

        <div className="hero__body">
          <div className="hero__intro">
            {/* One paragraph, three independently typed lines. Mapping over
                the paces rather than the strings is what ties each line to its
                own entry in the choreography. */}
            <p className="hero__tagline">
              {INTRO.tagline.map((pace, i) => (
                <Typewriter key={i} text={TAGLINE[i]} {...pace} />
              ))}
            </p>

            <div className="hero__actions">
              <Button href={sectionHref("contact")}>Get in touch</Button>
              {/* `download` forces a direct file download rather than opening
                  the PDF inline — inline viewing errors out on a lot of mobile
                  browsers. Same-origin, so the download is honoured. */}
              <Button
                href={PROFILE.resume}
                variant="outline"
                download
                rel="noopener noreferrer"
              >
                Résumé
              </Button>
            </div>
          </div>

          <PortraitCard {...PHOTOS.portrait} className="hero__portrait" />
        </div>
      </div>
    </section>
  );
};
