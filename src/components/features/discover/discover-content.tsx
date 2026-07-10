"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Star, ChevronLeft, ChevronRight, Lock, Zap, Crown, Info } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/components/shared/app-shell";

const CATS = [
  { name: "ลูน่า เบลล์",  breed: "Persian",       age: "2 ปี", gender: "♀", img: "/img/Persian_dollface_Luna.png",  pct: 97, traits: ["อ่อนโยน","เป็นมิตร","ชอบอยู่นิ่ง"],  owner: "คุณมาลี",    location: "กรุงเทพฯ" },
  { name: "มีซา",          breed: "Maine Coon",    age: "3 ปี", gender: "♂", img: "/img/Maine-Coon.png",             pct: 94, traits: ["เล่นสนุก","ฉลาด","ชอบเดินเล่น"],  owner: "คุณก้อง",    location: "เชียงใหม่" },
  { name: "โมจิ",          breed: "Scottish Fold", age: "2 ปี", gender: "♀", img: "/img/Scottish-fold-mochi.png",    pct: 91, traits: ["สงบ","น่ารัก","เป็นมิตร"],        owner: "คุณปลา",     location: "กรุงเทพฯ" },
  { name: "ลีโอ",          breed: "Persian",       age: "4 ปี", gender: "♂", img: "/img/Persian-Long-Hair-Leo.png",  pct: 88, traits: ["ซื่อสัตย์","อ่อนโยน","เงียบ"],    owner: "คุณนน",      location: "ภูเก็ต" },
  { name: "ดัชเชส",        breed: "British Shorthair", age: "3 ปี", gender: "♀", img: "/img/British-Shorthair.png",  pct: 85, traits: ["สง่างาม","อ่อนโยน","ชอบนอน"],  owner: "คุณฟ้า",     location: "นนทบุรี" },
];

const DAILY_LIMIT = 5;

type Dir = "left" | "right" | "up" | null;

export function DiscoverContent() {
  const [idx, setIdx] = useState(0);
  const [swipesLeft, setSwipesLeft] = useState(DAILY_LIMIT);
  const [matched, setMatched] = useState<string[]>([]);
  const [dir, setDir] = useState<Dir>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const cat = CATS[idx % CATS.length];
  const done = swipesLeft === 0;

  function swipe(d: Dir) {
    if (done) return;
    setDir(d);
    if (d === "right" || d === "up") {
      setMatched((p) => [...p, cat.name]);
      if (d === "right") setTimeout(() => setShowMatch(true), 400);
    }
    setTimeout(() => {
      setDir(null);
      setIdx((i) => i + 1);
      setSwipesLeft((n) => Math.max(0, n - 1));
    }, 350);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-extrabold text-[#0B1D3A]">จับคู่แมว</h1>
          <p className="text-xs text-[#6B5232]/60">AI คัดสรรคู่ที่เหมาะที่สุดให้คุณ</p>
        </div>

        {/* Match flash */}
        <AnimatePresence>
          {showMatch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center"
              style={{ background: "rgba(11,29,58,0.85)", backdropFilter: "blur(8px)" }}
              onClick={() => setShowMatch(false)}
            >
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.6, repeat: 2 }}>
                <p className="text-center text-5xl font-black" style={{ color: "#EDD060" }}>💞 Match!</p>
                <p className="mt-2 text-center text-lg font-bold text-white">คุณและ {matched[matched.length - 1]} แมตช์กัน!</p>
              </motion.div>
              <p className="mt-6 text-sm text-white/50">แตะเพื่อปิด</p>
            </motion.div>
          )}
        </AnimatePresence>

        {done ? (
          /* Daily limit reached */
          <div className="flex flex-col items-center justify-center rounded-3xl py-16 text-center"
            style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.25)" }}>
            <div className="mb-4 text-5xl">🐱</div>
            <h2 className="mb-2 text-lg font-extrabold text-[#0B1D3A]">ใช้ครบ {DAILY_LIMIT} สวายป์แล้ววันนี้</h2>
            <p className="mb-6 text-sm text-[#6B5232]/60">กลับมาพรุ่งนี้ หรืออัปเกรดเพื่อสวายป์ไม่จำกัด</p>
            <Link href="/register"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
              <Crown className="size-4" /> อัปเกรด Premium
            </Link>
          </div>
        ) : (
          /* Card stack */
          <>
            {/* Counter — sits outside the relative card stack so ghost cards can't bleed over it */}
            <div className="mb-4 flex items-center justify-center gap-2">
              {Array.from({ length: DAILY_LIMIT }).map((_, i) => (
                <div key={i} className="size-2 rounded-full transition-all"
                  style={{ background: i < swipesLeft ? "#D4AF37" : "rgba(212,175,55,0.22)" }} />
              ))}
              <span className="ml-1 text-xs font-bold"
                style={{ color: swipesLeft > 0 ? "#B8920A" : "#B03030" }}>
                {swipesLeft}/{DAILY_LIMIT} วันนี้
              </span>
            </div>

          <div className="relative flex flex-col items-center">
            {/* Ghost cards below */}
            {[2, 1].map((offset) => (
              <div key={offset}
                className="absolute rounded-3xl"
                style={{
                  width: "100%", maxWidth: "380px", height: "520px",
                  top: `${offset * 8}px`,
                  transform: `scale(${1 - offset * 0.04})`,
                  background: offset === 2 ? "rgba(249,197,209,0.35)" : "rgba(249,197,209,0.55)",
                  border: "1px solid rgba(212,160,175,0.20)",
                  zIndex: 10 - offset,
                }}
              />
            ))}

            {/* Main card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: 0, x: 0 }}
                exit={
                  dir === "right" ? { x: 300, opacity: 0, rotate: 15 } :
                  dir === "left"  ? { x: -300, opacity: 0, rotate: -15 } :
                  dir === "up"    ? { y: -300, opacity: 0, scale: 1.1 } :
                  { opacity: 0 }
                }
                transition={{ duration: 0.3 }}
                className="relative z-20 w-full max-w-[380px] overflow-hidden rounded-3xl shadow-2xl"
                style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.20)" }}
              >
                {/* Photo */}
                <div className="relative h-72 overflow-hidden">
                  <Image src={cat.img} alt={cat.name} fill className="object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,29,58,0.75) 0%, transparent 55%)" }} />
                  {/* Match % badge */}
                  <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5"
                    style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                    <Zap className="size-3.5" />
                    <span className="text-xs font-extrabold">{cat.pct}% Match</span>
                  </div>
                  {/* Info toggle */}
                  <button onClick={() => setShowInfo(!showInfo)}
                    className="absolute left-4 top-4 flex size-8 items-center justify-center rounded-full"
                    style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
                    <Info className="size-4 text-white" />
                  </button>
                  {/* Name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="text-xl font-extrabold text-white">{cat.name} {cat.gender}</h2>
                    <p className="text-sm text-white/75">{cat.breed} · {cat.age} · {cat.location}</p>
                  </div>
                </div>

                {/* Info panel */}
                <AnimatePresence>
                  {showInfo && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      className="overflow-hidden px-5 pt-3">
                      <p className="mb-2 text-xs font-semibold text-[#6B5232]/60">เจ้าของ: {cat.owner}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Traits */}
                <div className="flex flex-wrap gap-1.5 px-5 py-4">
                  {cat.traits.map((t) => (
                    <span key={t} className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: "rgba(212,175,55,0.12)", color: "#B8920A" }}>{t}</span>
                  ))}
                </div>

                {/* Premium lock notice */}
                <div className="mx-5 mb-4 flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{ background: "rgba(212,140,165,0.10)", border: "1px solid rgba(212,140,165,0.20)" }}>
                  <Lock className="size-3.5 text-[#B04060]/60" />
                  <span className="text-[11px] text-[#B04060]/70">อัปเกรดเพื่อส่งข้อความโดยตรง</span>
                  <Link href="/register" className="ml-auto text-[11px] font-bold text-[#D4AF37] hover:underline">Premium</Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Action buttons */}
            <div className="relative z-30 mt-8 flex items-center gap-5">
              <button onClick={() => swipe("left")}
                className="flex size-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
                style={{ background: "#FFFAFC", border: "2px solid rgba(220,80,80,0.30)" }}>
                <X className="size-6" style={{ color: "#DC5050" }} />
              </button>
              <button onClick={() => swipe("up")}
                className="flex size-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
                style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", border: "none" }}>
                <Star className="size-5 text-[#0B1D3A]" />
              </button>
              <button onClick={() => swipe("right")}
                className="flex size-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
                style={{ background: "linear-gradient(135deg,#F9C5D1,#E8A0B4)", border: "2px solid rgba(212,140,165,0.40)" }}>
                <Heart className="size-6 text-white" fill="white" />
              </button>
            </div>

            {/* Navigation hint */}
            <div className="relative z-30 mt-4 flex gap-6 text-[11px] text-[#6B5232]/40">
              <span className="flex items-center gap-1"><ChevronLeft className="size-3" /> ผ่าน</span>
              <span className="flex items-center gap-1"><Star className="size-3" /> Super Like</span>
              <span className="flex items-center gap-1">ไลค์ <ChevronRight className="size-3" /></span>
            </div>

            {/* Matched row */}
            {matched.length > 0 && (
              <div className="relative z-30 mt-6 w-full rounded-2xl p-4"
                style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.20)" }}>
                <p className="mb-2 text-xs font-bold text-[#0B1D3A]">💞 Matches วันนี้ ({matched.length})</p>
                <div className="flex flex-wrap gap-2">
                  {matched.map((n) => (
                    <span key={n} className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: "rgba(212,175,55,0.15)", color: "#B8920A" }}>{n}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
