import { motion } from "framer-motion";

type Path = { id: number; d: string; width: number };

// The original sweeping family (top-left → bottom-right). `position` (1 / -1)
// mirrors the group so the two cross.
function diagonalPaths(position: number): Path[] {
  return Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));
}

function PathField({
  paths,
  transform,
}: {
  paths: Path[];
  transform?: string;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="absolute w-full h-full text-foreground"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        <g transform={transform}>
          {paths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeOpacity={0.1 + path.id * 0.03}
              initial={{ pathLength: 0.3, opacity: 0.6 }}
              animate={{
                pathLength: 1,
                opacity: [0.3, 0.6, 0.3],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration: 20 + Math.random() * 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

export function BackgroundPaths() {
  return (
    <div className="absolute min-h-screen w-full flex items-center pointer-events-none justify-center overflow-hidden bg-background">
      <div className="absolute inset-0">
        <PathField paths={diagonalPaths(1)} />
        <PathField paths={diagonalPaths(-1)} />
        <PathField paths={diagonalPaths(1)} transform="translate(-150 170)" />
      </div>
    </div>
  );
}
