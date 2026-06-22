import { type Tone } from "@/constants/tones";
import { Blob, type BlobSize } from "@/components/Blob/Blob";
import { WaveLines } from "@/components/WaveLines/WaveLines";
import "./Background.css";

type ScatterBlob = {
  color: Tone;
  size: BlobSize;
  /** Position + opacity utilities, relative to the full-page scatter layer. */
  className: string;
};

/**
 * Ambient circles scattered down the whole page. Positions are percentage-based
 * so they distribute across the document height regardless of section sizes.
 * Roughly grouped by the section they drift behind (hero → contacts).
 */
const SCATTER: ScatterBlob[] = [
  { color: "sky", size: "lg", className: "top-[4%] right-[10%] opacity-70" },
  { color: "butter", size: "md", className: "top-[9%] left-[7%] opacity-70" },
  { color: "lilac", size: "sm", className: "top-[16%] right-[22%] opacity-60" },
  { color: "clay", size: "lg", className: "top-[24%] -left-10 opacity-70" },
  { color: "mint", size: "sm", className: "top-[30%] left-[18%] opacity-60" },
  { color: "butter", size: "md", className: "top-[34%] right-[8%] opacity-70" },
  { color: "mint", size: "xl", className: "top-[44%] right-[12%] opacity-60" },
  { color: "lilac", size: "md", className: "top-[50%] -left-8 opacity-70" },
  { color: "sky", size: "sm", className: "top-[56%] left-[14%] opacity-60" },
  { color: "clay", size: "md", className: "top-[62%] right-[20%] opacity-70" },
  { color: "sky", size: "lg", className: "top-[68%] -right-10 opacity-70" },
  { color: "clay", size: "sm", className: "top-[73%] left-[9%] opacity-70" },
  {
    color: "butter",
    size: "sm",
    className: "top-[80%] right-[16%] opacity-60",
  },
  { color: "sky", size: "md", className: "top-[85%] left-4 opacity-70" },
  { color: "mint", size: "md", className: "top-[91%] right-[10%] opacity-60" },
  {
    color: "lilac",
    size: "sm",
    className: "bottom-[8%] left-[12%] opacity-70",
  },
  { color: "butter", size: "xl", className: "bottom-[3%] -right-8 opacity-80" },
  { color: "sky", size: "sm", className: "top-[6%] left-[26%] opacity-80" },
  { color: "mint", size: "md", className: "top-[13%] right-[3%] opacity-80" },
  { color: "butter", size: "md", className: "top-[20%] -left-8 opacity-80" },
  { color: "lilac", size: "sm", className: "top-[27%] right-[32%] opacity-80" },
  { color: "sky", size: "md", className: "top-[38%] -left-12 opacity-80" },
  { color: "clay", size: "sm", className: "top-[41%] left-[30%] opacity-80" },
  {
    color: "butter",
    size: "sm",
    className: "top-[50%] right-[30%] opacity-80",
  },
  { color: "clay", size: "sm", className: "top-[53%] right-[5%] opacity-80" },
  { color: "lilac", size: "lg", className: "top-[59%] -right-12 opacity-80" },
  { color: "butter", size: "md", className: "top-[66%] left-[24%] opacity-80" },
  { color: "mint", size: "sm", className: "top-[71%] right-[30%] opacity-80" },
  { color: "sky", size: "md", className: "top-[77%] -left-10 opacity-80" },
  { color: "clay", size: "sm", className: "top-[83%] left-[22%] opacity-80" },
  { color: "lilac", size: "sm", className: "top-[88%] right-[26%] opacity-80" },
  { color: "mint", size: "md", className: "top-[95%] left-[8%] opacity-80" },
];

/**
 * The page's ambient background, in three stacked layers:
 *   1. eggshell color + animated lines — fixed (stationary as you scroll)
 *   2. scattered pastel circles — absolute, full document height (scrolls)
 * Both are mounted as siblings of the foreground; the foreground (z-10) sits
 * above and its transparent gaps reveal these layers.
 */
export function Background() {
  return (
    <>
      <div className="background__lines" aria-hidden="true">
        <WaveLines />
      </div>
      <div className="background__scatter" aria-hidden="true">
        {SCATTER.map((b, i) => (
          <Blob key={i} color={b.color} size={b.size} className={b.className} />
        ))}
      </div>
    </>
  );
}
