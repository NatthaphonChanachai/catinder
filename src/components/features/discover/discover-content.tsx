"use client";

import { motion } from "framer-motion";
import { HeartHandshake, Crown, PawPrint } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/components/shared/app-shell";

export function DiscoverContent() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-extrabold text-[#0B1D3A]">จับคู่แมว</h1>
          <p className="text-xs text-[#6B5232]/60">AI คัดสรรคู่ที่เหมาะที่สุดให้คุณ</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-3xl py-20 text-center"
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.25)" }}
        >
          <PawPrint className="mb-4 size-14 text-[#D4AF37]/40" />
          <h2 className="mb-2 text-lg font-extrabold text-[#0B1D3A]">ยังไม่มีแมวให้จับคู่</h2>
          <p className="mb-6 text-sm text-[#6B5232]/60">เพิ่มแมวของคุณก่อน เพื่อให้ AI หาคู่ที่เหมาะสม</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/cats"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
              <HeartHandshake className="size-4" /> เพิ่มโปรไฟล์แมว
            </Link>
            <Link href="/register"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ background: "rgba(212,140,165,0.12)", color: "#B04060", border: "1px solid rgba(212,140,165,0.25)" }}>
              <Crown className="size-4" /> Premium ไม่จำกัด
            </Link>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
