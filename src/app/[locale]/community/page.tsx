import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Newsletter } from "@/components/shared/newsletter";
import { BackToTop } from "@/components/shared/back-to-top";
import { CommunityContent } from "@/components/features/community/community-content";

export default function CommunityPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <CommunityContent />
        <Newsletter />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
