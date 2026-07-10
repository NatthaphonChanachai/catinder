"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { CalendarDays, MapPin, CheckCircle2, CalendarRange, Wifi, Users } from "lucide-react";
import { ALL_EVENTS } from "@/constants/sample-content";
import { HeavenBg } from "@/components/shared/heaven-bg";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

type FilterType = "all" | "online";

function daysUntil(isoDate: string) {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

// Deterministic seeded count from slug so it looks real but never flickers
function seedCount(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) & 0xffff;
  return 42 + (h % 139); // 42–180
}

export function EventsContent() {
  const t = useTranslations("eventsPage");
  const te = useTranslations("events");
  const [filter, setFilter] = useState<FilterType>("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [joined, setJoined] = useLocalStorage<string[]>("catinder.joinedEvents", []);

  const filtered =
    filter === "all" ? ALL_EVENTS : ALL_EVENTS.filter((e) => e.type === filter);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "online", label: t("filterOnline") },
  ];

  function toggleJoin(slug: string) {
    setJoined((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--champagne)]/40 to-background px-6 py-16 text-center sm:py-20">
        <HeavenBg dense={false} hearts={false} />
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative mx-auto max-w-2xl">
          <motion.span variants={fadeUp} className="inline-block rounded-full bg-[var(--soft-gold)]/40 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            {t("badge")}
          </motion.span>
          <motion.h1 variants={fadeUp} className="mt-5 text-3xl font-extrabold sm:text-4xl">
            {t("title")}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-base text-muted-foreground">
            {t("subtitle")}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Wifi className="size-3.5 text-[var(--soft-gold)]" />
            {t("onlineOnlyBadge")}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Filters + view toggle ── */}
      <section className="sticky top-[68px] sm:top-[76px] lg:top-20 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-6 py-3">
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                  filter === f.key
                    ? "bg-[var(--soft-gold)] text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-full border border-border p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                viewMode === "list" ? "bg-[var(--soft-gold)]" : "text-muted-foreground",
              )}
            >
              {t("listView")}
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                viewMode === "calendar" ? "bg-[var(--soft-gold)]" : "text-muted-foreground",
              )}
            >
              {t("calendarView")}
            </button>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          {viewMode === "calendar" ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border py-16 text-center"
            >
              <CalendarRange className="size-10 text-[var(--soft-gold)]" />
              <p className="text-muted-foreground">{t("calendarComingSoon")}</p>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.p initial="hidden" animate="visible" variants={fadeUp} className="py-16 text-center text-muted-foreground">
              {t("noEvents")}
            </motion.p>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex flex-col gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((event) => {
                  const isJoined = joined.includes(event.slug);
                  const days = daysUntil(event.isoDate);
                  return (
                    <motion.div
                      key={event.slug}
                      layout
                      variants={fadeUp}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-5 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/60"
                    >
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
                        <Image src={event.image} alt={event.title} fill sizes="80px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold">{event.title}</h3>
                          <span className="hidden shrink-0 rounded-full bg-[var(--soft-gold)]/30 px-2 py-0.5 text-[10px] font-bold sm:inline">
                            <Wifi className="mr-0.5 inline size-2.5" />
                            Online
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><CalendarDays className="size-3.5" />{event.date}</span>
                          <span className="flex items-center gap-1"><MapPin className="size-3.5" />{event.location}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-block rounded-full bg-[var(--rose-blush)]/60 px-2.5 py-0.5 text-[11px] font-semibold">
                            {days === 0 ? te("today") : te("daysLeft", { n: days })}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Users className="size-3" />
                            {t("joinedCount", { n: seedCount(event.slug) + (isJoined ? 1 : 0) })}
                          </span>
                          {isJoined && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--rose-gold)]">
                              <CheckCircle2 className="size-3" /> {t("joinedBadge")}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleJoin(event.slug)}
                        className={cn(
                          "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                          isJoined
                            ? "bg-[var(--rose-blush)] text-foreground"
                            : "bg-[var(--soft-gold)] text-foreground hover:opacity-90",
                        )}
                      >
                        {isJoined ? "✓" : te("join")}
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
