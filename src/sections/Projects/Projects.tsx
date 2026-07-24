import { Globe } from "lucide-react";
import { PROJECT_PHOTO_LINK } from "@/constants/links";
import { TONES } from "@/constants/tones";
import { SectionShell } from "@/components/SectionShell/SectionShell";
import { Card } from "@/components/Card/Card";
import { Carousel } from "@/components/Carousel/Carousel";
import { Photo } from "@/components/Photo/Photo";
import { Tag } from "@/components/Tag/Tag";
import { useMediaQuery } from "@/lib/useMediaQuery";
import "./Projects.css";

type Project = {
  name: string;
  description: string;
  link: string;
  /** Optional live domain to surface as a pill under the title, e.g. "www.thefraynews.com". */
  site?: string;
  tools: string[];
  photo: string;
  /** Pixel size of the file in public/projects, so the card reserves its space. */
  photoSize: [number, number];
};

const projects: Project[] = [
  {
    name: "The Fray News",
    description:
      "A web application that provides personalized news recommendations. Using KNN machine learning algorithms and user preferences through interactions and topic filtering, this web app personalizes your feed to match what each user likes.",
    link: "https://www.thefraynews.com",
    site: "www.thefraynews.com",
    tools: [
      "React",
      "FastAPI",
      "scikit-learn",
      "Machine Learning",
      "Nginx",
      "Python",
      "TypeScript",
      "JWT",
      "Axios",
      "NewsAPI",
    ],
    photo: "thefraynews.jpg",
    photoSize: [750, 373],
  },
  {
    name: "Cash Out Poker Bank",
    description:
      "A automated home game poker banking app. Made to make home games enjoyable by servicing settlement calculations and denomination distrubutions. Also provides stats overtime and between friends!",
    link: "https://cashoutpoker.net",
    site: "www.cashoutpoker.net",
    tools: [
      "Data Anaylsis",
      "Python",
      "TypeScript",
      "PostgreSQL",
      "TailwindCSS",
      "React",
      "JWT",
      "FastAPI",
      "Swift",
    ],
    photo: "cashoutlogo.jpg",
    photoSize: [750, 348],
  },
  {
    name: "My Portfolio",
    description:
      "My fun and innovative portfolio, with interactive components, animated rendering, and theming. This website is meant to showcase my projects, skills, and myself as a programmer!",
    link: "https://andregiske.com",
    site: "www.andregiske.com",
    tools: [
      "TypeScript",
      "TailwindCSS",
      "UX/UI",
      "Digital Design",
      "Interactivity",
    ],
    photo: "code.jpg",
    photoSize: [750, 403],
  },
  {
    name: "Hemma",
    description:
      "A international social media platform that utilizes the widget space! Hemma users upload images of 'home' and compete for a spot on the leaderboard. Winners get to be featured as one of the most voted pictures of the week!",
    link: "https://hemmalive.com",
    site: "www.hemmalive.com",
    tools: [
      "Swift",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "iOS",
      "SwiftUI",
      "CDN",
      "Sentry",
    ],
    photo: "hemma.jpg",
    photoSize: [750, 389],
  },
];

const ProjectCard = ({ project }: { project: Project }) => (
  <Card as="article" className="project-card">
    <Photo
      src={`${PROJECT_PHOTO_LINK}${project.photo}`}
      alt={project.name}
      className="project-card__img"
      width={project.photoSize[0]}
      height={project.photoSize[1]}
    />
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
);

export const Projects = () => {
  // Three cards abreast where there's room, one on a phone.
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <SectionShell id="projects" num="03" eyebrow="WORK" title="Projects">
      <Carousel
        className="projects__carousel"
        itemsPerView={isDesktop ? 3 : 1}
        gap={16}
        autoPlay={5000}
      >
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </Carousel>
    </SectionShell>
  );
};
