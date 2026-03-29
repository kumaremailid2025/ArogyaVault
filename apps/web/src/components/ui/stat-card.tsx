import * as React from "react";
import { cn } from "@/lib/utils";
import { H2, Text, Muted } from "@/core/primitives";

interface StatCardProps {
  value: string;
  label: string;
  sublabel?: string;
  className?: string;
}

export function StatCard({ value, label, sublabel, className }: StatCardProps) {
  return (
    <div className={cn("flex flex-col items-center gap-1 text-center", className)}>
      <H2 className="text-4xl font-bold text-primary lg:text-5xl">{value}</H2>
      <Text className="font-semibold text-foreground">{label}</Text>
      {sublabel && <Muted className="text-xs">{sublabel}</Muted>}
    </div>
  );
}
