import { useRef } from "react";
import { SOCIALS_ICON_LINK } from "@/constants/links";
import type { Tone } from "@/constants/tones";
import { useConstellation } from "@/lib/useConstellation";
import { cn } from "@/lib/utils";

export type Social = { name: string; url: string; src: string; tone: Tone };

const VW = 1000;
const VH = 400;
/** Slack around the field a dragged icon may occupy — see `useConstellation`. */
const BLEED = 150;

/**
 * The contact socials laid out as an inline horizontal constellation: linked
 * circles that drift and can be dragged, reusing the Skills constellation field.
 */
export function ContactConstellation({ socials }: { socials: Social[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeEls = useRef<(HTMLElement | null)[]>([]);

  useConstellation({
    boxRef,
    canvasRef,
    nodeEls,
    count: socials.length,
    vw: VW,
    vh: VH,
    bleed: BLEED,
    floatAmp: 16,
    hoverScale: 1.1,
    // Even horizontal spread with a gentle zigzag so the links read as a chain.
    layout: (_box, setHome) => {
      const n = socials.length;
      socials.forEach((_, i) => {
        const hx = n > 1 ? 160 + (680 * i) / (n - 1) : VW / 2;
        const hy = VH / 2 + (i % 2 === 0 ? -70 : 70);
        setHome(i, hx, hy);
      });
    },
  });

  return (
    <div ref={boxRef} className="contact__constellation">
      <canvas ref={canvasRef} className="contact__constellation-canvas" />
      {socials.map((social, i) => (
        <a
          key={social.name}
          ref={(el) => {
            nodeEls.current[i] = el;
          }}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.name}
          className={cn("contact__node", `contact__node--${social.tone}`)}
        >
          <img
            src={`${SOCIALS_ICON_LINK}${social.src}`}
            alt={social.name}
            className="contact__social-img"
          />
        </a>
      ))}
    </div>
  );
}
