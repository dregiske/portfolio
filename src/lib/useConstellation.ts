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
  /**
   * Selector for an ancestor of the box (e.g. "section") whose whole area a
   * node may be dragged across. Replaces `bleed`: the canvas is stretched over
   * that ancestor, so links follow a node anywhere inside it.
   */
  roam?: string;
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
  /** Eased toward `hoverScale`; the CSS transition used to do this. */
  scale: number;
  /** Last-written values, so a frame that changes nothing writes nothing. */
  lifted: boolean;
  z: string;
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
  roam,
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
    const roamEl = roam ? box.closest<HTMLElement>(roam) : null;

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
      scale: 1,
      lifted: false,
      z: "",
    }));

    /**
     * Node sizes only change when the text reflows or a font swaps in — rare,
     * and `offsetWidth` forces a layout flush, so it is watched for rather than
     * read on every frame. The observer also fires once on observe, which is
     * where the initial measurement comes from.
     */
    const measureNodes = () => {
      for (const n of nodes) {
        if (!n.el) continue;
        n.w = n.el.offsetWidth;
        n.h = n.el.offsetHeight;
      }
    };
    const sizeObserver = new ResizeObserver(measureNodes);

    let dpr = 1;
    let scaleX = 1;
    let scaleY = 1;
    // Where the box's origin sits inside the canvas, in px — the canvas is
    // grown past the box (by the bleed, or out to the roam area) so a node
    // dragged outside it keeps its links.
    let originX = 0;
    let originY = 0;
    // How far a node's centre may travel, in virtual units (box coordinates).
    let minX = 0;
    let maxX = vw;
    let minY = 0;
    let maxY = vh;
    const setHome: SetHome = (i, hx, hy) => {
      nodes[i].hx = hx;
      nodes[i].hy = hy;
    };
    // The canvas's drawing area in CSS px — the roam area, or the box plus its
    // bleed — as of the last layout.
    let areaW = 0;
    let areaH = 0;
    /** Homes, box height, scale and travel bounds for the current size. */
    const layoutField = () => {
      const h = layoutRef.current(box, setHome);
      if (typeof h === "number") box.style.height = h + "px";
      scaleX = box.clientWidth / vw;
      scaleY = box.clientHeight / vh;
      if (roamEl) {
        const area = roamEl.getBoundingClientRect();
        const own = box.getBoundingClientRect();
        originX = own.left - area.left;
        originY = own.top - area.top;
        areaW = area.width;
        areaH = area.height;
      } else {
        originX = bleed * scaleX;
        originY = bleed * scaleY;
        areaW = box.clientWidth + originX * 2;
        areaH = box.clientHeight + originY * 2;
      }
      minX = -originX / scaleX;
      minY = -originY / scaleY;
      maxX = (areaW - originX) / scaleX;
      maxY = (areaH - originY) / scaleY;
      canvas.style.left = `${-originX}px`;
      canvas.style.top = `${-originY}px`;
    };

    // Reallocating the backing store is the expensive part of a resize — a
    // roaming canvas is section-sized — so it's sized up to the next
    // `CANVAS_STEP` px and only replaced when the area outgrows that, or
    // shrinks a whole step below it. The surplus runs off the right and bottom
    // and is clipped by the section. Dragging a window edge then reallocates
    // every ~128px rather than every frame.
    const CANVAS_STEP = 128;
    let allocW = 0;
    let allocH = 0;
    let allocDpr = 0;
    const sizeCanvas = () => {
      // A roaming canvas covers a whole section, so it keeps to 1.5× — the
      // links are hairlines, and 2× would quadruple a full-screen backing store.
      dpr = Math.min(window.devicePixelRatio || 1, roamEl ? 1.5 : 2);
      const w = Math.ceil(areaW / CANVAS_STEP) * CANVAS_STEP;
      const h = Math.ceil(areaH / CANVAS_STEP) * CANVAS_STEP;
      if (w === allocW && h === allocH && dpr === allocDpr) return;
      allocW = w;
      allocH = h;
      allocDpr = dpr;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      dirty = null;
    };

    // Window resizes and the area observer below can both report the same
    // change in one frame; fold them into one pass at the next frame. The
    // canvas itself is only resized while the field is running — offscreen,
    // nothing is drawn, so that waits until it comes back into view.
    let canvasStale = false;
    let resizeRaf = 0;
    const resize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        layoutField();
        if (raf) sizeCanvas();
        else canvasStale = true;
      });
    };

    // The canvas area that last frame's links were drawn in, so only that has
    // to be cleared — a roaming canvas is mostly empty, and wiping all of it
    // every frame would be wasted fill.
    let dirty: { x: number; y: number; w: number; h: number } | null = null;
    layoutField();
    sizeCanvas();
    nodes.forEach((n) => {
      n.x = n.hx;
      n.y = n.hy;
      if (n.el) sizeObserver.observe(n.el);
    });
    measureNodes();
    window.addEventListener("resize", resize);
    // The roam area can change height without the window resizing (a status
    // line under the form, a font swapping in), which moves its edges.
    const areaObserver = roamEl ? new ResizeObserver(resize) : null;
    areaObserver?.observe(roamEl as HTMLElement);

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

    // Link bookkeeping, allocated once. Rebuilding the nearest-neighbour list
    // used to allocate `count²` objects and sort them, per node, per frame —
    // pure garbage for the collector to chase sixty times a second.
    const nearIdx = new Int32Array(neighbors);
    const nearD = new Float64Array(neighbors);
    /** Pair flags, so a link is only drawn from one of its two ends. */
    const linked = new Uint8Array(count * count);
    /** Links touching the hovered node, held back for a second stroke pass. */
    const litA = new Int32Array(count * neighbors);
    const litB = new Int32Array(count * neighbors);

    let raf = 0;
    let lastNow = -1;
    const frame = (now: number) => {
      // Real elapsed time, not a fixed step per frame — a constant would run
      // the idle float at double speed on a 120Hz display. Capped so a long
      // pause (backgrounded tab, offscreen section) resumes rather than lurches.
      t += Math.min(lastNow < 0 ? 16.7 : now - lastNow, 100) / 1000;
      lastNow = now;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const halfW = n.w / 2 / scaleX;
        const halfH = n.h / 2 / scaleY;
        if (dragging !== i) {
          const ax = (n.hx + Math.sin(t * 0.6 + n.phase) * amp - n.x) * 0.012;
          const ay = (n.hy + Math.cos(t * 0.5 + n.phase) * amp - n.y) * 0.012;
          n.vx = (n.vx + ax) * 0.9;
          n.vy = (n.vy + ay) * 0.9;
          n.x += n.vx;
          n.y += n.vy;
        }
        n.x = Math.max(minX + halfW, Math.min(maxX - halfW, n.x));
        n.y = Math.max(minY + halfH, Math.min(maxY - halfH, n.y));

        // Position rides on the transform rather than left/top. Both look the
        // same, but left/top are layout properties: moving a dozen nodes that
        // way re-runs layout every frame, where a transform is handed straight
        // to the compositor. The hover scale is eased here for the same reason
        // the CSS transition on `transform` had to go — it would smear every
        // per-frame position write into a lag.
        const lifted = hovered === i;
        n.scale += ((lifted ? hoverScale : 1) - n.scale) * 0.22;
        const tx = n.x * scaleX - n.w / 2;
        const ty = n.y * scaleY - n.h / 2;
        n.el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${n.scale.toFixed(4)})`;

        if (n.lifted !== lifted) {
          n.lifted = lifted;
          n.el.style.boxShadow = lifted ? shadowHover : shadowRest;
        }
        const z = lifted || dragging === i ? "5" : "2";
        if (n.z !== z) {
          n.z = z;
          n.el.style.zIndex = z;
        }
      }

      const cx = (n: Node) => (n.x * scaleX + originX) * dpr;
      const cy = (n: Node) => (n.y * scaleY + originY) * dpr;
      if (dirty) ctx.clearRect(dirty.x, dirty.y, dirty.w, dirty.h);
      // Every link runs between two node centres, so their bounding box (plus
      // the active stroke's width) covers everything drawn this frame.
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      for (const n of nodes) {
        const x = cx(n);
        const y = cy(n);
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
      const pad = 2 * dpr;
      dirty = {
        x: Math.floor(x0 - pad),
        y: Math.floor(y0 - pad),
        w: Math.ceil(x1 - x0 + pad * 2) + 1,
        h: Math.ceil(y1 - y0 + pad * 2) + 1,
      };

      linked.fill(0);
      let lit = 0;
      // One path for all the resting links: a stroke is a rasterization pass,
      // and there is no reason to start a new one per line.
      ctx.beginPath();
      for (let ai = 0; ai < nodes.length; ai++) {
        const a = nodes[ai];
        // Nearest neighbours by on-screen distance, so links stay natural at any
        // aspect ratio as the constellation morphs. Insertion into a fixed
        // `neighbors`-long list, on squared distance — the ordering is the same
        // as hypot's and it costs no square roots.
        for (let k = 0; k < neighbors; k++) {
          nearD[k] = Infinity;
          nearIdx[k] = -1;
        }
        for (let bi = 0; bi < nodes.length; bi++) {
          if (bi === ai) continue;
          const b = nodes[bi];
          const dx = (a.x - b.x) * scaleX;
          const dy = (a.y - b.y) * scaleY;
          const d = dx * dx + dy * dy;
          if (d >= nearD[neighbors - 1]) continue;
          let k = neighbors - 1;
          while (k > 0 && nearD[k - 1] > d) {
            nearD[k] = nearD[k - 1];
            nearIdx[k] = nearIdx[k - 1];
            k--;
          }
          nearD[k] = d;
          nearIdx[k] = bi;
        }
        for (let k = 0; k < neighbors; k++) {
          const bi = nearIdx[k];
          if (bi < 0) continue;
          const key = ai < bi ? ai * count + bi : bi * count + ai;
          if (linked[key]) continue;
          linked[key] = 1;
          if (hovered === ai || hovered === bi) {
            litA[lit] = ai;
            litB[lit] = bi;
            lit++;
            continue;
          }
          const b = nodes[bi];
          ctx.moveTo(cx(a), cy(a));
          ctx.lineTo(cx(b), cy(b));
        }
      }
      ctx.lineWidth = dpr;
      ctx.strokeStyle = lineRest;
      ctx.stroke();

      if (lit > 0) {
        ctx.beginPath();
        for (let k = 0; k < lit; k++) {
          const a = nodes[litA[k]];
          const b = nodes[litB[k]];
          ctx.moveTo(cx(a), cy(a));
          ctx.lineTo(cx(b), cy(b));
        }
        ctx.lineWidth = 1.6 * dpr;
        ctx.strokeStyle = lineActive;
        ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    };

    // Lay the nodes out before first paint — the observer below only reports
    // back a frame later, and until something writes a transform every node is
    // still sitting on top of the others at the field's origin.
    frame(performance.now());

    // A constellation two sections away is still a full rAF loop and a canvas
    // repaint. Run it only while it's near the viewport.
    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!raf) {
            // Catch up on a resize that happened while it was offscreen.
            if (canvasStale) {
              canvasStale = false;
              sizeCanvas();
            }
            lastNow = -1;
            frame(performance.now());
          }
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "150px" },
    );
    visibility.observe(box);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", resize);
      themeObserver.disconnect();
      sizeObserver.disconnect();
      areaObserver?.disconnect();
      visibility.disconnect();
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
    roam,
    hoverScale,
  ]);
}
