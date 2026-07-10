"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Clock, Bookmark } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Article } from "@/types/content";
import { Badge } from "@/components/ui/badge";
import { softHover } from "@/lib/motion";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

export function ArticleCard({ article }: { article: Article }) {
  const t = useTranslations("knowledge");
  const tc = useTranslations("common");
  const ta = useTranslations("articleData");
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>("catinder.bookmarkedArticles", []);
  const isBookmarked = bookmarks.includes(article.slug);

  // Get locale-aware title/excerpt; fall back to English from sample-content
  const localTitle = (ta as (key: string) => string)(`${article.slug}.title`) ?? article.title;
  const localExcerpt = (ta as (key: string) => string)(`${article.slug}.excerpt`) ?? article.excerpt;

  function toggleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    setBookmarks((prev) =>
      prev.includes(article.slug) ? prev.filter((s) => s !== article.slug) : [...prev, article.slug],
    );
  }

  return (
    <motion.div whileHover={softHover}>
      <Link
        href={`/articles/${article.slug}`}
        className="group block overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/60"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={article.image}
            alt={localTitle}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <button
            onClick={toggleBookmark}
            aria-label={tc("bookmark")}
            className={cn(
              "absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-colors",
              isBookmarked ? "text-[var(--soft-gold)]" : "text-foreground/60 hover:text-foreground",
            )}
          >
            <Bookmark className={cn("size-4", isBookmarked && "fill-[var(--soft-gold)]")} />
          </button>
        </div>
        <div className="p-5">
          <Badge variant="secondary" className="rounded-full">
            {t(`categories.${article.category}`)}
          </Badge>
          <h3 className="mt-3 text-base font-bold leading-snug">{localTitle}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{localExcerpt}</p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {t("minRead", { n: article.readMinutes })}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
