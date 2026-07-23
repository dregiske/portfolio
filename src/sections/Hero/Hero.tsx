import { HERO_PHOTO_LINK } from "@/constants/links";
import { TopBar } from "@/components/TopBar/TopBar";
import { PortraitCard } from "@/components/PortraitCard/PortraitCard";
import "./Hero.css";

export const Hero = () => {
  return (
    <section id="hero" className="hero">
      <div className="hero__inner">
        <TopBar />

        <div className="hero__body">
          <div className="hero__intro">
            <span className="hero__greeting">hey, I'm</span>
            <h1 className="hero__title">Andre Giske</h1>
            <p className="hero__tagline">
              CSE student at UC San Diego building backend systems and
              full-stack apps, feel free to connect!
            </p>
          </div>

          {/* Centred while it's stacked under the text; back in the row at lg. */}
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
