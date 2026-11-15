import { ArrowUpRight } from "lucide-react";
import { toneAt } from "@/constants/tones";
import { PROJECTS } from "@/content/projects";
import type { Project } from "@/content/types";
import { SectionShell } from "@/components/SectionShell/SectionShell";
import { Card } from "@/components/Card/Card";
import { Photo } from "@/components/Photo/Photo";
import { Tag } from "@/components/Tag/Tag";
import "./Projects.css";

/** Tags a card shows before counting the rest as "+N". */
const MAX_TAGS = 5;

/**
 * One project. The whole card is the link: the title's anchor stretches over
 * it (see `.project-card__title a`), so there's one target, one tab stop and
 * one accessible name, instead of a domain pill and a button that both went
 * to the same place.
 */
const ProjectCard = ({ project }: { project: Project }) => {
  const shown = project.tools.slice(0, MAX_TAGS);
  const more = project.tools.length - shown.length;

  return (
    <Card
      as="article"
      className={project.featured ? "project-card project-card--featured" : "project-card"}
    >
      <div className="project-card__media">
        <Photo {...project.image} alt="" className="project-card__img" />
      </div>

      <div className="project-card__body">
        <h3 className="project-card__title">
          <a href={project.link} target="_blank" rel="noopener noreferrer">
            {project.name}
          </a>
        </h3>
        <p className="project-card__summary">{project.summary}</p>
        <p className="project-card__desc">{project.description}</p>

        <ul className="project-card__tags" aria-label="Built with">
          {shown.map((tool, i) => (
            <li key={tool}>
              <Tag tone={toneAt(i)}>{tool}</Tag>
            </li>
          ))}
          {more > 0 && (
            <li className="project-card__more" aria-label={`and ${more} more`}>
              +{more}
            </li>
          )}
        </ul>

        {/* Decorative: the title link already covers the card. */}
        <div className="project-card__foot" aria-hidden="true">
          <span>{new URL(project.link).host.replace(/^www\./, "")}</span>
          <span className="project-card__visit">
            Visit
            <ArrowUpRight className="project-card__visit-glyph" />
          </span>
        </div>
      </div>
    </Card>
  );
};

/**
 * The featured project across the top, wide, then the rest in a grid below
 * it — everything visible at once, so a visitor can compare at a glance.
 */
export const Projects = () => {
  const featured = PROJECTS.find((p) => p.featured);
  const rest = PROJECTS.filter((p) => p !== featured);

  return (
    <SectionShell id="projects">
      <div className="projects">
        {featured && <ProjectCard project={featured} />}
        <div className="projects__grid">
          {rest.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
};
