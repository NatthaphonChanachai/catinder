import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Newsletter } from "@/components/shared/newsletter";
import { Hero } from "@/components/features/home/hero";
import { Mission } from "@/components/features/home/mission";
import { CommunityBenefits } from "@/components/features/home/community-benefits";
import { FeatureCards } from "@/components/features/home/feature-cards";
import { ArticlesPreview } from "@/components/features/home/articles-preview";
import { BreedExplorer } from "@/components/features/home/breed-explorer";
import { UpcomingEvents } from "@/components/features/home/upcoming-events";
import { PremiumSection } from "@/components/features/home/premium-section";
import { FaqSection } from "@/components/features/home/faq-section";

// Simplified landing page — focused on converting visitors to sign-ups.
// The daily-engagement widgets (quote / fact / mood / mission / lucky card /
// today's journey / photo challenge / poll) were moved off the marketing page;
// they belong inside the logged-in experience, not stacked on the homepage.
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pb-20 lg:pb-0">
        {/* 1 — Hook */}
        <Hero />

        {/* 2 — Why Catinder (trust) */}
        <Mission />

        {/* 3 — What you get */}
        <CommunityBenefits />
        <FeatureCards />

        {/* 4 — One interactive, on-brand moment */}
        <BreedExplorer />

        {/* 5 — Educational value */}
        <ArticlesPreview />

        {/* 6 — Community / social proof */}
        <UpcomingEvents />

        {/* 7 — Monetization */}
        <PremiumSection />

        {/* 8 — Answer objections + final CTA */}
        <FaqSection />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
