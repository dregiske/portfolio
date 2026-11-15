import type { ScrollMorph } from "@/lib/useScrollMorph";
import { AuraLayer } from "./AuraLayer";
import { KoiLayer } from "./KoiLayer";

/**
 * The whole site's background: a fixed stack of full-screen canvases behind
 * everything, one per layer, back to front.
 *
 *   AuraLayer   monochrome clouds over a flat base
 *   KoiLayer    pixel koi swimming over the aura
 *
 * Deliberately not per-section: sections are transparent and scroll over this,
 * so there is never a seam between them — the background is one continuous
 * piece of weather that the sections happen to sit in front of.
 *
 * Each layer owns its canvas, its clock, its redraw budget, the color tokens
 * it reads and the shared layer styles, so a layer can be added, removed or
 * swapped here — or used on its own, as the 404 page does with the koi —
 * without touching the others.
 */
export function SiteBackground({ morph }: { morph: ScrollMorph }) {
  return (
    <>
      <AuraLayer morph={morph} />
      <KoiLayer />
    </>
  );
}
