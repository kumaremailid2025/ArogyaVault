import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeader } from "@/components/ui/section-header";
import { CtaSection } from "@/components/sections/cta-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { Container, Section, Grid, Stack, Row } from "@/core/primitives/layout";
import { H3, H4, Text, Lead, Muted, Eyebrow } from "@/core/primitives/typography";
import { Surface } from "@/core/primitives/surface";
import {
  Heart,
  Shield,
  Brain,
  Users,
  Target,
  Lightbulb,
  Globe,
  Award,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/core/ui/badge";

export const metadata: Metadata = {
  title: "About ArogyaVault | Our Mission to Secure India's Health Records",
  description:
    "Learn about ArogyaVault's mission to give every Indian a secure, AI-powered vault for their lifetime of medical records — accessible anywhere, anytime.",
};

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const VALUES = [
  {
    icon: Heart,
    title: "Patient First",
    description:
      "Every decision starts with one question: does this make it easier for a patient to own and understand their health journey?",
  },
  {
    icon: Shield,
    title: "Privacy by Design",
    description:
      "We architect for privacy from the ground up — not as a feature layer, but as the foundation everything else is built on.",
  },
  {
    icon: Brain,
    title: "AI That Explains, Not Just Extracts",
    description:
      "Our AI doesn't just pull data from documents — it contextualises, summarises, and explains in plain language you can act on.",
  },
  {
    icon: Users,
    title: "Family Is a Unit",
    description:
      "Health isn't individual. We built ArogyaVault to support linked family groups so caregivers and loved ones stay informed.",
  },
  {
    icon: Lightbulb,
    title: "Simplicity Over Complexity",
    description:
      "We hide the complexity of OCR pipelines, vector databases, and AWS infrastructure behind interfaces anyone can use.",
  },
  {
    icon: Globe,
    title: "Built for India",
    description:
      "Indian healthcare is fragmented across paper prescriptions, private labs, and government hospitals. We're building the connective tissue.",
  },
];

const MILESTONES = [
  {
    year: "2024",
    quarter: "Q3",
    title: "The Problem Identified",
    description:
      "Founders experienced first-hand the chaos of managing a family member's medical records across a dozen hospitals and labs.",
  },
  {
    year: "2024",
    quarter: "Q4",
    title: "Research & Architecture",
    description:
      "Months of research into Indian healthcare data formats, ABDM standards, and AI-powered document understanding pipelines.",
  },
  {
    year: "2025",
    quarter: "Q1",
    title: "Core Platform Built",
    description:
      "OCR + GPT-4o extraction pipeline, AWS infrastructure, secure multi-tenant PostgreSQL schema, and mobile-first web app.",
  },
  {
    year: "2025",
    quarter: "Q2",
    title: "Beta Launch",
    description:
      "Onboarded first beta families. Validated group linking, document categorisation, and AI Q&A against real-world records.",
  },
  {
    year: "2025",
    quarter: "Q3",
    title: "AI Q&A & Analytics",
    description:
      "Launched RAG-powered health Q&A and longitudinal analytics — medication timelines, lab trend charts, doctor summaries.",
  },
  {
    year: "2025",
    quarter: "Q4+",
    title: "Scale & Flutter Mobile",
    description:
      "Production deployment on AWS ECS, Flutter Android & iOS apps, ABDM integration roadmap, and Series A preparation.",
  },
];

const TEAM_PILLARS = [
  { label: "Doctors & clinicians", description: "Advising on clinical workflows and data standards" },
  { label: "AI/ML engineers", description: "Building the document intelligence and RAG pipeline" },
  { label: "Security architects", description: "Ensuring every byte of health data is protected" },
  { label: "Product designers", description: "Making complex health data genuinely usable" },
];

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About ArogyaVault"
        title="One vault for every health record you'll ever have"
        description="We're on a mission to give every Indian a secure, AI-powered home for their lifetime of medical records — so that the next time a doctor asks 'do you have your old reports?', the answer is always yes."
      />

      {/* ── Mission ─────────────────────────────────────────────────────────── */}
      <Section>
        <Container>
          <Grid cols={2} className="items-center gap-16">
            {/* Text */}
            <Stack gap="lg">
              <Eyebrow>Our Mission</Eyebrow>
              <H3 className="text-3xl font-bold tracking-tight">
                Turning scattered paper records into an intelligent health vault
              </H3>
              <Text className="text-muted-foreground leading-relaxed">
                India generates hundreds of millions of medical documents every year — prescriptions written on 
                loose slips, lab reports in WhatsApp chats, discharge summaries tucked in folders no one can find 
                in an emergency. ArogyaVault changes that.
              </Text>
              <Text className="text-muted-foreground leading-relaxed">
                We use OCR and GPT-4o to extract structured data from any format — handwritten, printed, or 
                photographed. We store it securely on AWS with AES-256 encryption. And we let you query your 
                entire health history in plain English, share records with family, and walk into any hospital 
                with a complete picture of your health.
              </Text>
              <Stack gap="md" className="mt-2">
                {[
                  "No more scrambling for old reports in emergencies",
                  "AI that reads your records so you understand them",
                  "Family-linked vaults for coordinated care",
                  "Built to ABDM and DPDP compliance standards",
                ].map((point) => (
                  <Row key={point} gap="md" className="items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <Text className="text-sm">{point}</Text>
                  </Row>
                ))}
              </Stack>
            </Stack>

            {/* Visual: stat callouts */}
            <Grid cols={2} gap="sm">
              {[
                { value: "50+", label: "Document types", sub: "Prescriptions to discharge summaries" },
                { value: "256-bit", label: "AES encryption", sub: "Military-grade at rest & in transit" },
                { value: "GPT-4o", label: "AI extraction", sub: "Structured data from any scan" },
                { value: "∞", label: "Storage", sub: "Lifetime of records, no cap" },
              ].map((stat) => (
                <Surface key={stat.label} variant="muted" padding="md" className="rounded-xl text-center">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="font-semibold text-sm mt-1">{stat.label}</div>
                  <Muted className="text-xs mt-1">{stat.sub}</Muted>
                </Surface>
              ))}
            </Grid>
          </Grid>
        </Container>
      </Section>

      {/* ── Values ──────────────────────────────────────────────────────────── */}
      <Section className="bg-muted/30">
        <Container>
          <SectionHeader
            eyebrow="What We Stand For"
            title="Principles we build by"
            description="Six values that shape every product decision we make."
          />
          <Grid cols={3} gap="md" className="mt-12">
            {VALUES.map((v) => (
              <Surface key={v.title} variant="default" padding="lg" className="rounded-xl border border-border">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <H4 className="font-semibold mb-2">{v.title}</H4>
                <Text className="text-sm text-muted-foreground leading-relaxed">{v.description}</Text>
              </Surface>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* ── Timeline ────────────────────────────────────────────────────────── */}
      <Section>
        <Container size="default">
          <SectionHeader
            eyebrow="Our Journey"
            title="How we got here"
            description="From a frustrating personal experience to a platform securing health records for families across India."
          />
          <div className="mt-12 relative">
            {/* Vertical line */}
            <div className="absolute left-[5.5rem] top-0 bottom-0 w-px bg-border hidden md:block" />
            <Stack gap="xl">
              {MILESTONES.map((m, i) => (
                <Row key={i} gap="lg" className="items-start">
                  {/* Date badge */}
                  <div className="hidden md:flex flex-col items-end shrink-0 w-20 pt-1">
                    <span className="text-xs font-semibold text-primary">{m.year}</span>
                    <Badge variant="outline" className="text-xs mt-1">{m.quarter}</Badge>
                  </div>
                  {/* Dot */}
                  <div className="hidden md:flex shrink-0 w-5 h-5 rounded-full bg-primary border-4 border-background mt-1 z-10" />
                  {/* Content */}
                  <Surface variant="muted" padding="md" className="flex-1 rounded-xl">
                    <div className="flex items-center gap-2 mb-1 md:hidden">
                      <Badge variant="outline" className="text-xs">{m.year} {m.quarter}</Badge>
                    </div>
                    <H4 className="font-semibold">{m.title}</H4>
                    <Text className="text-sm text-muted-foreground mt-1">{m.description}</Text>
                  </Surface>
                </Row>
              ))}
            </Stack>
          </div>
        </Container>
      </Section>

      {/* ── Team ────────────────────────────────────────────────────────────── */}
      <Section className="bg-muted/30">
        <Container>
          <Grid cols={2} className="items-center gap-16">
            <Stack gap="lg">
              <Eyebrow>The Team</Eyebrow>
              <H3 className="text-3xl font-bold tracking-tight">
                Built by people who care about healthcare
              </H3>
              <Text className="text-muted-foreground leading-relaxed">
                ArogyaVault is built by a cross-functional team that combines deep expertise in AI, 
                cloud security, and healthcare systems with a genuine personal stake in solving 
                India's medical records problem.
              </Text>
              <Text className="text-muted-foreground leading-relaxed">
                We're advised by practising clinicians, informed by data privacy lawyers, and 
                guided by patients and family caregivers who've experienced the problem first-hand.
              </Text>
              <Stack gap="md" className="mt-2">
                {TEAM_PILLARS.map((p) => (
                  <Surface key={p.label} variant="muted" padding="sm" className="rounded-lg">
                    <Row gap="md" className="items-start p-1">
                      <Award className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold">{p.label}</div>
                        <Muted className="text-xs">{p.description}</Muted>
                      </div>
                    </Row>
                  </Surface>
                ))}
              </Stack>
            </Stack>

            {/* Culture callout */}
            <Surface variant="default" padding="lg" className="rounded-2xl border border-border">
              <Stack gap="lg">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <H3 className="text-xl font-bold">We're hiring</H3>
                <Text className="text-muted-foreground leading-relaxed">
                  We're looking for engineers, designers, and healthcare domain experts who want to 
                  build infrastructure that matters for 1.4 billion people.
                </Text>
                <Stack gap="sm">
                  {[
                    "Full-stack engineers (Next.js, FastAPI)",
                    "ML/AI engineers (RAG, document AI)",
                    "Flutter mobile developers",
                    "Healthcare data analysts",
                    "Security & compliance specialists",
                  ].map((role) => (
                    <Row key={role} gap="sm" className="items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <Text className="text-sm">{role}</Text>
                    </Row>
                  ))}
                </Stack>
                <Text className="text-sm text-muted-foreground">
                  Reach out at{" "}
                  <Link href="mailto:careers@arogyavault.in" className="text-primary underline underline-offset-4">
                    careers@arogyavault.in
                  </Link>
                </Text>
              </Stack>
            </Surface>
          </Grid>
        </Container>
      </Section>

      <TestimonialsSection />

      <CtaSection
        title="Join the families already using ArogyaVault"
        description="Get early access to India's most secure, AI-powered medical records platform."
        primaryLabel="Get Early Access"
        secondaryLabel="Learn how it works"
        secondaryHref="/how-it-works"
      />
    </>
  );
}
