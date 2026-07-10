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
    <section className="bg-[var(--warm-ivory)] px-6 py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-2xl font-extrabold sm:text-3xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {items.map((item, i) => {
          const Icon = ICONS[i];
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
