import { WaveLines } from "@/components/WaveLines/WaveLines";
import "./Background.css";

/**
 * The page's ambient background: an eggshell/navy color wash with animated
 * wave lines, fixed so it stays put while the page scrolls. The foreground
 * (z-10) sits above and its transparent gaps reveal this layer.
 */
export function Background() {
  return (
    <div className="background__lines" aria-hidden="true">
      <WaveLines />
    </div>
  );
}
