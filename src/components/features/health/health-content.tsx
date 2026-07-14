"use client";

import { motion } from "framer-motion";
import { HeartPulse, Syringe, FileText, Lock, Crown, Plus, PawPrint } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function HealthContent() {
  return (
    <AppShell>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-4xl space-y-5">

        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#0B1D3A]">บันทึกสุขภาพ</h1>
            <p className="text-xs text-[#6B5232]/60">ติดตามสุขภาพและวัคซีนของแมวคุณ</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            <Plus className="size-4" /> เพิ่มบันทึก
          </button>
        </motion.div>

        {/* Cat health empty state */}
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center rounded-3xl py-16 text-center"
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
          <HeartPulse className="mb-4 size-12 text-[#D4AF37]/40" />
          <h3 className="text-base font-bold text-[#0B1D3A]">ยังไม่มีแมวในโปรไฟล์</h3>
          <p className="mt-1 text-xs text-[#6B5232]/50">เพิ่มแมวเพื่อเริ่มติดตามสุขภาพ</p>
          <Link href="/cats" className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            <PawPrint className="size-4" /> เพิ่มแมว
          </Link>
        </motion.div>

        {/* Records empty state */}
        <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(212,160,175,0.18)" }}>
            <h2 className="font-bold text-[#0B1D3A]">
              <Syringe className="mr-1.5 inline size-4 text-[#D4AF37]" />
              ประวัติวัคซีนและการตรวจ
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Syringe className="mb-3 size-8 text-[#D4AF37]/30" />
            <p className="text-sm font-bold text-[#0B1D3A]">ยังไม่มีบันทึก</p>
            <p className="mt-1 text-xs text-[#6B5232]/50">ประวัติวัคซีนและการตรวจจะแสดงที่นี่</p>
          </div>
        </motion.div>

        {/* Premium health passport */}
        <motion.div variants={fadeUp} className="rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg,#FDF0F4,#F9DDE8)", border: "1px solid rgba(212,140,165,0.30)" }}>
          <div className="flex items-start gap-4">
            <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)" }}>
              <FileText className="size-6 text-[#0B1D3A]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Lock className="size-3.5 text-[#B04060]/60" />
                <h3 className="font-bold text-[#4A1030]">Health Passport เต็มรูปแบบ</h3>
              </div>
              <p className="mt-1 text-xs text-[#6B5232]/60">รายงานสุขภาพ PDF · ประวัติทั้งหมด · แชร์กับสัตวแพทย์ · ติดตามผลเลือด</p>
              <Link href="/register" className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                <Crown className="size-3" /> ปลดล็อกด้วย Premium
              </Link>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </AppShell>
  );
}
