import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Newsletter } from "@/components/shared/newsletter";
import { BackToTop } from "@/components/shared/back-to-top";
import { AboutPageContent } from "@/components/features/about/about-page-content";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <AboutPageContent />
        <Newsletter />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
