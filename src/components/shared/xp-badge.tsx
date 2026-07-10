"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, PawPrint, Sparkles, Crown, Star, Zap } from "lucide-react";
import { getXP, getStreak, getLevel, getLevelProgress } from "@/lib/xp";

// Icons per level name (matches LEVELS in xp.ts)
const LEVEL_ICONS = {
  Kitten: PawPrint,
  Cat:    Sparkles,
  Tiger:  Zap,
  Lion:   Crown,
  Legend: Star,
} as const;

type LevelName = keyof typeof LEVEL_ICONS;

export function XPBadge() {
  const [xp, setXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setXP(getXP());
    setStreak(getStreak());
    setMounted(true);

    function onXP() {
      setXP(getXP());
      setStreak(getStreak());
    }
    window.addEventListener("catinder:xp", onXP);
    return () => window.removeEventListener("catinder:xp", onXP);
  }, []);

  if (!mounted) return null;

  const level = getLevel(xp);
  const { pct } = getLevelProgress(xp);
  const LevelIcon = LEVEL_ICONS[level.name as LevelName] ?? PawPrint;

  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.97 }}
        title={`${level.nameTh} — ${xp} XP`}
        className="relative flex items-center gap-1.5 overflow-hidden rounded-full bg-[var(--soft-gold)]/15 px-3 py-1.5 ring-1 ring-[var(--soft-gold)]/35"
      >
        {/* Progress fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-[var(--soft-gold)]/20"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <LevelIcon className="relative size-3.5 text-[var(--soft-gold)]" />
        <span className="relative text-xs font-extrabold tabular-nums">{xp} XP</span>
      </motion.div>

      {streak > 0 && (
        <motion.div
          whileHover={{ scale: 1.06 }}
          title={`${streak} day streak`}
          className="flex items-center gap-1 rounded-full bg-[var(--warm-peach)]/40 px-2.5 py-1.5 ring-1 ring-[var(--warm-peach)]/50"
        >
          <Flame className="size-3.5 text-[var(--rose-gold)]" />
          <span className="text-xs font-extrabold text-[var(--rose-gold)]">{streak}</span>
        </motion.div>
      )}
    </div>
  );
}
