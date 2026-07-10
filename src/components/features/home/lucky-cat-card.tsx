"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, PawPrint } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { useLocalStorage, todayKey } from "@/hooks/use-local-storage";
import { addXP } from "@/lib/xp";

export function LuckyCatCard() {
  const t = useTranslations("lucky");
  const blessings = t.raw("items") as string[];
  const [state, setState] = useLocalStorage<{ date: string; cardIndex: number | null; collected: number }>(
    "catinder.luckyCard",
    { date: "", cardIndex: null, collected: 0 },
  );

  const drawnToday = state.date === todayKey();
  const blessing = drawnToday && state.cardIndex !== null ? blessings[state.cardIndex] : null;

  function draw() {
    if (drawnToday) return;
    const index = Math.floor(Math.random() * blessings.length);
    setState({ date: todayKey(), cardIndex: index, collected: state.collected + 1 });
    addXP(5, "จั่วไพ่นำโชค");
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      className="mx-auto max-w-xl px-6 py-20 text-center"
    >
      <h2 className="text-2xl font-extrabold sm:text-3xl">{t("title")}</h2>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

      <div className="relative mx-auto mt-8 h-56 w-40 [perspective:1200px]">
        <motion.div
          className="relative size-full [transform-style:preserve-3d]"
          animate={{ rotateY: drawnToday ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <button
            onClick={draw}
            disabled={drawnToday}
            className="absolute inset-0 flex items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--soft-gold)] to-[var(--warm-peach)] shadow-md [backface-visibility:hidden] disabled:cursor-default"
          >
            <PawPrint className="size-10 text-foreground/70" />
          </button>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl bg-card p-4 shadow-md ring-1 ring-border/60 [backface-visibility:hidden] [transform:rotateY(180deg)]"
          >
            <Sparkles className="size-6 text-[var(--soft-gold)]" />
            <AnimatePresence>
              {blessing && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-sm font-semibold leading-snug"
                >
                  {blessing}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div className="mt-6">
        {!drawnToday && (
          <button
            onClick={draw}
            className="rounded-full bg-[var(--soft-gold)] px-7 py-3 text-sm font-semibold text-foreground hover:opacity-90"
          >
            {t("draw")}
          </button>
        )}
        <p className="mt-3 text-xs text-muted-foreground">{t("collected", { n: state.collected })}</p>
      </div>
    </motion.section>
  );
}
