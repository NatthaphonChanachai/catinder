"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Heart, HeartHandshake, Trash2 } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function FavoritesContent() {
  const [favs, setFavs] = useState<{ name: string; breed: string; age: string; gender: string; img: string; pct: number }[]>([]);

  function remove(name: string) {
    setFavs((p) => p.filter((f) => f.name !== name));
  }

  return (
    <AppShell>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-4xl space-y-5">

        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#0B1D3A]">รายการโปรด</h1>
            <p className="text-xs text-[#6B5232]/60">แมวที่คุณบันทึกไว้ {favs.length} ตัว</p>
          </div>
          <Link href="/discover"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            <HeartHandshake className="size-4" /> ค้นหาเพิ่ม
          </Link>
        </motion.div>

        {favs.length === 0 ? (
          <motion.div variants={fadeUp} className="flex flex-col items-center justify-center rounded-3xl py-20 text-center"
            style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
            <Bookmark className="mb-4 size-12 text-[#D4AF37]/40" />
            <h3 className="text-base font-bold text-[#0B1D3A]">ยังไม่มีรายการโปรด</h3>
            <p className="mt-1 text-xs text-[#6B5232]/50">กดไลค์หรือบันทึกแมวที่คุณชอบไว้ที่นี่</p>
            <Link href="/discover" className="mt-4 rounded-full px-5 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
              เริ่มค้นหา
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favs.map((f) => (
              <div key={f.name} className="group overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
                <div className="relative h-44 overflow-hidden">
                  <Image src={f.img} alt={f.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,29,58,0.55) 0%, transparent 50%)" }} />
                  {/* Match badge */}
                  <div className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-extrabold"
                    style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                    {f.pct}%
                  </div>
                  {/* Remove */}
                  <button onClick={() => remove(f.name)}
                    className="absolute left-3 top-3 flex size-7 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(220,80,80,0.85)" }}>
                    <Trash2 className="size-3.5 text-white" />
                  </button>
                  {/* Name */}
                  <div className="absolute bottom-3 left-3">
                    <p className="font-bold text-white">{f.name} {f.gender}</p>
                    <p className="text-xs text-white/70">{f.breed} · {f.age}</p>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex gap-2 p-3">
                  <Link href="/discover"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                    <Heart className="size-3.5" /> ส่งคำขอ
                  </Link>
                  <button onClick={() => remove(f.name)}
                    className="flex items-center justify-center rounded-xl px-3 py-2 text-[11px] font-bold hover:opacity-80"
                    style={{ background: "rgba(212,140,165,0.12)", color: "#B04060" }}>
                    <Bookmark className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </AppShell>
  );
}
