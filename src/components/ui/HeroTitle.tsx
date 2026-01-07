"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { HERO_TITLE } from "@/constants/theme";

type HeroTitleProps = {
  title: string;
  className?: string;
};

export function HeroTitle({ title, className = "" }: HeroTitleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const words = title.split(" ");

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.35], [0, -40]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ opacity, y }}>
        <h1 className="font-bold mb-8 tracking-tighter leading-[0.95] text-[clamp(2.25rem,7vw,6rem)]">
          {words.map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block mr-4 last:mr-0">
              {word.split("").map((letter, letterIndex) => (
                <motion.span
                  key={`${wordIndex}-${letterIndex}`}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: wordIndex * 0.1 + letterIndex * 0.03,
                    type: "spring",
                    stiffness: 150,
                    damping: 25,
                  }}
                  className={`inline-block text-transparent bg-clip-text 
                    bg-linear-to-r ${HERO_TITLE.light} dark:${HERO_TITLE.dark}`}
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
