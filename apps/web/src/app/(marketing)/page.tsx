import { HeroSection }        from "@/components/sections/hero-section";
import { StatsSection }       from "@/components/sections/stats-section";
import { FeaturesSection }    from "@/components/sections/features-section";
import { HowItWorksSection }  from "@/components/sections/how-it-works-section";
import { GroupsSection }      from "@/components/sections/groups-section";
import { SecuritySection }    from "@/components/sections/security-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { FaqSection }         from "@/components/sections/faq-section";
import { CtaSection }         from "@/components/sections/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection limit={6} />
      <HowItWorksSection />
      <GroupsSection compact />
      <SecuritySection compact />
      <TestimonialsSection />
      <FaqSection limit={4} />
      <CtaSection />
    </>
  );
}
