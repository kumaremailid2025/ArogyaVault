import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Surface — a styled div with elevation, radius, and background tokens.
 * Sits between a raw div and the full shadcn Card (which has opinions about padding/gap).
 * Use when you need a contained block but want to control layout yourself.
 */
export function Surface({
  className,
  variant = "default",
  padding = "md",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "muted" | "primary" | "bordered" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "rounded-xl",
        variant === "default" && "bg-card text-card-foreground shadow-sm",
        variant === "muted" && "bg-muted text-foreground",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "bordered" && "bg-background border border-border",
        variant === "ghost" && "bg-transparent",
        padding === "none" && "p-0",
        padding === "sm" && "p-3",
        padding === "md" && "p-5",
        padding === "lg" && "p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * GradientBadge — a small pill with a gradient background, used for eyebrow labels.
 */
export function GradientBadge({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * GlassCard — translucent card for use over coloured/image backgrounds.
 */
export function GlassCard({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
