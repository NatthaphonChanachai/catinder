import type { Metadata } from "next";
import { SupportContent } from "@/components/features/support/support-content";

export const metadata: Metadata = {
  title: "แชทกับทีมงาน | Catinder",
  description: "แชทกับทีมงาน Catinder โดยตรง — เราตอบทุกข้อความภายใน 24 ชั่วโมง",
};

export default function SupportPage() {
  return <SupportContent />;
}
