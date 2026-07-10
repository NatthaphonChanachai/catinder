"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Bookmark, Share2, Shuffle } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

export function CatFact() {
  const t = useTranslations("fact");
  const facts = t.raw("items") as string[];
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useLocalStorage<number[]>("catinder.savedFacts", []);
  const [shared, setShared] = useState(false);

  const fact = facts[index];
  const isSaved = saved.includes(index);

  function anotherFact() {
    setIndex((i) => (i + 1) % facts.length);
  }

  function toggleSave() {
    setSaved((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  }

  async function share() {
    try {
      if (navigator.share) await navigator.share({ text: fact, title: "Catinder" });
      else {
        await navigator.clipboard.writeText(fact);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // cancelled
    }
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-3xl bg-[var(--rose-blush)]/40 px-6 py-8 text-center sm:px-10"
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-card">
        <Lightbulb className="size-5 text-[var(--soft-gold)]" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("label")}</p>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="max-w-xl text-base font-semibold leading-relaxed sm:text-lg"
        >
          {fact}
        </motion.p>
      </AnimatePresence>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={anotherFact}
          className="flex items-center gap-1.5 rounded-full bg-[var(--soft-gold)] px-4 py-2 text-sm font-semibold text-foreground hover:opacity-90"
        >
          <Shuffle className="size-4" /> {t("another")}
        </button>
        <button
          onClick={toggleSave}
          className={cn(
            "flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-border/60",
            isSaved ? "text-[var(--soft-gold)]" : "text-foreground/70 hover:text-foreground",
          )}
        >
          <Bookmark className={cn("size-4", isSaved && "fill-[var(--soft-gold)]")} /> {t("save")}
        </button>
        <button
          onClick={share}
          className="flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground/70 shadow-sm ring-1 ring-border/60 hover:text-foreground"
        >
          <Share2 className="size-4" /> {shared ? t("copied") : t("share")}
        </button>
      </div>
    </motion.div>
  );
}
