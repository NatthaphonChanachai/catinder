"use client";

import { motion } from "framer-motion";
import { Bot, BookOpen, PawPrint, Users, HeartPulse, Gamepad2 } from "lucide-react";
import Image from "next/image";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Link } from "@/i18n/navigation";

const FEATURES = [
  {
    icon: <Bot className="size-6" />,
    title: "AI จับคู่แมว",
    desc: "ระบบ AI อัจฉริยะช่วยหาคู่ผสมพันธุ์ที่เหมาะสมที่สุดสำหรับแมวของคุณ",
    href: "/discover",
    color: "#D4AF37",
    bg: "rgba(212,175,55,0.12)",
  },
  {
    icon: <BookOpen className="size-6" />,
    title: "ความรู้สุขภาพแมว",
    desc: "บทความและคู่มือจากผู้เชี่ยวชาญด้านสุขภาพ โภชนาการ และการดูแลแมว",
    href: "/knowledge",
    color: "#F9C5D1",
    bg: "rgba(249,197,209,0.18)",
  },
  {
    icon: <PawPrint className="size-6" />,
    title: "โปรไฟล์แมว",
    desc: "สร้างโปรไฟล์แมวที่สมบูรณ์ พร้อมประวัติสุขภาพและสายพันธุ์ที่ครบถ้วน",
    href: "/cats",
    color: "#D4AF37",
    bg: "rgba(212,175,55,0.12)",
  },
  {
    icon: <Users className="size-6" />,
    title: "ชุมชนพ่อแม่แมว",
    desc: "เชื่อมต่อกับคนรักแมวทั่วประเทศ แลกเปลี่ยนประสบการณ์และเคล็ดลับ",
    href: "/community",
    color: "#F9C5D1",
    bg: "rgba(249,197,209,0.18)",
  },
  {
    icon: <HeartPulse className="size-6" />,
    title: "บันทึกสุขภาพ",
    desc: "ติดตามวัคซีน การตรวจสุขภาพ และประวัติสุขภาพแมวของคุณในที่เดียว",
    href: "/health",
    color: "#D4AF37",
    bg: "rgba(212,175,55,0.12)",
  },
  {
    icon: <Gamepad2 className="size-6" />,
    title: "กิจกรรม/เกมประจำวัน",
    desc: "ภารกิจรายวัน คำคมแมว และกิจกรรมสนุก ๆ ที่ให้คะแนน XP สะสม",
    href: "/games",
    color: "#F9C5D1",
    bg: "rgba(249,197,209,0.18)",
  },
];

export function FeatureCards() {
  return (
    <section className="relative overflow-hidden px-6 py-16 sm:py-20">
      {/* Blackgroud3 — soft castle background */}
      <Image src="/img/Blackgroud3.png" alt="" fill className="object-cover object-center" quality={75} />
      <div className="absolute inset-0" style={{ background: "rgba(255,252,242,0.82)" }} />
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="mb-12 text-center"
        >
          <motion.p
            variants={fadeUp}
            className="mb-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37]"
          >
            ฟีเจอร์หลัก
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-heading text-3xl font-bold text-[#0B1D3A] sm:text-4xl"
          >
            ทุกสิ่งที่คุณพ่อคุณแม่แมวต้องการ
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#6B5232] sm:text-base"
          >
            แพลตฟอร์มครบวงจรสำหรับการจับคู่แมวอย่างปลอดภัยและมีความสุข
          </motion.p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(11,29,58,0.14)" }}
              transition={{ duration: 0.25 }}
            >
              <Link
                href={f.href}
                className="group flex h-full flex-col rounded-3xl p-6 transition-colors"
                style={{
                  background: "rgba(255,255,255,0.80)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(212,175,55,0.22)",
                  boxShadow: "0 4px 20px rgba(11,29,58,0.07)",
                }}
              >
                {/* Icon */}
                <div
                  className="mb-4 flex size-12 items-center justify-center rounded-2xl"
                  style={{ background: f.bg, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-[#0B1D3A]">{f.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-[#6B5232]/85">{f.desc}</p>
                <div
                  className="mt-4 flex items-center gap-1 text-xs font-semibold transition-all group-hover:gap-2"
                  style={{ color: "#D4AF37" }}
                >
                  <span>เรียนรู้เพิ่มเติม</span>
                  <span>→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
