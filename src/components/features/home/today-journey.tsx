"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Flame, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { addXP, getXP, getLevel, hasEarnedToday, markEarnedToday } from "@/lib/xp";
import { todayKey } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

// ── State helpers ─────────────────────────────────────────────────────────────

interface JourneyState {
  checkedIn: boolean;
  luckyDone: boolean;
  missionDone: number;
  missionTotal: number;
  xp: number;
  levelEmoji: string;
  levelNameTh: string;
  streak: number;
}

function readJourneyState(): JourneyState {
  if (typeof window === "undefined") {
    return { checkedIn: false, luckyDone: false, missionDone: 0, missionTotal: 4, xp: 0, levelEmoji: "🐱", levelNameTh: "ลูกแมว", streak: 0 };
  }
  const today = todayKey();

  const checkedIn = localStorage.getItem("catinder.checkin") === today;

  const luckyRaw = localStorage.getItem("catinder.luckyCard");
  const luckyDone = luckyRaw
    ? (JSON.parse(luckyRaw) as { date: string }).date === today
    : false;

  const missionRaw = localStorage.getItem("catinder.dailyMission");
  let missionDone = 0;
  const missionTotal = 4; // must match th.json dailyMission.items count
  if (missionRaw) {
    const parsed = JSON.parse(missionRaw) as { date: string; done: number[] };
    if (parsed.date === today) missionDone = parsed.done.length;
  }

  const xp = getXP();
  const level = getLevel(xp);
  const streak = Number(localStorage.getItem("catinder.xp.streak") ?? "0");

  return { checkedIn, luckyDone, missionDone, missionTotal, xp, levelEmoji: level.emoji, levelNameTh: level.nameTh, streak };
}

// ── Single card ───────────────────────────────────────────────────────────────

function JCard({
  gradient,
  icon,
  title,
  sub,
  done,
  onClick,
}: {
  gradient: string;
  icon: string;
  title: string;
  sub: string;
  done: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.90 }}
      transition={{ type: "spring", stiffness: 480, damping: 28 }}
      onClick={onClick}
      className={cn(
        "flex-shrink-0 w-[148px] rounded-3xl p-4 flex flex-col gap-2.5 cursor-pointer select-none",
        "bg-gradient-to-br ring-1 ring-white/70 shadow-sm",
        gradient,
      )}
      style={{ minHeight: "132px" }}
    >
      <span className="text-[26px] leading-none">{icon}</span>
      <div className="flex-1">
        <p className="text-[13px] font-bold leading-tight" style={{ color: "#0B1D3A" }}>{title}</p>
        <p
          className="mt-1 text-[11px] leading-snug"
          style={{ color: done ? "#3A7D5A" : "rgba(107,82,50,0.70)" }}
        >
          {sub}
        </p>
      </div>
      {done && (
        <div className="flex size-5 items-center justify-center rounded-full bg-[#3A7D5A]/20 self-start">
          <Check className="size-3 text-[#3A7D5A]" strokeWidth={3} />
        </div>
      )}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TodayJourney() {
  const t = useTranslations("journey");
  const [state, setState] = useState<JourneyState>({
    checkedIn: false, luckyDone: false, missionDone: 0, missionTotal: 4,
    xp: 0, levelEmoji: "🐱", levelNameTh: "ลูกแมว", streak: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(readJourneyState());
    setMounted(true);

    function onXP() { setState(readJourneyState()); }
    window.addEventListener("catinder:xp", onXP);
    return () => window.removeEventListener("catinder:xp", onXP);
  }, []);

  function handleCheckIn() {
    if (state.checkedIn || !mounted) return;
    localStorage.setItem("catinder.checkin", todayKey());
    if (!hasEarnedToday("daily-checkin")) {
      markEarnedToday("daily-checkin");
      addXP(10, "Check-in ประจำวัน");
    }
    setState(readJourneyState());
  }

  if (!mounted) return null;

  const cards = [
    {
      id: "checkin",
      gradient: "from-[#F9C5D1] via-[#F7D7AB]/60 to-[#FFFEF5]",
      icon: state.checkedIn ? "✅" : "🌟",
      title: t("checkin"),
      sub: state.checkedIn ? t("checkinDone") : t("checkinSub"),
      done: state.checkedIn,
      onClick: handleCheckIn,
    },
    {
      id: "lucky",
      gradient: "from-[#F7D7AB] via-[#EDD060]/30 to-[#FFFEF5]",
      icon: "🎴",
      title: t("lucky"),
      sub: state.luckyDone ? t("luckyDone") : t("luckySub"),
      done: state.luckyDone,
      href: "#lucky-cat",
    },
    {
      id: "mission",
      gradient: "from-[#F9C5D1]/70 via-[#FFFEF5]/60 to-[#FFFEF5]",
      icon: "📋",
      title: t("mission"),
      sub: t("missionSub", { done: state.missionDone, total: state.missionTotal }),
      done: state.missionDone === state.missionTotal,
      href: "#daily-mission",
    },
    {
      id: "mood",
      gradient: "from-[#A8C4E8]/50 via-[#F9C5D1]/30 to-[#FFFEF5]",
      icon: "😸",
      title: t("mood"),
      sub: t("moodSub"),
      done: false,
      href: "#cat-mood",
    },
    {
      id: "fact",
      gradient: "from-[#EDD060]/30 via-[#F7D7AB]/30 to-[#FFFEF5]",
      icon: "💡",
      title: t("fact"),
      sub: t("factSub"),
      done: false,
      href: "#cat-fact",
    },
    {
      id: "xp",
      gradient: "from-[#D4AF37]/20 via-[#F9C5D1]/20 to-[#FFFEF5]",
      icon: state.levelEmoji,
      title: t("xpTitle"),
      sub: `${state.xp} XP · ${state.levelNameTh}`,
      done: false,
      href: undefined,
    },
  ];

  return (
    <section className="lg:hidden px-4 pt-4 pb-2">
      {/* Header row */}
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-[15px] font-extrabold" style={{ color: "#0B1D3A" }}>
          {t("title")} 🌟
        </h2>
        <div className="flex items-center gap-2">
          {state.streak > 0 && (
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
              style={{ background: "rgba(242,200,152,0.35)", color: "#C8915E" }}
            >
              <Flame className="size-3" /> {state.streak}
            </span>
          )}
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ background: "rgba(212,175,55,0.18)", color: "#C4A020" }}
          >
            <Star className="size-3" /> {state.xp} XP
          </span>
        </div>
      </div>

      {/* Horizontal scroll strip */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
        {cards.map((card) =>
          card.href ? (
            <a key={card.id} href={card.href} className="flex-shrink-0">
              <JCard
                gradient={card.gradient}
                icon={card.icon}
                title={card.title}
                sub={card.sub}
                done={card.done}
              />
            </a>
          ) : (
            <div key={card.id} className="flex-shrink-0">
              <JCard
                gradient={card.gradient}
                icon={card.icon}
                title={card.title}
                sub={card.sub}
                done={card.done}
                onClick={card.onClick}
              />
            </div>
          ),
        )}
      </div>
    </section>
  );
}
