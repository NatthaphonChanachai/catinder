"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import { fadeUp } from "@/lib/motion";

export function Mission() {
  const t = useTranslations("mission");

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      className="mx-auto max-w-3xl px-6 py-20 text-center"
    >
      <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-[var(--petal-pink)]">
        <HeartHandshake className="size-6 text-foreground" />
      </div>
      <h2 className="mt-6 text-2xl font-extrabold sm:text-3xl">{t("title")}</h2>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t("body")}</p>
    </motion.section>
  );
}
