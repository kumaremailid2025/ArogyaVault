import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { ContactFormSection } from "@/components/sections/contact-form-section";
import { Container, Section, Grid, Stack, Row } from "@/core/primitives/layout";
import { H3, H4, Text, Muted, Eyebrow } from "@/core/primitives/typography";
import { Surface } from "@/core/primitives/surface";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Briefcase,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | ArogyaVault Support & Enquiries",
  description:
    "Get in touch with the ArogyaVault team for support, partnership enquiries, media requests, or to provide feedback about our platform.",
};

/* ─── Contact channels ──────────────────────────────────────────────────────── */
const CONTACT_CHANNELS = [
  {
    icon: LifeBuoy,
    title: "General Support",
    description: "Questions about the app, your account, or getting started.",
    contact: "support@arogyavault.in",
    href: "mailto:support@arogyavault.in",
    type: "email",
    responseTime: "Within 24 hours",
  },
  {
    icon: Briefcase,
    title: "Partnerships & Clinics",
    description: "Hospital integrations, clinic plans, or API partnership enquiries.",
    contact: "partnerships@arogyavault.in",
    href: "mailto:partnerships@arogyavault.in",
    type: "email",
    responseTime: "Within 48 hours",
  },
  {
    icon: ShieldCheck,
    title: "Security & Privacy",
    description: "To report a vulnerability or a data privacy concern.",
    contact: "security@arogyavault.in",
    href: "mailto:security@arogyavault.in",
    type: "email",
    responseTime: "Within 12 hours",
  },
  {
    icon: MessageSquare,
    title: "Media & Press",
    description: "Interviews, press kits, or media coverage requests.",
    contact: "press@arogyavault.in",
    href: "mailto:press@arogyavault.in",
    type: "email",
    responseTime: "Within 48 hours",
  },
];

const OFFICE_INFO = {
  address: "Hyderabad, Telangana, India",
  phone: "+91 80 0000 0000",
  hours: "Mon – Fri, 9:00 AM – 6:00 PM IST",
  email: "hello@arogyavault.in",
};

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="We'd love to hear from you"
        description="Whether you have a support question, a partnership idea, or just want to say hello — our team is here and responds quickly."
      />

      {/* ── Contact channels ─────────────────────────────────────────────────── */}
      <Section className="pb-0">
        <Container>
          <Grid cols={2} gap="sm" className="md:grid-cols-4">
            {CONTACT_CHANNELS.map((ch) => (
              <Surface
                key={ch.title}
                variant="muted"
                padding="md"
                className="rounded-xl border border-border hover:border-primary/40 transition-colors group"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mb-3">
                  <ch.icon className="h-5 w-5 text-primary" />
                </div>
                <H4 className="font-semibold text-sm mb-1">{ch.title}</H4>
                <Text className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {ch.description}
                </Text>
                <a
                  href={ch.href}
                  className="text-primary text-xs font-medium hover:underline underline-offset-4 block truncate"
                >
                  {ch.contact}
                </a>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <Muted className="text-xs">{ch.responseTime}</Muted>
                </div>
              </Surface>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* ── Form + sidebar ───────────────────────────────────────────────────── */}
      <ContactFormSection />

      {/* ── Office info strip ────────────────────────────────────────────────── */}
      <Section className="bg-muted/30">
        <Container>
          <Grid cols={3} gap="md" className="items-start">
            <Row gap="md" className="items-start">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <Stack gap="xs">
                <H4 className="font-semibold text-sm">Office</H4>
                <Text className="text-sm text-muted-foreground">{OFFICE_INFO.address}</Text>
              </Stack>
            </Row>

            <Row gap="md" className="items-start">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <Stack gap="xs">
                <H4 className="font-semibold text-sm">Phone</H4>
                <a
                  href={`tel:${OFFICE_INFO.phone.replace(/\s/g, "")}`}
                  className="text-sm text-primary hover:underline underline-offset-4"
                >
                  {OFFICE_INFO.phone}
                </a>
                <Muted className="text-xs">{OFFICE_INFO.hours}</Muted>
              </Stack>
            </Row>

            <Row gap="md" className="items-start">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <Stack gap="xs">
                <H4 className="font-semibold text-sm">General Enquiries</H4>
                <a
                  href={`mailto:${OFFICE_INFO.email}`}
                  className="text-sm text-primary hover:underline underline-offset-4"
                >
                  {OFFICE_INFO.email}
                </a>
                <Muted className="text-xs">We reply to every message</Muted>
              </Stack>
            </Row>
          </Grid>
        </Container>
      </Section>
    </>
  );
}
