import type { Metadata } from "next";
import { CheckoutContent } from "@/components/features/premium/checkout-content";

export const metadata: Metadata = {
  title: "อัปเกรด Premium | Catinder",
  description: "อัปเกรดเป็นสมาชิก Premium ของ Catinder ผ่าน PromptPay",
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}
