import * as React from "react";
import Link from "next/link";
import {
  ShieldCheckIcon, BrainCircuitIcon, UsersIcon,
  ArrowRightIcon, PlayCircleIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Container, Section, Stack, Row, Banner, Grid } from "@/core/primitives";
import { H1, Lead, Highlight, Small } from "@/core/primitives";
import { GradientBadge } from "@/core/primitives";

const TRUST_BADGES = [
  { icon: ShieldCheckIcon, label: "OTP-Only Login" },
  { icon: BrainCircuitIcon, label: "AI-Powered" },
  { icon: UsersIcon,        label: "Family Groups" },
];

export const HeroSection = () => {
  return (
    <Banner className="bg-gradient-to-b from-background via-secondary/30 to-background">
      <Container>
        <Section size="lg">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left — copy */}
            <Stack gap="lg">
              <GradientBadge>
                <BrainCircuitIcon className="size-3" />
                Now with GPT-4o AI Analysis
              </GradientBadge>

              <H1>
                Your Health Records.{" "}
                <Highlight>Secure.</Highlight>{" "}
                <Highlight>Organised.</Highlight>{" "}
                Always Ready.
              </H1>

              <Lead>
                ArogyaVault uses AI to digitise, organise, and safeguard your
                family&apos;s medical documents — accessible anywhere with just
                your phone number.
              </Lead>

              {/* CTAs */}
              <Row gap="sm" wrap>
                <Button asChild size="lg" className="gap-2">
                  <Link href="/contact">
                    Get Started Free
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link href="/how-it-works">
                    <PlayCircleIcon className="size-4" />
                    See How It Works
                  </Link>
                </Button>
              </Row>

              {/* Trust badges */}
              <Row gap="md" wrap className="pt-2">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <Row key={label} gap="xs" className="text-muted-foreground">
                    <Icon className="size-4 text-primary" />
                    <Small>{label}</Small>
                  </Row>
                ))}
              </Row>
            </Stack>

            {/* Right — abstract visual */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative size-[420px]">
                {/* Background glow */}
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />
                {/* Central phone mockup */}
                <div className="absolute inset-8 flex flex-col rounded-3xl border-2 border-primary/20 bg-card shadow-2xl overflow-hidden">
                  {/* Phone status bar */}
                  <div className="flex items-center justify-between bg-primary px-4 py-3">
                    <Small className="text-primary-foreground font-semibold">ArogyaVault</Small>
                    <ShieldCheckIcon className="size-4 text-primary-foreground/80" />
                  </div>
                  {/* Phone content */}
                  <div className="flex flex-col gap-3 p-4 flex-1">
                    <div className="h-3 w-3/4 rounded-full bg-muted" />
                    <div className="h-3 w-1/2 rounded-full bg-muted" />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {["Lab Report", "Prescription", "Imaging", "Discharge"].map((t) => (
                        <div key={t} className="flex flex-col gap-1 rounded-xl bg-primary/8 p-3">
                          <div className="size-5 rounded bg-primary/20" />
                          <div className="h-2 w-full rounded-full bg-muted" />
                          <Small className="text-[10px] text-muted-foreground">{t}</Small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -right-4 top-12 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
                  <BrainCircuitIcon className="size-4 text-primary" />
                  <Small className="text-xs font-medium">AI Extracted</Small>
                </div>
                <div className="absolute -left-4 bottom-16 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
                  <ShieldCheckIcon className="size-4 text-green-500" />
                  <Small className="text-xs font-medium">256-bit encrypted</Small>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </Container>
    </Banner>
  );
};
