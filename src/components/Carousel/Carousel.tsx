import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";
import "./Carousel.css";

const TRANSITION_MS = 500;

type CarouselProps = {
  children: ReactNode;
  /** How many items are visible at once. */
  itemsPerView?: number;
  /** Gap between items, in pixels. */
  gap?: number;
  /** Auto-advance period in ms. 0 (or reduced motion) disables autoplay. */
  autoPlay?: number;
  className?: string;
};

/**
 * A paginated slider: a fixed window of `itemsPerView` cards with a chevron on
 * each side to step through them, plus optional autoplay.
 *
 * Unlike a marquee it is still between steps — it only animates for the ~500ms
 * of a transition, so it doesn't tax the compositor while the reader is just
 * looking. The list loops endlessly in both directions: `itemsPerView` clones
 * are stitched onto each end, and stepping onto a clone silently snaps to its
 * real twin once the slide finishes.
 *
 * Readers who ask for reduced motion get instant steps and no autoplay.
 */
export function Carousel({
  children,
  itemsPerView = 3,
  gap = 20,
  autoPlay = 0,
  className,
}: CarouselProps) {
  const reduced = useReducedMotion();
  const items = Children.toArray(children);
  const n = items.length;
  const view = Math.max(1, Math.min(itemsPerView, n));

  // Clone `view` items onto each end so a step past either edge lands on a
  // frame identical to the opposite end, which we then snap to invisibly.
  const head = items.slice(n - view);
  const tail = items.slice(0, view);
  const extended = [...head, ...items, ...tail];
  const FIRST_REAL = view; // where items[0] sits in `extended`

  const viewportRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState(0);
  const [index, setIndex] = useState(FIRST_REAL);
  const [animate, setAnimate] = useState(true);
  const locked = useRef(false);
  const [autoplayKey, setAutoplayKey] = useState(0); // bump to restart the timer

  // Re-centre on the real items whenever the window size or item count changes.
  useEffect(() => {
    setIndex(view);
  }, [view, n]);

  // Measure one item from the live viewport width so the layout stays fluid.
  useLayoutEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const measure = () =>
      setItemWidth((vp.clientWidth - (view - 1) * gap) / view);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [view, gap]);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (locked.current) return;
      locked.current = true;
      setAnimate(!reduced);
      setIndex((i) => i + dir);
    },
    [reduced],
  );

  // The right chevron glides the cards to the right (a new card enters from the
  // left); the left chevron, the other way. Flip the signs to swap them.
  const shiftRight = useCallback(() => step(-1), [step]);
  const shiftLeft = useCallback(() => step(1), [step]);

  // Snap off a clone back onto its real twin once the slide settles.
  const normalise = useCallback(() => {
    locked.current = false;
    setIndex((i) => {
      if (i >= FIRST_REAL + n) {
        setAnimate(false);
        return i - n;
      }
      if (i < FIRST_REAL) {
        setAnimate(false);
        return i + n;
      }
      return i;
    });
  }, [FIRST_REAL, n]);

  // No transition fires under reduced motion, so settle the step right away.
  useEffect(() => {
    if (reduced && locked.current) normalise();
  }, [index, reduced, normalise]);

  // Re-enable animation on the frame after a silent snap has painted.
  useEffect(() => {
    if (animate) return;
    let raf = requestAnimationFrame(() =>
      (raf = requestAnimationFrame(() => setAnimate(true))),
    );
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  // Autoplay: step right on an interval, paused while the row is off-screen.
  const shiftRightRef = useRef(shiftRight);
  shiftRightRef.current = shiftRight;
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || reduced || !autoPlay) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const run = () => {
      timer ??= setInterval(() => shiftRightRef.current(), autoPlay);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? run() : stop()),
      { threshold: 0 },
    );
    io.observe(vp);
    return () => {
      stop();
      io.disconnect();
    };
  }, [reduced, autoPlay, autoplayKey]);

  // A manual nudge resets the autoplay clock so it doesn't fire right after.
  const nudge = (fn: () => void) => () => {
    fn();
    setAutoplayKey((k) => k + 1);
  };

  const offset = -(index * (itemWidth + gap));

  return (
    <div className={cn("carousel", className)}>
      <button
        type="button"
        className="carousel__btn carousel__btn--left"
        aria-label="Previous projects"
        onClick={nudge(shiftLeft)}
      >
        <ChevronLeft className="carousel__chevron" />
      </button>

      <div className="carousel__viewport" ref={viewportRef}>
        <div
          className="carousel__track"
          style={{
            gap: `${gap}px`,
            transform: `translate3d(${offset}px, 0, 0)`,
            transition:
              animate && !reduced ? `transform ${TRANSITION_MS}ms ease` : "none",
          }}
          // Only the track's own transform settling counts — ignore transition
          // events bubbling up from a card's hover effects.
          onTransitionEnd={(e) => {
            if (e.target === e.currentTarget && e.propertyName === "transform") {
              normalise();
            }
          }}
        >
          {extended.map((child, i) => (
            <div
              className="carousel__item"
              key={`item-${i}`}
              style={{ flex: `0 0 ${itemWidth}px` }}
              // Only the real slice is exposed; the clones are decorative.
              aria-hidden={i < FIRST_REAL || i >= FIRST_REAL + n || undefined}
              inert={i < FIRST_REAL || i >= FIRST_REAL + n || undefined}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="carousel__btn carousel__btn--right"
        aria-label="Next projects"
        onClick={nudge(shiftRight)}
      >
        <ChevronRight className="carousel__chevron" />
      </button>
    </div>
  );
}
