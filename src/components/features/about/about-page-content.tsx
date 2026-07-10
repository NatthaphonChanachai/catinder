"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Shield, Heart, Eye, Sparkles, CheckCircle } from "lucide-react";
import Image from "next/image";
import { LinkButton } from "@/components/shared/link-button";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { fadeUp, staggerContainer } from "@/lib/motion";

const PROMISE_ICONS = [Shield, Heart, Eye, Sparkles];

export function AboutPageContent() {
  const t = useTranslations("about");

  const stats = [
    { value: t("stats.catParentsValue"), label: t("stats.catParentsLabel") },
    { value: t("stats.articlesValue"), label: t("stats.articlesLabel") },
    { value: t("stats.breedsValue"), label: t("stats.breedsLabel") },
    { value: t("stats.citiesValue"), label: t("stats.citiesLabel") },
  ];

  const promiseItems = [0, 1, 2, 3].map((i) => ({
    title: t(`promiseItems.${i}.title`),
    desc: t(`promiseItems.${i}.desc`),
  }));

  const timelineItems = [0, 1, 2, 3].map((i) => ({
    year: t(`timelineItems.${i}.year`),
    title: t(`timelineItems.${i}.title`),
    desc: t(`timelineItems.${i}.desc`),
  }));

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center sm:py-28">
        {/* Blackgroud4 — Roman columns / golden sky */}
        <Image src="/img/Blackgroud4.png" alt="" fill className="object-cover object-center" quality={85} />
        <div className="absolute inset-0" style={{ background: "rgba(255,248,236,0.72)" }} />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative mx-auto max-w-3xl"
        >
          <motion.span
            variants={fadeUp}
            className="inline-block rounded-full bg-[var(--rose-blush)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
          >
            {t("badge")}
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl"
          >
            {t("headline")}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {t("subheadline")}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/register" size="lg" className="rounded-full px-8">
              {t("ctaJoin")}
            </LinkButton>
            <LinkButton href="/knowledge" variant="outline" size="lg" className="rounded-full px-8">
              {t("ctaLearn")}
            </LinkButton>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-border/60 bg-card px-6 py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="text-center">
              <AnimatedCounter value={s.value} label={s.label} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Mission + Vision ── */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {[
            { label: t("missionLabel"), body: t("missionBody"), color: "var(--rose-blush)" },
            { label: t("visionLabel"), body: t("visionBody"), color: "var(--champagne)" },
          ].map((item) => (
            <motion.div
              key={item.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              className="rounded-3xl p-8"
              style={{ background: `color-mix(in srgb, ${item.color} 30%, white)` }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-3 text-base font-semibold leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Community Promise ── */}
      <section className="bg-[var(--warm-ivory)] px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center text-2xl font-extrabold sm:text-3xl"
          >
            {t("promiseTitle")}
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
            className="mt-10 grid gap-5 sm:grid-cols-2"
          >
            {promiseItems.map((item, i) => {
              const Icon = PROMISE_ICONS[i]!;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="flex gap-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border/60"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--rose-blush)]">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-12 text-center text-2xl font-extrabold sm:text-3xl"
          >
            {t("timelineTitle")}
          </motion.h2>
          <div className="relative">
            <div className="absolute left-7 top-0 h-full w-px bg-border" />
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={staggerContainer}
              className="flex flex-col gap-10"
            >
              {timelineItems.map((item) => (
                <motion.div key={item.year} variants={fadeUp} className="flex gap-6">
                  <div className="relative flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-[var(--soft-gold)]/30 text-center">
                    <p className="text-[10px] font-bold uppercase leading-tight text-muted-foreground">
                      {item.year}
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-[var(--soft-gold)]" />
                      <p className="font-bold">{item.title}</p>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-br from-[var(--rose-blush)] via-[var(--champagne)] to-[var(--warm-peach)] px-6 py-16 text-center sm:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto max-w-2xl"
        >
          <motion.h2 variants={fadeUp} className="text-2xl font-extrabold sm:text-3xl">
            {t("ctaTitle")}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-base text-muted-foreground">
            {t("ctaSubtitle")}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/register" size="lg" className="rounded-full px-8">
              {t("ctaJoin")}
            </LinkButton>
            <LinkButton href="/knowledge" variant="outline" size="lg" className="rounded-full px-8 bg-white/60">
              {t("ctaLearn")}
            </LinkButton>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
