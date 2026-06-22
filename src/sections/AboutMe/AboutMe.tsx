import { Code, User, Briefcase, type LucideIcon } from "lucide-react";
import { RESUME_LINK } from "@/constants/links";
import { type Tone } from "@/constants/tones";
import { Section } from "@/components/Section/Section";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { Card } from "@/components/Card/Card";
import { IconCircle } from "@/components/IconCircle/IconCircle";
import { Pill } from "@/components/Pill/Pill";
import "./AboutMe.css";

type Feature = {
  icon: LucideIcon;
  title: string;
  text: string;
  tone: Tone;
  glyphClass: string;
};

const features: Feature[] = [
  {
    icon: Code,
    title: "Python Programmer",
    text: "Extensive knowledge in creating applications using Python and modern frameworks.",
    tone: "clay",
    glyphClass: "about-feature__glyph--clay",
  },
  {
    icon: User,
    title: "GitHub Experience",
    text: "Familiar with all the necessary git / GitHub tools and commands for collaborative work.",
    tone: "sky",
    glyphClass: "about-feature__glyph--blue",
  },
  {
    icon: Briefcase,
    title: "Agile Developer",
    text: "Experience with the Agile development process, ready for real-world application.",
    tone: "lilac",
    glyphClass: "about-feature__glyph--plum",
  },
];

export const AboutMe = () => {
  return (
    <Section id="about">
      <SectionHeader
        index="01"
        eyebrow="About"
        title="About"
        accent="me"
        tone="mint"
      />

      <div className="about__grid">
        {/* Left — intro card */}
        <Card variant="tinted" tone="mint" className="about__card">
          <h3 className="about__heading">
            Hello world! My name is{" "}
            <span className="about__name">Andre Giske</span>.
          </h3>
          <p className="about__text">
            I'm a passionate Computer Science &amp; Engineering student with a
            keen interest in backend design and full-stack development. I love
            exploring new technologies and applying them to solve real-world
            problems.
          </p>
          <p className="about__text">
            In my free time I work on personal projects, contribute to
            open-source, and stay current with the latest in tech.
          </p>
          <p className="about__text">
            Always eager to connect and explore opportunities. Reach out if
            you'd like to collaborate or just chat about technology!
          </p>

          <div className="about__actions">
            <Pill href="#contact" variant="solid" className="px-5 py-3">
              Get in Touch
            </Pill>
            <Pill
              href={RESUME_LINK}
              variant="solid"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-tone-terracotta"
            >
              Download Résumé →
            </Pill>
          </div>
        </Card>

        {/* Right — feature cards */}
        <div className="about__features">
          {features.map(({ icon: Icon, title, text, tone, glyphClass }) => (
            <Card key={title} className="about-feature">
              <IconCircle size="md" bg={tone}>
                <Icon className={`about-feature__glyph ${glyphClass}`} />
              </IconCircle>
              <div>
                <h4 className="about-feature__title">{title}</h4>
                <p className="about-feature__text">{text}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
};
