import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type HeroSubtitleProps = {
  subtitle: string;
  className?: string;
};

export function HeroSubtitle({ subtitle, className = "" }: HeroSubtitleProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.35], [0, -40]);

  return (
    <div ref={ref} className={className}>
      <motion.p
        style={{ opacity, y }}
        className="max-w-md text-lg leading-relaxed text-muted-foreground"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
