import * as React from "react";
import Link from "next/link";
import {
  ShieldCheckIcon, KeyIcon, ServerIcon,
  EyeOffIcon, LockIcon, CheckCircleIcon, ArrowRightIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { Container, Section, Stack, Row, Grid } from "@/core/primitives";
import { H2, H4, Lead, Text, Eyebrow, Muted } from "@/core/primitives";
import { Surface, GradientBadge } from "@/core/primitives";
import { SectionHeader } from "@/components/ui/section-header";

export const SECURITY_PILLARS: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: LockIcon,
    title: "256-bit AES Encryption",
    description:
      "Every document is encrypted before it leaves your device and stays encrypted at rest on AWS S3.",
  },
  {
    icon: KeyIcon,
    title: "OTP-Only Authentication",
    description:
      "There are no passwords to steal or forget. You authenticate with a one-time code sent to your phone.",
  },
  {
    icon: EyeOffIcon,
    title: "Zero-Knowledge Architecture",
    description:
      "Our servers never hold your decryption keys. Even our engineering team cannot read your documents.",
  },
  {
    icon: ServerIcon,
    title: "AWS Enterprise Infrastructure",
    description:
      "Hosted on AWS with RDS, S3, and CloudFront. SOC 2 compliant infrastructure with 99.9% uptime SLA.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Audit Logs",
    description:
      "Every access, share, and download is logged. You can review a complete activity trail any time.",
  },
  {
    icon: CheckCircleIcon,
    title: "HIPAA-Grade Standards",
    description:
      "Built to HIPAA-aligned security standards so your data is always treated with medical-grade care.",
  },
];

interface SecuritySectionProps {
  compact?: boolean;
  showHeader?: boolean;
}

export function SecuritySection({
  compact = false,
  showHeader = true,
}: SecuritySectionProps) {
  const pillars = compact ? SECURITY_PILLARS.slice(0, 3) : SECURITY_PILLARS;
  return (
    <Section className="bg-muted/30">
      <Container>
        <Stack gap="xl" align="center">
          {showHeader && (
            <SectionHeader
              eyebrow="Security & Privacy"
              title="Your records. Your control. Always."
              description="We built ArogyaVault with security as the foundation — not an afterthought. Your medical data is too important to compromise."
              align="center"
            />
          )}
          <Grid cols={3} gap="md">
            {pillars.map(({ icon: Icon, title, description }) => (
              <Surface
                key={title}
                variant="bordered"
                padding="lg"
                className="flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <H4 className="text-base">{title}</H4>
                <Text className="text-sm text-muted-foreground leading-relaxed">{description}</Text>
              </Surface>
            ))}
          </Grid>
          {!compact && (
            <Button asChild variant="outline" className="gap-2">
              <Link href="/security">
                Read our full security overview
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
