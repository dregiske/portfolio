import type { ScrollMorph } from "@/lib/useScrollMorph";
import { AuraLayer } from "./AuraLayer";
import { KoiLayer } from "./KoiLayer";
import "./SiteBackground.css";

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
 * Each layer owns its canvas, its clock, its redraw budget and the color tokens
 * it reads, so a layer can be added, removed or swapped here without touching
 * the others.
 */
export function SiteBackground({ morph }: { morph: ScrollMorph }) {
  return (
    <>
      <AuraLayer morph={morph} />
      <KoiLayer />
    </>
  );
}
