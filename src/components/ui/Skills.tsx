'use client';

const skills = [
  { name: "Python", level: 95, category: "Languages" },
  { name: "JavaScript", level: 90, category: "Languages" },
  { name: "TypeScript", level: 85, category: "Languages" },
  { name: "C++", level: 80, category: "Languages" },
  { name: "C", level: 80, category: "Languages" },
  { name: "Java", level: 80, category: "Languages" },
  { name: "SQL", level: 80, category: "Languages" },

  { name: "React", level: 90, category: "Frameworks" },
  { name: "SQLAlchemy", level: 85, category: "Frameworks" },
  { name: "Numpy", level: 80, category: "Frameworks" },
  { name: "Pandas", level: 75, category: "Frameworks" },
  { name: "FastAPI", level: 95, category: "Frameworks" },
  { name: "scikit-learn", level: 75, category: "Frameworks" },

  { name: "Machine Learning", level: 80, category: "Technologies" },
  { name: "Data Analysis", level: 85, category: "Technologies" },
  { name: "Web Development", level: 90, category: "Technologies" },

  { name: "Docker", level: 80, category: "Tools" },
  { name: "Git", level: 90, category: "Tools" },
]

export const Skills = () => {
  return (
	<section id="skills" className="py-24 px-4 relative">
	  <div className="container mx-auto max-w-5xl">
		<h2 className="text-3xl md:text-4xl font-bold mb-12 text-center border-b pb-4">
		  My <span className="text-primary">Skills</span>
		</h2>

		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
		  {skills.map((skill, key) => (
			<div
			  key={key}
			  className="bg-secondary/70 p-6 rounded-lg shadow-md card-hover"
			>
			  <div className="text-left mb-4">
				<h3 className="font-semibold text-lg">
				  {skill.name}
				</h3>
			  </div>
			  <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
			    <div className="bg-primary h-2 rounded-full origin-left animate-[grow_1s_ease-in-out_forwards]" style={{ width: `${skill.level}%` }}></div>
			  </div>
			</div>
		  ))}
		</div>
	  </div>
	</section>
  );
}