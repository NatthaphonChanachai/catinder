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
    <section className="mx-auto max-w-6xl px-6 py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left"
      >
        <div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">{t("title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link
          href="/articles"
          className="flex items-center gap-1 text-sm font-semibold text-foreground hover:underline"
        >
          {t("viewAll")} <ArrowRight className="size-4" />
        </Link>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3"
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
