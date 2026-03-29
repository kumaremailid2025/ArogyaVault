import * as React from "react";
import { Container, Section, Stack } from "@/core/primitives";
import { SectionHeader } from "@/components/ui/section-header";
import { TestimonialCard } from "@/components/ui/testimonial-card";

const TESTIMONIALS = [
  {
    quote:
      "Finally organised all my mother's lab reports in one place. The AI even flagged a pattern my doctor hadn't noticed yet. Incredible product.",
    name: "Priya Sharma",
    role: "Software Engineer",
    location: "Hyderabad",
    rating: 5,
  },
  {
    quote:
      "I shared my complete medical history with my cardiologist in 30 seconds before my appointment. No more carrying folders of papers.",
    name: "Rajesh Mehta",
    role: "Retired Teacher",
    location: "Mumbai",
    rating: 5,
  },
  {
    quote:
      "Our entire family — parents, kids, grandparents — all connected. Vaccination records, prescriptions, everything in one vault. Life changing.",
    name: "Anita Krishnan",
    role: "Home Maker",
    location: "Chennai",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <Section>
      <Container>
        <Stack gap="xl" align="center">
          <SectionHeader
            eyebrow="Testimonials"
            title="Trusted by families across India"
            description="Real stories from people who've transformed how they manage their family's health records."
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
