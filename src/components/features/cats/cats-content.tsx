"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, PawPrint, HeartPulse, Dna, Edit3, Star, Crown } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { fadeUp, staggerContainer } from "@/lib/motion";

const MY_CATS = [
  { name: "โมจิ", breed: "Scottish Fold", age: "2 ปี", gender: "♀", img: "/img/Scottish-fold-mochi.png", health: 92, matches: 8, vaccinated: true },
  { name: "ลูน่า", breed: "Persian", age: "1 ปี", gender: "♀", img: "/img/Persian_dollface_Luna.png", health: 88, matches: 5, vaccinated: true },
];

export function CatsContent() {
  const [selected, setSelected] = useState<number | null>(null);

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

        {/* Cat cards */}
        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
          {MY_CATS.map((cat, i) => (
            <div key={cat.name}
              className="overflow-hidden rounded-3xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{ background: "#FFFAFC", border: selected === i ? "2px solid #D4AF37" : "1px solid rgba(212,160,175,0.25)", boxShadow: "0 2px 16px rgba(160,60,90,0.07)" }}
              onClick={() => setSelected(selected === i ? null : i)}>
              {/* Photo */}
              <div className="relative h-48 overflow-hidden">
                <Image src={cat.img} alt={cat.name} fill className="object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,29,58,0.6) 0%, transparent 50%)" }} />
                <div className="absolute bottom-3 left-4">
                  <h2 className="text-lg font-extrabold text-white">{cat.name} {cat.gender}</h2>
                  <p className="text-xs text-white/70">{cat.breed} · {cat.age}</p>
                </div>
                <button className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full"
                  style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
                  <Edit3 className="size-3.5 text-white" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-[#F0D0DA] border-t border-[#F0D0DA]">
                {[
                  { icon: HeartPulse, label: "สุขภาพ", value: `${cat.health}%`, color: "#22c55e" },
                  { icon: Star,       label: "แมตช์",  value: `${cat.matches}`, color: "#D4AF37" },
                  { icon: PawPrint,   label: "วัคซีน", value: cat.vaccinated ? "ครบ" : "รอ",  color: cat.vaccinated ? "#22c55e" : "#f97316" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex flex-col items-center py-3">
                    <Icon className="mb-0.5 size-3.5" style={{ color }} />
                    <span className="text-xs font-extrabold text-[#0B1D3A]">{value}</span>
                    <span className="text-[10px] text-[#6B5232]/50">{label}</span>
                  </div>
                ))}
              </div>

              {/* Expanded actions */}
              {selected === i && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }}
                  className="flex gap-2 overflow-hidden border-t border-[#F0D0DA] px-4 py-3">
                  <Link href="/health" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold hover:opacity-90"
                    style={{ background: "rgba(34,197,94,0.12)", color: "#16a34a" }}>
                    <HeartPulse className="size-3.5" /> Health Passport
                  </Link>
                  <Link href="/breeding" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold hover:opacity-90"
                    style={{ background: "rgba(212,175,55,0.12)", color: "#B8920A" }}>
                    <Dna className="size-3.5" /> จับคู่ผสมพันธุ์
                  </Link>
                </motion.div>
              )}
            </div>
          ))}

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
