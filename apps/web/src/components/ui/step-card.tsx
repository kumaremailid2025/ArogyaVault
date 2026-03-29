import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { H4, Text, Muted } from "@/core/primitives";

interface StepCardProps {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  isLast?: boolean;
  className?: string;
}

export function StepCard({
  step,
  icon: Icon,
  title,
  description,
  isLast = false,
  className,
}: StepCardProps) {
  return (
    <div className={cn("relative flex flex-col items-center text-center gap-4", className)}>
      {/* Connector line */}
      {!isLast && (
        <div className="absolute top-10 left-1/2 hidden h-0.5 w-full translate-x-5 bg-gradient-to-r from-primary/40 to-transparent lg:block" />
      )}
      {/* Step number + icon */}
      <div className="relative flex flex-col items-center gap-2">
        <div className="flex size-20 flex-col items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 transition-all group-hover:bg-primary/20">
          <Icon className="size-8 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background">
          {step}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <H4 className="text-base">{title}</H4>
        <Text className="text-sm text-muted-foreground leading-relaxed">{description}</Text>
      </div>
    </div>
  );
}
