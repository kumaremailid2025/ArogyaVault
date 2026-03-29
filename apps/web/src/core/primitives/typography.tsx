import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Headings ────────────────────────────────────────────────────────────────

export function H1({ className, children, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-bold tracking-tight text-foreground lg:text-5xl xl:text-6xl",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({ className, children, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "scroll-m-20 text-3xl font-bold tracking-tight text-foreground lg:text-4xl",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function H3({ className, children, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function H4({ className, children, ...props }: React.ComponentProps<"h4">) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </h4>
  );
}

// ─── Body Text ───────────────────────────────────────────────────────────────

export function Text({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("leading-7 text-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function Lead({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-lg leading-8 text-muted-foreground md:text-xl", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function Muted({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function Small({ className, children, ...props }: React.ComponentProps<"small">) {
  return (
    <small
      className={cn("text-sm font-medium leading-none text-muted-foreground", className)}
      {...props}
    >
      {children}
    </small>
  );
}

export function Large({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-lg font-semibold text-foreground", className)} {...props}>
      {children}
    </div>
  );
}

export function InlineCode({ className, children, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}

export function Highlight({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-primary font-semibold", className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-block text-xs font-semibold uppercase tracking-widest text-primary",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
