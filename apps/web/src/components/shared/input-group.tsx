"use client";

/**
 * InputGroup
 * ----------
 * Generic grouped input component with optional left/right addons.
 *
 * Architecture ref: ARCHITECTURE.md — Page → Container → **Component** → Core UI
 *
 * @example
 * ```tsx
 * // Left addon only (country code + phone input)
 * <InputGroup left="+91">
 *   <Input placeholder="XXXXX XXXXX" />
 * </InputGroup>
 *
 * // Left + right (currency input)
 * <InputGroup left="$" right=".00">
 *   <Input placeholder="0" />
 * </InputGroup>
 * ```
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────────── */

export type InputGroupAddon = React.ReactNode;

export interface InputGroupProps extends React.ComponentProps<"div"> {
  /** Content rendered in the left addon slot. */
  left?: InputGroupAddon;
  /** Content rendered in the right addon slot. */
  right?: InputGroupAddon;
  children: React.ReactNode;
}

/* ── Addon wrapper ────────────────────────────────────────────────── */

interface AddonProps {
  children: React.ReactNode;
  position: "left" | "right";
  className?: string;
}

const Addon = ({ children, position, className }: AddonProps) => {
  if (!children) return null;

  return (
    <span
      className={cn(
        "flex h-11 shrink-0 items-center border border-input bg-muted px-3 text-sm font-medium text-muted-foreground select-none",
        position === "left" && "rounded-l-md border-r-0",
        position === "right" && "rounded-r-md border-l-0",
        className,
      )}
    >
      {children}
    </span>
  );
};

/* ── InputGroup ───────────────────────────────────────────────────── */

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ left, right, children, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center", className)}
        {...rest}
      >
        {left && <Addon position="left">{left}</Addon>}

        <div
          className={cn(
            "flex-1 [&>input]:h-11 [&>input]:text-base",
            left && "[&>input]:rounded-l-none",
            right && "[&>input]:rounded-r-none",
          )}
        >
          {children}
        </div>

        {right && <Addon position="right">{right}</Addon>}
      </div>
    );
  },
);

InputGroup.displayName = "InputGroup";

export { InputGroup };
