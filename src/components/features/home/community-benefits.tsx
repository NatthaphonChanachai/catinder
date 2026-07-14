"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ShieldCheck, BookOpenText, Users2, Sparkle } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";

const ICONS = [ShieldCheck, BookOpenText, Users2, Sparkle];
const BGS = ["bg-[var(--rose-blush)]", "bg-[var(--soft-gold)]", "bg-[var(--petal-pink)]", "bg-[var(--warm-peach)]"];

export function CommunityBenefits() {
  const t = useTranslations("benefits");
  const items = t.raw("items") as { title: string; desc: string }[];

  return (
    <section className="bg-[var(--warm-ivory)] px-4 sm:px-6 py-14 sm:py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-xl font-extrabold sm:text-2xl lg:text-3xl">{t("title")}</h2>
        <p className="mt-2.5 text-sm text-muted-foreground sm:mt-3">{t("subtitle")}</p>
      </motion.div>

      {/* ── Mobile: 2×2 grid (compact) ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-3 sm:hidden"
      >
        {items.map((item, i) => {
          const Icon = ICONS[i]!;
          return (
            <motion.div
              key={item.title}
              variants={fadeUp}
              whileTap={{ scale: 0.97 }}
              className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60"
            >
              <div className={`flex size-9 items-center justify-center rounded-xl ${BGS[i]}`}>
                <Icon className="size-4 text-foreground" />
              </div>
              <h3 className="mt-3 text-[13px] font-bold leading-tight">{item.title}</h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-3">{item.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Desktop: 4-column grid (unchanged) ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="mx-auto mt-12 hidden sm:grid max-w-5xl grid-cols-2 gap-5 lg:grid-cols-4"
      >
        {items.map((item, i) => {
          const Icon = ICONS[i]!;
          return (
            <motion.div
              key={item.title}
              variants={fadeUp}
              className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border/60"
            >
              <div className={`flex size-12 items-center justify-center rounded-2xl ${BGS[i]}`}>
                <Icon className="size-5 text-foreground" />
              </div>
              <h3 className="mt-4 text-base font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
