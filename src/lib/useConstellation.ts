import { useEffect, useRef, type RefObject } from "react";

type SetHome = (i: number, hx: number, hy: number) => void;

/** Position every node's home (virtual coords) for the current box size. */
type Layout = (box: HTMLDivElement, setHome: SetHome) => number | void;

export interface ConstellationOptions {
  boxRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  nodeEls: RefObject<(HTMLElement | null)[]>;
  count: number;
  /** Virtual coordinate space the homes are expressed in. */
  vw?: number;
  vh?: number;
  /** Nearest-neighbour links drawn per node. */
  neighbors?: number;
  /** Idle float amplitude, in virtual units. */
  floatAmp?: number;
  /**
   * How far past the box a node may be dragged, in virtual units. The canvas
   * grows by the same margin so links still draw out there. The box itself must
   * not clip (no `overflow-hidden`) for the bleed to be visible.
   */
  bleed?: number;
  /** Scale applied to a hovered node. */
  hoverScale?: number;
  /**
   * Place each node's home for the current box width via setHome(i, hx, hy).
   * Optionally return a px height to apply to the box (for responsive morphs);
   * return nothing to leave the box height to CSS.
   */
  layout: Layout;
}

type Node = {
  el: HTMLElement;
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

/**
 * Shared constellation field: DOM nodes drift around per-node home positions,
 * are linked to their nearest neighbours on a canvas, and can be dragged. Colors
 * (line + shadow) resolve from CSS tokens and track the theme. The caller owns
 * the node markup + a `layout` that places homes in a virtual coordinate space.
 */
export function useConstellation({
  boxRef,
  canvasRef,
  nodeEls,
  count,
  vw = 1000,
  vh = 1000,
  neighbors = 2,
  floatAmp = 7,
  bleed = 0,
  hoverScale = 1.06,
  layout,
}: ConstellationOptions) {
  // Keep the latest layout without re-running the effect (mount-once setup).
  const layoutRef = useRef(layout);
  useEffect(() => {
    layoutRef.current = layout;
  });

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
    const amp = reduce ? 0 : floatAmp;

    const nodes: Node[] = Array.from({ length: count }, (_, i) => ({
      el: nodeEls.current[i] as HTMLElement,
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

    let dpr = 1;
    let scaleX = 1;
    let scaleY = 1;
    // The bleed margin in px — the canvas is grown and offset by this much so a
    // node dragged outside the box keeps its links.
    let bleedX = 0;
    let bleedY = 0;
    const setHome: SetHome = (i, hx, hy) => {
      nodes[i].hx = hx;
      nodes[i].hy = hy;
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const h = layoutRef.current(box, setHome);
      if (typeof h === "number") box.style.height = h + "px";
      scaleX = box.clientWidth / vw;
      scaleY = box.clientHeight / vh;
      bleedX = bleed * scaleX;
      bleedY = bleed * scaleY;
      const cw = box.clientWidth + bleedX * 2;
      const ch = box.clientHeight + bleedY * 2;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.left = `${-bleedX}px`;
      canvas.style.top = `${-bleedY}px`;
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
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
      let moved = 0;
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
        moved = 0;
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
        moved += Math.abs(p.x - lastX) + Math.abs(p.y - lastY);
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
      // Swallow the click that trails a drag so linked nodes (<a>) don't navigate.
      const click = (ev: MouseEvent) => {
        if (moved > 8) {
          ev.preventDefault();
          ev.stopPropagation();
          moved = 0;
        }
      };
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", release);
      el.addEventListener("pointercancel", release);
      el.addEventListener("click", click);
      cleanups.push(() => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
        el.removeEventListener("pointerdown", down);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", release);
        el.removeEventListener("pointercancel", release);
        el.removeEventListener("click", click);
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
        const halfW = n.w / 2 / scaleX - bleed;
        const halfH = n.h / 2 / scaleY - bleed;
        if (dragging === i) {
          n.x = Math.max(halfW, Math.min(vw - halfW, n.x));
          n.y = Math.max(halfH, Math.min(vh - halfH, n.y));
        } else {
          const ax = (n.hx + Math.sin(t * 0.6 + n.phase) * amp - n.x) * 0.012;
          const ay = (n.hy + Math.cos(t * 0.5 + n.phase) * amp - n.y) * 0.012;
          n.vx = (n.vx + ax) * 0.9;
          n.vy = (n.vy + ay) * 0.9;
          n.x += n.vx;
          n.y += n.vy;
          n.x = Math.max(halfW, Math.min(vw - halfW, n.x));
          n.y = Math.max(halfH, Math.min(vh - halfH, n.y));
        }
        n.el.style.left = n.x * scaleX - n.w / 2 + "px";
        n.el.style.top = n.y * scaleY - n.h / 2 + "px";
        n.el.style.transform =
          hovered === i ? `scale(${hoverScale})` : "scale(1)";
        n.el.style.boxShadow = hovered === i ? shadowHover : shadowRest;
        n.el.style.zIndex = hovered === i || dragging === i ? "5" : "2";
      });

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const cx = (n: Node) => (n.x * scaleX + bleedX) * dpr;
      const cy = (n: Node) => (n.y * scaleY + bleedY) * dpr;
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
          .slice(0, neighbors);
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
  }, [
    boxRef,
    canvasRef,
    nodeEls,
    count,
    vw,
    vh,
    neighbors,
    floatAmp,
    bleed,
    hoverScale,
  ]);
}
