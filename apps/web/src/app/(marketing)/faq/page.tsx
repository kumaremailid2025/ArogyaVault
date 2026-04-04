import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { FaqSection, ALL_FAQS } from "@/components/sections/faq-section";
import { CtaSection } from "@/components/sections/cta-section";
import { Container, Section, Grid, Stack, Row } from "@/core/primitives/layout";
import { H3, Text, Muted, Eyebrow } from "@/core/primitives/typography";
import { Surface } from "@/core/primitives/surface";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/core/ui/badge";
import {
  Shield,
  Smartphone,
  Users,
  FileText,
  Brain,
  LifeBuoy,
  Mail,
  MessageSquare,
} from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ | ArogyaVault Help & Frequently Asked Questions",
  description:
    "Get answers to the most common questions about ArogyaVault — security, document types, family groups, AI extraction, and more.",
};

/* ─── FAQ categories for quick navigation ───────────────────────────────────── */
const FAQ_CATEGORIES = [
  { icon: Shield, label: "Security & Privacy", count: 2 },
  { icon: Smartphone, label: "Getting Started", count: 2 },
  { icon: Users, label: "Family Groups", count: 1 },
  { icon: FileText, label: "Documents", count: 1 },
  { icon: Brain, label: "AI Features", count: 1 },
  { icon: LifeBuoy, label: "Support", count: 1 },
];

/* ─── Additional FAQs beyond the core 8 ────────────────────────────────────── */
const ADDITIONAL_FAQS = [
  {
    value: "faq-9",
    question: "Does ArogyaVault work without the internet?",
    answer:
      "ArogyaVault is a cloud-based platform, so an internet connection is required to upload documents, run AI extraction, and sync records. However, our Flutter mobile app (coming soon) will allow offline viewing of previously downloaded documents so you can access your records even in low-connectivity areas like rural hospitals.",
  },
  {
    value: "faq-10",
    question: "Can I link records for elderly parents who don't use smartphones?",
    answer:
      "Yes, this is one of the most common use cases. You can create a health group and invite yourself as a member to manage records on behalf of a family member. You upload their documents, and the AI extracts and organises them. Your parent doesn't need to touch the app — you manage everything on their behalf with their consent.",
  },
  {
    value: "faq-11",
    question: "What languages does ArogyaVault support?",
    answer:
      "The app interface is currently in English. Our OCR pipeline (powered by GPT-4o) can read and extract data from documents written in English, Hindi, Tamil, Telugu, Kannada, and other Indian languages, though accuracy is highest for English and Hindi. Multi-language interface support is on our roadmap.",
  },
  {
    value: "faq-12",
    question: "How do I delete my account and all my data?",
    answer:
      "We take data ownership seriously. You can delete your account and all associated data at any time from Settings → Account → Delete Account. All documents, AI-extracted metadata, group memberships, and personal information are permanently deleted within 30 days in compliance with the DPDP Act.",
  },
];

/* ─── Page ──────────────────────────────────────────────────────────────────── */

const FaqPage = () => {
  return (
    <>
      <PageHero
        eyebrow="Help Centre"
        title="Frequently asked questions"
        description="Everything you need to know about ArogyaVault. Browse by topic or scroll through all answers below."
      />

      {/* ── Category quick-nav ──────────────────────────────────────────────── */}
      <Section className="pb-0">
        <Container>
          <Grid cols={3} gap="sm" className="md:grid-cols-6">
            {FAQ_CATEGORIES.map((cat) => (
              <Surface
                key={cat.label}
                variant="muted"
                padding="sm"
                className="rounded-xl text-center cursor-pointer hover:border-primary/40 border border-transparent transition-colors group"
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mb-2">
                  <cat.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-xs font-medium leading-tight">{cat.label}</div>
                <Muted className="text-xs mt-0.5">{cat.count} answers</Muted>
              </Surface>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* ── Core FAQs ───────────────────────────────────────────────────────── */}
      <FaqSection showHeader={false} />

      {/* ── Additional FAQs ─────────────────────────────────────────────────── */}
      <Section className="pt-0">
        <Container size="sm">
          <SectionHeader
            eyebrow="More Questions"
            title="Offline, language & account"
            description="Less common but important questions answered."
            align="left"
          />
          <div className="mt-8 space-y-4">
            {ADDITIONAL_FAQS.map((faq) => (
              <Surface
                key={faq.value}
                variant="muted"
                padding="md"
                className="rounded-xl border border-border"
              >
                <Stack gap={2}>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="shrink-0 mt-0.5 text-xs font-mono">
                      {faq.value.replace("faq-", "Q")}
                    </Badge>
                    <H3 className="text-base font-semibold">{faq.question}</H3>
                  </div>
                  <Text className="text-sm text-muted-foreground leading-relaxed pl-10">
                    {faq.answer}
                  </Text>
                </Stack>
              </Surface>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Still have questions? ────────────────────────────────────────────── */}
      <Section className="bg-muted/30">
        <Container>
          <SectionHeader
            eyebrow="Still Need Help?"
            title="We're here to help"
            description="Didn't find the answer you were looking for? Our support team responds within 24 hours."
          />
          <Grid cols={2} gap="md" className="mt-10 max-w-2xl mx-auto">
            <Surface
              variant="default"
              padding="lg"
              className="rounded-xl border border-border text-center"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <H3 className="font-semibold mb-2">Email Support</H3>
              <Text className="text-sm text-muted-foreground mb-4">
                Send us a detailed message and we'll get back to you within 24 hours.
              </Text>
              <a
                href="mailto:support@arogyavault.in"
                className="text-primary text-sm font-medium underline underline-offset-4 hover:text-primary/80 transition-colors"
              >
                support@arogyavault.in
              </a>
            </Surface>

            <Surface
              variant="default"
              padding="lg"
              className="rounded-xl border border-border text-center"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <H3 className="font-semibold mb-2">Contact Form</H3>
              <Text className="text-sm text-muted-foreground mb-4">
                Fill out our contact form with your query and preferred contact method.
              </Text>
              <a
                href="/contact"
                className="text-primary text-sm font-medium underline underline-offset-4 hover:text-primary/80 transition-colors"
              >
                Go to Contact →
              </a>
            </Surface>
          </Grid>
        </Container>
      </Section>

      <CtaSection
        title="Ready to secure your health records?"
        description="Join thousands of families who trust ArogyaVault with their most important documents."
        primaryLabel="Get Early Access"
        secondaryLabel="View all features"
        secondaryHref="/features"
      />
    </>
  );
};

export default FaqPage;
