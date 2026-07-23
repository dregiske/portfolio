import "./Photo.css";

type PhotoProps = {
  /** Path to the JPEG. The WebP beside it is derived by swapping the extension. */
  src: string;
  alt: string;
  className?: string;
  /** Intrinsic size of the file — see the note below. */
  width: number;
  height: number;
  /**
   * Set on images that are already on screen before any scrolling. Everything
   * else waits until it is near the viewport.
   */
  priority?: boolean;
};

/**
 * An `<img>` that prefers WebP and falls back to the JPEG beside it.
 *
 * Both files come out of `scripts/optimize-images.sh` as a pair, which is why
 * the WebP path is just the source with its extension swapped. Only one of the
 * two is ever downloaded — the browser chooses before it fetches.
 *
 * `width`/`height` are the pixel size of the file, not the size it renders at.
 * They are there to give the browser the aspect ratio before the bytes arrive,
 * so a lazily-loaded image can't shove the page around as it lands.
 */
export function Photo({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
}: PhotoProps) {
  return (
    <picture className="photo">
      <source srcSet={src.replace(/\.[^.]+$/, ".webp")} type="image/webp" />
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}
