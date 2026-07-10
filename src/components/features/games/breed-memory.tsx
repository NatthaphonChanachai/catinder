"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Trophy, RotateCcw, PawPrint, Flower2, Moon, Mountain, Heart, Gem, Award, Leaf, Eye, LayoutGrid, Clock } from "lucide-react";
import { addXP } from "@/lib/xp";

type LucideFC = React.FC<React.SVGProps<SVGSVGElement> & { className?: string; strokeWidth?: number }>;

const BREEDS: { id: string; name: string; Icon: LucideFC; color: string }[] = [
  { id: "persian",  name: "Persian",       Icon: Flower2 as LucideFC,   color: "#E8709A" },
  { id: "siamese",  name: "Siamese",       Icon: Moon as LucideFC,      color: "#5080C8" },
  { id: "maine",    name: "Maine Coon",    Icon: Mountain as LucideFC,  color: "#3A9050" },
  { id: "scottish", name: "Scottish Fold", Icon: Heart as LucideFC,     color: "#D04870" },
  { id: "ragdoll",  name: "Ragdoll",       Icon: Gem as LucideFC,       color: "#7858C8" },
  { id: "burmese",  name: "Burmese",       Icon: Award as LucideFC,     color: "#C89010" },
  { id: "bengal",   name: "Bengal",        Icon: Leaf as LucideFC,      color: "#2A8A2A" },
  { id: "sphynx",   name: "Sphynx",        Icon: Eye as LucideFC,       color: "#9040A8" },
];

const BREED_MAP = Object.fromEntries(BREEDS.map((b) => [b.id, b]));

type Card = { uid: string; breedId: string; name: string; flipped: boolean; matched: boolean };

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function makeCards(): Card[] {
  return shuffle(
    BREEDS.flatMap((b) => [
      { uid: `${b.id}-a`, breedId: b.id, name: b.name, flipped: false, matched: false },
      { uid: `${b.id}-b`, breedId: b.id, name: b.name, flipped: false, matched: false },
    ])
  );
}

export function BreedMemory({ onClose }: { onClose: () => void }) {
  const [cards, setCards] = useState<Card[]>(makeCards);
  const [selected, setSelected] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState<"win" | "lose" | null>(null);
  const [moves, setMoves] = useState(0);

  const matchedCount = cards.filter((c) => c.matched).length / 2;
  const checkWin = useCallback((cs: Card[]) => cs.every((c) => c.matched), []);

  useEffect(() => {
    if (!started || finished) return;
    const t = setInterval(() => {
      setTimeLeft((n) => {
        if (n <= 1) { clearInterval(t); setFinished("lose"); return 0; }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, finished]);

  function flip(uid: string) {
    if (!started) setStarted(true);
    if (locked || finished) return;
    const card = cards.find((c) => c.uid === uid);
    if (!card || card.flipped || card.matched) return;
    if (selected.length === 1 && selected[0] === uid) return;

    const next = cards.map((c) => c.uid === uid ? { ...c, flipped: true } : c);
    setCards(next);

    if (selected.length === 0) { setSelected([uid]); return; }

    const firstUid = selected[0];
    const first = next.find((c) => c.uid === firstUid)!;
    const second = next.find((c) => c.uid === uid)!;
    setMoves((m) => m + 1);
    setLocked(true);

    if (first.breedId === second.breedId) {
      const matched = next.map((c) =>
        c.uid === firstUid || c.uid === uid ? { ...c, matched: true } : c
      );
      setCards(matched);
      setSelected([]);
      setLocked(false);
      if (checkWin(matched)) {
        addXP(timeLeft > 60 ? 50 : timeLeft > 30 ? 35 : 20, "memory");
        setFinished("win");
      }
    } else {
      setTimeout(() => {
        setCards((cs) => cs.map((c) =>
          c.uid === firstUid || c.uid === uid ? { ...c, flipped: false } : c
        ));
        setSelected([]);
        setLocked(false);
      }, 900);
    }
  }

  function restart() {
    setCards(makeCards());
    setSelected([]);
    setLocked(false);
    setTimeLeft(90);
    setStarted(false);
    setFinished(null);
    setMoves(0);
  }

  const pct = Math.round((timeLeft / 90) * 100);
  const timerColor = timeLeft > 45 ? "#22c55e" : timeLeft > 20 ? "#D4AF37" : "#DC5050";

  return (
    <div className="relative rounded-3xl p-5" style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl"
            style={{ background: "rgba(212,175,55,0.20)" }}>
            <LayoutGrid className="size-4 text-[#B8920A]" />
          </div>
          <h3 className="text-base font-extrabold text-[#0B1D3A]">Breed Memory</h3>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 text-[#6B5232]/40 hover:bg-[#F9C5D1]/30 transition-colors">✕</button>
      </div>

      {/* Timer bar */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Timer className="size-4" style={{ color: timerColor }} />
          <span className="text-sm font-extrabold tabular-nums" style={{ color: timerColor }}>{timeLeft}s</span>
        </div>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(212,140,165,0.15)" }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${pct}%`, background: timerColor }} />
        </div>
        <span className="text-xs font-bold text-[#6B5232]/60">{matchedCount}/8 คู่</span>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => {
          const breed = BREED_MAP[card.breedId];
          const BreedIcon = breed.Icon;
          return (
            <button key={card.uid} onClick={() => flip(card.uid)}
              className="aspect-square rounded-2xl text-center transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: card.matched
                  ? "linear-gradient(135deg,rgba(212,175,55,0.22),rgba(237,208,96,0.16))"
                  : card.flipped
                  ? "rgba(255,248,252,1)"
                  : "linear-gradient(135deg,#F9C5D1,#E8A0B4)",
                border: card.matched
                  ? "1.5px solid rgba(212,175,55,0.45)"
                  : card.flipped
                  ? `1.5px solid ${breed.color}55`
                  : "none",
                transform: card.matched ? "scale(0.96)" : undefined,
              }}>
              <AnimatePresence mode="wait">
                {card.flipped || card.matched ? (
                  <motion.div key="face" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }}
                    className="flex h-full flex-col items-center justify-center gap-1 p-1">
                    <BreedIcon className="size-5" style={{ color: card.matched ? breed.color : breed.color }} strokeWidth={1.8} />
                    <span className="text-[9px] font-bold leading-tight"
                      style={{ color: card.matched ? "#B8920A" : "#4A1030" }}>
                      {card.name}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div key="back" className="flex h-full items-center justify-center">
                    <PawPrint className="size-6 text-white/55" strokeWidth={1.5} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[11px] text-[#6B5232]/40">{moves} ครั้งที่พลิก</p>

      {/* Win / Lose overlay */}
      <AnimatePresence>
        {finished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl p-8 text-center"
            style={{ background: "rgba(255,250,252,0.96)", backdropFilter: "blur(8px)" }}>
            {finished === "win" ? (
              <>
                <Trophy className="mb-3 size-12 text-[#D4AF37]" />
                <p className="text-2xl font-extrabold text-[#0B1D3A]">ชนะแล้ว!</p>
                <p className="mt-1 text-sm text-[#6B5232]/60">{moves} ครั้งที่พลิก · เหลือเวลา {timeLeft}s</p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2"
                  style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                  <span className="text-sm font-bold">+{timeLeft > 60 ? 50 : timeLeft > 30 ? 35 : 20} XP</span>
                </div>
              </>
            ) : (
              <>
                <Clock className="mb-3 size-12 text-[#DC5050]" />
                <p className="text-2xl font-extrabold text-[#0B1D3A]">หมดเวลา!</p>
                <p className="mt-1 text-sm text-[#6B5232]/60">จับคู่ได้ {matchedCount}/8 คู่</p>
              </>
            )}
            <div className="mt-5 flex gap-3">
              <button onClick={restart}
                className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all hover:opacity-80"
                style={{ background: "rgba(212,140,165,0.12)", color: "#B04060" }}>
                <RotateCcw className="size-4" /> เล่นใหม่
              </button>
              <button onClick={onClose}
                className="rounded-2xl px-5 py-2.5 text-sm font-bold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                เสร็จแล้ว
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
