import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { BackToTop } from "@/components/shared/back-to-top";
import { FaqContent } from "@/components/features/faq/faq-content";

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <FaqContent />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
