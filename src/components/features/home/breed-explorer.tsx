"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, MapPin, Sparkles } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { CAT_BREED_KEYS } from "@/constants/sample-content";

export function BreedExplorer() {
  const t = useTranslations("breed");
  const [index, setIndex] = useState(0);
  const breed = CAT_BREED_KEYS[index];
  const info = t.raw(`breeds.${breed.key}`) as { name: string; origin: string; temperament: string };

  function discoverAnother() {
    setIndex((i) => {
      let next = Math.floor(Math.random() * CAT_BREED_KEYS.length);
      if (next === i) next = (next + 1) % CAT_BREED_KEYS.length;
      return next;
    });
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      className="mx-auto max-w-4xl px-6 py-20"
    >
      <div className="text-center">
        <h2 className="text-2xl font-extrabold sm:text-3xl">{t("title")}</h2>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="relative mt-10 overflow-hidden rounded-[2rem] bg-card shadow-sm ring-1 ring-border/60">
        <AnimatePresence mode="wait">
          <motion.div
            key={breed.key}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid items-center gap-0 sm:grid-cols-2"
          >
            <div className="relative aspect-square w-full">
              <Image src={breed.image} alt={info.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="p-8 sm:p-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--soft-gold)]/30 px-3 py-1 text-xs font-semibold">
                <Sparkles className="size-3.5" /> {info.name}
              </span>
              <h3 className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                <MapPin className="size-4" /> {t("origin")}: {info.origin}
              </h3>
              <p className="mt-3 text-sm font-semibold text-muted-foreground">{t("temperament")}</p>
              <p className="mt-1 text-base leading-relaxed">{info.temperament}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={discoverAnother}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--soft-gold)] px-6 py-3 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
        >
          <Shuffle className="size-4" /> {t("discoverAnother")}
        </button>
      </div>
    </motion.section>
  );
}
