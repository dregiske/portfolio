import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
        <h1 className="font-serif font-normal leading-[0.9] tracking-[-0.01em] text-[clamp(3.5rem,10vw,7.5rem)] text-foreground">
          {words.map((word, wordIndex) => (
            <span
              key={wordIndex}
              className={`block ${wordIndex === words.length - 1 ? "italic" : ""}`}
            >
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
                  className="inline-block"
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
