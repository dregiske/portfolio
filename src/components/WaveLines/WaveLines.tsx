import { useEffect, useRef } from "react";
import "./WaveLines.css";

const LINE_COUNT = 30;

/**
 * Ambient canvas wave-field: stacked sine curves drifting down the viewport.
 * Fixed + full-viewport, drawn in the muted-foreground color so it tracks the
 * theme. An experimental alternative to the diagonal BackgroundPaths.
 */
export function WaveLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resolve the line color from the element's computed color (text-muted-
    // foreground), re-reading whenever the theme (.dark on <html>) toggles.
    let rgb = "120, 112, 98";
    const readColor = () => {
      const m = getComputedStyle(canvas).color.match(/\d+/g);
      if (m && m.length >= 3) rgb = `${m[0]}, ${m[1]}, ${m[2]}`;
    };
    readColor();
    const themeObserver = new MutationObserver(readColor);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let t = 0;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1 * dpr;
      ctx.lineCap = "round";
      for (let i = 0; i < LINE_COUNT; i++) {
        const p = i / LINE_COUNT;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${rgb}, ${0.07 + p * 0.16})`;
        for (let x = 0; x <= w; x += 10 * dpr) {
          const nx = x / w;
          const base = h * (-0.05 + p * 1.05);
          const y =
            base +
            Math.sin(nx * 3.0 + t * 0.6 + p * 4.0) * 42 * dpr +
            Math.sin(nx * 7.0 - t * 0.4 + p * 2.0) * 14 * dpr +
            nx * nx * h * 0.4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      if (!reduce) {
        t += 0.0045;
        raf = requestAnimationFrame(draw);
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      themeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="wave-lines" aria-hidden="true" />;
}
