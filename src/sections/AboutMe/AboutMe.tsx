import {
  ABOUT_PHOTO_LINK,
  ABOUT_PHOTO_2_LINK,
  RESUME_LINK,
} from "@/constants/links";
import { SectionShell } from "@/components/SectionShell/SectionShell";
import { Photo } from "@/components/Photo/Photo";
import { Pill } from "@/components/Pill/Pill";
import "./AboutMe.css";

export const AboutMe = () => {
  return (
    <SectionShell id="about" title="About" className="about">
      <div className="about__grid">
        <div className="about__photos">
          <Photo
            src={ABOUT_PHOTO_LINK}
            alt="Andre with the ACM group at UC San Diego"
            className="about__photo"
            width={1100}
            height={616}
          />
          <Photo
            src={ABOUT_PHOTO_2_LINK}
            alt="ACM event participants at UC San Diego"
            className="about__photo about__photo--wide-only"
            width={1100}
            height={825}
          />
        </div>

        {/* Right — the bio, free-standing and overlapping the photos. Its
            paragraphs are `data-halftone-quiet`: the halftone thins its dots
            out behind them (see HalftoneLayer), so the type reads clean
            without a shadow or a backing. */}
        <div className="about__bio">
          <p className="about__text" data-halftone-quiet>
            I'm a Computer Science &amp; Engineering student with a keen
            interest in backend design and full-stack development. I love
            exploring new technologies and applying them to solve real-world
            problems.
          </p>
          <p className="about__text" data-halftone-quiet>
            In my free time I work on personal projects, contribute to
            open-source, and surf the San Diego beaches. Always eager to
            connect, so reach out if you'd like to collaborate or just chat!
          </p>

          <div className="about__actions">
            <Pill href="#contact" variant="solid">
              Get in Touch
            </Pill>
            {/* `download` forces a direct file download rather than opening the
                PDF inline in a new tab — inline viewing errors out on a lot of
                mobile browsers. Same-origin, so the download is honoured. */}
            <Pill
              href={RESUME_LINK}
              variant="outline"
              download
              rel="noopener noreferrer"
            >
              Résumé
            </Pill>
          </div>
        </div>
      </div>
    </SectionShell>
  );
};
