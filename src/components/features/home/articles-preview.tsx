"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ArticleCard } from "@/components/shared/article-card";
import { FEATURED_ARTICLES } from "@/constants/sample-content";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function ArticlesPreview() {
  const t = useTranslations("knowledge");

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
      {/* Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left"
      >
        <div>
          <h2 className="text-xl font-extrabold sm:text-2xl lg:text-3xl">{t("title")}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2">{t("subtitle")}</p>
        </div>
        <Link
          href="/articles"
          className="flex items-center gap-1 text-sm font-semibold text-foreground hover:underline whitespace-nowrap"
        >
          {t("viewAll")} <ArrowRight className="size-4" />
        </Link>
      </motion.div>

      {/* ── Mobile: horizontal scroll strip ── */}
      <div className="mt-6 sm:hidden">
        <div className="flex gap-3.5 overflow-x-auto pb-2 no-scrollbar">
          {FEATURED_ARTICLES.map((article, i) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="flex-shrink-0 w-[260px]"
            >
              <ArticleCard article={article} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Desktop: 3-column grid (unchanged) ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="hidden sm:grid mt-10 grid-cols-3 gap-6"
      >
        {FEATURED_ARTICLES.map((article) => (
          <motion.div key={article.slug} variants={fadeUp}>
            <ArticleCard article={article} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
