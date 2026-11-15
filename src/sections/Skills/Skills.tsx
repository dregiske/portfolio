import type { CSSProperties } from "react";
import { toneAt } from "@/constants/tones";
import { SKILLS, SKILL_HOMES } from "@/content/skills";
import { isWide } from "@/lib/breakpoint";
import { SectionShell } from "@/components/SectionShell/SectionShell";
import { Constellation } from "@/components/Constellation/Constellation";
import "./Skills.css";

/** The field's height in px on each side of the breakpoint. Compact is
 *  trimmed so the phone Skills section isn't taller than the viewport. */
const FIELD_HEIGHT = { wide: 520, tall: 620 };

/**
 * Node size follows proficiency: the weakest listed skill renders at
 * `MIN_SCALE` of the base pill, the strongest at `MAX_SCALE`.
 */
const LEVEL_RANGE = [74, 100] as const;
const MIN_SCALE = 0.92;
const MAX_SCALE = 1.47;
/** The base pill, at scale 1, in px. */
const BASE = { padY: 9, padX: 16, font: 13.5 };

function nodeStyle(level: number): CSSProperties {
  const [lo, hi] = LEVEL_RANGE;
  const scale = MIN_SCALE + ((level - lo) / (hi - lo)) * (MAX_SCALE - MIN_SCALE);
  return {
    padding: `${BASE.padY * scale}px ${BASE.padX * scale}px`,
    fontSize: `${BASE.font * scale}px`,
  };
}

export const Skills = () => (
  <SectionShell id="skills" className="overflow-hidden">
    <Constellation
      className="skills__field"
      items={SKILLS}
      toneOf={(_, i) => toneAt(i)}
      // Free to roam the whole section; its own overflow does the clipping.
      roam="section"
      // Homes are in virtual units, so the spread scales with the width; the
      // layout set switches at the site breakpoint, and the field's spring
      // glides each node to its new home.
      layout={(_box, setHome) => {
        const wide = isWide();
        const homes = wide ? SKILL_HOMES.wide : SKILL_HOMES.tall;
        homes.forEach(([hx, hy], i) => setHome(i, hx, hy));
        return wide ? FIELD_HEIGHT.wide : FIELD_HEIGHT.tall;
      }}
      renderNode={(skill, node) => (
        <div
          key={skill.name}
          {...node}
          className={`${node.className} skills__node`}
          style={nodeStyle(skill.level)}
        >
          {skill.name}
        </div>
      )}
    />
  </SectionShell>
);
