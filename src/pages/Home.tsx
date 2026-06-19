import { BackgroundPaths } from "@/components/ui/shadcn-io/background-paths";

import { HeroTitle } from "@/components/ui/HeroTitle";
import { HeroSubtitle } from "@/components/ui/HeroSubtitle";
import { Navbar } from "@/components/ui/Navbar";
import { AboutMe } from "@/components/ui/AboutMe";
import { Projects } from "@/components/ui/Projects";
import { Skills } from "@/components/ui/Skills";
import { Contacts } from "@/components/ui/Contacts";
import { Footer } from "@/components/ui/Footer";

import { PROFILE_PHOTO_LINK } from "@/constants/links";

export const Home = () => {
  return (
    <div className="relative min-h-screen">
      {/* Foreground */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section id="hero" className="relative min-h-screen w-full">
          <div className="relative z-10 container mx-auto px-6 min-h-screen flex items-center pt-24 pb-16">
            <div className="w-full grid grid-cols-1 md:grid-cols-[1.12fr_0.88fr] gap-14 items-center">
              {/* Intro (LEFT) */}
              <div className="text-center md:text-left flex flex-col items-center md:items-start">
                <div className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-d-clay bg-c-clay px-3.5 py-1.5 rounded-full mb-7">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Portfolio — 2026
                </div>

                <HeroTitle title="Andre Giske" />

                <div className="mt-7">
                  <HeroSubtitle subtitle="CSE student at UC San Diego building backend systems & full-stack apps — somewhere between the terminal and the chairlift." />
                </div>

                <div className="flex flex-wrap gap-3.5 mt-9 justify-center md:justify-start">
                  <a
                    href="#projects"
                    className="font-mono text-xs uppercase tracking-widest px-6 py-3.5 rounded-full bg-ink text-egg hover:opacity-90 transition-opacity"
                  >
                    View Work →
                  </a>
                  <a
                    href="#contact"
                    className="font-mono text-xs uppercase tracking-widest px-6 py-3.5 rounded-full border border-rule text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    Get in Touch
                  </a>
                </div>
              </div>

              {/* Photo (RIGHT) */}
              <div className="relative w-full max-w-md mx-auto md:mx-0">
                <div className="absolute -top-3.5 -right-3.5 w-28 h-28 bg-c-sky rounded-full z-0" />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-c-butter rounded-full z-0" />
                <div className="relative z-10 rounded-lg overflow-hidden shadow-[0_22px_55px_rgba(26,23,20,0.18)]">
                  <img
                    src={PROFILE_PHOTO_LINK}
                    alt="Andre Giske"
                    className="w-full h-105 sm:h-120 object-cover"
                  />
                </div>
                <div className="relative z-10 flex justify-between mt-3.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  <span>Fig. 01 — On the lift</span>
                  <span>Big Bear, CA</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navbar */}
        <Navbar />

        <main>
          {/* Main Content */}
          <AboutMe />
          <Projects />
          <Skills />
          <Contacts />
        </main>

        {/* Background */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <BackgroundPaths />
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};
