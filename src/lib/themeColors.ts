/**
 * Canvas ↔ CSS-token bridge.
 *
 * A canvas can't read `var(--dot-color)`, and the tokens may be hex, rgb(), or
 * a color-mix() the canvas would choke on. So we hand the value to a hidden
 * probe element and let the browser resolve it to a concrete rgb() we can both
 * hand to `fillStyle` and pick apart into numbers (radial-gradient stops need
 * `rgba(r,g,b,a)` at arbitrary alpha).
 *
 * The theme lives in a `.dark` class on <html>, so one MutationObserver on that
 * attribute is enough to re-resolve every token when the toggle flips.
 */

export type ResolvedColor = {
  /** Ready for `ctx.fillStyle`, e.g. "rgb(11, 31, 77)". */
  css: string;
  r: number;
  g: number;
  b: number;
};

export type ThemeColors<T extends string> = Record<T, ResolvedColor>;

const BLACK: ResolvedColor = { css: "rgb(0, 0, 0)", r: 0, g: 0, b: 0 };

function parse(color: string): ResolvedColor {
  const [r, g, b] = (color.match(/[\d.]+/g) ?? []).map(Number);
  if (r === undefined || g === undefined || b === undefined) return BLACK;
  return { css: `rgb(${r}, ${g}, ${b})`, r, g, b };
}

/**
 * Resolve `tokens` to concrete colors, call `onChange` with them immediately
 * and again on every theme switch. Returns a cleanup function.
 */
export function watchThemeColors<T extends string>(
  tokens: readonly T[],
  onChange: (colors: ThemeColors<T>) => void,
): () => void {
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  probe.setAttribute("aria-hidden", "true");
  document.body.appendChild(probe);

  const read = () => {
    const colors = {} as ThemeColors<T>;
    for (const token of tokens) {
      probe.style.color = `var(${token})`;
      colors[token] = parse(getComputedStyle(probe).color);
    }
    onChange(colors);
  };
  read();

  const observer = new MutationObserver(read);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => {
    observer.disconnect();
    probe.remove();
  };
}
