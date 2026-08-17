"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { MessageCircle, Mail, Phone, HelpCircle, ArrowRight, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function ContactContent() {
  const t = useTranslations("contactPage");

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-[var(--warm-ivory)] to-background px-6 py-16 text-center sm:py-20">
        <m.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-xl">
          <m.span variants={fadeUp} className="inline-block rounded-full bg-[var(--champagne)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            {t("badge")}
          </m.span>
          <m.h1 variants={fadeUp} className="mt-5 text-3xl font-extrabold sm:text-4xl">
            {t("title")}
          </m.h1>
          <m.p variants={fadeUp} className="mt-4 text-base text-muted-foreground">
            {t("subtitle")}
          </m.p>
        </m.div>
      </section>

      {/* ── Contact channels ── */}
      <section className="px-6 pb-16">
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="mx-auto grid max-w-3xl gap-4"
        >
          {/* Primary — Chat with the team */}
          <m.div variants={fadeUp}>
            <Link
              href="/support"
              className="group flex items-center gap-4 rounded-3xl p-6 transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#0B1D3A,#12264a)", boxShadow: "0 8px 32px rgba(11,29,58,0.18)" }}
            >
              <div className="flex size-14 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)" }}>
                <MessageCircle className="size-7 text-[#0B1D3A]" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-extrabold text-white">แชทกับทีมงาน</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-amber-200/80">
                  <Clock className="size-3.5" /> ตอบเร็วที่สุด · ภายใน 24 ชม.
                </p>
              </div>
              <ArrowRight className="size-5 flex-shrink-0 text-amber-300 transition-transform group-hover:translate-x-1" />
            </Link>
          </m.div>

          {/* Secondary channels */}
          <div className="grid gap-4 sm:grid-cols-2">
            <m.a
              variants={fadeUp}
              href="mailto:support@catinder.app"
              className="flex items-center gap-3 rounded-2xl bg-card p-5 ring-1 ring-border/60 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex size-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(212,175,55,0.14)" }}>
                <Mail className="size-5 text-[var(--soft-gold)]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold">อีเมล</p>
                <p className="truncate text-xs text-muted-foreground">support@catinder.app</p>
              </div>
            </m.a>

            <m.div
              variants={fadeUp}
              className="flex items-center gap-3 rounded-2xl bg-card p-5 ring-1 ring-border/60"
            >
              <div className="flex size-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(212,175,55,0.14)" }}>
                <Phone className="size-5 text-[var(--soft-gold)]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold">โทรหาเรา</p>
                <p className="text-xs text-muted-foreground">เปิดให้บริการเร็วๆ นี้</p>
              </div>
            </m.div>
          </div>

          {/* FAQ shortcut */}
          <m.div variants={fadeUp} className="rounded-2xl bg-[var(--warm-ivory)] p-5">
            <div className="flex items-center gap-3">
              <HelpCircle className="size-5 flex-shrink-0 text-[var(--rose-gold)]" />
              <div className="flex-1">
                <p className="text-sm font-bold">{t("faqShortcutTitle")}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t("faqShortcutSubtitle")}</p>
              </div>
              <Link href="/faq" className="flex-shrink-0 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold transition-colors hover:bg-muted">
                {t("faqShortcutCta")}
              </Link>
            </div>
          </m.div>
        </m.div>
      </section>
    </>
  );
}
