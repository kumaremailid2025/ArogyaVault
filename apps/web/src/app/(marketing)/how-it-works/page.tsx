import type { Metadata } from "next";
import { HowItWorksSection, STEPS } from "@/components/sections/how-it-works-section";
import { GroupsSection }   from "@/components/sections/groups-section";
import { CtaSection }      from "@/components/sections/cta-section";
import { PageHero }        from "@/components/ui/page-hero";
import { Container, Section, Stack, Grid } from "@/core/primitives";
import { H3, Text, Eyebrow } from "@/core/primitives";
import { Surface } from "@/core/primitives";
import { CheckCircleIcon } from "lucide-react";
import { Row } from "@/core/primitives";

export const metadata: Metadata = {
  title: "How It Works — ArogyaVault",
  description: "Learn how ArogyaVault makes it simple to digitise, organise, and share your family's health records.",
};

const UPLOAD_TIPS = [
  "Take a clear photo in good lighting",
  "PDF uploads are processed with higher accuracy",
  "Multiple pages can be uploaded as a single document",
  "Blurry or low-contrast scans still work — AI handles them",
  "Supported formats: JPG, PNG, PDF, HEIC, TIFF",
];

const HowItWorksPage = () => {
  return (
    <>
      <PageHero
        eyebrow="How It Works"
        title="From paper to digital in under a minute"
        description="ArogyaVault makes it simple for anyone — regardless of age or tech skill — to manage their family's medical records."
      />

      <HowItWorksSection showCta={false} />

      {/* Upload tips */}
      <Section>
        <Container size="sm">
          <Stack gap="xl" align="center">
            <Stack gap="sm" align="center" className="text-center">
              <Eyebrow>Upload Tips</Eyebrow>
              <H3 className="text-xl font-bold">Get the best results from your uploads</H3>
            </Stack>
            <Grid cols={1} gap="sm" className="w-full">
              {UPLOAD_TIPS.map((tip) => (
                <Surface key={tip} variant="bordered" padding="md" className="flex items-start gap-3">
                  <CheckCircleIcon className="size-5 shrink-0 text-primary mt-0.5" />
                  <Text className="text-sm">{tip}</Text>
                </Surface>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>

      <div id="families">
        <GroupsSection />
      </div>

      <CtaSection
        title="Ready to get started?"
        description="It takes less than 2 minutes to set up your free health vault."
        primaryLabel="Create Your Free Vault"
        secondaryLabel="View Features"
        secondaryHref="/features"
      />
    </>
  );
};

export default HowItWorksPage;
