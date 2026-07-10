"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Heart, PawPrint, ShieldCheck, Bot, Sparkles } from "lucide-react";
import Image from "next/image";
import { LinkButton } from "@/components/shared/link-button";
import { fadeUp, staggerContainer } from "@/lib/motion";

// ── Trust badge pill ──────────────────────────────────────────────────────────
function TrustPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-semibold"
      style={{
        background: "rgba(255,254,245,0.82)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(212,175,55,0.32)",
        boxShadow: "0 4px 20px rgba(11,29,58,0.10)",
        color: "#0B1D3A",
      }}
    >
      <span className="flex size-8 items-center justify-center rounded-full" style={{ background: "rgba(212,175,55,0.16)" }}>
        {icon}
      </span>
      {label}
    </motion.div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export function Hero() {
  const t = useTranslations("hero");

  return (
    <>
      {/* ─── Main hero section ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">

        {/* Background: Blackgroud.png */}
        <Image
          src="/img/Blackgroud.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />

        {/* Soft overlay — left fade for text legibility only */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(110deg, rgba(11,29,58,0.38) 0%, rgba(11,29,58,0.18) 42%, transparent 68%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-8 pt-20 pb-24 sm:pt-24 sm:pb-28 lg:pt-28 lg:pb-32 xl:pt-32">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-4 xl:gap-8">

            {/* LEFT: Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="order-1 flex-1 text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div variants={fadeUp} className="mb-6">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.22)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(212,175,55,0.50)",
                    color: "#fff",
                    textShadow: "0 1px 6px rgba(0,0,0,0.30)",
                  }}
                >
                  <Heart className="size-3.5 fill-[#F9C5D1] text-[#F9C5D1]" />
                  {t("badge")}
                </span>
              </motion.div>

              {/* Main heading */}
              <motion.h1
                variants={fadeUp}
                className="font-heading text-5xl font-bold leading-tight tracking-wide sm:text-6xl xl:text-[4.2rem]"
                style={{
                  color: "#fff",
                  textShadow: "0 2px 16px rgba(0,0,0,0.35), 0 0 60px rgba(0,0,0,0.15)",
                }}
              >
                {t("headline1")}
                <br />
                <span
                  style={{
                    color: "#EDD060",
                    textShadow:
                      "0 0 22px rgba(212,175,55,0.80), 0 2px 12px rgba(0,0,0,0.25)",
                  }}
                >
                  {t("headline2")}
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mx-auto mt-6 max-w-lg text-lg leading-relaxed lg:mx-0"
                style={{
                  color: "rgba(255,255,255,0.90)",
                  textShadow: "0 1px 8px rgba(0,0,0,0.30)",
                }}
              >
                {t("subheadline")}
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                variants={fadeUp}
                className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:items-start"
              >
                <a
                  href="https://www.facebook.com/profile.php?id=61591494033259&mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full px-9 text-base font-bold transition-all hover:opacity-90 active:scale-95 sm:w-auto"
                  style={{
                    background:
                      "linear-gradient(135deg, #EDD060 0%, #D4AF37 50%, #B8920A 100%)",
                    color: "#0B1D3A",
                    boxShadow: "0 6px 28px rgba(212,175,55,0.60), 0 0 60px rgba(212,175,55,0.20)",
                  }}
                >
                  <svg className="size-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                  {t("ctaJoin")}
                </a>
                <LinkButton
                  href="/knowledge"
                  variant="outline"
                  size="lg"
                  className="h-13 w-full rounded-full px-9 text-base font-semibold sm:w-auto"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    backdropFilter: "blur(12px)",
                    border: "1.5px solid rgba(255,255,255,0.55)",
                    color: "#fff",
                    textShadow: "0 1px 6px rgba(0,0,0,0.20)",
                    height: "52px",
                  } as React.CSSProperties}
                >
                  {t("ctaLearn")}
                </LinkButton>
              </motion.div>

              {/* Trust micro-badges */}
              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-sm lg:justify-start"
              >
                {[
                  { icon: <Heart className="size-3.5 fill-[#F9C5D1] text-[#F9C5D1]" />, text: t("freeOnWeb") },
                  { icon: <PawPrint className="size-3.5 text-[#EDD060]" />, text: t("marketStat") },
                  { icon: <ShieldCheck className="size-3.5 text-[#EDD060]" />, text: t("swipeChatBook") },
                ].map((b) => (
                  <span
                    key={b.text}
                    className="flex items-center gap-2 rounded-full px-3 py-1"
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      backdropFilter: "blur(8px)",
                      color: "#fff",
                      textShadow: "0 1px 4px rgba(0,0,0,0.25)",
                    }}
                  >
                    {b.icon} {b.text}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT: Mascot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
              className="order-2 flex w-full max-w-[380px] justify-center sm:max-w-[460px] lg:max-w-[540px] xl:max-w-[640px]"
            >
              <div className="relative w-full">
                {/* Glow layers */}
                <div
                  className="absolute inset-0 -m-12 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(212,175,55,0.45) 0%, rgba(249,197,209,0.22) 48%, transparent 74%)",
                    filter: "blur(36px)",
                  }}
                />
                <div
                  className="absolute inset-0 -m-4 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(212,175,55,0.22) 0%, transparent 68%)",
                    filter: "blur(20px)",
                  }}
                />
                {/* Floating mascot */}
                <motion.div
                  animate={{ y: [0, -18, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <Image
                    src="/img/mascot.png"
                    alt="Catinder — กามเทพแมว"
                    width={640}
                    height={640}
                    className="relative w-full"
                    style={{
                      filter:
                        "drop-shadow(0 16px 48px rgba(212,175,55,0.55)) drop-shadow(0 0 90px rgba(212,175,55,0.22))",
                    }}
                    priority
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Trust badge strip — Blackgroud2 background ───────────────────── */}
      <section className="relative overflow-hidden">
        {/* Blackgroud2 as soft bg */}
        <Image
          src="/img/Blackgroud2.png"
          alt=""
          fill
          className="object-cover object-center"
          quality={80}
        />
        {/* Cream overlay so pills read cleanly */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(255,250,240,0.70)" }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <TrustPill icon={<ShieldCheck className="size-4 text-[#D4AF37]" />} label="ปลอดภัย 100%" />
            <TrustPill icon={<Heart className="size-4 fill-[#F9C5D1] text-[#F9C5D1]" />} label="เชื่อถือได้" />
            <TrustPill icon={<PawPrint className="size-4 text-[#D4AF37]" />} label="ใส่ใจทุกชีวิต" />
            <TrustPill icon={<Bot className="size-4 text-[#D4AF37]" />} label="AI Matching" />
            <TrustPill icon={<Sparkles className="size-4 text-[#D4AF37]" />} label="Premium Care" />
          </motion.div>
        </div>
      </section>
    </>
  );
}
