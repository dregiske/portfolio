import { useScrollMorph } from "@/lib/useScrollMorph";
import { SiteBackground } from "@/components/SiteBackground/SiteBackground";
import { MobileMenu } from "@/components/MobileMenu/MobileMenu";
import { Hero } from "@/sections/Hero/Hero";
import { AboutMe } from "@/sections/AboutMe/AboutMe";
import { Projects } from "@/sections/Projects/Projects";
import { Skills } from "@/sections/Skills/Skills";
import { Contacts } from "@/sections/Contacts/Contacts";
import { Footer } from "@/sections/Footer/Footer";
import "./Home.css";

/**
 * One scroll, three layers: the background canvases at the bottom, the five
 * transparent sections above them, and the chrome (footer, compact menu) on
 * top. The morph engine is
 * created here and shared by reference, so the artwork and the footer are
 * driven by the same numbers on the same frame.
 */
export const Home = () => {
  const morph = useScrollMorph();

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

      {/* Here rather than in the hero's top bar: its button stays fixed to
          the screen, and inside the hero's stacking context the sections
          below would paint over it. */}
      <MobileMenu />
    </div>
  );
};
