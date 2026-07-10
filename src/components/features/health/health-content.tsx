"use client";

import { motion } from "framer-motion";
import { CheckCircle, Circle, AlertCircle, HeartPulse, Syringe, Activity, FileText, Lock, Crown, Plus } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { fadeUp, staggerContainer } from "@/lib/motion";

const CATS = [
  { name: "โมจิ", breed: "Scottish Fold", img: "/img/Scottish-fold-mochi.png", score: 92 },
  { name: "ลูน่า", breed: "Persian",       img: "/img/Persian_dollface_Luna.png", score: 88 },
];

const RECORDS = [
  { cat: "โมจิ", type: "วัคซีน", label: "วัคซีนรวม FVRCP",         date: "12 ม.ค. 2026", status: "done"    },
  { cat: "โมจิ", type: "วัคซีน", label: "วัคซีนพิษสุนัขบ้า",        date: "12 ม.ค. 2026", status: "done"    },
  { cat: "โมจิ", type: "ยา",     label: "ยาป้องกันปรสิต",           date: "1 มี.ค. 2026",  status: "done"    },
  { cat: "โมจิ", type: "ตรวจ",   label: "ตรวจสุขภาพประจำปี",        date: "20 ก.ค. 2026",  status: "upcoming"},
  { cat: "ลูน่า", type: "วัคซีน", label: "วัคซีนรวม FVRCP",         date: "5 ก.พ. 2026",  status: "done"    },
  { cat: "ลูน่า", type: "ตรวจ",   label: "ตรวจเลือดประจำปี",         date: "15 ส.ค. 2026",  status: "upcoming"},
];

function HealthRing({ score }: { score: number }) {
  const r = 44, circ = 2 * Math.PI * r, dash = circ * (score / 100);
  return (
    <svg viewBox="0 0 100 100" className="size-20">
      <defs>
        <linearGradient id={`hg${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EDD060" /><stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={`url(#hg${score})`} strokeWidth="8"
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4}
        transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0B1D3A">{score}</text>
      <text x="50" y="60" textAnchor="middle" fontSize="8" fill="#6B5232">ดีเยี่ยม</text>
    </svg>
  );
}

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

        {/* Cat health summary */}
        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
          {CATS.map((cat) => (
            <div key={cat.name} className="flex items-center gap-4 rounded-2xl p-5"
              style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
              <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-2xl">
                <Image src={cat.img} alt={cat.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#0B1D3A]">{cat.name}</p>
                <p className="text-xs text-[#6B5232]/60">{cat.breed}</p>
                <div className="mt-2 flex items-center gap-2">
                  <HeartPulse className="size-3.5 text-green-500" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(212,175,55,0.15)" }}>
                    <div className="h-full rounded-full" style={{ width: `${cat.score}%`, background: "linear-gradient(135deg,#EDD060,#D4AF37)" }} />
                  </div>
                  <span className="text-xs font-bold text-[#D4AF37]">{cat.score}%</span>
                </div>
              </div>
              <HealthRing score={cat.score} />
            </div>
          ))}
        </motion.div>

        {/* Records table */}
        <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(212,160,175,0.18)" }}>
            <h2 className="font-bold text-[#0B1D3A]">
              <Syringe className="mr-1.5 inline size-4 text-[#D4AF37]" />
              ประวัติวัคซีนและการตรวจ
            </h2>
          </div>
          <div className="divide-y divide-[#F5E0E6]">
            {RECORDS.map((r, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-shrink-0">
                  {r.status === "done"     && <CheckCircle className="size-5 text-green-500" />}
                  {r.status === "upcoming" && <Circle className="size-5 text-[#D4AF37]" />}
                  {r.status === "overdue"  && <AlertCircle className="size-5 text-red-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#0B1D3A]">{r.label}</p>
                  <p className="text-[11px] text-[#6B5232]/60">{r.cat} · {r.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-[#6B5232]">{r.date}</p>
                  <span className="text-[10px] font-bold"
                    style={{ color: r.status === "done" ? "#16a34a" : r.status === "upcoming" ? "#B8920A" : "#dc2626" }}>
                    {r.status === "done" ? "เสร็จแล้ว" : r.status === "upcoming" ? "ที่จะถึง" : "เลยกำหนด"}
                  </span>
                </div>
              </div>
            ))}
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
