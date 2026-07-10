"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, LayoutGrid, Brain, HelpCircle, Sparkles,
  Zap, RotateCcw, Lightbulb, Trophy, Star, PawPrint, Gamepad2,
} from "lucide-react";
import { AppShell } from "@/components/shared/app-shell";
import { CatPhotoStyler } from "./cat-photo-styler";
import { BreedMemory } from "./breed-memory";
import { PersonalityQuiz } from "./personality-quiz";
import { addXP } from "@/lib/xp";

type LucideFC = React.FC<React.SVGProps<SVGSVGElement> & { className?: string; strokeWidth?: number }>;

/* ─── Daily Trivia ─── */
const TRIVIA = [
  {
    q: "แมวมีฟันกี่ซี่เมื่อโตเต็มวัย?",
    opts: ["26", "28", "30", "32"],
    ans: 2,
    fact: "แมวโตมีฟัน 30 ซี่ ลูกแมวมีฟันน้ำนม 26 ซี่",
  },
  {
    q: "แมวหลับเฉลี่ยวันละกี่ชั่วโมง?",
    opts: ["8–10", "12–14", "15–20", "20–22"],
    ans: 2,
    fact: "แมวนอนถึง 15–20 ชั่วโมงต่อวัน — สัตว์ที่หลับมากที่สุด!",
  },
  {
    q: "อะไรของแมวที่ไม่ซ้ำกันเลย เหมือนลายนิ้วมือมนุษย์?",
    opts: ["ลายขน", "หนวด", "ลายจมูก", "อุ้งเท้า"],
    ans: 2,
    fact: "ลายจมูกของแมวแต่ละตัวไม่ซ้ำกัน — ใช้ระบุตัวตนได้",
  },
];

/* ─── Name Generator ─── */
const TRAITS = ["ซุกซน", "อ่อนโยน", "ฉลาด", "ขี้เกียจ", "กล้าหาญ", "สงบ", "ชอบนอน", "ชอบเล่น", "เป็นนักสำรวจ", "ขี้อาย"];

const NAME_BANK = {
  male: [
    { name: "คิริ", meaning: "หมอกแห่งยอดเขา" },
    { name: "โซระ", meaning: "ท้องฟ้ากว้างไกล" },
    { name: "เรียว", meaning: "พลังงานที่ไหลลื่น" },
    { name: "เคน", meaning: "ผู้แข็งแกร่ง" },
    { name: "ทาโร่", meaning: "บุตรชายผู้ยิ่งใหญ่" },
    { name: "ฮารุ", meaning: "ฤดูใบไม้ผลิอันอบอุ่น" },
    { name: "โยชิ", meaning: "ความดีงามแท้จริง" },
    { name: "นามิ", meaning: "คลื่นที่สงบนิ่ง" },
  ],
  female: [
    { name: "ซากุระ", meaning: "ดอกซากุระบานสะพรั่ง" },
    { name: "ฮานะ", meaning: "ดอกไม้แห่งความงาม" },
    { name: "ยูกิ", meaning: "หิมะขาวบริสุทธิ์" },
    { name: "อาโออิ", meaning: "สีฟ้าแห่งท้องทะเล" },
    { name: "มิซึ", meaning: "น้ำใสสะอาด" },
    { name: "โคโตะ", meaning: "เสียงดนตรีที่ไพเราะ" },
    { name: "ฮิมาริ", meaning: "ดอกทานตะวันสดใส" },
    { name: "โมโม", meaning: "ลูกพีชหวานอ่อน" },
  ],
};

type GameId = "photo" | "memory" | "quiz" | "trivia" | "namegen" | null;

const GAME_CARDS: {
  id: GameId;
  CardIcon: LucideFC;
  iconColor: string;
  iconBg: string;
  title: string;
  desc: string;
  xp: number;
  badge: string | null;
  bg: string;
}[] = [
  {
    id: "photo",   CardIcon: Palette as LucideFC,    iconColor: "#C8506A", iconBg: "rgba(249,197,209,0.40)",
    title: "Cat Photo Styler",   desc: "ถ่าย/อัปโหลดรูปน้องแมว แปลงเป็น 8 สไตล์", xp: 20, badge: "ใหม่!", bg: "rgba(249,197,209,0.22)",
  },
  {
    id: "memory",  CardIcon: LayoutGrid as LucideFC, iconColor: "#B8920A", iconBg: "rgba(212,175,55,0.28)",
    title: "Breed Memory Match", desc: "จับคู่สายพันธุ์ให้ครบใน 90 วินาที",          xp: 50, badge: null,    bg: "rgba(212,175,55,0.14)",
  },
  {
    id: "quiz",    CardIcon: Brain as LucideFC,      iconColor: "#3A8A3A", iconBg: "rgba(180,220,180,0.38)",
    title: "Personality Quiz",   desc: "ค้นหาบุคลิกน้องแมวของคุณ 5 ข้อ",             xp: 20, badge: null,    bg: "rgba(180,220,180,0.18)",
  },
  {
    id: "trivia",  CardIcon: HelpCircle as LucideFC, iconColor: "#3A6AAA", iconBg: "rgba(140,180,255,0.32)",
    title: "Daily Cat Trivia",   desc: "ตอบคำถามแมว 3 ข้อ รับ XP ทุกวัน",            xp: 30, badge: "รายวัน", bg: "rgba(140,180,255,0.16)",
  },
  {
    id: "namegen", CardIcon: Sparkles as LucideFC,   iconColor: "#8A3A8A", iconBg: "rgba(212,140,200,0.32)",
    title: "Cat Name Generator", desc: "เลือกนิสัย 2 ข้อ รับชื่อน้องแมวสุดพิเศษ",   xp: 5,  badge: null,    bg: "rgba(212,140,200,0.16)",
  },
];

/* ─── Trivia sub-component ─── */
function TriviaGame({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === TRIVIA[step].ans;
    if (correct) setScore((s) => s + 10);
    setTimeout(() => {
      if (step < TRIVIA.length - 1) {
        setStep((s) => s + 1);
        setPicked(null);
      } else {
        const total = correct ? score + 10 : score;
        addXP(total, "trivia");
        setDone(true);
      }
    }, 1200);
  }

  const DoneIcon = score === 30 ? Trophy : score >= 20 ? Star : PawPrint;
  const doneColor = score === 30 ? "#D4AF37" : score >= 20 ? "#D4AF37" : "#E8A0B4";

  if (done) {
    return (
      <div className="rounded-3xl p-6 text-center" style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-[#6B5232]/40 hover:bg-[#F9C5D1]/30">✕</button>
        <DoneIcon className="mx-auto mb-3 size-12" style={{ color: doneColor }} strokeWidth={1.5} />
        <p className="text-xl font-extrabold text-[#0B1D3A]">
          {score === 30 ? "เก่งมาก! 100%!" : `ได้คะแนน ${score}/30`}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5"
          style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
          <Zap className="size-3.5" /><span className="text-xs font-bold">+{score} XP ได้รับแล้ว</span>
        </div>
        <p className="mt-3 text-xs text-[#6B5232]/50">มาตอบคำถามใหม่พรุ่งนี้นะคะ</p>
        <button onClick={onClose}
          className="mt-4 w-full rounded-2xl py-2.5 text-sm font-bold transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
          กลับหน้าเกม
        </button>
      </div>
    );
  }

  const q = TRIVIA[step];
  return (
    <div className="rounded-3xl p-6" style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl"
            style={{ background: "rgba(140,180,255,0.28)" }}>
            <HelpCircle className="size-4 text-[#3A6AAA]" />
          </div>
          <h3 className="text-base font-extrabold text-[#0B1D3A]">Daily Trivia</h3>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 text-[#6B5232]/40 hover:bg-[#F9C5D1]/30">✕</button>
      </div>
      <div className="mb-3 flex gap-1.5">
        {TRIVIA.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= step ? "#D4AF37" : "rgba(212,175,55,0.18)" }} />
        ))}
      </div>
      <p className="mb-1 text-[11px] text-[#6B5232]/50">ข้อ {step + 1}/{TRIVIA.length} · {score} คะแนน</p>
      <p className="mb-5 text-sm font-bold text-[#0B1D3A]">{q.q}</p>
      <div className="space-y-2.5">
        {q.opts.map((opt, i) => {
          const isCorrect = i === q.ans;
          const isWrong = picked === i && !isCorrect;
          const showRight = picked !== null && isCorrect;
          return (
            <button key={i} onClick={() => choose(i)} disabled={picked !== null}
              className="w-full rounded-2xl p-3.5 text-left text-sm font-medium transition-all disabled:pointer-events-none"
              style={{
                background: showRight ? "rgba(34,197,94,0.15)" : isWrong ? "rgba(220,80,80,0.12)" : "rgba(212,140,165,0.08)",
                border: showRight ? "1.5px solid rgba(34,197,94,0.40)" : isWrong ? "1.5px solid rgba(220,80,80,0.35)" : "1px solid rgba(212,160,175,0.22)",
                color: "#4A1030",
              }}>
              {opt}
              {showRight && <span className="float-right text-green-500">✓</span>}
              {isWrong && <span className="float-right text-red-400">✗</span>}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-start gap-2 rounded-xl p-3"
          style={{ background: "rgba(212,175,55,0.10)" }}>
          <Lightbulb className="mt-0.5 size-4 flex-shrink-0 text-[#D4AF37]" />
          <p className="text-xs leading-relaxed text-[#6B5232]">{q.fact}</p>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Name Generator sub-component ─── */
function NameGenerator({ onClose }: { onClose: () => void }) {
  const [gender, setGender] = useState<"male" | "female">("female");
  const [picked, setPicked] = useState<string[]>([]);
  const [results, setResults] = useState<{ name: string; meaning: string }[] | null>(null);

  function toggleTrait(t: string) {
    setPicked((p) => p.includes(t) ? p.filter((x) => x !== t) : p.length < 2 ? [...p, t] : p);
  }

  function generate() {
    const bank = NAME_BANK[gender];
    const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0, 3);
    setResults(shuffled);
    addXP(5, "name-gen");
  }

  return (
    <div className="rounded-3xl p-6" style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl"
            style={{ background: "rgba(212,140,200,0.28)" }}>
            <Sparkles className="size-4 text-[#8A3A8A]" />
          </div>
          <h3 className="text-base font-extrabold text-[#0B1D3A]">Cat Name Generator</h3>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 text-[#6B5232]/40 hover:bg-[#F9C5D1]/30">✕</button>
      </div>

      <p className="mb-2 text-xs font-bold text-[#6B5232]/60">เพศของน้องแมว</p>
      <div className="mb-4 flex gap-2">
        {(["female", "male"] as const).map((g) => (
          <button key={g} onClick={() => setGender(g)}
            className="flex-1 rounded-2xl py-2.5 text-sm font-bold transition-all"
            style={{
              background: gender === g ? "linear-gradient(135deg,#F9C5D1,#E8A0B4)" : "rgba(212,140,165,0.08)",
              color: gender === g ? "#4A1030" : "rgba(74,20,50,0.45)",
              border: gender === g ? "none" : "1px solid rgba(212,160,175,0.22)",
            }}>
            {g === "female" ? "♀ หญิง" : "♂ ชาย"}
          </button>
        ))}
      </div>

      <p className="mb-2 text-xs font-bold text-[#6B5232]/60">เลือกนิสัยน้องแมว (สูงสุด 2 ข้อ)</p>
      <div className="mb-5 flex flex-wrap gap-2">
        {TRAITS.map((t) => (
          <button key={t} onClick={() => toggleTrait(t)}
            className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
            style={{
              background: picked.includes(t) ? "linear-gradient(135deg,#EDD060,#D4AF37)" : "rgba(212,175,55,0.10)",
              color: picked.includes(t) ? "#0B1D3A" : "#B8920A",
              border: picked.includes(t) ? "none" : "1px solid rgba(212,175,55,0.25)",
            }}>
            {t}
          </button>
        ))}
      </div>

      <button onClick={generate}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
        style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
        <Sparkles className="size-4" />
        เจนชื่อ{picked.length > 0 ? ` (${picked.join(" + ")})` : ""}
      </button>

      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2.5">
            {results.map((r) => (
              <div key={r.name} className="flex items-center gap-3 rounded-2xl p-3.5"
                style={{ background: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.25)" }}>
                <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "rgba(212,175,55,0.18)" }}>
                  <PawPrint className="size-4 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#0B1D3A]">{r.name}</p>
                  <p className="text-[11px] text-[#6B5232]/55">{r.meaning}</p>
                </div>
              </div>
            ))}
            <button onClick={generate}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-bold text-[#B04060] hover:bg-[#F9C5D1]/20 transition-colors">
              <RotateCcw className="size-3.5" /> สุ่มชื่อใหม่
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Games Content ─── */
export function GamesContent() {
  const [activeGame, setActiveGame] = useState<GameId>(null);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl"
            style={{ background: "linear-gradient(135deg,rgba(249,197,209,0.50),rgba(232,160,180,0.35))" }}>
            <Gamepad2 className="size-5 text-[#C8506A]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#0B1D3A]">เกม</h1>
            <p className="text-xs text-[#6B5232]/60">เล่นมินิเกม รับ XP และสนุกกับน้องแมวของคุณ</p>
          </div>
        </div>

        {/* Active game panel */}
        <AnimatePresence mode="wait">
          {activeGame && (
            <motion.div key={activeGame}
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="relative mb-6">
              {activeGame === "photo"   && <CatPhotoStyler  onClose={() => setActiveGame(null)} />}
              {activeGame === "memory"  && <BreedMemory      onClose={() => setActiveGame(null)} />}
              {activeGame === "quiz"    && <PersonalityQuiz  onClose={() => setActiveGame(null)} />}
              {activeGame === "trivia"  && <TriviaGame       onClose={() => setActiveGame(null)} />}
              {activeGame === "namegen" && <NameGenerator    onClose={() => setActiveGame(null)} />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game card lobby */}
        <div className="grid gap-3 sm:grid-cols-2">
          {GAME_CARDS.map((g) => {
            const isActive = activeGame === g.id;
            return (
              <motion.button key={g.id}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setActiveGame(isActive ? null : g.id)}
                className="flex items-start gap-4 rounded-3xl p-4 text-left transition-all"
                style={{
                  background: isActive ? "rgba(212,175,55,0.15)" : g.bg,
                  border: isActive ? "1.5px solid rgba(212,175,55,0.50)" : "1px solid rgba(212,160,175,0.16)",
                }}>
                {/* Icon circle */}
                <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm"
                  style={{ background: isActive ? "rgba(212,175,55,0.22)" : g.iconBg }}>
                  <g.CardIcon className="size-6" style={{ color: isActive ? "#D4AF37" : g.iconColor }} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-[#0B1D3A]">{g.title}</p>
                    {g.badge && (
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                        style={{ background: "linear-gradient(135deg,#F9C5D1,#E8A0B4)", color: "#4A1030" }}>
                        {g.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-[#6B5232]/60">{g.desc}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <Zap className="size-3 text-[#D4AF37]" />
                    <span className="text-[10px] font-bold text-[#B8920A]">+{g.xp} XP</span>
                  </div>
                </div>

                {/* Active indicator */}
                <div className="mt-1 flex size-5 flex-shrink-0 items-center justify-center rounded-full transition-all"
                  style={{ background: isActive ? "rgba(212,175,55,0.25)" : "transparent" }}>
                  <g.CardIcon className="size-3" style={{ color: isActive ? "#D4AF37" : "rgba(176,64,96,0.30)" }} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
