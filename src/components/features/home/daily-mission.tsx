"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Award } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { useLocalStorage, todayKey } from "@/hooks/use-local-storage";
import { addXP, hasEarnedToday, markEarnedToday } from "@/lib/xp";
import { cn } from "@/lib/utils";

export function DailyMission() {
  const t = useTranslations("dailyMission");
  const items = t.raw("items") as string[];
  const [state, setState] = useLocalStorage<{ date: string; done: number[] }>("catinder.dailyMission", {
    date: todayKey(),
    done: [],
  });

  const done = state.date === todayKey() ? state.done : [];
  const allComplete = done.length === items.length;

  function toggle(i: number) {
    const current = state.date === todayKey() ? state.done : [];
    const wasChecked = current.includes(i);
    const next = wasChecked ? current.filter((x) => x !== i) : [...current, i];
    setState({ date: todayKey(), done: next });
    if (!wasChecked && !hasEarnedToday(`mission-${i}`)) {
      markEarnedToday(`mission-${i}`);
      addXP(10, "ภารกิจสำเร็จ");
    }
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      className="mx-auto max-w-2xl rounded-3xl bg-card px-6 py-8 shadow-sm ring-1 ring-border/60 sm:px-10"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold">{t("title")}</h3>
        <span className="text-sm font-semibold text-muted-foreground">
          {t("progress", { done: done.length, total: items.length })}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-[var(--soft-gold)]"
          animate={{ width: `${(done.length / items.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <ul className="mt-6 flex flex-col gap-2">
        {items.map((item, i) => {
          const checked = done.includes(i);
          return (
            <li key={item}>
              <button
                onClick={() => toggle(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors",
                  checked ? "bg-[var(--rose-blush)]/50" : "bg-muted hover:bg-[var(--soft-cream)]",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    checked ? "border-[var(--soft-gold)] bg-[var(--soft-gold)]" : "border-border",
                  )}
                >
                  {checked && <Check className="size-3.5 text-foreground" />}
                </span>
                <span className={cn(checked && "line-through opacity-60")}>{item}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-6 flex items-center gap-3 rounded-2xl bg-[var(--soft-gold)]/30 px-5 py-4"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--soft-gold)]">
              <Award className="size-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold">{t("rewardTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("rewardBody")}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
