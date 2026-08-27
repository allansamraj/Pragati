import { Navbar } from "@/components/nav/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { CoreSolutionSection } from "@/components/sections/CoreSolutionSection";
import { FacilityMatchingSection } from "@/components/sections/FacilityMatchingSection";
import { LiveAvailabilitySection } from "@/components/sections/LiveAvailabilitySection";
import { TrustSection, CTASection, Footer } from "@/components/sections/TrustAndFooter";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <CoreSolutionSection />
      <FacilityMatchingSection />
      <LiveAvailabilitySection />
      <TrustSection />
      <CTASection />
      <Footer />
    </>
  );
}
