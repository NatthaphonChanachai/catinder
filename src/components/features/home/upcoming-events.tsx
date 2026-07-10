"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { EventCard } from "@/components/shared/event-card";
import { UPCOMING_EVENTS } from "@/constants/sample-content";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function UpcomingEvents() {
  const t = useTranslations("events");

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
        <Link
          href="/events"
          className="flex items-center gap-1 text-sm font-semibold text-foreground hover:underline"
        >
          {t("seeAll")} <ArrowRight className="size-4" />
        </Link>
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
