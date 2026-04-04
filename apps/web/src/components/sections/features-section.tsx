import * as React from "react";
import {
  FolderHeartIcon, BrainCircuitIcon, UsersIcon,
  SmartphoneIcon, SearchIcon, QrCodeIcon,
  FileTextIcon, ActivityIcon, ShieldCheckIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container, Section, Stack, Grid } from "@/core/primitives";
import { SectionHeader } from "@/components/ui/section-header";
import { FeatureCard } from "@/components/ui/feature-card";

export const ALL_FEATURES: {
  icon: LucideIcon;
  title: string;
  description: string;
  highlighted?: boolean;
}[] = [
  {
    icon: FolderHeartIcon,
    title: "Secure Document Vault",
    description:
      "Store all your lab reports, prescriptions, imaging, and discharge summaries in one encrypted, organised vault.",
  },
  {
    icon: BrainCircuitIcon,
    title: "AI-Powered Extraction",
    description:
      "GPT-4o reads every document and automatically extracts key values — no manual tagging required.",
    highlighted: true,
  },
  {
    icon: UsersIcon,
    title: "Family Health Groups",
    description:
      "Securely share records with family members, caregivers, or your doctor with granular permissions.",
  },
  {
    icon: SmartphoneIcon,
    title: "OTP-Only Access",
    description:
      "No usernames or passwords. Login with your phone number and a one-time OTP — always safe.",
  },
  {
    icon: SearchIcon,
    title: "Smart Health Search",
    description:
      "Ask questions like 'What was my haemoglobin last year?' and get instant answers from your own records.",
  },
  {
    icon: QrCodeIcon,
    title: "Emergency QR Card",
    description:
      "Print a wallet-sized QR card. One scan gives emergency staff access to your critical health summary.",
  },
  {
    icon: FileTextIcon,
    title: "50+ Document Types",
    description:
      "Lab reports, prescriptions, radiology, vaccination records, discharge summaries, dental, and more.",
  },
  {
    icon: ActivityIcon,
    title: "Health Timeline",
    description:
      "See your complete health history in a beautiful, chronological timeline — across all records.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Zero-Knowledge Privacy",
    description:
      "Your documents are encrypted before storage. Even our team cannot read your medical records.",
  },
];

interface FeaturesSectionProps {
  limit?: number;
  showHeader?: boolean;
  align?: "left" | "center";
}

export const FeaturesSection = ({
  limit,
  showHeader = true,
  align = "center",
}: FeaturesSectionProps) => {
  const features = limit ? ALL_FEATURES.slice(0, limit) : ALL_FEATURES;
  return (
    <Section>
      <Container>
        <Stack gap="xl" align={align}>
          {showHeader && (
            <SectionHeader
              eyebrow="Features"
              title="Everything your family's health needs"
              description="From secure storage to AI-powered insights — ArogyaVault handles every aspect of your personal health records."
              align={align}
            />
          )}
          <Grid cols={3} gap="md">
            {features.map((f) => (
              <FeatureCard
                key={f.title}
                icon={f.icon}
                title={f.title}
                description={f.description}
                variant={f.highlighted ? "highlighted" : "default"}
              />
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
};
