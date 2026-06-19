import { useEffect, useRef } from "react";

const skills = [
  { name: "Python", level: 95 },
  { name: "TypeScript", level: 85 },
  { name: "C++", level: 80 },
  { name: "Java", level: 80 },
  { name: "SQL", level: 80 },
  { name: "React", level: 90 },
  { name: "SQLAlchemy", level: 85 },
  { name: "Numpy", level: 80 },
  { name: "FastAPI", level: 95 },
  { name: "scikit-learn", level: 75 },
  { name: "Docker", level: 80 },
  { name: "Git", level: 90 },
];

// Home positions in a 1124-wide virtual coordinate space (scaled to container width)
const homes: [number, number][] = [
  [140, 100], [400, 65], [680, 115], [930, 75], [1090, 175],
  [90, 300], [360, 315], [640, 350], [905, 305], [1095, 360],
  [240, 455], [760, 470],
];

const tints = ["bg-c-clay", "bg-c-mint", "bg-c-sky", "bg-c-lilac", "bg-c-butter"];

const W0 = 1124;

type Node = {
  el: HTMLDivElement;
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  phase: number;
};

export const Skills = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeEls = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const floatAmp = reduce ? 0 : 6;

    const nodes: Node[] = skills.map((_, i) => ({
      el: nodeEls.current[i] as HTMLDivElement,
      hx: homes[i][0],
      hy: homes[i][1],
      x: homes[i][0],
      y: homes[i][1],
      vx: 0,
      vy: 0,
      w: 0,
      h: 0,
      phase: (i * 1234.567) % 6.28,
    }));

    let dpr = 1;
    let scaleX = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = box.clientWidth * dpr;
      canvas.height = box.clientHeight * dpr;
      scaleX = box.clientWidth / W0;
    };
    resize();
    window.addEventListener("resize", resize);

    let hovered = -1;
    let dragging = -1;
    let offX = 0;
    let offY = 0;
    let lastX = 0;
    let lastY = 0;
    let t = 0;

    const pt = (ev: PointerEvent) => {
      const r = box.getBoundingClientRect();
      return {
        x: (ev.clientX - r.left) / scaleX,
        y: (ev.clientY - r.top) / scaleX,
      };
    };

    const cleanups: (() => void)[] = [];
    nodes.forEach((n, i) => {
      const el = n.el;
      if (!el) return;
      const enter = () => {
        if (dragging < 0) hovered = i;
      };
      const leave = () => {
        if (hovered === i) hovered = -1;
      };
      const down = (ev: PointerEvent) => {
        ev.preventDefault();
        dragging = i;
        hovered = i;
        const p = pt(ev);
        offX = p.x - n.x;
        offY = p.y - n.y;
        lastX = p.x;
        lastY = p.y;
        el.setPointerCapture(ev.pointerId);
        el.style.cursor = "grabbing";
        box.style.cursor = "grabbing";
      };
      const move = (ev: PointerEvent) => {
        if (dragging !== i) return;
        const p = pt(ev);
        n.x = p.x - offX;
        n.y = p.y - offY;
        n.vx = p.x - lastX;
        n.vy = p.y - lastY;
        lastX = p.x;
        lastY = p.y;
      };
      const release = () => {
        if (dragging === i) {
          dragging = -1;
          el.style.cursor = "grab";
          box.style.cursor = "grab";
        }
      };
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", release);
      el.addEventListener("pointercancel", release);
      cleanups.push(() => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
        el.removeEventListener("pointerdown", down);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", release);
        el.removeEventListener("pointercancel", release);
      });
    });

    let raf = 0;
    const frame = () => {
      t += 0.016;
      nodes.forEach((n) => {
        n.w = n.el.offsetWidth;
        n.h = n.el.offsetHeight;
      });
      nodes.forEach((n, i) => {
        if (dragging === i) {
          n.x = Math.max(
            n.w / 2 / scaleX,
            Math.min(W0 - n.w / 2 / scaleX, n.x),
          );
          n.y = Math.max(
            n.h / 2 / scaleX,
            Math.min(box.clientHeight / scaleX - n.h / 2 / scaleX, n.y),
          );
        } else {
          const ax = (n.hx + Math.sin(t * 0.6 + n.phase) * floatAmp - n.x) * 0.012;
          const ay = (n.hy + Math.cos(t * 0.5 + n.phase) * floatAmp - n.y) * 0.012;
          n.vx = (n.vx + ax) * 0.9;
          n.vy = (n.vy + ay) * 0.9;
          n.x += n.vx;
          n.y += n.vy;
        }
        n.el.style.left = n.x * scaleX - n.w / 2 + "px";
        n.el.style.top = n.y * scaleX - n.h / 2 + "px";
        n.el.style.transform = hovered === i ? "scale(1.06)" : "scale(1)";
        n.el.style.boxShadow =
          hovered === i
            ? "0 8px 22px rgba(26,23,20,.16)"
            : "0 2px 8px rgba(26,23,20,.06)";
        n.el.style.zIndex = hovered === i || dragging === i ? "5" : "2";
      });

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const cx = (n: Node) => n.x * scaleX * dpr;
      const cy = (n: Node) => n.y * scaleX * dpr;
      const drawn = new Set<string>();
      nodes.forEach((a, ai) => {
        const near = nodes
          .map((b, bi) => ({
            bi,
            d: bi === ai ? 1e9 : Math.hypot(a.x - b.x, a.y - b.y),
          }))
          .sort((p, q) => p.d - q.d)
          .slice(0, 2);
        near.forEach(({ bi }) => {
          const key = ai < bi ? ai + "-" + bi : bi + "-" + ai;
          if (drawn.has(key)) return;
          drawn.add(key);
          const b = nodes[bi];
          const active = hovered === ai || hovered === bi;
          ctx.beginPath();
          ctx.moveTo(cx(a), cy(a));
          ctx.lineTo(cx(b), cy(b));
          ctx.lineWidth = (active ? 1.6 : 1) * dpr;
          ctx.strokeStyle = active
            ? "rgba(191,106,74,0.55)"
            : "rgba(120,112,98,0.22)";
          ctx.stroke();
        });
      });
      raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <section id="skills" className="py-24 px-6 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-d-blue mb-2.5">
            03 — Toolkit
          </div>
          <h2 className="font-serif font-normal text-5xl md:text-6xl leading-none text-foreground">
            My <span className="italic text-d-blue">skills</span>
          </h2>
        </div>

        <div className="flex items-center gap-2.5 mb-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Drag the nodes — bigger means stronger
        </div>

        <div
          ref={boxRef}
          className="relative w-full h-130 cursor-grab touch-none"
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          {skills.map((skill, i) => {
            const scale = 0.92 + ((skill.level - 74) / 26) * 0.55;
            return (
              <div
                key={skill.name}
                ref={(el) => {
                  nodeEls.current[i] = el;
                }}
                className={`const-node absolute left-0 top-0 rounded-full font-semibold whitespace-nowrap text-foreground select-none cursor-grab z-2 ${
                  tints[i % tints.length]
                }`}
                style={{
                  padding: `${9 * scale}px ${16 * scale}px`,
                  fontSize: `${13.5 * scale}px`,
                  transformOrigin: "center",
                  willChange: "left, top, transform",
                  transition: "box-shadow .2s, transform .12s",
                }}
              >
                {skill.name}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
