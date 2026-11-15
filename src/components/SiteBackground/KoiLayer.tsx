import { useEffect, useRef } from "react";
import { createKoiPond, type KoiInk, type KoiPond } from "@/lib/koi";
import { watchThemeColors, type ResolvedColor } from "@/lib/themeColors";
import { REDUCED_MOTION_QUERY } from "@/lib/useReducedMotion";

/** What a click can land on without feeding the koi: anything interactive. */
const INTERACTIVE =
  "a, button, input, textarea, select, label, [role='button'], [role='dialog']";

const INK_TOKENS = [
  "--koi-trail",
  "--koi-ripple",
  "--koi-splash",
  "--koi-food",
] as const;

const rgb = (c: ResolvedColor) => [c.r, c.g, c.b] as const;

/**
 * Koi swimming over the whole page (see `@/lib/koi`), on one fixed canvas
 * above the aura. A click on empty space drops food, and the nearby koi come
 * to eat. Off with `?koi=off`. In development, `?koi=trace` also draws each
 * fish's recent path.
 */
export function KoiLayer() {
  const world = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get("koi");
    if (mode === "off") return;
    const w = world.current;
    if (!w) return;

    const motion = window.matchMedia(REDUCED_MOTION_QUERY);
    const fontFamily = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-mono")
      .trim();

    // The watcher reports straight away, so the pond is created with the
    // theme's colors already resolved, then re-inked on every theme switch.
    let pond: KoiPond | undefined;
    const stopWatching = watchThemeColors(INK_TOKENS, (colors) => {
      const ink: KoiInk = {
        trail: rgb(colors["--koi-trail"]),
        ripple: rgb(colors["--koi-ripple"]),
        splash: rgb(colors["--koi-splash"]),
        food: rgb(colors["--koi-food"]),
      };
      if (pond) pond.setInk(ink);
      else
        pond = createKoiPond(w, {
          reducedMotion: () => motion.matches,
          fontFamily,
          ink,
          trace: import.meta.env.DEV && mode === "trace",
        });
    });
    const koi = pond!;
    koi.resize();
    koi.start();

    const onResize = () => koi.resize();
    const onDown = (ev: PointerEvent) => {
      if (ev.button !== 0 || !ev.isPrimary) return;
      const t = ev.target as Element | null;
      if (t?.closest(INTERACTIVE)) return;
      koi.feed(ev.clientX, ev.clientY);
    };
    const onVisibility = () => (document.hidden ? koi.stop() : koi.start());

    window.addEventListener("resize", onResize);
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVisibility);
      stopWatching();
      koi.destroy();
    };
  }, []);

  return <canvas ref={world} className="site-bg site-bg--koi" aria-hidden="true" />;
}
