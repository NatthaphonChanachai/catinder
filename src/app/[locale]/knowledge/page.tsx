import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Newsletter } from "@/components/shared/newsletter";
import { BackToTop } from "@/components/shared/back-to-top";
import { KnowledgeContent } from "@/components/features/knowledge/knowledge-content";

export default function KnowledgePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <KnowledgeContent />
        <Newsletter />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
