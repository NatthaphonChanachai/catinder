import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { BackToTop } from "@/components/shared/back-to-top";
import { ContactContent } from "@/components/features/contact/contact-content";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ContactContent />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
