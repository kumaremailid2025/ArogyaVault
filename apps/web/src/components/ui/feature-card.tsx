import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Surface } from "@/core/primitives";
import { H4, Text } from "@/core/primitives";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  variant?: "default" | "highlighted";
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
  variant = "default",
}: FeatureCardProps) {
  return (
    <Surface
      variant={variant === "highlighted" ? "primary" : "bordered"}
      padding="lg"
      className={cn(
        "group flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        className
      )}
    >
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-xl transition-colors",
          variant === "highlighted"
            ? "bg-primary-foreground/20 text-primary-foreground"
            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col gap-1.5">
        <H4
          className={cn(
            "text-base",
            variant === "highlighted" && "text-primary-foreground"
          )}
        >
          {title}
        </H4>
        <Text
          className={cn(
            "text-sm leading-relaxed",
            variant === "highlighted"
              ? "text-primary-foreground/80"
              : "text-muted-foreground"
          )}
        >
          {description}
        </Text>
      </div>
    </Surface>
  );
}
