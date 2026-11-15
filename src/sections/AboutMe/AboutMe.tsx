import { CONTACT } from "@/content/contact";
import { BIO, PHOTOS } from "@/content/profile";
import { sectionHref } from "@/constants/sections";
import { SectionShell } from "@/components/SectionShell/SectionShell";
import { Photo } from "@/components/Photo/Photo";
import { Button } from "@/components/Button/Button";
import "./AboutMe.css";

/**
 * The bio beside a column of photos. Text first in the markup (and on the
 * left, wide) so it's what's read first; compact, CSS lifts the one photo
 * above it. The hero already carries the filled button, so this ends on a
 * single glass one.
 */
export const AboutMe = () => {
  return (
    <SectionShell id="about">
      <div className="about__grid">
        <div className="about__bio">
          {BIO.map((paragraph) => (
            <p key={paragraph} className="about__text">
              {paragraph}
            </p>
          ))}

          <Button href={sectionHref("contact")} variant="outline" className="about__link">
            {CONTACT.cta}
          </Button>
        </div>

        <div className="about__photos">
          <Photo {...PHOTOS.aboutGroup} className="about__photo" />
          <Photo
            {...PHOTOS.aboutParticipants}
            className="about__photo about__photo--wide-only"
          />
        </div>
      </div>
    </SectionShell>
  );
};
