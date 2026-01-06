'use client';

const projects = [
  { 
	name: "News Recommendation Website",
	description: "A web application that provides personalized news recommendations using machine learning algorithms. Built with React, FastAPI, and scikit-learn.",
	link: "https://github.com/dregiske/personal-news-rec",
	tools: ["React", "FastAPI", "scikit-learn"],
	photo: "/newspaper.jpg",
  },
  { 
	name: "Similar Product Recommender",
	description: "A product recommendation system that suggests similar products based on user preferences. Developed using Python, Flask, and collaborative filtering techniques.",
	link: "https://github.com/dregiske/product_recommendation_model",
	tools: ["Python", "Flask", "Collaborative Filtering"],
	photo: "/products.jpg",
  },
  {
	name: "Graph Project",
	description: "A C++ application that implements various graph algorithms, including Dijkstra's and A* for shortest pathfinding, and Prim's and Kruskal's for minimum spanning trees.",
	link: "https://github.com/dregiske/graph-project",
	tools: ["C++", "Graph Algorithms", "csv-parser"],
	photo: "/graph.jpg",
  },
]

export const Projects = () => {
  return (
	<section id="projects">
	  <div className="container mx-auto max-w-5xl py-24 px-4 relative">
		<h2 className="text-3xl md:text-4xl font-bold mb-12 text-center border-b pb-4">
		  Featured <span className="text-primary">Projects</span>
		</h2>

		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
		  {projects.map((project, key) => (
			<div
			  key={key}
			  className="bg-secondary/70 p-6 rounded-lg shadow-md card-hover"
			>
			  <div className="text-left mb-4">
				<img
				  src={project.photo}
				  className="bg-secondary rounded-md mb-4 object-cover h-40 w-full"
				/>

				<h3 className="font-semibold text-lg mb-2">
				  {project.name}
				</h3>
				<p className="text-muted-foreground mb-4">
				  {project.description}
				</p>
				<div className="mb-4">
				  {project.tools.map((tool, toolKey) => (
					<span
					  key={toolKey}
					  className="inline-block bg-primary/20 text-primary text-xs px-2 py-1 rounded-full mr-2 mb-2"
					>
					  {tool}
					</span>
				  ))}
				</div>
				<a
				  href={project.link}
				  target="_blank"
				  rel="noopener noreferrer"
				  className="text-primary font-medium hover:underline"
				>
				  View Project &rarr;
				</a>
			  </div>
			</div>
		  ))}
		</div>
	  </div>
	</section>
  );
}