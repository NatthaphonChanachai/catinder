"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowLeft, Bookmark, ThumbsUp, Share2, BookOpen, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  ALL_ARTICLES,
  getArticleBody,
  getQuizForArticle,
} from "@/constants/sample-content";
import { ArticleCard } from "@/components/shared/article-card";
import { ArticleQuiz } from "@/components/shared/article-quiz";
import { PremiumTeaser } from "@/components/shared/premium-teaser";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { addXP, hasEarnedToday, markEarnedToday } from "@/lib/xp";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

const TOC_SECTIONS = ["tocIntro", "tocWhatToKnow", "tocPracticalTips", "tocExpertAdvice", "tocSummary"] as const;

const LOCALIZED_BODY_SLUGS = ["vaccination-basics", "nutrition-fundamentals"];

export function ArticleReader({ slug }: { slug: string }) {
  const t = useTranslations("articlePage");
  const tk = useTranslations("knowledge");
  const ta = useTranslations("articleData");
  const tb = useTranslations("articleBody");

  const article = ALL_ARTICLES.find((a) => a.slug === slug)!;
  const quiz = getQuizForArticle(article.category);
  const related = ALL_ARTICLES.filter((a) => a.category === article.category && a.slug !== slug).slice(0, 3);

  const localTitle = (ta as (key: string) => string)(`${slug}.title`) ?? article.title;
  const bodyKey = LOCALIZED_BODY_SLUGS.includes(slug) ? slug : "default";
  const body = (tb.raw as (key: string) => string[])(`${bodyKey}.paragraphs`) ?? getArticleBody(slug);

  const [bookmarks, setBookmarks] = useLocalStorage<string[]>("catinder.bookmarkedArticles", []);
  const [likedArticles, setLikedArticles] = useLocalStorage<string[]>("catinder.likedArticles", []);
  const [copied, setCopied] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  const isBookmarked = bookmarks.includes(slug);
  const isLiked = likedArticles.includes(slug);

  // Reading progress bar
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setReadProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Award XP once per article read (per day)
  useEffect(() => {
    const key = `read-${slug}`;
    if (!hasEarnedToday(key)) {
      const timer = setTimeout(() => {
        markEarnedToday(key);
        addXP(30, "อ่านบทความ");
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [slug]);

  function toggleBookmark() {
    const wasBookmarked = bookmarks.includes(slug);
    setBookmarks((prev) => wasBookmarked ? prev.filter((s) => s !== slug) : [...prev, slug]);
    if (!wasBookmarked) addXP(10, "บันทึกบทความ");
  }

  function toggleLike() {
    const wasLiked = likedArticles.includes(slug);
    setLikedArticles((prev) => wasLiked ? prev.filter((s) => s !== slug) : [...prev, slug]);
    if (!wasLiked) addXP(5, "ถูกใจบทความ");
  }

  function share() {
    if (typeof navigator !== "undefined") {
      void navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  const handleQuizComplete = useCallback((score: number) => {
    const xp = score === quiz.length ? 50 : score >= Math.ceil(quiz.length / 2) ? 30 : 10;
    if (!hasEarnedToday(`quiz-${slug}`)) {
      markEarnedToday(`quiz-${slug}`);
      addXP(xp, "ทำแบบทดสอบสำเร็จ");
    }
  }, [slug, quiz.length]);

  return (
    <>
      {/* Reading progress bar — fixed at very top */}
      <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-border/40">
        <motion.div
          className="h-full bg-gradient-to-r from-[var(--soft-gold)] to-[var(--warm-peach)]"
          style={{ width: `${readProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <article className="px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          {/* Back */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Link href="/articles" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> {t("backToArticles")}
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mt-6"
          >
            <motion.span variants={fadeUp} className="rounded-full bg-[var(--rose-blush)] px-3 py-1 text-xs font-semibold">
              {tk(`categories.${article.category}`)}
            </motion.span>
            <motion.h1 variants={fadeUp} className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
              {localTitle}
            </motion.h1>
            <motion.div variants={fadeUp} className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><BookOpen className="size-3.5" />{t("authorLabel")}</span>
              <span className="flex items-center gap-1"><Clock className="size-3.5" />{t("minRead", { n: article.readMinutes })}</span>
              <span className="rounded-full bg-[var(--soft-gold)]/30 px-2 py-0.5 font-semibold text-foreground">
                {t("reviewedLabel")}
              </span>
              <span className="rounded-full bg-[var(--rose-blush)]/50 px-2 py-0.5 font-semibold text-foreground">
                +30 XP ⭐
              </span>
            </motion.div>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mt-8 aspect-[16/7] w-full overflow-hidden rounded-3xl bg-muted"
          >
            <Image src={article.image} alt={localTitle} fill sizes="100vw" className="object-cover" priority />
          </motion.div>

          {/* Layout: TOC sidebar + body */}
          <div className="mt-10 flex gap-10">
            {/* TOC - desktop sidebar */}
            <aside className="hidden w-48 shrink-0 lg:block">
              <div className="sticky top-24">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t("tableOfContents")}
                </p>
                <ul className="mt-4 space-y-2">
                  {TOC_SECTIONS.map((key) => (
                    <li key={key} className="text-sm text-muted-foreground hover:text-foreground">
                      <a href={`#${key}`}>{t(key)}</a>
                    </li>
                  ))}
                </ul>

                {/* XP mini tracker */}
                <div className="mt-8 rounded-2xl bg-[var(--soft-gold)]/15 p-4 ring-1 ring-[var(--soft-gold)]/25">
                  <p className="text-xs font-bold text-muted-foreground">อ่านแล้วได้</p>
                  <p className="mt-1 text-lg font-extrabold">+30 XP ⭐</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">ทำแบบทดสอบ +50 XP</p>
                </div>
              </div>
            </aside>

            {/* Body */}
            <div className="min-w-0 flex-1">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="space-y-5 text-base leading-relaxed"
              >
                {body.map((para, i) => (
                  <motion.p key={i} variants={fadeUp} id={TOC_SECTIONS[i] ?? undefined}>
                    {para}
                  </motion.p>
                ))}
              </motion.div>

              {/* Action bar */}
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={toggleBookmark}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-border/60 transition-colors",
                    isBookmarked ? "bg-[var(--soft-gold)]/20 ring-[var(--soft-gold)]" : "bg-card hover:bg-muted",
                  )}
                >
                  <Bookmark className={cn("size-4", isBookmarked && "fill-[var(--soft-gold)] text-[var(--soft-gold)]")} />
                  {isBookmarked ? t("bookmarkSave") : t("bookmarkAdd")}
                </button>
                <button
                  onClick={toggleLike}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-border/60 transition-colors",
                    isLiked ? "bg-[var(--rose-blush)]/30 ring-[var(--rose-blush)]" : "bg-card hover:bg-muted",
                  )}
                >
                  <ThumbsUp className={cn("size-4", isLiked && "fill-[var(--petal-pink)] text-[var(--petal-pink)]")} />
                  {t("likeBtn")}
                </button>
                <button
                  onClick={share}
                  className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold ring-1 ring-border/60 hover:bg-muted"
                >
                  <Share2 className="size-4" />
                  {copied ? t("shareCopied") : t("shareBtn")}
                </button>
              </div>

              {/* Quiz */}
              <div className="mt-10">
                <ArticleQuiz
                  questions={quiz}
                  title={t("quizTitle")}
                  subtitle={t("quizSubtitle")}
                  correctMsg={t("quizCorrect")}
                  wrongMsg={t("quizWrong")}
                  scoreMsg={(n) => t("quizScore", { n })}
                  retryLabel={t("quizRetry")}
                  onComplete={handleQuizComplete}
                />
              </div>

              {/* Premium teaser */}
              <div className="mt-10">
                <PremiumTeaser
                  title="AI Health Analysis"
                  description="Get personalised health insights and breed-specific advice powered by AI."
                  compact
                />
              </div>

              {/* Comments placeholder */}
              <div className="mt-10 rounded-3xl border border-dashed border-border p-6">
                <p className="text-center text-sm text-muted-foreground">{t("commentsPlaceholder")}</p>
              </div>
            </div>
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-6 text-xl font-extrabold">{t("relatedTitle")}</h2>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {related.map((a) => (
                  <motion.div key={a.slug} variants={fadeUp}>
                    <ArticleCard article={a} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}
        </div>
      </article>
    </>
  );
}
