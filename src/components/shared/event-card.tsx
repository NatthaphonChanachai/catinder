"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";
import type { CatEvent } from "@/types/content";
import { softHover } from "@/lib/motion";

function daysUntil(isoDate: string) {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function EventCard({ event }: { event: CatEvent & { isoDate: string } }) {
  const t = useTranslations("events");
  const days = daysUntil(event.isoDate);

  return (
    <motion.div
      whileHover={softHover}
      className="flex items-center gap-4 rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border/60"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
        <Image src={event.image} alt={event.title} fill sizes="80px" className="object-cover" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold">{event.title}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5" /> {event.date}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" /> {event.location}
          </span>
        </div>
        <span className="mt-2 inline-block rounded-full bg-[var(--rose-blush)]/60 px-2.5 py-0.5 text-[11px] font-semibold">
          {days === 0 ? t("today") : t("daysLeft", { n: days })}
        </span>
      </div>
      <button className="shrink-0 rounded-full bg-[var(--soft-gold)] px-4 py-2 text-xs font-semibold text-foreground hover:opacity-90">
        {t("join")}
      </button>
    </motion.div>
  );
}
