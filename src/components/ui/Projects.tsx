const projects = [
  {
    name: "News Recommendation Website",
    description:
      "A web application that provides personalized news recommendations using machine learning algorithms. Built with React, FastAPI, and scikit-learn.",
    link: "https://www.thefraynews.com",
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
    photo: "/newspaper.jpg",
    band: "bg-c-sky",
  },
  {
    name: "Similar Product Recommender",
    description:
      "A product recommendation system that suggests similar products based on user preferences. Developed using Python, Flask, and collaborative filtering techniques.",
    link: "https://github.com/dregiske/product_recommendation_model",
    tools: ["Python", "Flask", "Collaborative Filtering", "K-Nearest-Neighbors"],
    photo: "/products.jpg",
    band: "bg-c-butter",
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
    photo: "/graph.jpg",
    band: "bg-c-lilac",
  },
];

// Pastel tint + deep-ink pairs cycled across tool badges
const badgeTints = [
  "bg-c-clay text-d-clay",
  "bg-c-mint text-d-teal",
  "bg-c-sky text-d-blue",
  "bg-c-lilac text-d-plum",
  "bg-c-butter text-[#8a6a2a]",
];

export const Projects = () => {
  return (
    <section id="projects" className="py-24 px-6 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-d-clay mb-2.5">
            02 — Work
          </div>
          <h2 className="font-serif font-normal text-5xl md:text-6xl leading-none text-foreground">
            Featured <span className="italic text-d-clay">projects</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {projects.map((project, key) => (
            <article
              key={key}
              className="bg-card border border-rule rounded-2xl overflow-hidden flex flex-col"
            >
              <div className={`${project.band} p-3.5`}>
                <img
                  src={project.photo}
                  alt={project.name}
                  className="rounded-lg object-cover h-44 w-full"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-semibold text-xl leading-tight mb-3 text-foreground">
                  {project.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tools.map((tool, toolKey) => (
                    <span
                      key={toolKey}
                      className={`font-mono text-[11px] px-2.5 py-1.5 rounded-full ${
                        badgeTints[toolKey % badgeTints.length]
                      }`}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto font-mono text-xs uppercase tracking-[0.08em] text-primary hover:underline"
                >
                  View Project →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
