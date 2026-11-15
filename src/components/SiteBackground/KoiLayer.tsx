import { useEffect, useRef } from "react";
import { createKoiPond } from "@/lib/koi";

/**
 * DEMO — koi swimming over the whole page (see `@/lib/koi`), on one fixed
 * canvas above the aura. A click on empty space (anything that isn't a
 * link, button or form control) drops food, and the nearby koi come to eat.
 * Off with `?koi=off`; `?koi=trace` draws each fish's recent path (debug).
 */
export function KoiLayer() {
  const world = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get("koi");
    if (mode === "off") return;
    const w = world.current;
    if (!w) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pond = createKoiPond(w, {
      reducedMotion: () => motion.matches,
      trace: mode === "trace", // debug: draw each fish's recent path
    });
    pond.resize();
    pond.start();

    const onResize = () => pond.resize();
    const onDown = (ev: PointerEvent) => {
      if (ev.button !== 0 || !ev.isPrimary) return;
      const t = ev.target as Element | null;
      if (t?.closest("a, button, input, textarea, select, label, [role='button'], [role='dialog']"))
        return;
      pond.feed(ev.clientX, ev.clientY);
    };
    const onVisibility = () => (document.hidden ? pond.stop() : pond.start());

    window.addEventListener("resize", onResize);
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVisibility);
      pond.destroy();
    };
  }, []);

  return <canvas ref={world} className="site-bg site-bg--koi" aria-hidden="true" />;
}
