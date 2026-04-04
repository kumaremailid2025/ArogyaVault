import * as React from "react";
import Link from "next/link";
import { ArrowRightIcon, HeartPulseIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { Container, Section, Stack, Row } from "@/core/primitives";
import { H2, Lead } from "@/core/primitives";

interface CtaSectionProps {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export const CtaSection = ({
  title = "Ready to secure your family's health records?",
  description = "Join thousands of Indian families who've already moved their medical records to ArogyaVault. It takes less than 2 minutes to get started.",
  primaryLabel = "Get Started Free",
  primaryHref = "/contact",
  secondaryLabel = "Learn More",
  secondaryHref = "/how-it-works",
}: CtaSectionProps) => {
  return (
    <Section className="bg-primary text-primary-foreground">
      <Container>
        <Stack gap="lg" align="center" className="text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
            <HeartPulseIcon className="size-8" />
          </div>
          <H2 className="max-w-2xl text-primary-foreground">{title}</H2>
          <Lead className="max-w-xl text-primary-foreground/80">{description}</Lead>
          <Row gap="sm" wrap className="justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          </Row>
        </Stack>
      </Container>
    </Section>
  );
};
