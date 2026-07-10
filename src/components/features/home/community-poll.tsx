"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { BarChart3, Check } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { addXP } from "@/lib/xp";
import { cn } from "@/lib/utils";

// Seeded placeholder vote distribution so results look alive before real backend tallying exists.
const BASE_VOTES = [18, 41, 29, 12];

export function CommunityPoll() {
  const t = useTranslations("poll");
  const options = t.raw("options") as string[];
  const [voted, setVoted] = useLocalStorage<number | null>("catinder.pollVote", null);

  function vote(i: number) {
    if (voted !== null) return;
    setVoted(i);
    addXP(10, "โหวต Poll");
  }

  const votes = BASE_VOTES.map((v, i) => (voted === i ? v + 1 : v));
  const total = votes.reduce((a, b) => a + b, 0);

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      className="mx-auto max-w-2xl px-6 py-20"
    >
      <div className="rounded-3xl bg-card px-6 py-8 shadow-sm ring-1 ring-border/60 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--rose-blush)]">
            <BarChart3 className="size-5 text-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("subtitle")}</p>
            <h3 className="text-lg font-extrabold">{t("question")}</h3>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {options.map((option, i) => {
            const pct = total ? Math.round((votes[i] / total) * 100) : 0;
            const isVoted = voted === i;
            return (
              <button
                key={option}
                onClick={() => vote(i)}
                disabled={voted !== null}
                className="relative overflow-hidden rounded-2xl bg-muted px-4 py-3 text-left text-sm font-semibold disabled:cursor-default"
              >
                {voted !== null && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={cn("absolute inset-y-0 left-0", isVoted ? "bg-[var(--soft-gold)]/60" : "bg-border/60")}
                  />
                )}
                <span className="relative flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {isVoted && <Check className="size-4" />}
                    {option}
                  </span>
                  {voted !== null && <span className="text-xs text-muted-foreground">{pct}%</span>}
                </span>
              </button>
            );
          })}
        </div>

        {voted !== null && <p className="mt-4 text-center text-xs text-muted-foreground">{t("voted")}</p>}
      </div>
    </motion.section>
  );
}
