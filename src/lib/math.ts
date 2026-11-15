/** Small numeric helpers shared by the animation engines. */

export const clamp = (x: number, lo: number, hi: number) =>
  x < lo ? lo : x > hi ? hi : x;

export const clamp01 = (x: number) => clamp(x, 0, 1);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
