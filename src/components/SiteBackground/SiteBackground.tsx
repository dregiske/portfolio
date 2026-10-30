import type { ScrollMorph } from "@/lib/useScrollMorph";
import { HalftoneLayer } from "@/components/HalftoneLayer/HalftoneLayer";
import { AuraLayer } from "./AuraLayer";
import "./SiteBackground.css";

/**
 * The whole site's background: a fixed stack of full-screen canvases behind
 * everything, one per layer, back to front.
 *
 *   AuraLayer      z-0  monochrome clouds over a flat base
 *   HalftoneLayer  z-1  the three-ink halftone field
 *
 * Deliberately not per-section: sections are transparent and scroll over this,
 * so there is never a seam between them — the background is one continuous
 * piece of weather that the sections happen to sit in front of.
 *
 * Each layer owns its canvas, its clock, its redraw budget and the color tokens
 * it reads, so a layer can be added, removed or swapped here without touching
 * the others.
 *
 * ARCHIVED — the morphing dot field (wave → globe → streams → starfield →
 * mirrored wave). `src/lib/dotField.ts` is untouched and simply no longer
 * imported. To bring it back, restore the dots half of this component from
 * git history (the commit before the halftone landed): a desktop-only canvas
 * at `z-[1]` driven by `createDotField` / `renderDotField`, reading
 * `--dot-color`.
 */
export function SiteBackground({ morph }: { morph: ScrollMorph }) {
  return (
    <>
      <AuraLayer morph={morph} />
      <HalftoneLayer morph={morph} />
    </>
  );
}
