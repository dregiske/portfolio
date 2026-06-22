import { Globe } from "lucide-react";
import { PROJECT_PHOTO_LINK } from "@/constants/links";
import { TONES } from "@/constants/tones";
import { Section } from "@/components/Section/Section";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { Card } from "@/components/Card/Card";
import { Tag } from "@/components/Tag/Tag";
import "./Projects.css";

type Project = {
  name: string;
  description: string;
  link: string;
  /** Optional live domain to surface as a pill under the title, e.g. "www.thefraynews.com". */
  site?: string;
  tools: string[];
  photo: string;
  band: string;
};

const projects: Project[] = [
  {
    name: "News Recommendation Website",
    description:
      "A web application that provides personalized news recommendations using machine learning algorithms. Built with React, FastAPI, and scikit-learn.",
    link: "https://www.thefraynews.com",
    site: "www.thefraynews.com",
    tools: [
      "React",
      "FastAPI",
      "scikit-learn",
      "Nginx",
      "Python",
      "TypeScript",
      "JWT",
      "NewsAPI",
    ],
    photo: "newspaper.jpg",
    band: "project-card__band--sky",
  },
  {
    name: "Similar Product Recommender",
    description:
      "A product recommendation system that suggests similar products based on user preferences. Developed using Python, Flask, and collaborative filtering techniques.",
    link: "https://github.com/dregiske/product_recommendation_model",
    tools: [
      "Python",
      "Flask",
      "Collaborative Filtering",
      "K-Nearest-Neighbors",
    ],
    photo: "products.jpg",
    band: "project-card__band--butter",
  },
  {
    name: "Graph Project",
    description:
      "A C++ application that implements various graph algorithms, including Dijkstra's and A* for shortest pathfinding, and Prim's and Kruskal's for minimum spanning trees.",
    link: "https://github.com/dregiske/graph-project",
    tools: [
      "C++",
      "Graph Algorithms",
      "csv-parser",
      "Graph Theory",
      "Path Optimization",
    ],
    photo: "graph.jpg",
    band: "project-card__band--lilac",
  },
  {
    name: "Cash Out Poker Bank",
    description:
      "A automated home game poker banking app. Made to make home games enjoyable, avoiding hand calculations and providing stats overtime and between friends.",
    link: "https://cashoutpoker.net",
    site: "www.cashoutpoker.net",
    tools: [
      "Nginx",
      "Data Anaylsis",
      "Python",
      "TypeScript",
      "PostgreSQL",
      "TailwindCSS",
      "FastAPI",
    ],
    photo: "Cashoutpoker.png",
    band: "project-card__band--sky",
  },
];

export const Projects = () => {
  return (
    <Section id="projects">
      <SectionHeader
        index="02"
        eyebrow="Work"
        title="Featured"
        accent="projects"
        tone="clay"
      />

      <div className="projects__grid">
        {projects.map((project) => (
          <Card as="article" key={project.name} className="project-card">
            <div className={`project-card__band ${project.band}`}>
              <img
                src={`${PROJECT_PHOTO_LINK}${project.photo}`}
                alt={project.name}
                className="project-card__img"
              />
            </div>
            <div className="project-card__body">
              <h3 className="project-card__title">{project.name}</h3>
              {project.site && (
                <a
                  href={`https://${project.site}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-card__site"
                >
                  <Globe className="project-card__site-icon" />
                  {project.site}
                </a>
              )}
              <p className="project-card__desc">{project.description}</p>
              <div className="project-card__tags">
                {project.tools.map((tool, toolKey) => (
                  <Tag key={tool} tone={TONES[toolKey % TONES.length]}>
                    {tool}
                  </Tag>
                ))}
              </div>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card__link"
              >
                View Project →
              </a>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
};
