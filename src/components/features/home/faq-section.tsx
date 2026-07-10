"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { fadeUp } from "@/lib/motion";

export function FaqSection() {
  const t = useTranslations("faqSection");
  const items = t.raw("items") as { question: string; answer: string }[];

  return (
    <section className="bg-[var(--warm-ivory)] px-6 py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeUp}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-2xl font-extrabold sm:text-3xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      <div className="mt-10">
        <FaqAccordion items={items} />
      </div>
    </section>
  );
}
