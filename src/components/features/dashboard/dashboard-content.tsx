"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  HeartHandshake, MessageCircle, PawPrint, Crown, Sparkles,
  Search, Home, BookOpen, CalendarDays, Users,
  ChevronRight, ChevronLeft, HeartPulse, Star, Heart,
  Dna, Bookmark, Settings, TrendingUp, CheckCircle, Circle,
  LogOut, Lock, Zap, Gift, ArrowRight, CheckCheck,
} from "lucide-react";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/contexts/auth-context";
import { fadeUp, staggerContainer } from "@/lib/motion";

// ── Data ─────────────────────────────────────────────────────────────────────

const MATCHES = [
  { name: "ลูน่า เบลล์", breed: "Persian", age: "2 ปี", gender: "♀", img: "/img/Persian_dollface_Luna.png", pct: 97, traits: ["อ่อนโยน", "เป็นมิตร"] },
  { name: "มีซา", breed: "Maine Coon", age: "3 ปี", gender: "♂", img: "/img/Maine-Coon.png", pct: 94, traits: ["เล่นสนุก", "ฉลาด"] },
  { name: "โมจิ", breed: "Scottish Fold", age: "2 ปี", gender: "♀", img: "/img/Scottish-fold-mochi.png", pct: 91, traits: ["สงบ", "น่ารัก"] },
  { name: "ลีโอ", breed: "Persian", age: "4 ปี", gender: "♂", img: "/img/Persian-Long-Hair-Leo.png", pct: 88, traits: ["ซื่อสัตย์", "อ่อนโยน"] },
];

const FEATURED = [
  { name: "ดัชเชส เพิร์ล", breed: "British Shorthair", age: "3 ปี", gender: "♀", img: "/img/British-Shorthair.png" },
  { name: "เซอร์ ไมโล", breed: "Ragdoll", age: "2 ปี", gender: "♂", img: "/img/Ragdoll.png" },
  { name: "สยาม", breed: "Siamese", age: "1 ปี", gender: "♀", img: "/img/Siamese_Cat.png" },
  { name: "ลีโอ พรินซ์", breed: "Persian", age: "4 ปี", gender: "♂", img: "/img/Persian-Long-Hair-Leo.png" },
];

const MESSAGES = [
  { name: "คุณมาลี", abbr: "มล", text: "ลูน่าน่ารักมากเลยค่ะ!", time: "2 นาที", unread: true },
  { name: "คุณก้อง", abbr: "กง", text: "แมวฉีดวัคซีนแล้วหรือยังครับ?", time: "1 ชม.", unread: true },
  { name: "Dr. ศิริพร", abbr: "ศพ", text: "ผลตรวจสุขภาพออกมาแล้วนะคะ", time: "3 ชม.", unread: false },
];

const HEALTH_ITEMS = [
  { label: "วัคซีน", detail: "ครบแล้ว", ok: true },
  { label: "ถ่ายพยาธิ", detail: "ครบแล้ว", ok: true },
  { label: "ตรวจสุขภาพ", detail: "ถัดไป: 20 ก.ย.", ok: null },
  { label: "ยาป้องกันปรสิต", detail: "ครบแล้ว", ok: true },
];

const NAV_LINKS = [
  { icon: Home,          label: "แดชบอร์ด",     href: "/dashboard", badge: 0 },
  { icon: HeartHandshake,label: "จับคู่แมว",     href: "/discover",  badge: 0 },
  { icon: PawPrint,      label: "โปรไฟล์แมว",   href: "/cats",      badge: 0 },
  { icon: MessageCircle, label: "ข้อความ",       href: "/chat",      badge: 4 },
  { icon: HeartPulse,    label: "บันทึกสุขภาพ",  href: "/health",    badge: 0 },
  { icon: Dna,           label: "ผสมพันธุ์",     href: "/breeding",  badge: 0 },
  { icon: BookOpen,      label: "คลังความรู้",   href: "/knowledge", badge: 0 },
  { icon: CalendarDays,  label: "กิจกรรม",       href: "/events",    badge: 0 },
  { icon: Users,         label: "ชุมชน",         href: "/community", badge: 0 },
  { icon: Bookmark,      label: "รายการโปรด",   href: "/favorites", badge: 0 },
  { icon: Settings,      label: "ตั้งค่า",       href: "/settings",  badge: 0 },
];

// ── Mini sparkline SVG ────────────────────────────────────────────────────────

function Sparkline({ points, color = "#22c55e" }: { points: string; color?: string }) {
  return (
    <svg viewBox="0 0 80 32" className="h-8 w-20" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Health ring SVG ───────────────────────────────────────────────────────────

function HealthRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <svg viewBox="0 0 100 100" className="size-24">
      <defs>
        <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EDD060" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke="url(#hg)" strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ / 4}
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0B1D3A">{score}</text>
      <text x="50" y="60" textAnchor="middle" fontSize="8" fill="#6B5232">ดีเยี่ยม</text>
    </svg>
  );
}

// ── Mini Calendar ─────────────────────────────────────────────────────────────

function MiniCalendar() {
  // July 2026 — starts Wednesday (index 3)
  const days = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const firstDay = 3; // Wednesday
  const totalDays = 31;
  const today = 3;
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-[#0B1D3A]">กรกฎาคม 2026</span>
        <div className="flex gap-1">
          <button className="flex size-6 items-center justify-center rounded-full hover:bg-[#D4AF37]/10">
            <ChevronLeft className="size-3.5 text-[#6B5232]" />
          </button>
          <button className="flex size-6 items-center justify-center rounded-full hover:bg-[#D4AF37]/10">
            <ChevronRight className="size-3.5 text-[#6B5232]" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {days.map((d) => (
          <span key={d} className="text-[9px] font-semibold text-[#6B5232]/50">{d}</span>
        ))}
        {cells.map((n, i) => (
          <span
            key={i}
            className={`text-xs leading-6 rounded-full ${
              n === null ? "" :
              n === today
                ? "font-bold text-white"
                : "text-[#0B1D3A]/70 hover:bg-[#D4AF37]/10 cursor-pointer"
            }`}
            style={n === today ? { background: "linear-gradient(135deg,#EDD060,#D4AF37)" } : {}}
          >
            {n ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const initial = user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "ต";

  useEffect(() => {
    const locale = window.location.pathname.split("/")[1] || "th";
    const timer = setTimeout(() => {
      NAV_LINKS.forEach(({ href }) => {
        fetch(`/${locale}${href}`, {
          headers: { RSC: "1", "Next-Router-Prefetch": "1" },
          cache: "no-store",
        }).catch(() => {});
      });
    }, 100);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <aside
      className="hidden w-64 flex-shrink-0 flex-col xl:flex"
      style={{
        background: "linear-gradient(180deg, #FFF0F3 0%, #FFE4EC 100%)",
        borderRight: "1px solid rgba(212,160,175,0.25)",
      }}
    >
      {/* Logo */}
      <div className="flex h-20 items-center px-5" style={{ borderBottom: "1px solid rgba(200,130,155,0.18)" }}>
        <Link href="/" className="relative h-14 w-52">
          <Image
            src="/img/logo_and_icon.png"
            alt="Catinder"
            fill
            className="object-contain object-left"
          />
        </Link>
      </div>

      {/* User pill */}
      <div className="mx-3 mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5"
        style={{ background: "rgba(212,140,165,0.12)", border: "1px solid rgba(212,140,165,0.22)" }}>
        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg,#F9C5D1 0%,#E8A0B4 100%)", boxShadow: "0 1px 6px rgba(212,140,165,0.40)" }}>
          <svg viewBox="0 0 32 32" className="size-6" fill="none">
            <path d="M8 4L4 12h8L8 4z" fill="#D4AF37" opacity="0.9"/>
            <path d="M24 4l4 8h-8l4-8z" fill="#D4AF37" opacity="0.9"/>
            <path d="M8 4L5.5 10.5h5L8 4z" fill="#FFF0F3"/>
            <path d="M24 4l2.5 6.5h-5L24 4z" fill="#FFF0F3"/>
            <circle cx="16" cy="18" r="10" fill="#FFFAFC"/>
            <ellipse cx="12.5" cy="16.5" rx="1.6" ry="2" fill="#4A1030"/>
            <ellipse cx="19.5" cy="16.5" rx="1.6" ry="2" fill="#4A1030"/>
            <circle cx="13" cy="16" r="0.55" fill="white"/>
            <circle cx="20" cy="16" r="0.55" fill="white"/>
            <ellipse cx="16" cy="19.8" rx="1.1" ry="0.8" fill="#E8A0B4"/>
            <path d="M14.5 20.8 Q16 22 17.5 20.8" stroke="#C07090" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
            <line x1="6" y1="19" x2="13" y2="20" stroke="#C07090" strokeWidth="0.5" opacity="0.6"/>
            <line x1="6" y1="21" x2="13" y2="21" stroke="#C07090" strokeWidth="0.5" opacity="0.6"/>
            <line x1="19" y1="20" x2="26" y2="19" stroke="#C07090" strokeWidth="0.5" opacity="0.6"/>
            <line x1="19" y1="21" x2="26" y2="21" stroke="#C07090" strokeWidth="0.5" opacity="0.6"/>
          </svg>
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold" style={{ color: "#4A1030" }}>
            {user?.displayName ?? user?.email?.split("@")[0] ?? "คุณตะนาสรน์"}
          </p>
          <div className="flex items-center gap-1">
            <Gift className="size-2.5 text-[#B05070]" />
            <span className="text-[9px] font-semibold text-[#B05070]">สมาชิกทั่วไป</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3">
        {NAV_LINKS.map((l) => {
          const Icon = l.icon;
          const active = pathname?.endsWith(l.href) || (l.href === "/dashboard" && pathname?.includes("dashboard"));
          return (
            <Link
              key={l.href}
              href={l.href}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-[#F9C5D1]/30"
              style={{
                background: active ? "rgba(212,140,165,0.20)" : "transparent",
                color: active ? "#B04060" : "rgba(74,20,50,0.60)",
              }}
            >
              <Icon className="size-4 flex-shrink-0" style={{ color: active ? "#D4AF37" : "rgba(176,64,96,0.55)" }} />
              <span className="flex-1">{l.label}</span>
              {l.badge > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: "#D4AF37", color: "#0B1D3A" }}>
                  {l.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Plan card */}
      <div className="mx-3 mb-3 rounded-2xl p-4"
        style={{ background: "linear-gradient(135deg,rgba(249,197,209,0.30),rgba(237,208,96,0.15))", border: "1px solid rgba(212,140,165,0.35)" }}>
        {/* Current plan */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Gift className="size-3.5 text-[#B04060]" />
            <span className="text-[11px] font-bold" style={{ color: "#B04060" }}>แผนฟรี</span>
          </div>
          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
            style={{ background: "rgba(212,175,55,0.15)", color: "#B8920A" }}>ปัจจุบัน</span>
        </div>
        {/* Free limits */}
        <div className="mb-3 space-y-1.5">
          {[
            "ดู AI Match ได้ 5 คู่/วัน",
            "ส่ง Request ได้ 3 ครั้ง/วัน",
            "อ่านบทความ & กิจกรรม",
          ].map((f) => (
            <div key={f} className="flex items-center gap-1.5">
              <CheckCheck className="size-3 flex-shrink-0 text-green-500" />
              <span className="text-[10px]" style={{ color: "rgba(74,20,50,0.70)" }}>{f}</span>
            </div>
          ))}
          {[
            "แชทโดยตรง",
            "Health Passport",
            "Pedigree & Priority",
          ].map((f) => (
            <div key={f} className="flex items-center gap-1.5">
              <Lock className="size-3 flex-shrink-0 text-[#B04060]/40" />
              <span className="text-[10px] line-through" style={{ color: "rgba(74,20,50,0.35)" }}>{f}</span>
            </div>
          ))}
        </div>
        <Link href="/register"
          className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
          <Crown className="size-3" />
          อัปเกรดเป็น Premium
        </Link>
      </div>

      {/* Logout */}
      <button onClick={logout}
        className="mx-3 mb-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs transition-colors hover:bg-[#F9C5D1]/20"
        style={{ color: "rgba(74,20,50,0.40)" }}>
        <LogOut className="size-3.5" />
        ออกจากระบบ
      </button>
    </aside>
  );
}

// ── Right Panel ───────────────────────────────────────────────────────────────

function RightPanel() {
  return (
    <aside
      className="hidden w-80 flex-shrink-0 flex-col gap-4 overflow-y-auto p-4 2xl:flex"
      style={{ borderLeft: "1px solid rgba(212,160,175,0.20)", background: "rgba(255,245,248,0.80)" }}
    >
      {/* Upcoming Appointments */}
      <div className="rounded-2xl p-4"
        style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.20)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0B1D3A]">
            <CalendarDays className="mr-1.5 inline size-4 text-[#D4AF37]" />
            นัดหมายที่จะถึง
          </h3>
          <span className="cursor-pointer text-[11px] font-semibold text-[#D4AF37] hover:underline">ดูทั้งหมด</span>
        </div>
        <MiniCalendar />
        {/* Appointment item */}
        <div className="mt-3 flex items-center gap-3 rounded-xl p-3"
          style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.18)" }}>
          <div className="flex size-9 flex-shrink-0 flex-col items-center justify-center rounded-xl text-center"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            <span className="text-[9px] font-bold leading-none">ก.ค.</span>
            <span className="text-base font-extrabold leading-none">20</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#0B1D3A]">ตรวจสุขภาพประจำปี</p>
            <p className="text-[11px]" style={{ color: "#6B5232" }}>โมจิ · Scottish Fold</p>
            <p className="text-[10px] text-[#6B5232]/60">14:00 น.</p>
          </div>
        </div>
      </div>

      {/* Health Summary */}
      <div className="rounded-2xl p-4"
        style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.20)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0B1D3A]">
            <HeartPulse className="mr-1.5 inline size-4 text-[#D4AF37]" />
            สรุปสุขภาพ
          </h3>
          <span className="cursor-pointer text-[11px] font-semibold text-[#D4AF37] hover:underline">รายละเอียด</span>
        </div>
        <div className="flex items-center gap-4">
          <HealthRing score={92} />
          <div className="flex-1 space-y-2">
            {HEALTH_ITEMS.map((h) => (
              <div key={h.label} className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#6B5232]/80">{h.label}</span>
                <div className="flex items-center gap-1">
                  {h.ok === true && <CheckCircle className="size-3 text-green-500" />}
                  {h.ok === null && <Circle className="size-3 text-[#D4AF37]/60" />}
                  <span className="text-[10px] font-semibold"
                    style={{ color: h.ok === true ? "#16a34a" : h.ok === null ? "#B8920A" : "#dc2626" }}>
                    {h.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="rounded-2xl p-4"
        style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.20)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0B1D3A]">
            <MessageCircle className="mr-1.5 inline size-4 text-[#D4AF37]" />
            ข้อความล่าสุด
          </h3>
          <span className="cursor-pointer text-[11px] font-semibold text-[#D4AF37] hover:underline">ดูทั้งหมด</span>
        </div>
        <div className="space-y-3">
          {MESSAGES.map((m) => (
            <div key={m.name} className="flex items-start gap-3">
              <div className="relative">
                <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: "rgba(212,175,55,0.16)", color: "#D4AF37" }}>
                  {m.abbr}
                </div>
                {m.unread && (
                  <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-[#D4AF37]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#0B1D3A]">{m.name}</p>
                  <span className="text-[10px] text-[#6B5232]/50">{m.time}</span>
                </div>
                <p className="mt-0.5 truncate text-[11px]" style={{ color: "#6B5232" }}>{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium nudge */}
      <div className="relative overflow-hidden rounded-2xl p-4"
        style={{ background: "linear-gradient(135deg,#FDF0F4,#F9DDE8)", border: "1px solid rgba(212,140,165,0.35)" }}>
        <div className="pointer-events-none absolute -right-4 -top-4 size-24 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(212,140,165,0.30),transparent 70%)", filter: "blur(12px)" }} />
        <div className="relative">
          <div className="mb-1 flex items-center gap-1.5">
            <Crown className="size-3.5 text-[#D4AF37]" />
            <span className="text-[11px] font-bold" style={{ color: "#B04060" }}>ปลดล็อก Premium</span>
          </div>
          <p className="mb-1 text-xs font-bold" style={{ color: "#4A1030" }}>รับสิทธิ์พิเศษทั้งหมด</p>
          <p className="mb-3 text-[11px]" style={{ color: "rgba(74,20,50,0.60)" }}>
            AI จับคู่ขั้นสูง · รายงานสุขภาพ · Priority แชท
          </p>
          <Link href="/register"
            className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            <Sparkles className="size-3" />
            อัปเกรดตอนนี้
          </Link>
        </div>
      </div>
    </aside>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function DashboardContent() {
  const { user } = useAuth();
  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "คุณตะนาสรน์";
  const initial = displayName[0]?.toUpperCase() ?? "ต";
  const [requestsLeft, setRequestsLeft] = useState(3);
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleRequest(name: string) {
    if (sentTo.includes(name)) return;
    if (requestsLeft === 0) { showToast("ใช้ครบ 3 คำขอแล้ววันนี้ — อัปเกรดเพื่อส่งเพิ่ม"); return; }
    setSentTo((p) => [...p, name]);
    setRequestsLeft((n) => n - 1);
    showToast(`ส่งคำขอหา ${name} แล้ว! 🐾`);
  }

  function handleCheckIn() {
    if (checkedIn) return;
    setCheckedIn(true);
    showToast("เช็คอินสำเร็จ! +20 XP 🎉");
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#FFF5F8" }}>
      <Sidebar />

      {/* Center — main scrollable content */}
      <div className="flex flex-1 min-w-0 flex-col overflow-y-auto">

        {/* ── Topbar ── */}
        <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center gap-4 px-5"
          style={{ background: "rgba(255,248,250,0.94)", borderBottom: "1px solid rgba(212,160,175,0.20)", backdropFilter: "blur(16px)" }}>

          {/* Mobile logo */}
          <Link href="/" className="relative h-9 w-28 flex-shrink-0 xl:hidden">
            <Image src="/img/logo_and_icon.png" alt="Catinder" fill className="object-contain object-left" />
          </Link>

          {/* Search */}
          <div className="hidden flex-1 max-w-sm items-center gap-2.5 rounded-2xl px-4 py-2 sm:flex"
            style={{ background: "rgba(180,80,110,0.05)", border: "1px solid rgba(212,160,175,0.22)" }}>
            <Search className="size-4 flex-shrink-0 text-[#D4AF37]" />
            <input type="text" placeholder="ค้นหาแมว ผู้เพาะพันธุ์ ..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#6B5232]/40" />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* User */}
            <div className="flex items-center gap-2.5">
              {/* Cat avatar */}
              <div className="relative flex size-10 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg,#F9C5D1 0%,#E8A0B4 100%)", boxShadow: "0 2px 10px rgba(212,140,165,0.40)" }}>
                <svg viewBox="0 0 32 32" className="size-7" fill="none">
                  {/* Ears */}
                  <path d="M8 4L4 12h8L8 4z" fill="#D4AF37" opacity="0.9"/>
                  <path d="M24 4l4 8h-8l4-8z" fill="#D4AF37" opacity="0.9"/>
                  <path d="M8 4L5.5 10.5h5L8 4z" fill="#FFF0F3"/>
                  <path d="M24 4l2.5 6.5h-5L24 4z" fill="#FFF0F3"/>
                  {/* Face */}
                  <circle cx="16" cy="18" r="10" fill="#FFFAFC"/>
                  <circle cx="16" cy="18" r="10" fill="url(#catFace)" opacity="0.15"/>
                  <defs>
                    <radialGradient id="catFace" cx="50%" cy="30%">
                      <stop offset="0%" stopColor="#F9C5D1"/>
                      <stop offset="100%" stopColor="#E8A0B4"/>
                    </radialGradient>
                  </defs>
                  {/* Eyes */}
                  <ellipse cx="12.5" cy="16.5" rx="1.6" ry="2" fill="#4A1030"/>
                  <ellipse cx="19.5" cy="16.5" rx="1.6" ry="2" fill="#4A1030"/>
                  <circle cx="13" cy="16" r="0.55" fill="white"/>
                  <circle cx="20" cy="16" r="0.55" fill="white"/>
                  {/* Nose */}
                  <ellipse cx="16" cy="19.8" rx="1.1" ry="0.8" fill="#E8A0B4"/>
                  {/* Mouth */}
                  <path d="M14.5 20.8 Q16 22 17.5 20.8" stroke="#C07090" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
                  {/* Whiskers */}
                  <line x1="6" y1="19" x2="13" y2="20" stroke="#C07090" strokeWidth="0.5" opacity="0.6"/>
                  <line x1="6" y1="21" x2="13" y2="21" stroke="#C07090" strokeWidth="0.5" opacity="0.6"/>
                  <line x1="19" y1="20" x2="26" y2="19" stroke="#C07090" strokeWidth="0.5" opacity="0.6"/>
                  <line x1="19" y1="21" x2="26" y2="21" stroke="#C07090" strokeWidth="0.5" opacity="0.6"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-[#0B1D3A]">{displayName}</p>
                <div className="flex items-center gap-1">
                  <Gift className="size-2.5 text-[#6B5232]" />
                  <span className="text-[9px] font-semibold text-[#6B5232]">สมาชิกทั่วไป</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page body ── */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto max-w-4xl space-y-5"
          >

            {/* Toast */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                  className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-bold shadow-xl"
                  style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}
                >
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hero banner */}
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl" style={{ minHeight: "200px" }}>
              <Image src="/img/Blackgroud.png" alt="" fill className="object-cover object-center" quality={85} />
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(110deg,rgba(11,29,58,0.72) 0%,rgba(11,29,58,0.38) 50%,rgba(11,29,58,0.04) 100%)" }} />
              <div className="relative z-10 flex items-center justify-between p-6 sm:p-8">
                <div className="max-w-sm">
                  <p className="mb-2 text-xs font-semibold tracking-widest" style={{ color: "rgba(212,175,55,0.85)" }}>
                    AI-POWERED MATCHING
                  </p>
                  <h1 className="font-heading text-2xl font-bold leading-tight text-white sm:text-3xl">
                    หาคู่ที่ใช่<br />
                    <span style={{ color: "#EDD060" }}>สำหรับแมวของคุณ</span>
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(247,215,171,0.65)" }}>
                    AI จับคู่ขั้นสูง เพื่อความสัมพันธ์ที่มีความสุขและสุขภาพดีกว่า
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/discover"
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
                      style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A", boxShadow: "0 4px 16px rgba(212,175,55,0.40)" }}>
                      <HeartHandshake className="size-4" />
                      จับคู่เลย
                    </Link>
                    <button onClick={handleCheckIn}
                      disabled={checkedIn}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60"
                      style={{ background: checkedIn ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.20)", color: "white", border: "1px solid rgba(255,255,255,0.35)" }}>
                      <Zap className="size-4" style={{ color: checkedIn ? "#aaa" : "#EDD060" }} />
                      {checkedIn ? "เช็คอินแล้ว ✓" : "เช็คอินรับ XP"}
                    </button>
                  </div>
                </div>
                <div className="relative hidden sm:block">
                  <div className="absolute inset-0 -m-6 rounded-full"
                    style={{ background: "radial-gradient(circle,rgba(212,175,55,0.35),transparent 70%)", filter: "blur(20px)" }} />
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <Image src="/img/mascot.png" alt="" width={150} height={150} className="relative"
                      style={{ filter: "drop-shadow(0 8px 24px rgba(212,175,55,0.55))" }} />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={fadeUp} className="grid grid-cols-4 gap-2 sm:grid-cols-4">
              {[
                { icon: BookOpen,    label: "คลังความรู้", href: "/knowledge", color: "#4A90D9" },
                { icon: CalendarDays,label: "กิจกรรม",     href: "/events",    color: "#D4AF37" },
                { icon: Users,       label: "ชุมชน",       href: "/community", color: "#7B5EA7" },
                { icon: HeartPulse,  label: "สุขภาพ",      href: "/health",    color: "#E8706A" },
              ].map(({ icon: Icon, label, href, color }) => (
                <Link key={href} href={href}
                  className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.20)" }}>
                  <div className="flex size-10 items-center justify-center rounded-full"
                    style={{ background: `${color}18` }}>
                    <Icon className="size-5" style={{ color }} />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0B1D3A]">{label}</span>
                </Link>
              ))}
            </motion.div>

            {/* Stats row */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "การจับคู่ที่แอคทีฟ", value: "24", trend: "+12%", spark: "0,28 15,24 30,20 50,14 65,10 80,5" },
                { label: "ยอดเข้าชมโปรไฟล์", value: "1,248", trend: "+18%", spark: "0,26 15,22 30,18 50,13 65,8 80,4" },
                { label: "ไลค์ที่ได้รับ", value: "312", trend: "+8%", spark: "0,25 20,22 40,19 55,15 70,10 80,7" },
                { label: "จับคู่สำเร็จ", value: "15", trend: "+25%", spark: "0,28 15,22 35,17 55,12 70,7 80,3" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl p-4"
                  style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.20)", boxShadow: "0 2px 10px rgba(160,60,90,0.06)" }}>
                  <p className="mb-1 text-[11px] text-[#6B5232]/70">{s.label}</p>
                  <p className="text-xl font-extrabold text-[#0B1D3A]">{s.value}</p>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600">
                      <TrendingUp className="size-3" />{s.trend}
                    </span>
                    <Sparkline points={s.spark} />
                  </div>
                </div>
              ))}
            </motion.div>

            {/* AI Match Recommendations */}
            <motion.section variants={fadeUp}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0B1D3A]">
                  <Star className="mr-1.5 inline size-4 text-[#D4AF37]" />
                  AI แนะนำการจับคู่
                </h2>
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={{ background: requestsLeft > 0 ? "rgba(212,175,55,0.15)" : "rgba(220,80,80,0.12)", color: requestsLeft > 0 ? "#B8920A" : "#B03030" }}>
                    เหลือ {requestsLeft}/3 คำขอวันนี้
                  </span>
                  <Link href="/discover" className="flex items-center gap-1 text-xs font-semibold text-[#D4AF37] hover:underline">
                    ดูทั้งหมด <ChevronRight className="size-3" />
                  </Link>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {MATCHES.map((m) => {
                  const sent = sentTo.includes(m.name);
                  return (
                    <div key={m.name} className="group relative rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.20)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
                      <div className="relative mx-auto mb-3 size-20">
                        <div className="size-20 overflow-hidden rounded-full ring-2 ring-offset-1"
                          style={{ ringColor: "rgba(212,175,55,0.40)" }}>
                          <Image src={m.img} alt={m.name} fill className="object-cover" />
                        </div>
                        <div className="absolute -right-1 -top-1 flex h-7 min-w-[28px] items-center justify-center rounded-full px-1 text-[10px] font-extrabold"
                          style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A", boxShadow: "0 2px 8px rgba(212,175,55,0.40)" }}>
                          {m.pct}%
                        </div>
                      </div>
                      <p className="text-center text-sm font-bold text-[#0B1D3A]">{m.name}</p>
                      <p className="text-center text-[11px]" style={{ color: "#6B5232" }}>{m.breed} · {m.age} {m.gender}</p>
                      <div className="mt-2 flex flex-wrap justify-center gap-1">
                        {m.traits.map((t) => (
                          <span key={t} className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: "rgba(212,175,55,0.12)", color: "#B8920A" }}>{t}</span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleRequest(m.name)}
                        disabled={sent}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold transition-all hover:opacity-90 disabled:opacity-70"
                        style={{ background: sent ? "rgba(34,197,94,0.15)" : "linear-gradient(135deg,#EDD060,#D4AF37)", color: sent ? "#16a34a" : "#0B1D3A" }}>
                        {sent ? <CheckCheck className="size-3" /> : <Heart className="size-3" />}
                        {sent ? "ส่งแล้ว ✓" : "ส่งคำขอ"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* Featured Cat Profiles */}
            <motion.section variants={fadeUp}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0B1D3A]">
                  <Crown className="mr-1.5 inline size-4 text-[#D4AF37]" />
                  โปรไฟล์แมวแนะนำ
                </h2>
                <Link href="/cats" className="flex items-center gap-1 text-xs font-semibold text-[#D4AF37] hover:underline">
                  ดูทั้งหมด <ChevronRight className="size-3" />
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {FEATURED.map((f) => (
                  <div key={f.name} className="group overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.20)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
                    <div className="relative h-36 overflow-hidden">
                      <Image src={f.img} alt={f.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      {/* Star badge */}
                      <div className="absolute left-2 top-2 flex size-6 items-center justify-center rounded-full"
                        style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", boxShadow: "0 2px 8px rgba(212,175,55,0.40)" }}>
                        <Star className="size-3 text-[#0B1D3A]" />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-[#0B1D3A]">{f.name}</p>
                      <p className="text-[11px]" style={{ color: "#6B5232" }}>{f.breed} · {f.age} · {f.gender === "♀" ? "เมีย" : "ผู้"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

          </motion.div>
        </main>
      </div>

      <RightPanel />
    </div>
  );
}
