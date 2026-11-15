import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import "./Button.css";

type Variant = "solid" | "outline" | "text" | "ghost";

type Common = {
  /**
   * "solid" = filled pill CTA · "outline" = glass pill CTA · "text" = bare
   * label (+ arrow), underline on hover · "ghost" = bare, e.g. icon buttons.
   */
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

type AsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type ButtonProps = AsButton | AsLink;

/**
 * The site's one action control. Renders an `<a>` when given `href`, a
 * `<button>` otherwise, with the same look either way. Owns the shape and the
 * variant; layout (margins, alignment) comes from the caller via `className`.
 */
export function Button({
  variant = "solid",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn("btn", `btn--${variant}`, className);

  if (rest.href !== undefined) {
    const link = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a className={classes} {...link}>
        {children}
      </a>
    );
  }

  const { type = "button", ...button } =
    rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={classes} {...button}>
      {children}
    </button>
  );
}
