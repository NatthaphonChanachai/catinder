"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Camera, Trophy } from "lucide-react";
import { fadeUp } from "@/lib/motion";

export function PhotoChallenge() {
  const t = useTranslations("challenge");

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      className="mx-auto max-w-3xl px-6 py-20"
    >
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[var(--warm-peach)]/60 to-[var(--soft-gold)]/30 px-8 py-12 text-center shadow-sm sm:px-12">
        <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-card">
          <Camera className="size-6 text-[var(--soft-gold)]" />
        </div>
        <h2 className="mt-6 text-2xl font-extrabold sm:text-3xl">{t("title")}</h2>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("subtitle")}
        </p>
        <p className="mt-3 text-xl font-bold">{t("theme")}</p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button className="rounded-full bg-[var(--soft-gold)] px-7 py-3 text-sm font-semibold text-foreground hover:opacity-90">
            {t("upload")}
          </button>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Trophy className="size-4" /> {t("leaderboardSoon")}
          </span>
        </div>
      </div>
    </motion.section>
  );
}
