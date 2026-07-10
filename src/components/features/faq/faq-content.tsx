"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Search, MessageCircle } from "lucide-react";
import { LinkButton } from "@/components/shared/link-button";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { FaqAiChat } from "@/components/features/faq/faq-ai-chat";
import { HeavenBg } from "@/components/shared/heaven-bg";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

type FaqCat = "all" | "general" | "account" | "features" | "premium";
const CATS: FaqCat[] = ["all", "general", "account", "features", "premium"];

export function FaqContent() {
  const t = useTranslations("faqPage");
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<FaqCat>("all");

  const allItems = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
    cat: t(`items.${i}.cat`),
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  const filtered = allItems.filter((item) => {
    const matchesCat = activeCat === "all" || item.cat === activeCat;
    const matchesQuery =
      query === "" ||
      item.question.toLowerCase().includes(query.toLowerCase()) ||
      item.answer.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const catLabels: Record<FaqCat, string> = {
    all: t("catAll"),
    general: t("catGeneral"),
    account: t("catAccount"),
    features: t("catFeatures"),
    premium: t("catPremium"),
  };

  return (
    <>
      {/* ── Hero + Search ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--soft-cream)] to-background px-6 py-16 text-center sm:py-20">
        <HeavenBg dense={false} hearts={false} />
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative mx-auto max-w-2xl">
          <motion.span variants={fadeUp} className="inline-block rounded-full bg-[var(--rose-blush)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            {t("badge")}
          </motion.span>
          <motion.h1 variants={fadeUp} className="mt-5 text-3xl font-extrabold sm:text-4xl">
            {t("title")}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-base text-muted-foreground">
            {t("subtitle")}
          </motion.p>
          <motion.div variants={fadeUp} className="relative mt-8">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Category tabs ── */}
      <div className="sticky top-[68px] sm:top-[76px] lg:top-20 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-6 py-3 scrollbar-none">
          {CATS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                activeCat === cat
                  ? "bg-[var(--soft-gold)] text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {catLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* ── FAQ accordion ── */}
      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {filtered.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">No results found.</p>
            ) : (
              <FaqAccordion items={filtered} />
            )}
          </motion.div>

          {/* AI Chat */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="mt-14"
          >
            <div className="mb-5 text-center">
              <span className="inline-block rounded-full bg-[var(--rose-blush)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
                ผู้ช่วย AI
              </span>
              <h3 className="mt-3 text-xl font-extrabold">ถาม Nori ได้เลย 🐱</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                ผู้ช่วย AI ของ Catinder พร้อมตอบทุกคำถามทันที
              </p>
            </div>
            <FaqAiChat />
          </motion.div>

          {/* Still need help */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUp}
            className="mt-8 rounded-3xl bg-[var(--warm-ivory)] p-8 text-center"
          >
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-[var(--rose-blush)]">
              <MessageCircle className="size-5" />
            </div>
            <h3 className="text-lg font-extrabold">{t("stillNeedHelpTitle")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("stillNeedHelpSubtitle")}</p>
            <div className="mt-6">
              <LinkButton href="/contact" className="rounded-full px-8">
                {t("stillNeedHelpCta")}
              </LinkButton>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
