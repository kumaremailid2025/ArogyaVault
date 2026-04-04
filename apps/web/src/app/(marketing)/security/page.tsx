import type { Metadata } from "next";
import { SecuritySection, SECURITY_PILLARS } from "@/components/sections/security-section";
import { CtaSection } from "@/components/sections/cta-section";
import { PageHero }   from "@/components/ui/page-hero";
import { Container, Section, Stack, Grid, Row } from "@/core/primitives";
import { H3, H4, Text, Eyebrow, Muted } from "@/core/primitives";
import { Surface } from "@/core/primitives";
import { ShieldCheckIcon, CheckCircleIcon } from "lucide-react";
import { Badge } from "@/core/ui/badge";

export const metadata: Metadata = {
  title: "Security & Privacy — ArogyaVault",
  description: "Learn how ArogyaVault protects your medical records with enterprise-grade security and zero-knowledge architecture.",
};

const COMPLIANCE_BADGES = [
  "AWS SOC 2 Infrastructure",
  "HIPAA-Aligned Standards",
  "256-bit AES Encryption",
  "TLS 1.3 In Transit",
  "Zero-Knowledge Architecture",
  "OTP-Only Authentication",
];

const PRIVACY_PRINCIPLES = [
  {
    title: "We never sell your data",
    description: "Your health information is never shared with advertisers, insurers, or third parties of any kind.",
  },
  {
    title: "You own your data",
    description: "You can export all your records or delete your account and all data permanently at any time.",
  },
  {
    title: "Minimal data collection",
    description: "We only collect what is strictly necessary to provide the service — your phone number and your documents.",
  },
  {
    title: "Transparent access logs",
    description: "Every access event is logged. You can see exactly who viewed your records and when.",
  },
];

const SecurityPage = () => {
  return (
    <>
      <PageHero
        eyebrow="Security & Privacy"
        title="Your medical data deserves the highest protection"
        description="We built ArogyaVault with security as the foundation — not as an afterthought. Here is exactly how we protect your records."
      />

      <SecuritySection showHeader={false} compact={false} />

      {/* Compliance */}
      <Section className="bg-muted/30">
        <Container>
          <Stack gap="xl" align="center">
            <Stack gap="sm" align="center" className="text-center">
              <Eyebrow>Compliance</Eyebrow>
              <H3 className="text-2xl font-bold">Built to the highest standards</H3>
            </Stack>
            <Row wrap gap="sm" className="justify-center">
              {COMPLIANCE_BADGES.map((badge) => (
                <div key={badge} className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
                  <ShieldCheckIcon className="size-4 text-primary" />
                  <Text className="text-sm font-medium">{badge}</Text>
                </div>
              ))}
            </Row>
          </Stack>
        </Container>
      </Section>

      {/* Privacy principles */}
      <Section>
        <Container>
          <Stack gap="xl" align="center">
            <Stack gap="sm" align="center" className="text-center">
              <Eyebrow>Privacy Principles</Eyebrow>
              <H3 className="text-2xl font-bold">Our commitment to your privacy</H3>
            </Stack>
            <Grid cols={2} gap="md">
              {PRIVACY_PRINCIPLES.map(({ title, description }) => (
                <Surface key={title} variant="bordered" padding="lg" className="flex gap-4">
                  <CheckCircleIcon className="size-5 shrink-0 text-primary mt-0.5" />
                  <Stack gap="xs">
                    <H4 className="text-base">{title}</H4>
                    <Text className="text-sm text-muted-foreground leading-relaxed">{description}</Text>
                  </Stack>
                </Surface>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>

      <CtaSection
        title="Your health data, protected at every step"
        description="Start storing your family's health records with the security they deserve."
        primaryLabel="Create Secure Vault"
        secondaryLabel="View Features"
        secondaryHref="/features"
      />
    </>
  );
};

export default SecurityPage;
