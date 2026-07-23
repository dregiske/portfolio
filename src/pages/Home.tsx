import { SECTIONS } from "@/constants/sections";
import { useScrollMorph } from "@/lib/useScrollMorph";
import { SiteBackground } from "@/components/SiteBackground/SiteBackground";
import { ScrollIndicator } from "@/components/ScrollIndicator/ScrollIndicator";
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
 * created here and shared by reference, so the artwork, the progress line and
 * the footer are driven by the same numbers on the same frame.
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

      <ScrollIndicator morph={morph} />
      <Footer morph={morph} />
    </div>
  );
};
