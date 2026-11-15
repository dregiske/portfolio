import { useRef, type ReactNode } from "react";
import { toneClass, type Tone } from "@/constants/tones";
import {
  useConstellation,
  type ConstellationOptions,
} from "@/lib/useConstellation";
import { cn } from "@/lib/utils";
import "./Constellation.css";

/** What each rendered node must spread onto its root element. */
export type NodeProps = {
  className: string;
  /** Marks the element as a node for `useConstellation` to pick up. */
  "data-node": "";
};

type ConstellationProps<T> = Omit<
  ConstellationOptions,
  "boxRef" | "canvasRef" | "count"
> & {
  items: readonly T[];
  /** Each item's rung of the shade ladder — the node's fill and ink. */
  toneOf: (item: T, i: number) => Tone;
  /**
   * Render one node. Spread `node` onto the root element (merging
   * `node.className` with any class of your own); the field positions it.
   */
  renderNode: (item: T, node: NodeProps, i: number) => ReactNode;
  className?: string;
};

/**
 * A field of draggable nodes that drift around their homes, linked to their
 * nearest neighbours on a canvas behind them. Owns the field's box, canvas
 * and the shared node look; the caller supplies the items, how each renders,
 * and the `layout` that places their homes.
 */
export function Constellation<T>({
  items,
  toneOf,
  renderNode,
  className,
  ...options
}: ConstellationProps<T>) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useConstellation({ boxRef, canvasRef, count: items.length, ...options });

  return (
    <div ref={boxRef} className={cn("constellation", className)}>
      <canvas ref={canvasRef} className="constellation__canvas" />
      {items.map((item, i) =>
        renderNode(
          item,
          {
            className: cn("constellation__node", toneClass(toneOf(item, i))),
            "data-node": "",
          },
          i,
        ),
      )}
    </div>
  );
}
