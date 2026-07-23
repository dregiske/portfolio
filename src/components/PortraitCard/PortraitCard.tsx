import { cn } from "@/lib/utils";
import "./PortraitCard.css";

type PortraitCardProps = {
  src: string;
  alt: string;
  className?: string;
};

/** The hero's photo: a soft-shadowed rounded frame that crops to fill. */
export function PortraitCard({ src, alt, className }: PortraitCardProps) {
  return (
    <div className={cn("portrait-card", className)}>
      <img src={src} alt={alt} className="portrait-card__img" />
    </div>
  );
}
