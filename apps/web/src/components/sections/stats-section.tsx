import * as React from "react";
import { Container, Section, Grid, Divider } from "@/core/primitives";
import { StatCard } from "@/components/ui/stat-card";

const STATS = [
  { value: "50+",    label: "Document Types",     sublabel: "Lab, imaging, prescriptions & more" },
  { value: "256-bit", label: "AES Encryption",    sublabel: "Military-grade security at rest" },
  { value: "< 30s",  label: "Upload & Process",   sublabel: "AI extracts key data instantly" },
  { value: "∞",      label: "Storage",            sublabel: "Unlimited records per family" },
];

export const StatsSection = () => {
  return (
    <div className="border-y border-border bg-muted/30">
      <Container>
        <Section size="sm">
          <Grid cols={4} gap="lg">
            {STATS.map((stat) => (
              <div key={stat.label} className="relative">
                <StatCard {...stat} />
              </div>
            ))}
          </Grid>
        </Section>
      </Container>
    </div>
  );
};
