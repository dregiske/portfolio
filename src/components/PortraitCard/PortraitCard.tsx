import { cn } from "@/lib/utils";
import { Photo } from "@/components/Photo/Photo";
import "./PortraitCard.css";

type PortraitCardProps = {
  src: string;
  alt: string;
  className?: string;
};

/**
 * The hero's photo: a soft-shadowed rounded frame that crops to fill.
 *
 * Deliberately not lazy — this is the largest thing in the first viewport, so
 * it *is* the page's largest-contentful-paint. Telling the browser it matters
 * gets it in flight before the images further down the page.
 */
export function PortraitCard({ src, alt, className }: PortraitCardProps) {
  return (
    <div className={cn("portrait-card", className)}>
      <Photo
        src={src}
        alt={alt}
        className="portrait-card__img"
        width={450}
        height={800}
        priority
      />
    </div>
  );
}
