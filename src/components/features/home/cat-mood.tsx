"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { addXP, hasEarnedToday, markEarnedToday } from "@/lib/xp";
import { cn } from "@/lib/utils";

const MOODS = [
  { key: "happy", emoji: "😊" },
  { key: "sleepy", emoji: "😴" },
  { key: "loving", emoji: "🥰" },
  { key: "angry", emoji: "😾" },
  { key: "sick", emoji: "🤒" },
] as const;

const RESPONSE_KEY: Record<(typeof MOODS)[number]["key"], string> = {
  happy: "responseHappy",
  sleepy: "responseSleepy",
  loving: "responseLoving",
  angry: "responseAngry",
  sick: "responseSick",
};

export function CatMood() {
  const t = useTranslations("mood");
  const [selected, setSelected] = useState<(typeof MOODS)[number]["key"] | null>(null);

  function selectMood(key: (typeof MOODS)[number]["key"]) {
    if (!selected && !hasEarnedToday("mood")) {
      markEarnedToday("mood");
      addXP(5, "บันทึกอารมณ์แมว");
    }
    setSelected(key);
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      className="mx-auto max-w-2xl rounded-3xl bg-card px-6 py-10 text-center shadow-sm ring-1 ring-border/60 sm:px-10"
    >
      <h3 className="text-xl font-extrabold sm:text-2xl">{t("question")}</h3>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {MOODS.map(({ key, emoji }) => (
          <button
            key={key}
            onClick={() => selectMood(key)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
              selected === key
                ? "bg-[var(--soft-gold)] text-foreground shadow-sm"
                : "bg-muted text-foreground/70 hover:bg-[var(--soft-cream)]",
            )}
          >
            <span className="text-2xl">{emoji}</span>
            {t(key)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-6 rounded-2xl bg-[var(--soft-cream)] px-5 py-4 text-sm font-medium"
          >
            <p>{t(RESPONSE_KEY[selected])}</p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3.5" /> {t("aiPlaceholder")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
