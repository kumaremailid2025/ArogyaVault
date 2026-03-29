import * as React from "react";
import Link from "next/link";
import {
  SmartphoneIcon, UploadCloudIcon, BrainCircuitIcon,
  Share2Icon, ArrowRightIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Container, Section, Stack, Grid } from "@/core/primitives";
import { SectionHeader } from "@/components/ui/section-header";
import { StepCard } from "@/components/ui/step-card";

export const STEPS = [
  {
    step: 1,
    icon: SmartphoneIcon,
    title: "Register with Phone",
    description:
      "Enter your mobile number and verify with a one-time OTP. No email or password needed — ever.",
  },
  {
    step: 2,
    icon: UploadCloudIcon,
    title: "Upload Any Document",
    description:
      "Take a photo, scan, or upload a PDF. ArogyaVault accepts any format from any hospital.",
  },
  {
    step: 3,
    icon: BrainCircuitIcon,
    title: "AI Organises It",
    description:
      "GPT-4o reads your document, extracts key data, categorises it, and adds it to your timeline.",
  },
  {
    step: 4,
    icon: Share2Icon,
    title: "Access & Share",
    description:
      "View your records anytime, share securely with family or doctors, and print emergency cards.",
  },
];

interface HowItWorksSectionProps {
  showCta?: boolean;
  align?: "left" | "center";
}

export function HowItWorksSection({
  showCta = true,
  align = "center",
}: HowItWorksSectionProps) {
  return (
    <Section className="bg-muted/30">
      <Container>
        <Stack gap="xl" align={align}>
          <SectionHeader
            eyebrow="How It Works"
            title="From paper to digital in under a minute"
            description="ArogyaVault makes it simple to go from scattered paper records to a smart, organised digital vault."
            align={align}
          />
          <div className="group grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <StepCard
                key={step.title}
                {...step}
                isLast={i === STEPS.length - 1}
              />
            ))}
          </div>
          {showCta && (
            <Button asChild size="lg" className="gap-2">
              <Link href="/contact">
                Start Your Health Vault
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
