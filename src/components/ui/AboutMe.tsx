"use client";

import { Code, User, Briefcase } from "lucide-react";
import { RESUME_LINK } from "@/constants/links";

export const AboutMe = () => {
  return (
    <section id="about" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center border-b pb-4">
          About <span className="text-primary">Me</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-secondary/70 p-8 rounded-lg shadow-md">
          {/* Left Side */}
          <div className="space-y-6 max-w-prose text-center md:text-left">
            <h3 className="text-xl font-semibold">
              Hi! My name is Andre Giske.
            </h3>
            <p className="text-muted-foreground">
              I'm a passionate Computer Science and Engineering student with a
              keen interest in Artificial Intelligence and Machine Learning. I
              love exploring new technologies and applying them to solve
              real-world problems.
            </p>
            <p className="text-muted-foreground">
              In my free time, I enjoy working on personal projects,
              contributing to open-source, and staying updated with the latest
              advancements in AI/ML.
            </p>
            <p className="text-muted-foreground">
              I'm always eager to connect with like-minded individuals and
              explore opportunities in the tech world. Feel free to reach out if
              you'd like to collaborate or just chat about technology!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
              <a
                href="#contact"
                className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors duration-300"
              >
                Get In Touch
              </a>
              <a
                href={RESUME_LINK}
                className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors duration-300"
              >
                Download Resume
              </a>
            </div>
          </div>

          {/* Right Side */}
          <div className="grid grid-cols-1 gap-6">
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Code className="h-6 w-6 text-primary" />
                </div>

                <div className="text-left">
                  <h4 className="font-semibold text-lg">Python Programmer</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Creating applications and scripts using Python and modern
                    frameworks.
                  </p>
                </div>
              </div>
            </div>

            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>

                <div className="text-left">
                  <h4 className="font-semibold text-lg">GitHub Experience</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Familiar with all the necessary git tools and commands for
                    collaborative work.
                  </p>
                </div>
              </div>
            </div>

            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>

                <div className="text-left">
                  <h4 className="font-semibold text-lg">Agile Developer</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Experiences in the Agile development process ready for
                    real-world application.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
