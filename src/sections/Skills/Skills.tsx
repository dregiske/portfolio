import { useRef } from "react";
import { TONES } from "@/constants/tones";
import { useConstellation } from "@/lib/useConstellation";
import { isWide } from "@/lib/breakpoint";
import { SectionShell } from "@/components/SectionShell/SectionShell";
import "./Skills.css";

type Skill = { name: string; level: number };

const skills: Skill[] = [
  { name: "Python", level: 95 },
  { name: "TypeScript", level: 85 },
  { name: "C++", level: 80 },
  { name: "Java", level: 80 },
  { name: "SQL", level: 80 },
  { name: "React", level: 90 },
  { name: "SQLAlchemy", level: 85 },
  { name: "Numpy", level: 80 },
  { name: "FastAPI", level: 95 },
  { name: "Nginx", level: 75 },
  { name: "Docker", level: 80 },
  { name: "Git", level: 90 },
];

// Two layouts in a normalized 1000×1000 virtual space, switched at the site
// breakpoint (`@/lib/breakpoint`) along with everything else. The switch moves
// each node's *home*; the spring in `useConstellation` then glides the node
// there, so the change animates instead of snapping.
// homesWide is the original landscape spread; homesTall is a loose, uneven
// scatter for phones, placed by measured node size so no two pills touch at
// ~330px wide. (It was a strict two-column zigzag, which read as a grid.)
const homesWide: [number, number][] = [
  [181, 238],
  [377, 181],
  [589, 263],
  [779, 198],
  [900, 362],
  [143, 565],
  [347, 590],
  [559, 648],
  [760, 573],
  [903, 663],
  [256, 819],
  [650, 844],
];
const homesTall: [number, number][] = [
  [581, 210], // Python
  [275, 65], // TypeScript
  [153, 282], // C++
  [856, 323], // Java
  [703, 468], // SQL
  [367, 395], // React
  [520, 726], // SQLAlchemy
  [810, 629], // Numpy
  [275, 556], // FastAPI
  [153, 839], // Nginx
  [703, 879], // Docker
  [765, 113], // Git
];

const VW = 1000;
const VH = 1000;
const H_WIDE = 520; // field height (px), wide layout
const H_TALL = 620; // field height (px), compact — trimmed so the phone
// Skills section isn't taller than the viewport.

const tints = TONES.map((tone) => `skill-node--${tone}`);

export const Skills = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeEls = useRef<(HTMLElement | null)[]>([]);

  useConstellation({
    boxRef,
    canvasRef,
    nodeEls,
    count: skills.length,
    vw: VW,
    vh: VH,
    // Free to roam the whole Skills section, like the Contact socials. The
    // section's own overflow does the clipping.
    roam: "section",
    // Pick the layout for the current side of the breakpoint. Within either,
    // homes are in virtual units, so the spread still scales with the width.
    layout: (_box, setHome) => {
      const wide = isWide();
      const homes = wide ? homesWide : homesTall;
      homes.forEach(([hx, hy], i) => setHome(i, hx, hy));
      return wide ? H_WIDE : H_TALL;
    },
  });

  return (
    <SectionShell
      id="skills"
      title="Skills"
      className="overflow-hidden"
    >
      <div ref={boxRef} className="constellation">
        <canvas ref={canvasRef} className="constellation__canvas" />
        {skills.map((skill, i) => {
          const scale = 0.92 + ((skill.level - 74) / 26) * 0.55;
          return (
            <div
              key={skill.name}
              ref={(el) => {
                nodeEls.current[i] = el;
              }}
              className={`skill-node ${tints[i % tints.length]}`}
              style={{
                padding: `${9 * scale}px ${16 * scale}px`,
                fontSize: `${13.5 * scale}px`,
              }}
            >
              {skill.name}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
};
