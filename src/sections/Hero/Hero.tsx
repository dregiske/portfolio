import { HeroTitle } from "@/components/HeroTitle/HeroTitle";
import { HeroSubtitle } from "@/components/HeroSubtitle/HeroSubtitle";
import { Tag } from "@/components/Tag/Tag";
import { Pill } from "@/components/Pill/Pill";
import { HERO_PHOTO_LINK } from "@/constants/links";
import "./Hero.css";

export const Hero = () => {
  return (
    <section id="hero" className="hero">
      <div className="hero__inner">
        <div className="hero__grid">
          {/* Intro (LEFT) */}
          <div className="hero__intro">
            <Tag tone="clay" dot className="hero__badge">
              Portfolio — 2026
            </Tag>

            <HeroTitle title="Andre Giske" />

            <div className="hero__subtitle">
              <HeroSubtitle subtitle="CSE student at UC San Diego building backend systems & full-stack apps — somewhere between the terminal and the chairlift." />
            </div>

            <div className="hero__actions">
              <Pill href="#projects" variant="solid">
                View Work →
              </Pill>
              <Pill href="#contact" variant="outline">
                Get in Touch
              </Pill>
            </div>
          </div>

          {/* Photo (RIGHT) */}
          <div className="hero__photo">
            <div className="hero__frame">
              <img
                src={HERO_PHOTO_LINK}
                alt="Andre Giske"
                className="hero__img"
              />
            </div>
            <div className="hero__caption">
              <span>Fig. 01 — On the lift</span>
              <span>Big Bear, CA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
