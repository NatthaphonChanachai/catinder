"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Heart, Share2, RefreshCw } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

export function QuoteCard() {
  const t = useTranslations("quote");
  const quotes = t.raw("items") as string[];
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useLocalStorage<number[]>("catinder.likedQuotes", []);
  const [copied, setCopied] = useState(false);

  const quote = quotes[index];
  const isLiked = liked.includes(index);

  function nextQuote() {
    setIndex((i) => (i + 1) % quotes.length);
    setCopied(false);
  }

  function toggleLike() {
    setLiked((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  }

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ text: quote, title: "Catinder" });
      } else {
        await navigator.clipboard.writeText(quote);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled share — no-op
    }
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      className="mx-auto max-w-2xl rounded-[2rem] bg-[var(--soft-cream)] px-8 py-12 text-center shadow-sm"
    >
      <Quote className="mx-auto size-8 text-[var(--soft-gold)]" />
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mt-5 text-xl font-semibold leading-relaxed sm:text-2xl"
        >
          &ldquo;{quote}&rdquo;
        </motion.p>
      </AnimatePresence>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("label")}</p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={toggleLike}
          className={cn(
            "flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-border/60 transition-colors",
            isLiked ? "text-rose-500" : "text-foreground/70 hover:text-foreground",
          )}
        >
          <Heart className={cn("size-4", isLiked && "fill-rose-500")} /> {t("like")}
        </button>
        <button
          onClick={share}
          className="flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground/70 shadow-sm ring-1 ring-border/60 hover:text-foreground"
        >
          <Share2 className="size-4" /> {copied ? t("shared") : t("share")}
        </button>
        <button
          onClick={nextQuote}
          className="flex items-center gap-1.5 rounded-full bg-[var(--soft-gold)] px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <RefreshCw className="size-4" /> {t("next")}
        </button>
      </div>
    </motion.div>
  );
}
