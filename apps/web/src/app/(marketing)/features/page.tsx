import type { Metadata } from "next";
import { FeaturesSection, ALL_FEATURES } from "@/components/sections/features-section";
import { CtaSection }       from "@/components/sections/cta-section";
import { PageHero }         from "@/components/ui/page-hero";
import { Container, Section, Stack, Grid, Row } from "@/core/primitives";
import { H3, Text, Eyebrow } from "@/core/primitives";
import { Badge } from "@/core/ui/badge";

export const metadata: Metadata = {
  title: "Features — ArogyaVault",
  description: "Explore all the powerful features that make ArogyaVault India's most trusted personal health records platform.",
};

const DOCUMENT_TYPES = [
  "Lab Reports", "Blood Tests", "Urine Tests", "Lipid Profiles",
  "Prescriptions", "Discharge Summaries", "X-Ray Reports",
  "MRI Scans", "CT Scans", "Ultrasound", "ECG / EEG",
  "Vaccination Records", "Dental Records", "Eye Reports",
  "Cardiology", "Nephrology", "Oncology Reports",
  "Surgery Notes", "Physiotherapy", "Mental Health",
];

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="Every feature your family's health deserves"
        description="From secure storage to AI-powered Q&A — ArogyaVault is the only health records platform your family will ever need."
      />
      <FeaturesSection showHeader={false} />

      {/* Document types section */}
      <Section className="bg-muted/30">
        <Container>
          <Stack gap="xl" align="center">
            <Stack gap="sm" align="center" className="text-center">
              <Eyebrow>Supported Documents</Eyebrow>
              <H3 className="text-2xl font-bold">50+ document types supported</H3>
              <Text className="text-muted-foreground max-w-xl">
                If your hospital or clinic generates it, ArogyaVault can store,
                read, and organise it — across all specialities.
              </Text>
            </Stack>
            <Row wrap gap="sm" className="justify-center max-w-3xl">
              {DOCUMENT_TYPES.map((type) => (
                <Badge key={type} variant="secondary" className="text-sm px-3 py-1">
                  {type}
                </Badge>
              ))}
            </Row>
          </Stack>
        </Container>
      </Section>

      <CtaSection
        title="Ready to experience all these features?"
        primaryLabel="Create Your Free Vault"
        secondaryLabel="See How It Works"
        secondaryHref="/how-it-works"
      />
    </>
  );
}
