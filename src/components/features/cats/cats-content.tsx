"use client";

import { motion } from "framer-motion";
import { Plus, PawPrint, Crown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function CatsContent() {
  return (
    <AppShell>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-4xl space-y-5">

        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#0B1D3A]">โปรไฟล์แมวของฉัน</h1>
            <p className="text-xs text-[#6B5232]/60">จัดการโปรไฟล์และข้อมูลแมวของคุณ</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            <Plus className="size-4" /> เพิ่มแมว
          </button>
        </motion.div>

        {/* Empty state + Add placeholder */}
        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
          <div className="col-span-full flex flex-col items-center justify-center rounded-3xl py-16 text-center"
            style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
            <PawPrint className="mb-4 size-12 text-[#D4AF37]/40" />
            <h3 className="text-base font-bold text-[#0B1D3A]">ยังไม่มีแมวในโปรไฟล์</h3>
            <p className="mt-1 text-xs text-[#6B5232]/50">เพิ่มแมวของคุณเพื่อเริ่มจับคู่</p>
          </div>

          {/* Add cat placeholder */}
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed py-16 text-center transition-all hover:border-[#D4AF37] cursor-pointer"
            style={{ borderColor: "rgba(212,175,55,0.35)" }}>
            <div className="mb-3 flex size-14 items-center justify-center rounded-full"
              style={{ background: "rgba(212,175,55,0.12)" }}>
              <Plus className="size-7 text-[#D4AF37]" />
            </div>
            <p className="text-sm font-bold text-[#0B1D3A]">เพิ่มแมวตัวใหม่</p>
            <p className="mt-1 text-xs text-[#6B5232]/50">รองรับแมวได้ 2 ตัว (แผนฟรี)</p>
          </div>
        </motion.div>

        {/* Premium upsell */}
        <motion.div variants={fadeUp} className="rounded-2xl p-5 text-center"
          style={{ background: "linear-gradient(135deg,#FDF0F4,#F9DDE8)", border: "1px solid rgba(212,140,165,0.30)" }}>
          <Crown className="mx-auto mb-2 size-6 text-[#D4AF37]" />
          <p className="font-bold text-[#4A1030]">อัปเกรดเพื่อเพิ่มแมวได้ไม่จำกัด + Health Passport เต็มรูปแบบ</p>
          <Link href="/register" className="mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            <Crown className="size-4" /> Premium
          </Link>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
