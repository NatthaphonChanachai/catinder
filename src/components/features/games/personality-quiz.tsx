"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, RotateCcw, Zap, Brain, Compass, Users, Search, Wind } from "lucide-react";
import { addXP } from "@/lib/xp";

type LucideFC = React.FC<React.SVGProps<SVGSVGElement> & { className?: string; strokeWidth?: number }>;

const QUESTIONS = [
  {
    q: "น้องแมวชอบทำอะไรส่วนใหญ่?",
    opts: ["วิ่งเล่นตลอดเวลา", "นอนทั้งวัน", "สำรวจทุกมุมบ้าน", "นั่งมองออกหน้าต่าง"],
    weights: [
      { a: 2, b: 0, c: 2, d: 0 },
      { a: 0, b: 2, c: 0, d: 2 },
      { a: 2, b: 0, c: 2, d: 0 },
      { a: 0, b: 2, c: 0, d: 2 },
    ],
  },
  {
    q: "เมื่อมีแขกมาบ้าน น้องแมวทำอะไร?",
    opts: ["วิ่งมาต้อนรับทันที", "ซ่อนใต้เตียงเลย", "สังเกตจากระยะปลอดภัย", "ไม่สนใจ นอนต่อ"],
    weights: [
      { a: 0, b: 0, c: 2, d: 0 },
      { a: 0, b: 0, c: 0, d: 2 },
      { a: 0, b: 2, c: 0, d: 0 },
      { a: 2, b: 0, c: 0, d: 0 },
    ],
  },
  {
    q: "น้องแมวชอบของเล่นแบบไหน?",
    opts: ["ไม้เท้านกขนยาว", "ลูกบอลกลิ้ง", "กล่องกระดาษ", "ตัวเอง (เลียขน)"],
    weights: [
      { a: 0, b: 2, c: 0, d: 0 },
      { a: 2, b: 0, c: 0, d: 0 },
      { a: 0, b: 0, c: 2, d: 0 },
      { a: 0, b: 0, c: 0, d: 2 },
    ],
  },
  {
    q: "เวลาคุณทำงาน น้องแมว…",
    opts: ["นอนทับคีย์บอร์ด", "เรียกร้องความสนใจตลอด", "เล่นคนเดียวเงียบๆ", "หายไปไม่รู้อยู่ที่ไหน"],
    weights: [
      { a: 0, b: 2, c: 0, d: 0 },
      { a: 0, b: 0, c: 2, d: 0 },
      { a: 2, b: 0, c: 0, d: 0 },
      { a: 0, b: 0, c: 0, d: 2 },
    ],
  },
  {
    q: "น้องแมวทำเสียงร้องบ่อยแค่ไหน?",
    opts: ["ร้องตลอด คุยกันไม่หยุด", "ร้องเฉพาะตอนหิว", "แทบไม่ร้องเลย", "ร้องเฉพาะตอนต้องการอะไร"],
    weights: [
      { a: 0, b: 2, c: 0, d: 0 },
      { a: 2, b: 0, c: 0, d: 0 },
      { a: 0, b: 0, c: 2, d: 0 },
      { a: 0, b: 0, c: 0, d: 2 },
    ],
  },
];

const RESULTS: { type: string; ResultIcon: LucideFC; title: string; desc: string; color: string; iconColor: string; xp: number }[] = [
  {
    type: "a",
    ResultIcon: Compass as LucideFC,
    title: "นักผจญภัย",
    desc: "น้องแมวของคุณชอบความตื่นเต้นและการสำรวจ มีพลังงานสูง ชอบวิ่ง กระโดด และค้นหาสิ่งใหม่ๆ ตลอดเวลา เขาจะมีความสุขมากกับของเล่นที่เคลื่อนไหวและพื้นที่กว้างๆ",
    color: "#F9C5D1",
    iconColor: "#D04870",
    xp: 20,
  },
  {
    type: "b",
    ResultIcon: Users as LucideFC,
    title: "นักสังคม",
    desc: "น้องแมวของคุณรักคนและต้องการความสนใจ เขาชอบอยู่ใกล้คุณตลอดเวลา และมีความสุขที่สุดเมื่อได้รับความรักและการสัมผัส เป็นเพื่อนที่ดีที่สุดของครอบครัว",
    color: "rgba(212,175,55,0.30)",
    iconColor: "#B8920A",
    xp: 20,
  },
  {
    type: "c",
    ResultIcon: Search as LucideFC,
    title: "นักสำรวจ",
    desc: "น้องแมวของคุณฉลาดและช่างสังเกต เขาระมัดระวังในการรับมือกับสถานการณ์ใหม่ แต่เมื่อไว้วางใจแล้วจะเป็นเพื่อนที่ซื่อสัตย์อย่างยิ่ง ชอบสำรวจจากระยะปลอดภัยก่อน",
    color: "rgba(180,220,180,0.50)",
    iconColor: "#3A8A3A",
    xp: 20,
  },
  {
    type: "d",
    ResultIcon: Wind as LucideFC,
    title: "นักสงบ",
    desc: "น้องแมวของคุณเป็นคนสงบและเป็นอิสระ เขาชอบพื้นที่ส่วนตัวและสามารถดูแลตัวเองได้ดี แต่ยังคงรักคุณในแบบของตัวเอง มักแสดงความรักด้วยการอยู่ใกล้ๆ โดยไม่รุกราน",
    color: "rgba(140,180,255,0.35)",
    iconColor: "#3A5AA8",
    xp: 20,
  },
];

export function PersonalityQuiz({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ a: 0, b: 0, c: 0, d: 0 });
  const [result, setResult] = useState<(typeof RESULTS)[0] | null>(null);
  const [answered, setAnswered] = useState(false);

  function pick(optIdx: number) {
    if (answered) return;
    setAnswered(true);
    const w = QUESTIONS[step].weights[optIdx];
    const next = { a: scores.a + w.a, b: scores.b + w.b, c: scores.c + w.c, d: scores.d + w.d };
    setScores(next);

    setTimeout(() => {
      if (step < QUESTIONS.length - 1) {
        setStep((s) => s + 1);
        setAnswered(false);
      } else {
        const winner = (Object.entries(next) as [string, number][]).reduce((a, b) => b[1] > a[1] ? b : a)[0];
        const r = RESULTS.find((r) => r.type === winner) ?? RESULTS[0];
        setResult(r);
        addXP(r.xp, "quiz");
      }
    }, 400);
  }

  function reset() {
    setStep(0);
    setScores({ a: 0, b: 0, c: 0, d: 0 });
    setResult(null);
    setAnswered(false);
  }

  return (
    <div className="rounded-3xl p-6" style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl"
            style={{ background: "rgba(180,220,180,0.30)" }}>
            <Brain className="size-4 text-[#3A8A3A]" />
          </div>
          <h3 className="text-base font-extrabold text-[#0B1D3A]">Cat Personality Quiz</h3>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 text-[#6B5232]/40 hover:bg-[#F9C5D1]/30 transition-colors">
          ✕
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Progress */}
            <div className="mb-4 flex gap-1.5">
              {QUESTIONS.map((_, i) => (
                <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
                  style={{ background: i <= step ? "#D4AF37" : "rgba(212,175,55,0.18)" }} />
              ))}
            </div>
            <p className="mb-1 text-[11px] font-semibold text-[#6B5232]/50">คำถาม {step + 1}/{QUESTIONS.length}</p>
            <p className="mb-5 text-sm font-bold text-[#0B1D3A]">{QUESTIONS[step].q}</p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {QUESTIONS[step].opts.map((opt, i) => (
                <button key={i} onClick={() => pick(i)} disabled={answered}
                  className="rounded-2xl p-3.5 text-left text-sm font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:pointer-events-none"
                  style={{ background: "rgba(212,140,165,0.08)", border: "1px solid rgba(212,160,175,0.22)", color: "#4A1030" }}>
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="rounded-2xl p-5 text-center"
              style={{ background: `${result.color}`, border: `1px solid ${result.iconColor}33` }}>
              <result.ResultIcon className="mx-auto mb-2 size-10" style={{ color: result.iconColor }} strokeWidth={1.6} />
              <p className="text-2xl font-black text-[#0B1D3A]">{result.title}</p>
              <p className="mt-3 text-xs leading-relaxed text-[#6B5232]/70">{result.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                <Zap className="size-3.5" />
                <span className="text-xs font-bold">+{result.xp} XP</span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={reset}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all hover:opacity-80"
                style={{ background: "rgba(212,140,165,0.12)", color: "#B04060" }}>
                <RotateCcw className="size-4" /> ทำใหม่
              </button>
              <button onClick={onClose}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-bold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                เสร็จแล้ว <ChevronRight className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
