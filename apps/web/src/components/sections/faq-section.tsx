import * as React from "react";
import { Accordion } from "@/core/ui/accordion";
import { Container, Section, Stack } from "@/core/primitives";
import { SectionHeader } from "@/components/ui/section-header";
import { FaqItem } from "@/components/ui/faq-item";

export const ALL_FAQS = [
  {
    value: "faq-1",
    question: "Is my medical data really safe on ArogyaVault?",
    answer:
      "Yes. Every document you upload is encrypted with 256-bit AES encryption before it is stored on our servers. We use AWS S3 with server-side encryption, and your documents are also encrypted in transit using TLS 1.3. Even members of our team cannot access the content of your documents.",
  },
  {
    value: "faq-2",
    question: "Do I need a smartphone to use ArogyaVault?",
    answer:
      "You need a mobile number to receive your OTP for login. The app works on any smartphone (Android or iOS), and the web portal works on any modern browser. You do not need a smartphone — a basic mobile phone capable of receiving SMS is sufficient for authentication.",
  },
  {
    value: "faq-3",
    question: "Can I share my records with my doctor?",
    answer:
      "Yes. You can invite any person — doctor, specialist, family member, or caregiver — to your health group. You control exactly which documents they can see, and whether they can only read or also upload. You can revoke access at any time from your settings.",
  },
  {
    value: "faq-4",
    question: "What types of documents can I store?",
    answer:
      "ArogyaVault supports over 50 document types including: lab reports (blood tests, urine tests, etc.), prescriptions, radiology images (X-ray, MRI, CT scan reports), discharge summaries, vaccination records, dental records, ophthalmology reports, cardiology reports, and general health certificates.",
  },
  {
    value: "faq-5",
    question: "Is ArogyaVault free to use?",
    answer:
      "ArogyaVault offers a free plan that covers most personal use cases — unlimited document storage, AI extraction, and family group linking. Premium plans with advanced analytics, priority support, and team/clinic features will be available in a future release.",
  },
  {
    value: "faq-6",
    question: "What happens if I lose my phone?",
    answer:
      "Your data is stored securely on our servers, not on your device. If you lose your phone, simply get a new SIM with the same number, request a new OTP, and you are back in. Your records are always safe and accessible from any device.",
  },
  {
    value: "faq-7",
    question: "Can hospitals or clinics use ArogyaVault?",
    answer:
      "We are building clinic and hospital integrations as part of our Sprint 3 roadmap. Doctors can already receive patient records via secure group links today. Enterprise and clinic plans with bulk patient management will be released later this year.",
  },
  {
    value: "faq-8",
    question: "How does the AI extraction work?",
    answer:
      "When you upload a document, our AI pipeline (powered by GPT-4o) runs OCR to read the text, then intelligently extracts key medical data — test names, values, reference ranges, medications, diagnoses, and dates. This data is stored as structured metadata alongside your document, making it searchable.",
  },
];

interface FaqSectionProps {
  limit?: number;
  showHeader?: boolean;
}

export const FaqSection = ({ limit, showHeader = true }: FaqSectionProps) => {
  const faqs = limit ? ALL_FAQS.slice(0, limit) : ALL_FAQS;
  return (
    <Section>
      <Container size="sm">
        <Stack gap="xl" align="center">
          {showHeader && (
            <SectionHeader
              eyebrow="FAQ"
              title="Frequently asked questions"
              description="Everything you need to know about ArogyaVault. Can't find an answer? Write to us."
            />
          )}
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <FaqItem key={faq.value} {...faq} />
            ))}
          </Accordion>
        </Stack>
      </Container>
    </Section>
  );
};
