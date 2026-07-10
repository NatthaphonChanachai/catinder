import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Newsletter } from "@/components/shared/newsletter";
import { BackToTop } from "@/components/shared/back-to-top";
import { EventsContent } from "@/components/features/events/events-content";

export default function EventsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <EventsContent />
        <Newsletter />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
