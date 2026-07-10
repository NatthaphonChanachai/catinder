import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Newsletter } from "@/components/shared/newsletter";
import { BackToTop } from "@/components/shared/back-to-top";
import { ArticlesContent } from "@/components/features/articles/articles-content";

export default function ArticlesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ArticlesContent />
        <Newsletter />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
