import { SECTION_CARD_SM, SECTION_HEADING } from "@/constants/theme";

const skills = [
  { name: "Python", level: 95, category: "Languages" },
  { name: "TypeScript", level: 85, category: "Languages" },
  { name: "C++", level: 80, category: "Languages" },
  { name: "Java", level: 80, category: "Languages" },
  { name: "SQL", level: 80, category: "Languages" },

  { name: "React", level: 90, category: "Frameworks" },
  { name: "SQLAlchemy", level: 85, category: "Frameworks" },
  { name: "Numpy", level: 80, category: "Frameworks" },
  { name: "FastAPI", level: 95, category: "Frameworks" },
  { name: "scikit-learn", level: 75, category: "Frameworks" },

  { name: "Docker", level: 80, category: "Tools" },
  { name: "Git", level: 90, category: "Tools" },
];

export const Skills = () => {
  return (
    <section id="skills" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className={SECTION_HEADING}>
          My <span className="text-primary">Skills</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, key) => (
            <div
              key={key}
              className={`${SECTION_CARD_SM} hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className="text-left mb-4">
                <h3 className="font-semibold text-lg">{skill.name}</h3>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full origin-left animate-[grow_1s_ease-in-out_forwards]"
                  style={{ width: `${skill.level}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
