"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Heart, Shield, MessageCircle, Lightbulb, Trophy, Flame, Zap } from "lucide-react";
import { PremiumTeaser } from "@/components/shared/premium-teaser";
import { CatCompatibilityGame } from "@/components/features/community/cat-compatibility-game";
import { DiscussionBoard } from "@/components/features/community/discussion-board";
import { HeavenBg } from "@/components/shared/heaven-bg";
import { getXP, getStreak, getDailyXP, getLevel } from "@/lib/xp";
import { fadeUp, staggerContainer } from "@/lib/motion";

const GUIDELINE_ICONS = [Heart, Shield, MessageCircle, Lightbulb];

function LiveStats() {
  const [stats, setStats] = useState({ xp: 0, streak: 0, daily: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const update = () => setStats({ xp: getXP(), streak: getStreak(), daily: getDailyXP() });
    update();
    setMounted(true);
    window.addEventListener("catinder:xp", update);
    return () => window.removeEventListener("catinder:xp", update);
  }, []);

  if (!mounted) return null;

  const level = getLevel(stats.xp);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        { icon: Zap, label: "XP วันนี้", value: `${stats.daily} XP`, color: "var(--soft-gold)" },
        { icon: Flame, label: "Streak ต่อเนื่อง", value: `${stats.streak} วัน`, color: "var(--warm-peach)" },
        { icon: Trophy, label: "ระดับของคุณ", value: `${level.emoji} ${level.nameTh}`, color: "var(--rose-blush)" },
      ].map((stat) => (
        <motion.div
          key={stat.label}
          variants={fadeUp}
          className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/60"
        >
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: `color-mix(in srgb, ${stat.color} 30%, white)` }}
          >
            <stat.icon className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-extrabold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function CommunityContent() {
  const t = useTranslations("communityPage");

  const guidelines = [0, 1, 2, 3].map((i) => ({
    rule: t(`guidelinesItems.${i}.rule`),
    desc: t(`guidelinesItems.${i}.desc`),
  }));

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--rose-blush)] via-[var(--champagne)] to-[var(--warm-peach)] px-6 py-20 text-center sm:py-28">
        <HeavenBg dense={false} hearts />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,var(--soft-gold)/20,transparent_60%)]" />
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative mx-auto max-w-2xl">
          <motion.span variants={fadeUp} className="inline-block rounded-full bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            {t("badge")}
          </motion.span>
          <motion.h1 variants={fadeUp} className="mt-5 text-4xl font-extrabold sm:text-5xl">
            {t("title")}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 text-base text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </motion.p>
        </motion.div>
      </section>

      {/* ── Cat Compatibility Game ── */}
      <CatCompatibilityGame />

      {/* ── Live XP Stats ── */}
      <section className="px-6 py-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <LiveStats />
          </motion.div>
        </div>
      </section>

      {/* ── Discussion Board ── */}
      <DiscussionBoard />

      {/* ── Guidelines ── */}
      <section className="bg-[var(--warm-ivory)] px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-8 text-center text-2xl font-extrabold"
          >
            {t("guidelinesTitle")}
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
            className="grid gap-5 sm:grid-cols-2"
          >
            {guidelines.map((item, i) => {
              const Icon = GUIDELINE_ICONS[i]!;
              return (
                <motion.div
                  key={item.rule}
                  variants={fadeUp}
                  className="flex gap-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border/60"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--petal-pink)]/50">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-bold">{item.rule}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Leaderboard ── */}
      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-6 text-center text-2xl font-extrabold"
          >
            {t("leaderboardTitle")}
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border/60 bg-card py-14 text-center"
          >
            <Trophy className="size-10 text-[var(--soft-gold)] opacity-60" />
            <p className="text-sm font-semibold text-muted-foreground">{t("leaderboardComingSoon")}</p>
            <p className="max-w-xs text-xs text-muted-foreground/70">
              อันดับจะอัปเดตแบบเรียลไทม์เมื่อมีผู้ใช้สะสม XP ในชุมชน
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Premium ── */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-4xl">
          <PremiumTeaser
            title="Community Premium Features"
            description="Private groups, exclusive events, verified breeder access, and priority support — coming soon."
          />
        </div>
      </section>

      {/* ── Join CTA ── */}
      <section className="bg-gradient-to-br from-[var(--rose-blush)] to-[var(--champagne)] px-6 py-16 text-center sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto max-w-xl"
        >
          <motion.h2 variants={fadeUp} className="text-2xl font-extrabold sm:text-3xl">
            {t("joinCtaTitle")}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-base text-muted-foreground">
            {t("joinCtaSubtitle")}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex justify-center">
            <a
              href="https://www.facebook.com/profile.php?id=61591494033259&mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full px-10 py-4 text-base font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ background: "#1877F2", color: "#fff", boxShadow: "0 6px 24px rgba(24,119,242,0.40)" }}
            >
              <svg className="size-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
              </svg>
              เข้าร่วมชุมชน Facebook
            </a>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
