import { SECTIONS } from "@/constants/sections";
import { useScrollMorph } from "@/lib/useScrollMorph";
import { SiteBackground } from "@/components/SiteBackground/SiteBackground";
import { Hero } from "@/sections/Hero/Hero";
import { AboutMe } from "@/sections/AboutMe/AboutMe";
import { Projects } from "@/sections/Projects/Projects";
import { Skills } from "@/sections/Skills/Skills";
import { Contacts } from "@/sections/Contacts/Contacts";
import { Footer } from "@/sections/Footer/Footer";
import "./Home.css";

/**
 * One scroll, three layers: the background canvases at the bottom, the five
 * transparent sections above them, and the chrome on top. The morph engine is
 * created here and shared by reference, so the artwork and the footer are
 * driven by the same numbers on the same frame.
 *
 * ARCHIVED — the bottom navigation bar (`ScrollIndicator`: the progress line
 * over the five sections). Navigation is the top bar now: the nav pill when
 * wide, the dropdown menu when compact. The component is untouched in
 * `src/components/ScrollIndicator/`, and the engine still computes the
 * `frac` it reads. To restore it, import it and render
 * `<ScrollIndicator morph={morph} />` before `<Footer />`, then put back the
 * bottom padding that kept content clear of it: `pb-24` on
 * `.section-shell__inner`, and the hero's bottom pad of
 * `clamp(90px, 118px - 2vw, 112px)` (with 355px in `--hero-portrait-w`).
 */
export const Home = () => {
  const morph = useScrollMorph(SECTIONS);

  return (
    <div className="home">
      <SiteBackground morph={morph} />

      <main className="home__content">
        <Hero />
        <AboutMe />
        <Projects />
        <Skills />
        <Contacts />
      </main>

      <Footer morph={morph} />
    </div>
  );
};
