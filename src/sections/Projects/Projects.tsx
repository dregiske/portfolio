import { Globe } from "lucide-react";
import { toneAt } from "@/constants/tones";
import { PROJECTS } from "@/content/projects";
import type { Project } from "@/content/types";
import { SectionShell } from "@/components/SectionShell/SectionShell";
import { Button } from "@/components/Button/Button";
import { Card } from "@/components/Card/Card";
import { Carousel } from "@/components/Carousel/Carousel";
import { Photo } from "@/components/Photo/Photo";
import { Tag } from "@/components/Tag/Tag";
import { useIsWide } from "@/lib/breakpoint";
import "./Projects.css";

const ProjectCard = ({ project }: { project: Project }) => (
  // Scrim, not glass: three of these tile most of the viewport, and a
  // backdrop blur over the animated background would re-blur it every frame.
  <Card as="article" variant="scrim" className="project-card">
    <Photo {...project.image} alt={project.name} className="project-card__img" />
    <div className="project-card__body">
      <h3 className="project-card__title">{project.name}</h3>
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="project-card__site"
      >
        <Globe className="project-card__site-icon" />
        {new URL(project.link).host}
      </a>
      <p className="project-card__desc">{project.description}</p>
      <div className="project-card__tags">
        {project.tools.map((tool, i) => (
          <Tag key={tool} tone={toneAt(i)}>
            {tool}
          </Tag>
        ))}
      </div>
      <Button
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="project-card__link"
      >
        Take a look
      </Button>
    </div>
  </Card>
);

export const Projects = () => {
  // Three cards abreast where there's room, one on a phone.
  const isWide = useIsWide();

  return (
    // `overflow-x-clip` contains the carousel's off-screen cards (up to
    // ~1350px past the edge on a phone) right here, instead of leaving the
    // page's sideways-scroll safety to `.home` alone. `clip`, not `hidden`:
    // hidden would make the section a scroll container, and tabbing to an
    // off-screen card would then scroll it sideways.
    <SectionShell id="projects" className="overflow-x-clip">
      <Carousel
        className="projects__carousel"
        itemsPerView={isWide ? 3 : 1}
        gap={16}
        autoPlay={5000}
        prevLabel="Previous projects"
        nextLabel="Next projects"
      >
        {PROJECTS.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </Carousel>
    </SectionShell>
  );
};
