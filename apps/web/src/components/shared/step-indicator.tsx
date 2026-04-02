"use client";

/**
 * StepIndicator
 * -------------
 * A generic multi-step progress indicator. Renders numbered dots
 * connected by separator lines. Steps are marked as pending, active,
 * or done.
 *
 * Architecture ref: ARCHITECTURE.md — Page → Container → **Component** → Core UI
 *
 * @example
 * ```tsx
 * // Two-step flow
 * <StepIndicator totalSteps={2} currentStep={1} />
 *
 * // Three-step onboarding
 * <StepIndicator totalSteps={3} currentStep={2} />
 * ```
 */

import { CheckCircle2Icon } from "lucide-react";
import { Separator } from "@/core/ui/separator";
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────────── */

export interface StepIndicatorProps {
  /** Total number of steps (minimum 2). */
  totalSteps: number;
  /**
   * The current active step (1-indexed).
   * Steps before this are marked "done"; this step is "active";
   * steps after are "pending".
   */
  currentStep: number;
  /** Optional className on the root container. */
  className?: string;
}

/* ── Sub-component: single dot ────────────────────────────────────── */

const StepDot = ({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) => {
  return (
    <div
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold border-2 transition-colors sm:size-8",
        done
          ? "bg-primary border-primary text-primary-foreground"
          : active
            ? "border-primary text-primary"
            : "border-border text-muted-foreground",
      )}
    >
      {done ? <CheckCircle2Icon className="size-3.5 sm:size-4" /> : label}
    </div>
  );
};

/* ── Main component ───────────────────────────────────────────────── */

export const StepIndicator = ({
  totalSteps,
  currentStep,
  className,
}: StepIndicatorProps) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)}>
      {steps.map((stepNum) => {
        const done = stepNum < currentStep;
        const active = stepNum <= currentStep;
        const isLast = stepNum === totalSteps;

        return (
          <div key={stepNum} className={cn("flex items-center gap-2 sm:gap-3", !isLast && "flex-1")}>
            <StepDot
              active={active}
              done={done}
              label={String(stepNum)}
            />
            {!isLast && (
              <Separator
                className={cn(
                  "flex-1 transition-colors",
                  stepNum < currentStep ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
