"use client";

import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface PremiumTeaserProps {
  title: string;
  description: string;
  cta?: string;
  className?: string;
  compact?: boolean;
}

export function PremiumTeaser({ title, description, cta = "Coming Soon", className, compact }: PremiumTeaserProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-dashed border-[var(--soft-gold)]/60 bg-gradient-to-br from-[var(--soft-cream)] to-[var(--champagne)]/40",
        compact ? "px-5 py-5" : "px-8 py-10",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--soft-gold)/15,transparent_60%)]" />
      <div className="relative flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--soft-gold)]/30">
            <Lock className="size-4 text-foreground/70" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-[var(--soft-gold)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--rose-gold)]">Premium</span>
            </div>
            <p className={cn("mt-0.5 font-bold", compact ? "text-sm" : "text-base")}>{title}</p>
            <p className={cn("mt-1 text-muted-foreground", compact ? "text-xs" : "text-sm")}>{description}</p>
          </div>
        </div>
        <button
          disabled
          className="shrink-0 cursor-not-allowed rounded-full bg-[var(--soft-gold)]/40 px-5 py-2 text-sm font-semibold text-foreground/60"
        >
          {cta}
        </button>
      </div>
    </motion.div>
  );
}
