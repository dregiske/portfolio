import { cn } from "@/lib/utils";
import { Photo } from "@/components/Photo/Photo";
import type { ImageAsset } from "@/content/types";
import "./PortraitCard.css";

type PortraitCardProps = ImageAsset & {
  alt: string;
  /** Sets the card's size and placement. */
  className?: string;
};

/**
 * A photo in a soft-shadowed rounded frame that crops to fill.
 *
 * Deliberately not lazy — it's used for the hero, the largest thing in the
 * first viewport, so it *is* the page's largest-contentful-paint. Telling the
 * browser it matters gets it in flight before the images further down.
 */
export function PortraitCard({ className, ...image }: PortraitCardProps) {
  return (
    <div className={cn("portrait-card", className)}>
      <Photo {...image} className="portrait-card__img" priority />
    </div>
  );
}
