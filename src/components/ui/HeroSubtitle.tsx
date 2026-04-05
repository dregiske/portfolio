import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { HERO_SUBTITLE } from "@/constants/theme";

type HeroSubtitleProps = {
  subtitle: string;
  className?: string;
};

export function HeroSubtitle({ subtitle, className = "" }: HeroSubtitleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const words = subtitle.split(" ");

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.35], [0, -40]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ opacity, y }}>
        <h1 className="mb-8 tracking-tighter leading-[0.95] text-[clamp(1rem,3vw,3rem)]">
          {words.map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block mr-4 last:mr-0">
              {word.split("").map((letter, letterIndex) => (
                <motion.span
                  key={`${wordIndex}-${letterIndex}`}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: wordIndex * 0.1 + letterIndex * 0.03,
                    type: "spring",
                    stiffness: 150,
                    damping: 25,
                  }}
                  className={`inline-block ${HERO_SUBTITLE.color}`}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>
      </motion.div>
    </div>
  );
}
