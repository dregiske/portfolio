import { useEffect, useRef } from "react";
import { TONES } from "@/constants/tones";
import { Section } from "@/components/Section/Section";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { Tag } from "@/components/Tag/Tag";
import "./Skills.css";

type Skill = { name: string; level: number };

const skills: Skill[] = [
  { name: "Python", level: 95 },
  { name: "TypeScript", level: 85 },
  { name: "C++", level: 80 },
  { name: "Java", level: 80 },
  { name: "SQL", level: 80 },
  { name: "React", level: 90 },
  { name: "SQLAlchemy", level: 85 },
  { name: "Numpy", level: 80 },
  { name: "FastAPI", level: 95 },
  { name: "Nginx", level: 75 },
  { name: "Docker", level: 80 },
  { name: "Git", level: 90 },
];

// Two layouts in a normalized 1000×1000 virtual space. The live layout is a
// per-node blend between them, driven by container width — so the single
// constellation morphs continuously from horizontal (wide) to vertical (narrow).
// homesWide is the original landscape spread; homesTall is a two-column zigzag,
// index-matched so each node glides between its two homes without crossing.
const homesWide: [number, number][] = [
  [181, 238],
  [377, 181],
  [589, 263],
  [779, 198],
  [900, 362],
  [143, 565],
  [347, 590],
  [559, 648],
  [760, 573],
  [903, 663],
  [256, 819],
  [650, 844],
];
const homesTall: [number, number][] = [
  [330, 250],
  [312, 80],
  [688, 230],
  [700, 90],
  [706, 370],
  [322, 430],
  [338, 620],
  [700, 650],
  [694, 510],
  [686, 790],
  [308, 820],
  [704, 920],
];

const VW = 1000;
const VH = 1000;
const H_WIDE = 520; // field height (px) when fully horizontal
const H_TALL = 760; // field height (px) when fully vertical
// Blend factor: t=0 at WIDE_AT px wide, t=1 at TALL_AT px wide.
const WIDE_AT = 900;
const TALL_AT = 480;

const tints = TONES.map((tone) => `skill-node--${tone}`);

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

    // Pull canvas colors from CSS tokens. A hidden probe lets the browser fully
    // resolve var()/color-mix() to a concrete rgb() the canvas can parse; we
    // re-read whenever the theme (.dark on <html>) toggles.
    const probe = document.createElement("span");
    probe.style.cssText =
      "position:absolute;width:0;height:0;visibility:hidden";
    box.appendChild(probe);
    const resolve = (token: string) => {
      probe.style.color = `var(${token})`;
      return getComputedStyle(probe).color;
    };
    let lineRest = "";
    let lineActive = "";
    let shadowRest = "";
    let shadowHover = "";
    const readColors = () => {
      lineRest = resolve("--constellation-line");
      lineActive = resolve("--constellation-line-active");
      const sc = getComputedStyle(box)
        .getPropertyValue("--shadow-color")
        .trim();
      shadowRest = `0 2px 8px rgb(${sc} / 0.06)`;
      shadowHover = `0 8px 22px rgb(${sc} / 0.16)`;
    };
    readColors();
    const themeObserver = new MutationObserver(readColors);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const floatAmp = reduce ? 0 : 7;

    const nodes: Node[] = skills.map((_, i) => ({
      el: nodeEls.current[i] as HTMLDivElement,
      hx: 0,
      hy: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      w: 0,
      h: 0,
      phase: (i * 1234.567) % 6.28,
    }));

    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

    let dpr = 1;
    let scaleX = 1;
    let scaleY = 1;
    // Blend homes + field height from the current width, then size the canvas.
    const applyLayout = () => {
      const t = clamp01((WIDE_AT - box.clientWidth) / (WIDE_AT - TALL_AT));
      box.style.height = lerp(H_WIDE, H_TALL, t) + "px";
      nodes.forEach((n, i) => {
        n.hx = lerp(homesWide[i][0], homesTall[i][0], t);
        n.hy = lerp(homesWide[i][1], homesTall[i][1], t);
      });
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      applyLayout();
      canvas.width = box.clientWidth * dpr;
      canvas.height = box.clientHeight * dpr;
      scaleX = box.clientWidth / VW;
      scaleY = box.clientHeight / VH;
    };
    resize();
    nodes.forEach((n) => {
      n.x = n.hx;
      n.y = n.hy;
    });
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
        y: (ev.clientY - r.top) / scaleY,
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
        const halfW = n.w / 2 / scaleX;
        const halfH = n.h / 2 / scaleY;
        if (dragging === i) {
          n.x = Math.max(halfW, Math.min(VW - halfW, n.x));
          n.y = Math.max(halfH, Math.min(VH - halfH, n.y));
        } else {
          const ax =
            (n.hx + Math.sin(t * 0.6 + n.phase) * floatAmp - n.x) * 0.012;
          const ay =
            (n.hy + Math.cos(t * 0.5 + n.phase) * floatAmp - n.y) * 0.012;
          n.vx = (n.vx + ax) * 0.9;
          n.vy = (n.vy + ay) * 0.9;
          n.x += n.vx;
          n.y += n.vy;
          // Keep resting nodes within the field bounds.
          n.x = Math.max(halfW, Math.min(VW - halfW, n.x));
          n.y = Math.max(halfH, Math.min(VH - halfH, n.y));
        }
        n.el.style.left = n.x * scaleX - n.w / 2 + "px";
        n.el.style.top = n.y * scaleY - n.h / 2 + "px";
        n.el.style.transform = hovered === i ? "scale(1.06)" : "scale(1)";
        n.el.style.boxShadow = hovered === i ? shadowHover : shadowRest;
        n.el.style.zIndex = hovered === i || dragging === i ? "5" : "2";
      });

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const cx = (n: Node) => n.x * scaleX * dpr;
      const cy = (n: Node) => n.y * scaleY * dpr;
      const drawn = new Set<string>();
      nodes.forEach((a, ai) => {
        // Nearest neighbours by on-screen distance, so links stay natural at any
        // aspect ratio as the constellation morphs.
        const near = nodes
          .map((b, bi) => ({
            bi,
            d:
              bi === ai
                ? 1e9
                : Math.hypot((a.x - b.x) * scaleX, (a.y - b.y) * scaleY),
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
          ctx.strokeStyle = active ? lineActive : lineRest;
          ctx.stroke();
        });
      });
      raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      themeObserver.disconnect();
      probe.remove();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <Section id="skills" className="overflow-hidden">
      <SectionHeader
        index="03"
        eyebrow="Toolkit"
        title="My"
        accent="skills"
        tone="sky"
      />

      <Tag tone="sky" dot className="skills__hint">
        Drag the nodes!
      </Tag>

      <div ref={boxRef} className="constellation">
        <canvas ref={canvasRef} className="constellation__canvas" />
        {skills.map((skill, i) => {
          const scale = 0.92 + ((skill.level - 74) / 26) * 0.55;
          return (
            <div
              key={skill.name}
              ref={(el) => {
                nodeEls.current[i] = el;
              }}
              className={`skill-node ${tints[i % tints.length]}`}
              style={{
                padding: `${9 * scale}px ${16 * scale}px`,
                fontSize: `${13.5 * scale}px`,
              }}
            >
              {skill.name}
            </div>
          );
        })}
      </div>
    </Section>
  );
};
