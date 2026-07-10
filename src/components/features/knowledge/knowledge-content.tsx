"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ALL_ARTICLES } from "@/constants/sample-content";
import { ArticleCard } from "@/components/shared/article-card";
import { PremiumTeaser } from "@/components/shared/premium-teaser";
import { HeavenBg } from "@/components/shared/heaven-bg";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

const CATS = ["all", "health", "nutrition", "heat-cycle", "vaccination", "behavior", "breeding"] as const;
type Cat = (typeof CATS)[number];

export function KnowledgeContent() {
  const t = useTranslations("knowledgePage");
  const tk = useTranslations("knowledge");
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<Cat>("all");

  const filtered = ALL_ARTICLES.filter((a) => {
    const matchesCat = activeCat === "all" || a.category === activeCat;
    const matchesQuery =
      query === "" ||
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const featured = filtered.find((a) => a.featured);
  const rest = filtered.filter((a) => a !== featured);

  const catLabels: Record<Cat, string> = {
    all: t("catAll"),
    health: t("catHealth"),
    nutrition: t("catNutrition"),
    "heat-cycle": t("catHeatCycle"),
    vaccination: t("catVaccination"),
    behavior: t("catBehavior"),
    breeding: t("catBreeding"),
  };

  return (
    <>
      {/* ── Hero + Search ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--soft-cream)] to-background px-6 py-16 text-center sm:py-20">
        <HeavenBg dense={false} hearts={false} />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative mx-auto max-w-2xl"
        >
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
      <section className="sticky top-[68px] sm:top-[76px] lg:top-20 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-6 py-3 scrollbar-none">
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
      </section>

      {/* ── Content ── */}
      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          {/* Featured article */}
          {featured && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mb-10"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--rose-gold)]">
                {t("featuredLabel")}
              </p>
              <Link
                href={`/articles/${featured.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/60 sm:flex-row"
              >
                <div className="relative h-52 sm:h-auto sm:w-2/5 shrink-0 overflow-hidden bg-muted">
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 40vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center gap-3 p-8">
                  <span className="w-fit rounded-full bg-[var(--rose-blush)] px-3 py-1 text-xs font-semibold">
                    {tk(`categories.${featured.category}`)}
                  </span>
                  <h2 className="text-xl font-extrabold leading-snug sm:text-2xl">{featured.title}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("minRead", { n: featured.readMinutes })}
                  </p>
                </div>
              </Link>
            </motion.div>
          )}

          {/* All articles grid */}
          <p className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t("allArticles")}
          </p>
          {filtered.length === 0 ? (
            <motion.p variants={fadeUp} initial="hidden" animate="visible" className="py-16 text-center text-muted-foreground">
              {t("noResults")}
            </motion.p>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={staggerContainer}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {rest.map((article) => (
                <motion.div key={article.slug} variants={fadeUp}>
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Premium teaser */}
          <div className="mt-14">
            <PremiumTeaser
              title={t("premiumTitle")}
              description={t("premiumDesc")}
              cta={t("premiumCta")}
            />
          </div>
        </div>
      </section>
    </>
  );
}
