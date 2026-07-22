"use client";

import { useEffect } from "react";
import Image from "next/image";
import {
  Home, HeartHandshake, PawPrint, MessageCircle, HeartPulse,
  Dna, BookOpen, Gamepad2, Bookmark, Settings,
  Crown, Gift, Lock, CheckCheck, LogOut, Shield,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/contexts/auth-context";

const NAV_LINKS = [
  { icon: Home,           label: "แดชบอร์ด",     href: "/dashboard", badge: 0 },
  { icon: HeartHandshake, label: "จับคู่แมว",     href: "/discover",  badge: 0 },
  { icon: PawPrint,       label: "โปรไฟล์แมว",   href: "/cats",      badge: 0 },
  { icon: MessageCircle,  label: "ข้อความ",       href: "/chat",      badge: 0 },
  { icon: HeartPulse,     label: "บันทึกสุขภาพ",  href: "/health",    badge: 0 },
  { icon: Dna,            label: "ผสมพันธุ์",     href: "/breeding",  badge: 0 },
  { icon: BookOpen,       label: "คลังความรู้",   href: "/knowledge", badge: 0 },
  { icon: Gamepad2,        label: "เกม",            href: "/games",     badge: 0 },
  { icon: Bookmark,       label: "รายการโปรด",   href: "/favorites", badge: 0 },
  { icon: Settings,       label: "ตั้งค่า",       href: "/settings",  badge: 0 },
];

function CatAvatar({ size = 8 }: { size?: number }) {
  const cls = `size-${size}`;
  const inner = `size-${size - 2}`;
  return (
    <div
      className={`relative flex flex-shrink-0 ${cls} items-center justify-center rounded-full`}
      style={{ background: "linear-gradient(135deg,#F9C5D1 0%,#E8A0B4 100%)", boxShadow: "0 1px 6px rgba(212,140,165,0.40)" }}
    >
      <svg viewBox="0 0 32 32" className={inner} fill="none">
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
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

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
          <Image src="/img/logo_and_icon.png" alt="Catinder" fill className="object-contain object-left" />
        </Link>
      </div>

      {/* User pill */}
      <div className="mx-3 mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5"
        style={{ background: "rgba(212,140,165,0.12)", border: "1px solid rgba(212,140,165,0.22)" }}>
        <CatAvatar size={8} />
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

        {/* Admin Panel — เฉพาะ admin */}
        {isAdmin && (
          <>
            <div className="mx-1 my-2 border-t border-[rgba(212,140,165,0.20)]" />
            <Link
              href="/admin"
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all"
              style={{
                background: pathname?.includes("/admin") ? "rgba(212,175,55,0.18)" : "rgba(212,175,55,0.08)",
                color: "#B8920A",
                border: "1px solid rgba(212,175,55,0.25)",
              }}
            >
              <Shield className="size-4 flex-shrink-0 text-[#D4AF37]" />
              <span className="flex-1">Admin Panel</span>
            </Link>
          </>
        )}
      </nav>

      {/* Plan card */}
      <div className="mx-3 mb-3 rounded-2xl p-4"
        style={{ background: "linear-gradient(135deg,rgba(249,197,209,0.30),rgba(237,208,96,0.15))", border: "1px solid rgba(212,140,165,0.35)" }}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Gift className="size-3.5 text-[#B04060]" />
            <span className="text-[11px] font-bold" style={{ color: "#B04060" }}>แผนฟรี</span>
          </div>
          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
            style={{ background: "rgba(212,175,55,0.15)", color: "#B8920A" }}>ปัจจุบัน</span>
        </div>
        <div className="mb-3 space-y-1.5">
          {["ดู AI Match ได้ 5 คู่/วัน", "ส่ง Request ได้ 3 ครั้ง/วัน", "อ่านบทความ & เกม"].map((f) => (
            <div key={f} className="flex items-center gap-1.5">
              <CheckCheck className="size-3 flex-shrink-0 text-green-500" />
              <span className="text-[10px]" style={{ color: "rgba(74,20,50,0.70)" }}>{f}</span>
            </div>
          ))}
          {["แชทโดยตรง", "Health Passport", "Pedigree & Priority"].map((f) => (
            <div key={f} className="flex items-center gap-1.5">
              <Lock className="size-3 flex-shrink-0 text-[#B04060]/40" />
              <span className="text-[10px] line-through" style={{ color: "rgba(74,20,50,0.35)" }}>{f}</span>
            </div>
          ))}
        </div>
        <Link href="/pricing"
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

export { CatAvatar };
