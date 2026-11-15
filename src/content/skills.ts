import type { Skill } from "./types";

export const SKILLS: Skill[] = [
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

/**
 * Where each skill's node rests, in a 1000×1000 virtual space, for each side
 * of the site breakpoint — one entry per skill, in `SKILLS` order. Switching
 * layouts moves each node's home and the constellation glides it there.
 *
 * `wide` is a landscape spread; `tall` is a loose, uneven scatter for phones,
 * placed by measured node size so no two pills touch at ~330px wide. Add or
 * reorder a skill and both lists need the same change.
 */
export const SKILL_HOMES: {
  wide: [number, number][];
  tall: [number, number][];
} = {
  wide: [
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
  ],
  tall: [
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
  ],
};
