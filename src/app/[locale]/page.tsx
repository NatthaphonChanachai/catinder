import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Newsletter } from "@/components/shared/newsletter";
import { QuoteCard } from "@/components/shared/quote-card";
import { Hero } from "@/components/features/home/hero";
import { Mission } from "@/components/features/home/mission";
import { CommunityBenefits } from "@/components/features/home/community-benefits";
import { FeatureCards } from "@/components/features/home/feature-cards";
import { CatFact } from "@/components/features/home/cat-fact";
import { CatMood } from "@/components/features/home/cat-mood";
import { DailyMission } from "@/components/features/home/daily-mission";
import { ArticlesPreview } from "@/components/features/home/articles-preview";
import { BreedExplorer } from "@/components/features/home/breed-explorer";
import { UpcomingEvents } from "@/components/features/home/upcoming-events";
import { PhotoChallenge } from "@/components/features/home/photo-challenge";
import { CommunityPoll } from "@/components/features/home/community-poll";
import { LuckyCatCard } from "@/components/features/home/lucky-cat-card";
import { SuccessStories } from "@/components/features/home/success-stories";
import { PremiumSection } from "@/components/features/home/premium-section";
import { FaqSection } from "@/components/features/home/faq-section";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Mission />
        <CommunityBenefits />
        <FeatureCards />

        {/* Section 1 — Quote of the Day */}
        <div className="px-6 py-4">
          <QuoteCard />
        </div>

        {/* Section 2 — Today's Cat Fact */}
        <div className="px-6 py-4">
          <CatFact />
        </div>

        {/* Section 3 — Today's Cat Mood */}
        <div className="px-6 py-4">
          <CatMood />
        </div>

        {/* Section 4 — Today's Daily Mission */}
        <div className="px-6 py-4">
          <DailyMission />
        </div>

        {/* Section 5 — Cat Knowledge */}
        <ArticlesPreview />

        {/* Section 6 — Breed Explorer */}
        <BreedExplorer />

        {/* Section 7 — Community Events */}
        <UpcomingEvents />

        {/* Section 8 — Photo Challenge */}
        <PhotoChallenge />

        {/* Section 9 — Community Poll */}
        <CommunityPoll />

        {/* Section 10 — Lucky Cat Card */}
        <LuckyCatCard />

        {/* Section 11 — Success Stories */}
        <SuccessStories />

        <PremiumSection />

        <FaqSection />

        {/* Section 12 — Newsletter */}
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
