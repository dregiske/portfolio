import { Code, User, Briefcase } from "lucide-react";
import { RESUME_LINK } from "@/constants/links";

const features = [
  {
    icon: Code,
    title: "Python Programmer",
    text: "Creating applications and scripts using Python and modern frameworks.",
    tint: "bg-c-clay",
    ink: "text-d-clay",
  },
  {
    icon: User,
    title: "GitHub Experience",
    text: "Familiar with all the necessary git tools and commands for collaborative work.",
    tint: "bg-c-sky",
    ink: "text-d-blue",
  },
  {
    icon: Briefcase,
    title: "Agile Developer",
    text: "Experience with the Agile development process, ready for real-world application.",
    tint: "bg-c-lilac",
    ink: "text-d-plum",
  },
];

export const AboutMe = () => {
  return (
    <section id="about" className="py-24 px-6 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-d-teal mb-2.5">
            01 — About
          </div>
          <h2 className="font-serif font-normal text-5xl md:text-6xl leading-none text-foreground">
            About <span className="italic text-d-teal">me</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-14 items-start">
          {/* Left — intro card */}
          <div className="bg-c-mint rounded-2xl p-10">
            <h3 className="font-serif font-normal text-3xl leading-tight mb-5 text-foreground">
              Hello world! My name is Andre Giske.
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              I'm a passionate Computer Science &amp; Engineering student with a
              keen interest in backend design and full-stack development. I love
              exploring new technologies and applying them to solve real-world
              problems.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              In my free time I work on personal projects, contribute to
              open-source, and stay current with the latest in tech.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Always eager to connect and explore opportunities. Reach out if
              you'd like to collaborate or just chat about technology!
            </p>

            <div className="flex flex-wrap gap-3.5 mt-8">
              <a
                href="#contact"
                className="font-mono text-xs uppercase tracking-widest px-5 py-3 rounded-full bg-ink text-egg hover:opacity-90 transition-opacity"
              >
                Get in Touch
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={RESUME_LINK}
                className="font-mono text-xs uppercase tracking-widest px-5 py-3 rounded-full border border-ink/20 text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                Download Résumé →
              </a>
            </div>
          </div>

          {/* Right — feature cards */}
          <div className="flex flex-col gap-4.5">
            {features.map(({ icon: Icon, title, text, tint, ink }, key) => (
              <div
                key={key}
                className="flex gap-5 items-start bg-card border border-rule rounded-2xl p-6"
              >
                <div
                  className={`flex-none w-13 h-13 rounded-full ${tint} flex items-center justify-center`}
                >
                  <Icon className={`h-6 w-6 ${ink}`} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1.5 text-foreground">
                    {title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
