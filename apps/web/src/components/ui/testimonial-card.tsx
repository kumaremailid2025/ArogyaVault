import * as React from "react";
import { QuoteIcon, StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Surface } from "@/core/primitives";
import { Text, Muted, Small } from "@/core/primitives";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  location: string;
  rating?: number;
  className?: string;
}

export function TestimonialCard({
  quote,
  name,
  role,
  location,
  rating = 5,
  className,
}: TestimonialCardProps) {
  return (
    <Surface
      variant="bordered"
      padding="lg"
      className={cn("flex flex-col gap-4 hover:shadow-md transition-shadow", className)}
    >
      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: rating }).map((_, i) => (
          <StarIcon key={i} className="size-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      {/* Quote */}
      <div className="relative flex-1">
        <QuoteIcon className="absolute -top-1 -left-1 size-6 text-primary/20" />
        <Text className="text-sm leading-relaxed text-muted-foreground pl-4">{quote}</Text>
      </div>
      {/* Author */}
      <div className="flex items-center gap-3 border-t border-border pt-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {name.charAt(0)}
        </div>
        <div>
          <Small className="text-foreground font-semibold block">{name}</Small>
          <Muted className="text-xs">{role} · {location}</Muted>
        </div>
      </div>
    </Surface>
  );
}
