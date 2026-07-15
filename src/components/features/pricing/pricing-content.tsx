"use client";

import { motion } from "framer-motion";
import { Crown, Check, Zap, Shield, Heart, Star, ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useState } from "react";

const FREE_FEATURES = [
  { icon: Heart,  text: "แมวสูงสุด 2 ตัว" },
  { icon: Zap,    text: "AI Match 5 คู่/วัน" },
  { icon: Star,   text: "อ่านบทความ & เกม" },
  { icon: Shield, text: "เข้าถึงชุมชน" },
];

const PREMIUM_FEATURES = [
  { icon: Heart,  text: "แมวไม่จำกัด" },
  { icon: Zap,    text: "AI Match ไม่จำกัด" },
  { icon: Crown,  text: "แชทโดยตรงกับผู้เพาะพันธุ์" },
  { icon: Shield, text: "Health Passport เต็มรูปแบบ" },
  { icon: Star,   text: "Pedigree & Priority Listing" },
  { icon: Check,  text: "Breeder Badge ยืนยันตัวตน" },
];

const FAQ_ITEMS = [
  {
    q: "ฟรีแพลนมีอะไรบ้าง?",
    a: "แพลนฟรีให้คุณสร้างโปรไฟล์แมวได้สูงสุด 2 ตัว รับ AI Match 5 คู่ต่อวัน อ่านบทความ เล่นเกม และเข้าร่วมชุมชน Catinder ได้ทั้งหมด — ไม่มีค่าใช้จ่าย",
  },
  {
    q: "Premium จะเปิดให้ใช้เมื่อไหร่?",
    a: "เราอยู่ระหว่างพัฒนาระบบชำระเงินด้วย Omise และกำลังจะเปิดตัวเร็วๆ นี้ สมาชิกที่ลงทะเบียนก่อนจะได้รับสิทธิ์ Early Bird พิเศษ",
  },
  {
    q: "ถ้าสมัคร Premium แล้วเปลี่ยนใจได้ไหม?",
    a: "ได้เลย คุณสามารถยกเลิกได้ตลอดเวลาก่อนรอบบิลถัดไป และยังคงใช้งาน Premium จนหมดรอบบิลปัจจุบัน",
  },
];

export function PricingContent() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen" style={{ background: "#FFF5F8" }}>
      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-40 flex items-center px-4 py-3 border-b"
        style={{
          background: "rgba(255,250,252,0.94)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderColor: "rgba(212,160,175,0.22)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: "#B04060" }}
        >
          <span>←</span>
          <span>กลับ</span>
        </Link>
        <h1
          className="mx-auto text-sm font-bold"
          style={{ color: "#0B1D3A" }}
        >
          แผนราคา
        </h1>
        {/* spacer to center title */}
        <div className="w-12" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
            style={{
              background: "rgba(212,175,55,0.12)",
              color: "#C4A020",
              border: "1px solid rgba(212,175,55,0.25)",
            }}
          >
            ราคาและแผนบริการ
          </span>
          <h2
            className="font-heading text-3xl md:text-4xl font-bold mb-3 leading-tight"
            style={{
              background: "linear-gradient(135deg,#EDD060,#D4AF37)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            เลือกแผนที่ใช่สำหรับคุณ
          </h2>
          <p className="text-base max-w-sm mx-auto" style={{ color: "#6B5232" }}>
            เริ่มต้นฟรี อัปเกรดเมื่อพร้อม ไม่มีค่าใช้จ่ายซ่อนเร้น
          </p>
        </motion.div>

        {/* Monthly / Annual toggle (UI only) */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex items-center rounded-full p-1 gap-1"
            style={{
              background: "rgba(212,160,175,0.10)",
              border: "1px solid rgba(212,160,175,0.22)",
            }}
          >
            <button
              onClick={() => setAnnual(false)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={
                !annual
                  ? {
                      background: "linear-gradient(135deg,#EDD060,#D4AF37)",
                      color: "#0B1D3A",
                    }
                  : { color: "#6B5232" }
              }
            >
              รายเดือน
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5"
              style={
                annual
                  ? {
                      background: "linear-gradient(135deg,#EDD060,#D4AF37)",
                      color: "#0B1D3A",
                    }
                  : { color: "#6B5232" }
              }
            >
              รายปี
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "#F9C5D1", color: "#B04060" }}
              >
                ประหยัด 32%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {/* Free plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="rounded-2xl p-6 flex flex-col"
            style={{
              background: "#FFFAFC",
              border: "1px solid rgba(212,160,175,0.22)",
              boxShadow: "0 4px 24px rgba(11,29,58,0.05)",
            }}
          >
            <div className="mb-4">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#6B5232" }}
              >
                แผนฟรี
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black" style={{ color: "#0B1D3A" }}>
                  ฟรี
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: "#6B5232" }}>
                ตลอดไป ไม่มีบัตรเครดิต
              </p>
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {FREE_FEATURES.map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span
                    className="flex size-6 items-center justify-center rounded-full shrink-0"
                    style={{ background: "rgba(212,175,55,0.12)" }}
                  >
                    <Icon className="size-3.5" style={{ color: "#D4AF37" }} />
                  </span>
                  <span className="text-sm" style={{ color: "#0B1D3A" }}>
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="w-full rounded-xl py-3 text-sm font-semibold text-center block transition-opacity hover:opacity-80"
              style={{
                border: "1.5px solid rgba(212,175,55,0.4)",
                color: "#C4A020",
              }}
            >
              เริ่มใช้งานฟรี
            </Link>
          </motion.div>

          {/* Premium plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="rounded-2xl p-6 flex flex-col relative overflow-hidden"
            style={{
              background: "#0B1D3A",
              boxShadow: "0 8px 40px rgba(11,29,58,0.20)",
            }}
          >
            {/* Background shimmer */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 60% 0%, #EDD060 0%, transparent 70%)",
              }}
            />

            {/* Popular badge */}
            <div className="absolute top-4 right-4">
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: "linear-gradient(135deg,#EDD060,#D4AF37)",
                  color: "#0B1D3A",
                }}
              >
                แนะนำ
              </span>
            </div>

            <div className="mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Premium
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-white">
                  {annual ? "799" : "99"}
                </span>
                <span className="text-sm text-amber-300/70">
                  ฿/{annual ? "ปี" : "เดือน"}
                </span>
              </div>
              {annual && (
                <p className="text-xs mt-1 text-amber-300/60">
                  เทียบเท่า 66.58 ฿/เดือน
                </p>
              )}
              {!annual && (
                <p className="text-xs mt-1 text-white/40">
                  หรือ 799 ฿/ปี (ประหยัดกว่า)
                </p>
              )}
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {PREMIUM_FEATURES.map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span
                    className="flex size-6 items-center justify-center rounded-full shrink-0"
                    style={{ background: "rgba(237,208,96,0.15)" }}
                  >
                    <Icon className="size-3.5 text-amber-400" />
                  </span>
                  <span className="text-sm text-white/90">{text}</span>
                </li>
              ))}
            </ul>

            {/* Coming soon button */}
            <button
              disabled
              className="w-full rounded-xl py-3 text-sm font-bold text-center cursor-not-allowed opacity-70"
              style={{
                background: "linear-gradient(135deg,#EDD060,#D4AF37)",
                color: "#0B1D3A",
              }}
            >
              เร็วๆ นี้
            </button>
            <p className="text-center text-xs mt-2 text-white/40">
              ระบบชำระเงินกำลังพัฒนา
            </p>
          </motion.div>
        </div>

        {/* Feature comparison note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <p className="text-sm" style={{ color: "#6B5232" }}>
            ทุกแผนรวมถึงการเข้าถึงบทความ ชุมชน และกิจกรรมออนไลน์
          </p>
        </motion.div>

        {/* FAQ section */}
        <div>
          <h3
            className="font-heading text-xl font-bold text-center mb-6"
            style={{ color: "#0B1D3A" }}
          >
            คำถามที่พบบ่อย
          </h3>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "#FFFAFC",
                  border: "1px solid rgba(212,160,175,0.22)",
                }}
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold pr-4" style={{ color: "#0B1D3A" }}>
                    {item.q}
                  </span>
                  <ChevronDown
                    className="size-4 shrink-0 transition-transform duration-200"
                    style={{
                      color: "#D4AF37",
                      transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm leading-relaxed" style={{ color: "#6B5232" }}>
                      {item.a}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
