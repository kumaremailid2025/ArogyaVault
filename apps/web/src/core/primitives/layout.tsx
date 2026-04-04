import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Page-level wrappers ─────────────────────────────────────────────────────

/** Constrains content to max-width with horizontal padding */
export const Container = ({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & { size?: "sm" | "default" | "lg" | "full" }) => {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        size === "sm" && "max-w-3xl",
        size === "default" && "max-w-6xl",
        size === "lg" && "max-w-7xl",
        size === "full" && "max-w-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/** Semantic section with consistent vertical padding */
export const Section = ({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<"section"> & { size?: "sm" | "default" | "lg" }) => {
  return (
    <section
      className={cn(
        size === "sm" && "py-10 md:py-14",
        size === "default" && "py-16 md:py-24",
        size === "lg" && "py-24 md:py-32",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
};

/** Vertical flex stack */
export const Stack = ({
  className,
  gap = "md",
  align,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end";
}) => {
  return (
    <div
      className={cn(
        "flex flex-col",
        gap === "xs" && "gap-1",
        gap === "sm" && "gap-2",
        gap === "md" && "gap-4",
        gap === "lg" && "gap-6",
        gap === "xl" && "gap-8",
        align === "start" && "items-start",
        align === "center" && "items-center",
        align === "end" && "items-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/** Horizontal flex row */
export const Row = ({
  className,
  gap = "md",
  align = "center",
  wrap = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  wrap?: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex flex-row",
        gap === "xs" && "gap-1",
        gap === "sm" && "gap-2",
        gap === "md" && "gap-4",
        gap === "lg" && "gap-6",
        gap === "xl" && "gap-8",
        align === "start" && "items-start",
        align === "center" && "items-center",
        align === "end" && "items-end",
        align === "stretch" && "items-stretch",
        wrap && "flex-wrap",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/** Responsive CSS grid */
export const Grid = ({
  className,
  cols = 3,
  gap = "md",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: "sm" | "md" | "lg";
}) => {
  return (
    <div
      className={cn(
        "grid",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 md:grid-cols-2",
        cols === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        cols === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        cols === 6 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
        gap === "sm" && "gap-4",
        gap === "md" && "gap-6",
        gap === "lg" && "gap-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/** Generic flex container */
export const Flex = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div className={cn("flex", className)} {...props}>
      {children}
    </div>
  );
};

/** Full-bleed banner/hero area */
export const Banner = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
};

/** Divider */
export const Divider = ({ className, ...props }: React.ComponentProps<"hr">) => {
  return <hr className={cn("border-border my-8", className)} {...props} />;
};
