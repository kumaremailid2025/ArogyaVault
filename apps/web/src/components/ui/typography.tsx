/**
 * @file typography.tsx
 * @description Core Typography primitive built with `cva`.
 *
 * Every raw `<h1>…<h6>` and `<p>` in the app should use this component so that
 * font-size, weight, colour, and leading are defined in one place and can be
 * changed globally.
 *
 * ## Quick reference
 *
 * | variant   | element | size          | weight    | notes                         |
 * |-----------|---------|---------------|-----------|-------------------------------|
 * | hero      | h1      | 4xl / 5xl     | bold      | Marketing hero headlines      |
 * | h1        | h1      | xl            | bold      | App page titles               |
 * | h2        | h2      | lg            | semibold  | Section headers               |
 * | h3        | h3      | base          | semibold  | Card / panel headers          |
 * | h4        | h4      | sm            | semibold  | Sub-section labels            |
 * | h5        | h5      | xs            | semibold  | Small labels inside cards     |
 * | overline  | p       | [11px]        | semibold  | Uppercase section dividers    |
 * | body-lg   | p       | base          | normal    | Large body copy               |
 * | body      | p       | sm            | normal    | Default body copy             |
 * | body-sm   | p       | xs            | normal    | Secondary / helper body copy  |
 * | caption   | p       | xs            | normal    | Timestamps, meta info         |
 * | micro     | p       | [10px]        | normal    | Badge text, dense UI          |
 *
 * ## Color modifiers
 * Pass `color` prop for semantic colour:
 * - `default`     → text-foreground
 * - `muted`       → text-muted-foreground
 * - `primary`     → text-primary
 * - `destructive` → text-destructive
 * - `inverse`     → text-primary-foreground  (use on coloured backgrounds)
 * - `success`     → text-green-600 / dark:text-green-400
 *
 * ## Polymorphism
 * Use the `as` prop to change the rendered element without losing variant styles:
 * ```tsx
 * <Typography variant="h2" as="p">Rendered as <p> but styled as h2</Typography>
 * ```
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─── Variants ──────────────────────────────────────────────────────────────────

const typographyVariants = cva("", {
  variants: {
    variant: {
      /** Marketing hero – responsive 4xl→5xl bold */
      hero:     "text-4xl md:text-5xl font-bold leading-tight tracking-tight",
      /** Page title – xl bold */
      h1:       "text-xl font-bold tracking-tight leading-tight",
      /** Section header – lg semibold */
      h2:       "text-lg font-semibold leading-snug",
      /** Card / panel header – base semibold */
      h3:       "text-base font-semibold leading-snug",
      /** Sub-section label – sm semibold */
      h4:       "text-sm font-semibold leading-snug",
      /** Small label inside a card – xs semibold */
      h5:       "text-xs font-semibold leading-snug",
      /** Overline / section divider – 11 px, uppercase, tracked */
      overline: "text-[11px] font-semibold uppercase tracking-wider leading-none",
      /** Large body copy – base */
      "body-lg": "text-base leading-relaxed",
      /** Default body copy – sm */
      body:     "text-sm leading-relaxed",
      /** Secondary helper body – xs */
      "body-sm": "text-xs leading-relaxed",
      /** Caption / meta / timestamp – xs */
      caption:  "text-xs leading-snug",
      /** Dense UI badge text – 10 px */
      micro:    "text-[10px] leading-snug",
    },
    color: {
      default:     "text-foreground",
      muted:       "text-muted-foreground",
      primary:     "text-primary",
      destructive: "text-destructive",
      inverse:     "text-primary-foreground",
      success:     "text-green-600 dark:text-green-400",
    },
    /** Optional weight override – use sparingly; prefer semantic variants */
    weight: {
      normal:   "font-normal",
      medium:   "font-medium",
      semibold: "font-semibold",
      bold:     "font-bold",
    },
    /** Text truncation helpers */
    truncate: {
      true:           "truncate",
      false:          "",
      "line-clamp-1": "line-clamp-1",
      "line-clamp-2": "line-clamp-2",
      "line-clamp-3": "line-clamp-3",
    } as const,
  },
  defaultVariants: {
    variant: "body",
    color:   "default",
  },
});

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Allowed HTML tags for the `as` prop */
type TypographyElement =
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "p" | "span" | "div" | "li" | "dt" | "dd"
  | "label" | "legend" | "figcaption" | "blockquote";

/** Maps variant → sensible default element */
const DEFAULT_ELEMENT: Record<
  NonNullable<VariantProps<typeof typographyVariants>["variant"]>,
  TypographyElement
> = {
  hero:      "h1",
  h1:        "h1",
  h2:        "h2",
  h3:        "h3",
  h4:        "h4",
  h5:        "h5",
  overline:  "p",
  "body-lg": "p",
  body:      "p",
  "body-sm": "p",
  caption:   "p",
  micro:     "p",
};

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof typographyVariants> {
  /**
   * Override the rendered HTML element without changing the visual variant.
   * Defaults to the semantic element for the chosen variant (e.g. `h2` for
   * variant="h2", `p` for variant="body").
   */
  as?: TypographyElement;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Typography primitive — wraps any heading or paragraph with a consistent set
 * of size, weight, and colour variants derived from the design system.
 *
 * @example
 * // Section header
 * <Typography variant="h2">Sign-in error</Typography>
 *
 * @example
 * // Muted helper text
 * <Typography variant="body" color="muted">
 *   Something went wrong during sign-in. Please try again.
 * </Typography>
 *
 * @example
 * // Overline rendered as span inside a flex row
 * <Typography variant="overline" color="muted" as="span">
 *   Trending
 * </Typography>
 *
 * @example
 * // Destructive section label
 * <Typography variant="h4" color="destructive">Danger Zone</Typography>
 */
const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      variant = "body",
      color,
      weight,
      truncate,
      as,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Element = (as ?? DEFAULT_ELEMENT[variant ?? "body"]) as React.ElementType;

    return (
      <Element
        ref={ref}
        className={cn(
          typographyVariants({ variant, color, weight, truncate }),
          className
        )}
        {...props}
      >
        {children}
      </Element>
    );
  }
);

Typography.displayName = "Typography";

// ─── Named convenience exports ─────────────────────────────────────────────────
// These let you write <Heading2> instead of <Typography variant="h2"> in
// components that use only one or two variants.

/** Page title (h1, xl bold) */
export const Heading1 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="h1" {...props} />);
Heading1.displayName = "Heading1";

/** Section header (h2, lg semibold) */
export const Heading2 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="h2" {...props} />);
Heading2.displayName = "Heading2";

/** Card header (h3, base semibold) */
export const Heading3 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="h3" {...props} />);
Heading3.displayName = "Heading3";

/** Sub-section label (h4, sm semibold) */
export const Heading4 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="h4" {...props} />);
Heading4.displayName = "Heading4";

/** Default body copy (p, sm) */
export const BodyText = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="body" {...props} />);
BodyText.displayName = "BodyText";

/** Muted helper / secondary body (p, xs muted) */
export const MutedText = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="body-sm" color="muted" {...props} />);
MutedText.displayName = "MutedText";

/** Caption / timestamp / meta (p, xs) */
export const Caption = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="caption" color="muted" {...props} />);
Caption.displayName = "Caption";

/** Overline section divider (p, 11 px, uppercase, tracked, muted) */
export const Overline = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="overline" color="muted" {...props} />);
Overline.displayName = "Overline";

/** Micro / badge text (p or span, 10 px) */
export const MicroText = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} variant="micro" color="muted" {...props} />);
MicroText.displayName = "MicroText";

export { typographyVariants };
export default Typography;
