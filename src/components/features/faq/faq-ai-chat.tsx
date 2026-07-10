"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { addXP, hasEarnedToday, markEarnedToday } from "@/lib/xp";
import { cn } from "@/lib/utils";

type Msg = { from: "user" | "bot"; text: string };

const QA_PAIRS: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["ฟรี", "free", "ค่าใช้จ่าย", "cost", "price", "ราคา", "paid"],
    answer: "ใช่ค่ะ! Catinder ฟรี 100% คุณอ่านบทความ เข้าร่วมชุมชน และใช้ฟีเจอร์รายวันได้ทั้งหมดโดยไม่มีค่าใช้จ่าย",
  },
  {
    keywords: ["ai", "จับคู่", "match", "matching", "เมื่อไหร่", "when", "phase"],
    answer: "กำลังพัฒนาอยู่ค่ะ ตอนนี้เราสร้างรากฐานชุมชนและความรู้ก่อน ระบบ AI จับคู่จะเปิดตัวใน Phase 2 คอยติดตามได้เลย",
  },
  {
    keywords: ["ปลอดภัย", "safe", "ข้อมูล", "data", "privacy", "ความเป็นส่วนตัว", "security"],
    answer: "ปลอดภัยมากค่ะ ข้อมูลทั้งหมดเข้ารหัส ไม่แชร์ข้อมูลส่วนตัวโดยไม่ได้รับความยินยอม เราปฏิบัติตามมาตรฐานความปลอดภัยระดับอุตสาหกรรม",
  },
  {
    keywords: ["knowledge", "บทความ", "article", "ความรู้", "center", "เนื้อหา"],
    answer: "Knowledge Center มีบทความจากผู้เชี่ยวชาญในหัวข้อ: วัคซีน, โภชนาการ, พฤติกรรมแมว, การเป็นสัด และการเลี้ยงดูทั่วไป ทั้งหมดผ่านการตรวจสอบโดยสัตวแพทย์",
  },
  {
    keywords: ["premium", "พรีเมียม", "พิเศษ", "upgrade", "pro"],
    answer: "Premium จะรวมถึง: การวิเคราะห์สุขภาพด้วย AI, การแจ้งเตือนวัคซีน, บทความพิเศษ, ผู้เพาะพันธุ์ที่ได้รับการยืนยัน และพาสปอร์ตสัตว์เลี้ยงดิจิทัล",
  },
  {
    keywords: ["สัตวแพทย์", "vet", "หมอ", "doctor", "แนะนำ"],
    answer: "ได้เลยค่ะ! เนื้อหาของเราออกแบบมาเพื่อเสริม ไม่ใช่แทนที่ คำแนะนำจากสัตวแพทย์ เราแนะนำให้ปรึกษาสัตวแพทย์เสมอสำหรับการตัดสินใจด้านสุขภาพ",
  },
  {
    keywords: ["สมัคร", "register", "sign up", "join", "เข้าร่วม", "account", "บัญชี", "สร้าง"],
    answer: "สมัครง่ายมากค่ะ กดปุ่ม 'เข้าร่วมฟรี' ที่มุมขวาบน กรอกอีเมลและตั้งรหัสผ่าน หรือใช้ Google login ได้เลย",
  },
  {
    keywords: ["xp", "คะแนน", "ระดับ", "level", "badge", "gamification", "reward", "รางวัล"],
    answer: "ระบบ XP ให้คะแนนทุกครั้งที่อ่านบทความ (+30 XP), ทำแบบทดสอบ (+50 XP), โพสต์ในชุมชน (+20 XP) สะสม XP เพื่อขึ้นระดับจาก ลูกแมว ไปถึง ตำนาน",
  },
  {
    keywords: ["event", "กิจกรรม", "workshop", "webinar", "zoom", "online"],
    answer: "กิจกรรมของ Catinder เป็นแบบออนไลน์ทั้งหมด มี Live Vet Q&A, Photo Contest, Cat Trivia Night และ Nutrition Workshop ดูได้ที่หน้า Events",
  },
];

const FALLBACK =
  "ขออภัยนะคะ ฉันยังไม่เข้าใจคำถามนั้นดีพอ ลองถามใหม่อีกครั้ง หรือดูที่ FAQ ด้านบน หรือติดต่อทีมของเราโดยตรงผ่านหน้า Contact ได้เลย";

const GREETING =
  "สวัสดีค่ะ! ฉัน Nori ผู้ช่วย AI ของ Catinder มีอะไรให้ช่วยไหมคะ? ลองถามเรื่อง Catinder, ฟีเจอร์, ความปลอดภัย หรือ Premium ได้เลย";

const QUICK_QUESTIONS = [
  "Catinder ฟรีไหม?",
  "Premium มีอะไรบ้าง?",
  "ระบบ XP คืออะไร?",
  "ข้อมูลของฉันปลอดภัยไหม?",
];

function findAnswer(input: string): string {
  const lower = input.toLowerCase();
  for (const pair of QA_PAIRS) {
    if (pair.keywords.some((k) => lower.includes(k.toLowerCase()))) {
      return pair.answer;
    }
  }
  return FALLBACK;
}

export function FaqAiChat() {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: GREETING }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  function send(text: string) {
    if (!text.trim() || typing) return;
    setMsgs((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setTyping(true);

    setTimeout(
      () => {
        setMsgs((prev) => [...prev, { from: "bot", text: findAnswer(text) }]);
        setTyping(false);
        if (!hasEarnedToday("faq-chat")) {
          markEarnedToday("faq-chat");
          addXP(10, "ถามผู้ช่วย AI");
        }
      },
      900 + Math.random() * 700,
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/60">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-[var(--soft-cream)] px-5 py-4">
        <div className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--rose-blush)]">
          <span className="text-xl">🐱</span>
          <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-card" />
        </div>
        <div>
          <p className="text-sm font-extrabold">Nori — AI Assistant</p>
          <p className="text-xs text-muted-foreground">ออนไลน์อยู่ • ตอบทันที</p>
        </div>
        <span className="ml-auto rounded-full bg-[var(--soft-gold)]/30 px-3 py-1 text-[10px] font-bold text-foreground">
          +10 XP ⭐
        </span>
      </div>

      {/* Messages */}
      <div className="flex h-64 flex-col gap-3 overflow-y-auto p-5">
        {msgs.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={cn("flex items-end gap-2", msg.from === "user" ? "flex-row-reverse" : "flex-row")}
          >
            {msg.from === "bot" && (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--rose-blush)] text-sm">
                🐱
              </div>
            )}
            <div
              className={cn(
                "max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.from === "bot"
                  ? "rounded-bl-sm bg-[var(--warm-ivory)]"
                  : "rounded-br-sm bg-[var(--soft-gold)]/80 text-foreground",
              )}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--rose-blush)] text-sm">
              🐱
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-[var(--warm-ivory)] px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="block size-1.5 rounded-full bg-muted-foreground/60"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ delay: i * 0.15, repeat: Infinity, duration: 0.6 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div className="flex flex-wrap gap-2 border-t border-border/60 bg-background/50 px-5 py-3">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={typing}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-border/60 px-4 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="ถามอะไรก็ได้เกี่ยวกับ Catinder..."
          className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || typing}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--soft-gold)] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
