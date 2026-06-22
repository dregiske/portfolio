import { Background } from "@/sections/Background/Background";
import { Navbar } from "@/sections/Navbar/Navbar";
import { Hero } from "@/sections/Hero/Hero";
import { AboutMe } from "@/sections/AboutMe/AboutMe";
import { Projects } from "@/sections/Projects/Projects";
import { Skills } from "@/sections/Skills/Skills";
import { Contacts } from "@/sections/Contacts/Contacts";
import { Footer } from "@/sections/Footer/Footer";
import "./Home.css";

export const Home = () => {
  return (
    <div className="home">
      <Background />
      <div className="home__fg">
        <Hero />
        <Navbar />
        <main>
          <AboutMe />
          <Projects />
          <Skills />
          <Contacts />
        </main>
        <Footer />
      </div>
    </div>
  );
};
