import * as React from "react";
import { cn } from "@/lib/utils";
import { Eyebrow, H2, Lead } from "@/core/primitives";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}

export const SectionHeader = ({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  titleClassName,
}: SectionHeaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        align === "left" && "items-start text-left",
        className
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <H2 className={cn("max-w-2xl", titleClassName)}>{title}</H2>
      {description && (
        <Lead className="max-w-2xl">{description}</Lead>
      )}
    </div>
  );
};
