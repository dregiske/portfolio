import { BIO, PHOTOS, PROFILE } from "@/content/profile";
import { sectionHref } from "@/constants/sections";
import { SectionShell } from "@/components/SectionShell/SectionShell";
import { Photo } from "@/components/Photo/Photo";
import { Button } from "@/components/Button/Button";
import "./AboutMe.css";

export const AboutMe = () => {
  return (
    <SectionShell id="about" className="about">
      <div className="about__grid">
        <div className="about__photos">
          <Photo {...PHOTOS.aboutGroup} className="about__photo" />
          <Photo
            {...PHOTOS.aboutParticipants}
            className="about__photo about__photo--wide-only"
          />
        </div>

        {/* Right — the bio, free-standing and overlapping the photos. */}
        <div className="about__bio">
          {BIO.map((paragraph) => (
            <p key={paragraph} className="about__text">
              {paragraph}
            </p>
          ))}

          <div className="about__actions">
            <Button href={sectionHref("contact")}>Get in Touch</Button>
            {/* `download` forces a direct file download rather than opening the
                PDF inline in a new tab — inline viewing errors out on a lot of
                mobile browsers. Same-origin, so the download is honoured. */}
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
      </div>
    </SectionShell>
  );
};
