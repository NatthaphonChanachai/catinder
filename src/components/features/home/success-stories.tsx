"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface Story {
  title: string;
  quote: string;
  author: string;
  image: string;
}

export function SuccessStories() {
  const t = useTranslations("stories");
  const tc = useTranslations("common");
  const stories = t.raw("items") as Story[];
  const [index, setIndex] = useState(0);
  const story = stories[index];

  function go(delta: number) {
    setIndex((i) => (i + delta + stories.length) % stories.length);
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      className="mx-auto max-w-5xl px-6 py-20"
    >
      <div className="text-center">
        <h2 className="text-2xl font-extrabold sm:text-3xl">{t("title")}</h2>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="relative mt-10">
        <div className="overflow-hidden rounded-[2rem] bg-card shadow-sm ring-1 ring-border/60">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="grid items-center gap-8 md:grid-cols-2"
            >
              <div className="relative aspect-[4/3] w-full md:aspect-auto md:h-full">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="p-8 sm:p-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--warm-peach)]/60 px-3 py-1 text-xs font-semibold">
                  <Heart className="size-3.5" /> {t("title")}
                </span>
                <h3 className="mt-4 text-2xl font-extrabold sm:text-3xl">{story.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  &ldquo;{story.quote}&rdquo;
                </p>
                <p className="mt-4 text-sm font-semibold">{story.author}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => go(-1)}
          aria-label={tc("previousStory")}
          className="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-card p-2 shadow-md ring-1 ring-border/60 sm:flex"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label={tc("nextStory")}
          className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-card p-2 shadow-md ring-1 ring-border/60 sm:flex"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {stories.map((s, i) => (
          <button
            key={s.title}
            onClick={() => setIndex(i)}
            aria-label={`Go to story ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "w-6 bg-[var(--soft-gold)]" : "w-2 bg-border",
            )}
          />
        ))}
      </div>
    </motion.section>
  );
}
