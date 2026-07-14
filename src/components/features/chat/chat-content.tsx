"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Lock, Crown, ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/components/shared/app-shell";

const CONVERSATIONS: { id: number; name: string; abbr: string; text: string; time: string; unread: number; img: null }[] = [];

export function ChatContent() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const active = CONVERSATIONS.find((c) => c.id === activeId);
  const isPremium = false;

  return (
    <AppShell>
      <div className="mx-auto flex h-[calc(100vh-10.5rem)] sm:h-[calc(100vh-6.25rem)] lg:h-[calc(100vh-6.5rem)] max-w-4xl gap-4">

        {/* Conversation list — full width on mobile when no chat open, w-72 on sm+ */}
        <div
          className={`flex-shrink-0 flex-col rounded-3xl overflow-hidden ${activeId !== null ? "hidden sm:flex sm:w-72" : "flex w-full sm:w-72"}`}
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}
        >
          <div className="px-4 py-4" style={{ borderBottom: "1px solid rgba(212,160,175,0.18)" }}>
            <h2 className="text-base font-extrabold text-[#0B1D3A]">ข้อความ</h2>
            <p className="text-xs text-[#6B5232]/50">{CONVERSATIONS.filter(c => c.unread > 0).length} ข้อความใหม่</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {CONVERSATIONS.map((c) => (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F9C5D1]/15"
                style={{ background: activeId === c.id ? "rgba(212,175,55,0.10)" : "transparent", borderLeft: activeId === c.id ? "3px solid #D4AF37" : "3px solid transparent" }}>
                <div className="relative flex-shrink-0">
                  <div className="flex size-10 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: "rgba(212,175,55,0.16)", color: "#D4AF37" }}>{c.abbr}</div>
                  {c.unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full text-[9px] font-bold"
                      style={{ background: "#D4AF37", color: "#0B1D3A" }}>{c.unread}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs font-bold text-[#0B1D3A]">{c.name}</p>
                    <span className="text-[10px] text-[#6B5232]/40">{c.time}</span>
                  </div>
                  <p className="truncate text-[11px] text-[#6B5232]/60">{c.text}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area — hidden on mobile when no chat open, full width when open */}
        <div
          className={`flex-1 flex-col rounded-3xl overflow-hidden ${activeId !== null ? "flex" : "hidden sm:flex"}`}
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}
        >
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
              <div className="mb-4 text-5xl">💬</div>
              <h3 className="text-base font-bold text-[#0B1D3A]">เลือกบทสนทนา</h3>
              <p className="mt-1 text-xs text-[#6B5232]/50">คลิกที่ชื่อทางซ้ายเพื่อเปิดการสนทนา</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: "1px solid rgba(212,160,175,0.18)" }}>
                {/* Back to list — mobile only */}
                <button
                  onClick={() => setActiveId(null)}
                  className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-[#F9C5D1]/30 sm:hidden"
                  aria-label="กลับ"
                >
                  <ChevronLeft className="size-4 text-[#0B1D3A]" />
                </button>
                <div className="flex size-9 items-center justify-center rounded-full text-sm font-bold"
                  style={{ background: "rgba(212,175,55,0.16)", color: "#D4AF37" }}>{active.abbr}</div>
                <div>
                  <p className="text-sm font-bold text-[#0B1D3A]">{active.name}</p>
                  <p className="text-[11px] text-green-500">ออนไลน์</p>
                </div>
              </div>

              {/* Messages — empty until real messages load from Firestore */}
              <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
                <Lock className="mb-3 size-8 text-[#B04060]/30" />
                <p className="text-xs font-bold text-[#4A1030]">แชทโดยตรงเป็นฟีเจอร์ Premium</p>
                <p className="mt-0.5 text-[11px] text-[#6B5232]/50">อัปเกรดเพื่อส่งและรับข้อความ</p>
                <Link href="/register" className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold hover:opacity-90 transition-opacity"
                  style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                  <Crown className="size-3" /> อัปเกรด
                </Link>
              </div>

              {/* Input */}
              <div className="flex items-center gap-3 px-5 py-4"
                style={{ borderTop: "1px solid rgba(212,160,175,0.18)" }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!isPremium}
                  placeholder={isPremium ? "พิมพ์ข้อความ..." : "ต้องการ Premium เพื่อส่งข้อความ"}
                  className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none disabled:opacity-50"
                  style={{ background: "rgba(212,140,165,0.08)", border: "1px solid rgba(212,160,175,0.22)", color: "#0B1D3A" }}
                />
                <button disabled={!isPremium || !input}
                  className="flex size-10 items-center justify-center rounded-full transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)" }}>
                  <Send className="size-4 text-[#0B1D3A]" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
