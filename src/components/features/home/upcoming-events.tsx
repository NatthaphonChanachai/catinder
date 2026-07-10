"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { UPCOMING_EVENTS } from "@/constants/sample-content";
import { EventCard } from "@/components/shared/event-card";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function UpcomingEvents() {
  const t = useTranslations("events");

  if (UPCOMING_EVENTS.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeUp} className="mb-8 text-2xl font-extrabold sm:text-3xl">
            {t("title")}
          </motion.h2>
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border/60 py-14 text-center"
          >
            <CalendarDays className="size-10 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-muted-foreground">กำลังวางแผนกิจกรรมเร็วๆ นี้</p>
            <p className="max-w-xs text-xs text-muted-foreground/70">
              ติดตามกิจกรรมและ Event จาก Catinder ได้ที่ Facebook ชุมชนของเรา
            </p>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-extrabold sm:text-3xl">{t("title")}</h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerContainer}
        className="mt-8 flex flex-col gap-4"
      >
        {UPCOMING_EVENTS.map((event) => (
          <motion.div key={event.slug} variants={fadeUp}>
            <EventCard event={event} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
