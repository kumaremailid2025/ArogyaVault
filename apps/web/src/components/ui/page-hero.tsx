import * as React from "react";
import { cn } from "@/lib/utils";
import { Container, Section, Stack } from "@/core/primitives";
import { Eyebrow, H1, Lead } from "@/core/primitives";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

/** Compact hero banner used on inner pages (Features, About, etc.) */
export function PageHero({ eyebrow, title, description, className, children }: PageHeroProps) {
  return (
    <div className={cn("bg-muted/40 border-b border-border", className)}>
      <Container>
        <Section size="sm">
          <Stack gap="md" align="center" className="text-center">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <H1 className="max-w-3xl text-3xl lg:text-4xl">{title}</H1>
            {description && <Lead className="max-w-2xl">{description}</Lead>}
            {children}
          </Stack>
        </Section>
      </Container>
    </div>
  );
}
