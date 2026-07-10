"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Search, ThumbsUp, Star } from "lucide-react";
import { ALL_ARTICLES } from "@/constants/sample-content";
import { ArticleCard } from "@/components/shared/article-card";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

type SortMode = "popular" | "newest" | "editors";

export function ArticlesContent() {
  const t = useTranslations("articlesPage");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("popular");

  const filtered = ALL_ARTICLES.filter(
    (a) =>
      query === "" ||
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(query.toLowerCase()),
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "popular") return (b.likes ?? 0) - (a.likes ?? 0);
    if (sort === "editors") {
      if (a.editorsPick && !b.editorsPick) return -1;
      if (!a.editorsPick && b.editorsPick) return 1;
      return 0;
    }
    return 0; // newest: keep original order (already newest-first in sample)
  });

  const sorts: { key: SortMode; label: string }[] = [
    { key: "popular", label: t("sortPopular") },
    { key: "newest", label: t("sortNewest") },
    { key: "editors", label: t("sortEditors") },
  ];

  return (
    <>
      {/* ── Hero + Search ── */}
      <section className="bg-gradient-to-b from-[var(--warm-ivory)] to-background px-6 py-16 text-center sm:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mx-auto max-w-2xl"
        >
          <motion.span variants={fadeUp} className="inline-block rounded-full bg-[var(--petal-pink)]/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
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

      {/* ── Sort tabs ── */}
      <section className="sticky top-[68px] sm:top-[76px] lg:top-20 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl gap-1 px-6 py-3">
          {sorts.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                sort === s.key
                  ? "bg-[var(--soft-gold)] text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Articles grid ── */}
      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          {sorted.length === 0 ? (
            <motion.p initial="hidden" animate="visible" variants={fadeUp} className="py-16 text-center text-muted-foreground">
              {t("noResults")}
            </motion.p>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {sorted.map((article) => (
                <motion.div key={article.slug} variants={fadeUp} className="relative">
                  {article.editorsPick && (
                    <div className="absolute -top-2 left-4 z-10 flex items-center gap-1 rounded-full bg-[var(--soft-gold)] px-2.5 py-0.5 text-[11px] font-bold shadow-sm">
                      <Star className="size-3 fill-current" />
                      {t("editorsPickLabel")}
                    </div>
                  )}
                  <ArticleCard article={article} />
                  {article.likes != null && (
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-muted-foreground">
                      <ThumbsUp className="size-3" />
                      {t("likesLabel", { n: article.likes })}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
