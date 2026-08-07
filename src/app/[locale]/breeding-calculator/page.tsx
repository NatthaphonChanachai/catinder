import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { BackToTop } from "@/components/shared/back-to-top";
import { BreedingCalculator } from "@/components/features/tools/breeding-calculator";

export const metadata: Metadata = {
  title: "เครื่องคำนวณกำหนดคลอดแมว — นับวันตั้งท้องแมว | Catinder",
  description:
    "คำนวณกำหนดคลอดของแมวจากวันที่ผสมพันธุ์ พร้อมไทม์ไลน์การตั้งท้อง 63–67 วันตามข้อมูลสัตวแพทย์ ใช้ฟรี",
  openGraph: {
    title: "เครื่องคำนวณกำหนดคลอดแมว | Catinder",
    description: "ใส่วันผสมพันธุ์ ดูกำหนดคลอดและไทม์ไลน์การตั้งท้องของแมว",
    type: "website",
  },
};

export default function BreedingCalculatorPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1" style={{ background: "#FFF5F8" }}>
        <BreedingCalculator />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
