"use client";

import { motion } from "framer-motion";
import { Dna, HeartHandshake, Clock, CheckCircle, XCircle, Crown, Lock, Star } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { fadeUp, staggerContainer } from "@/lib/motion";

const REQUESTS_IN = [
  { from: "คุณมาลี",  cat: "ลูน่า เบลล์", breed: "Persian",       img: "/img/Persian_dollface_Luna.png",  pct: 97, status: "pending", date: "2 ก.ค." },
  { from: "คุณก้อง",  cat: "มีซา",        breed: "Maine Coon",    img: "/img/Maine-Coon.png",             pct: 94, status: "pending", date: "5 ก.ค." },
];
const REQUESTS_OUT = [
  { to: "คุณนน",    cat: "ลีโอ",   breed: "Persian",       img: "/img/Persian-Long-Hair-Leo.png",  pct: 88, status: "accepted", date: "1 ก.ค." },
  { to: "คุณฝน",    cat: "ดัชเชส", breed: "British Shorthair", img: "/img/British-Shorthair.png",  pct: 85, status: "pending",  date: "6 ก.ค." },
];

const TIPS = [
  { icon: Star,         title: "เลือกคู่ที่เหมาะสม",      desc: "ดู AI Match Score เพื่อความเข้ากันทางพันธุกรรม" },
  { icon: CheckCircle,  title: "ตรวจสุขภาพก่อน",           desc: "ทั้งสองฝ่ายควรมีสุขภาพที่ดีและวัคซีนครบ" },
  { icon: HeartHandshake, title: "ประสานงานกับเจ้าของ",   desc: "ใช้ระบบข้อความเพื่อนัดหมาย (Premium)" },
];

export function BreedingContent() {
  return (
    <AppShell>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-4xl space-y-5">

        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#0B1D3A]">ผสมพันธุ์</h1>
            <p className="text-xs text-[#6B5232]/60">จัดการคำขอจับคู่ผสมพันธุ์</p>
          </div>
          <Link href="/discover"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            <HeartHandshake className="size-4" /> หาคู่ผสม
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          {[
            { label: "คำขอที่ได้รับ",  value: REQUESTS_IN.length, color: "#D4AF37" },
            { label: "คำขอที่ส่ง",    value: REQUESTS_OUT.length, color: "#7B5EA7" },
            { label: "สำเร็จแล้ว",    value: 1,                   color: "#22c55e" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center"
              style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
              <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] text-[#6B5232]/60">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Incoming requests */}
        <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(212,160,175,0.18)" }}>
            <h2 className="font-bold text-[#0B1D3A]">
              <Dna className="mr-1.5 inline size-4 text-[#D4AF37]" />
              คำขอที่ได้รับ
            </h2>
          </div>
          {REQUESTS_IN.map((r) => (
            <div key={r.cat} className="flex items-center gap-4 px-5 py-4"
              style={{ borderBottom: "1px solid rgba(212,160,175,0.10)" }}>
              <div className="relative size-14 flex-shrink-0 overflow-hidden rounded-2xl">
                <Image src={r.img} alt={r.cat} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#0B1D3A]">{r.cat}</p>
                <p className="text-xs text-[#6B5232]/60">{r.breed} · จาก {r.from}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Star className="size-3 text-[#D4AF37]" />
                  <span className="text-[11px] font-bold text-[#D4AF37]">{r.pct}% Match</span>
                  <Clock className="ml-2 size-3 text-[#6B5232]/40" />
                  <span className="text-[10px] text-[#6B5232]/40">{r.date}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex size-9 items-center justify-center rounded-full hover:opacity-80 transition-opacity"
                  style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}>
                  <CheckCircle className="size-4 text-green-600" />
                </button>
                <button className="flex size-9 items-center justify-center rounded-full hover:opacity-80 transition-opacity"
                  style={{ background: "rgba(220,80,80,0.10)", border: "1px solid rgba(220,80,80,0.22)" }}>
                  <XCircle className="size-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Outgoing requests */}
        <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(212,160,175,0.18)" }}>
            <h2 className="font-bold text-[#0B1D3A]">
              <HeartHandshake className="mr-1.5 inline size-4 text-[#D4AF37]" />
              คำขอที่ส่งออก
            </h2>
          </div>
          {REQUESTS_OUT.map((r) => (
            <div key={r.cat} className="flex items-center gap-4 px-5 py-4"
              style={{ borderBottom: "1px solid rgba(212,160,175,0.10)" }}>
              <div className="relative size-14 flex-shrink-0 overflow-hidden rounded-2xl">
                <Image src={r.img} alt={r.cat} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#0B1D3A]">{r.cat}</p>
                <p className="text-xs text-[#6B5232]/60">{r.breed} · ถึง {r.to}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Clock className="size-3 text-[#6B5232]/40" />
                  <span className="text-[10px] text-[#6B5232]/40">{r.date}</span>
                </div>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={r.status === "accepted"
                  ? { background: "rgba(34,197,94,0.12)", color: "#16a34a" }
                  : { background: "rgba(212,175,55,0.15)", color: "#B8920A" }}>
                {r.status === "accepted" ? "ยอมรับแล้ว" : "รอการตอบรับ"}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Tips + Premium */}
        <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-3">
          {TIPS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl p-4"
              style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
              <Icon className="mb-2 size-5 text-[#D4AF37]" />
              <p className="text-xs font-bold text-[#0B1D3A]">{title}</p>
              <p className="mt-0.5 text-[11px] text-[#6B5232]/60">{desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Pedigree premium */}
        <motion.div variants={fadeUp} className="flex items-center gap-4 rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg,#FDF0F4,#F9DDE8)", border: "1px solid rgba(212,140,165,0.30)" }}>
          <Lock className="size-5 flex-shrink-0 text-[#B04060]/60" />
          <div className="flex-1">
            <p className="font-bold text-[#4A1030]">Pedigree Certificate & Priority Listing</p>
            <p className="text-xs text-[#6B5232]/60">ปลดล็อก Pedigree ดิจิทัล + แสดงโปรไฟล์ก่อนใคร</p>
          </div>
          <Link href="/register" className="flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            <Crown className="mr-1 inline size-3" /> Premium
          </Link>
        </motion.div>

      </motion.div>
    </AppShell>
  );
}
