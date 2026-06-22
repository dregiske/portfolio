import { useRef } from "react";
import { TONES } from "@/constants/tones";
import { useConstellation } from "@/lib/useConstellation";
import { Section } from "@/components/Section/Section";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { Tag } from "@/components/Tag/Tag";
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

// Two layouts in a normalized 1000×1000 virtual space. The live layout is a
// per-node blend between them, driven by container width — so the single
// constellation morphs continuously from horizontal (wide) to vertical (narrow).
// homesWide is the original landscape spread; homesTall is a two-column zigzag,
// index-matched so each node glides between its two homes without crossing.
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
  [330, 250],
  [312, 80],
  [688, 230],
  [700, 90],
  [706, 370],
  [322, 430],
  [338, 620],
  [700, 650],
  [694, 510],
  [686, 790],
  [308, 820],
  [704, 920],
];

const VW = 1000;
const VH = 1000;
const H_WIDE = 520; // field height (px) when fully horizontal
const H_TALL = 760; // field height (px) when fully vertical
// Blend factor: t=0 at WIDE_AT px wide, t=1 at TALL_AT px wide.
const WIDE_AT = 900;
const TALL_AT = 480;

const tints = TONES.map((tone) => `skill-node--${tone}`);

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

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
    // Blend each home + the field height between the wide and tall layouts,
    // driven by container width, so the constellation morphs as it narrows.
    layout: (box, setHome) => {
      const t = clamp01((WIDE_AT - box.clientWidth) / (WIDE_AT - TALL_AT));
      for (let i = 0; i < skills.length; i++) {
        setHome(
          i,
          lerp(homesWide[i][0], homesTall[i][0], t),
          lerp(homesWide[i][1], homesTall[i][1], t),
        );
      }
      return lerp(H_WIDE, H_TALL, t);
    },
  });

  return (
    <Section id="skills" className="overflow-hidden">
      <SectionHeader
        index="03"
        eyebrow="Toolkit"
        title="My"
        accent="skills"
        tone="sky"
      />

      <Tag tone="sky" dot className="skills__hint">
        Drag the nodes!
      </Tag>

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
    </Section>
  );
};
