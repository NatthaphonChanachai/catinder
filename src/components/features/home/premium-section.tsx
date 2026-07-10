"use client";

import { motion } from "framer-motion";
import { Crown, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import React from "react";
import { LinkButton } from "@/components/shared/link-button";
import { fadeUp, staggerContainer } from "@/lib/motion";

const PERKS = [
  "AI จับคู่ขั้นสูง ไม่จำกัดจำนวนครั้ง",
  "รายงานสุขภาพเชิงลึกสำหรับแมวของคุณ",
  "ปุ่ม Boost เพิ่มการมองเห็นโปรไฟล์",
  "แชทแบบ Priority กับผู้เพาะพันธุ์ที่ยืนยันแล้ว",
  "ตราสัญลักษณ์ Premium สร้างความน่าเชื่อถือ",
];

export function PremiumSection() {
  return (
    <section className="relative overflow-hidden px-6 py-16 sm:py-20">
      {/* Blackgroud4 — Roman columns, golden */}
      <Image src="/img/Blackgroud4.png" alt="" fill className="object-cover object-center" quality={80} />
      <div className="absolute inset-0" style={{ background: "rgba(251,244,224,0.78)" }} />
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="relative overflow-hidden rounded-[2.5rem]"
          style={{
            background:
              "linear-gradient(135deg, #0B1D3A 0%, #13294B 40%, #1D3A6E 100%)",
            boxShadow:
              "0 20px 70px rgba(11,29,58,0.35), 0 0 0 1px rgba(212,175,55,0.22)",
          }}
        >
          {/* Background glow blobs */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-10 -left-10 size-72 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(249,197,209,0.12) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />

          <div className="flex flex-col items-center gap-8 p-8 sm:p-12 lg:flex-row lg:gap-12">
            {/* Mascot */}
            <motion.div
              variants={fadeUp}
              className="relative flex-shrink-0 lg:w-[300px]"
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(212,175,55,0.35) 0%, transparent 70%)",
                  filter: "blur(28px)",
                }}
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/img/mascot.png"
                  alt="Catinder Premium"
                  width={300}
                  height={300}
                  className="relative w-48 sm:w-56 lg:w-full"
                  style={{
                    filter: "drop-shadow(0 8px 24px rgba(212,175,55,0.45))",
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Text content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Label */}
              <motion.div variants={fadeUp} className="mb-4 flex items-center justify-center gap-2 lg:justify-start">
                <Crown className="size-4 text-[#D4AF37]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                  Catinder Premium
                </span>
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="font-heading text-3xl font-bold text-white sm:text-4xl"
              >
                ยกระดับประสบการณ์<br />
                <span style={{ color: "#D4AF37" }}>การจับคู่แมว</span>
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="mx-auto mt-4 max-w-md text-sm leading-relaxed lg:mx-0 lg:text-base"
                style={{ color: "rgba(247,215,171,0.72)" }}
              >
                ปลดล็อกฟีเจอร์ระดับพรีเมียมที่ออกแบบมาเพื่อคุณพ่อคุณแม่แมวที่ต้องการสิ่งที่ดีที่สุดสำหรับลูกแมว
              </motion.p>

              {/* Perks list */}
              <motion.ul variants={staggerContainer} className="mt-6 space-y-2.5">
                {PERKS.map((perk, i) => (
                  <motion.li
                    key={i}
                    variants={fadeUp}
                    className="flex items-center gap-3 text-sm"
                    style={{ color: "rgba(247,215,171,0.85)" }}
                  >
                    <Star className="size-3.5 flex-shrink-0 fill-[#D4AF37] text-[#D4AF37]" />
                    {perk}
                  </motion.li>
                ))}
              </motion.ul>

              {/* CTA */}
              <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                <LinkButton
                  href="/register"
                  size="lg"
                  className="h-12 rounded-full px-8 text-sm font-bold"
                  style={{
                    background: "linear-gradient(135deg, #EDD060 0%, #D4AF37 50%, #B8920A 100%)",
                    color: "#0B1D3A",
                    boxShadow: "0 4px 24px rgba(212,175,55,0.50)",
                  } as React.CSSProperties}
                >
                  <Sparkles className="mr-2 size-4" />
                  เริ่มต้นฟรี
                </LinkButton>
                <span
                  className="flex items-center text-xs"
                  style={{ color: "rgba(247,215,171,0.50)" }}
                >
                  ไม่ต้องใช้บัตรเครดิต
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

