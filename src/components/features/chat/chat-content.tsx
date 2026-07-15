"use client";

import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/shared/app-shell";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Send, ChevronLeft, HeartHandshake, PawPrint } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MatchCat {
  id: string;
  name: string;
  breed: string;
  photoUrl: string;
  ownerId: string;
}

interface Match {
  id: string;
  users: string[];
  cats: MatchCat[];
  createdAt: unknown;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: unknown;
}

function getOtherCat(match: Match, myUid: string): MatchCat {
  return match.cats.find((c) => c.ownerId !== myUid) ?? match.cats[0];
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ChatContent() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const unsubMessagesRef = useRef<(() => void) | null>(null);

  // ── Load matches real-time ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "matches"),
      where("users", "array-contains", user.uid),
    );
    const unsub = onSnapshot(q, (snap) => {
      setMatches(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Match, "id">),
        })),
      );
    });
    return unsub;
  }, [user]);

  // ── Load messages for selected match (real-time) ────────────────────────────
  useEffect(() => {
    // Tear down previous subscription and reset
    unsubMessagesRef.current?.();
    unsubMessagesRef.current = null;
    setMessages([]);

    if (!selectedMatchId) return;

    const q = query(
      collection(db, "chats", selectedMatchId, "messages"),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Message, "id">),
        })),
      );
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    });
    unsubMessagesRef.current = unsub;

    return () => {
      unsub();
      unsubMessagesRef.current = null;
    };
  }, [selectedMatchId]);

  // ── Send message ────────────────────────────────────────────────────────────
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !selectedMatchId || !user) return;
    const text = input.trim();
    setInput("");
    try {
      await addDoc(collection(db, "chats", selectedMatchId, "messages"), {
        text,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }

  const selectedMatch = matches.find((m) => m.id === selectedMatchId) ?? null;
  const otherCat = selectedMatch && user ? getOtherCat(selectedMatch, user.uid) : null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <div className="mx-auto flex h-[calc(100vh-10.5rem)] sm:h-[calc(100vh-6.25rem)] lg:h-[calc(100vh-6.5rem)] max-w-4xl gap-4">

        {/* ── Match list (left panel) ── */}
        <div
          className={`flex-shrink-0 flex-col rounded-3xl overflow-hidden ${
            selectedMatchId !== null
              ? "hidden sm:flex sm:w-72"
              : "flex w-full sm:w-72"
          }`}
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}
        >
          {/* Header */}
          <div
            className="px-4 py-4"
            style={{ borderBottom: "1px solid rgba(212,160,175,0.18)" }}
          >
            <h2 className="text-base font-extrabold text-[#0B1D3A]">ข้อความ</h2>
            <p className="text-xs text-[#6B5232]/50">{matches.length} คู่จับคู่</p>
          </div>

          {/* List body */}
          <div className="flex-1 overflow-y-auto">
            {matches.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <HeartHandshake className="mb-3 size-10 text-[#D4AF37]/40" />
                <p className="text-sm font-bold text-[#0B1D3A]">ยังไม่มีการจับคู่</p>
                <p className="mt-1 text-xs text-[#6B5232]/50">
                  เริ่มจับคู่แมวได้เลย!
                </p>
                <Link
                  href="/discover"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold hover:opacity-90 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg,#EDD060,#D4AF37)",
                    color: "#0B1D3A",
                  }}
                >
                  <PawPrint className="size-3.5" />
                  ค้นหาคู่
                </Link>
              </div>
            ) : (
              matches.map((match) => {
                const other = user ? getOtherCat(match, user.uid) : null;
                if (!other) return null;
                const isActive = match.id === selectedMatchId;
                const initials = other.name.slice(0, 2).toUpperCase();

                return (
                  <button
                    key={match.id}
                    onClick={() => setSelectedMatchId(match.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F9C5D1]/15"
                    style={{
                      background: isActive ? "rgba(212,175,55,0.10)" : "transparent",
                      borderLeft: isActive
                        ? "3px solid #D4AF37"
                        : "3px solid transparent",
                    }}
                  >
                    {/* Cat photo or initials */}
                    <div className="relative flex-shrink-0">
                      {other.photoUrl ? (
                        <div className="relative size-10 rounded-full overflow-hidden">
                          <Image
                            src={other.photoUrl}
                            alt={other.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      ) : (
                        <div
                          className="flex size-10 items-center justify-center rounded-full text-sm font-bold"
                          style={{
                            background: "rgba(212,175,55,0.16)",
                            color: "#D4AF37",
                          }}
                        >
                          {initials}
                        </div>
                      )}
                    </div>

                    {/* Name + breed */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#0B1D3A]">{other.name}</p>
                      <p className="truncate text-[11px] text-[#6B5232]/60">
                        {other.breed}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat area (right panel) ── */}
        <div
          className={`flex-1 flex-col rounded-3xl overflow-hidden ${
            selectedMatchId !== null ? "flex" : "hidden sm:flex"
          }`}
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}
        >
          {!selectedMatch ? (
            /* No chat selected */
            <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
              <div className="mb-4 text-5xl">💬</div>
              <h3 className="text-base font-bold text-[#0B1D3A]">เลือกบทสนทนา</h3>
              <p className="mt-1 text-xs text-[#6B5232]/50">
                คลิกที่ชื่อทางซ้ายเพื่อเปิดการสนทนา
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: "1px solid rgba(212,160,175,0.18)" }}
              >
                {/* Back button — mobile only */}
                <button
                  onClick={() => setSelectedMatchId(null)}
                  className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-[#F9C5D1]/30 sm:hidden"
                  aria-label="กลับ"
                >
                  <ChevronLeft className="size-4 text-[#0B1D3A]" />
                </button>

                {/* Other cat avatar */}
                {otherCat?.photoUrl ? (
                  <div className="relative size-9 flex-shrink-0 rounded-full overflow-hidden">
                    <Image
                      src={otherCat.photoUrl}
                      alt={otherCat.name}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  </div>
                ) : (
                  <div
                    className="flex size-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: "rgba(212,175,55,0.16)", color: "#D4AF37" }}
                  >
                    {otherCat?.name.slice(0, 2).toUpperCase() ?? "??"}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0B1D3A]">{otherCat?.name}</p>
                  <p className="text-[11px] text-[#6B5232]/60">{otherCat?.breed}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 gap-2">
                {messages.length === 0 && (
                  <div className="flex flex-1 items-center justify-center text-center">
                    <div>
                      <HeartHandshake className="mx-auto mb-2 size-8 text-[#D4AF37]/40" />
                      <p className="text-xs text-[#6B5232]/50">
                        เริ่มการสนทนากับ {otherCat?.name}
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((msg) => {
                  const isMine = msg.senderId === user?.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className="max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                        style={
                          isMine
                            ? {
                                background:
                                  "linear-gradient(135deg,#EDD060,#D4AF37)",
                                color: "#0B1D3A",
                                borderBottomRightRadius: "4px",
                              }
                            : {
                                background: "rgba(212,160,175,0.12)",
                                color: "#0B1D3A",
                                border: "1px solid rgba(212,160,175,0.18)",
                                borderBottomLeftRadius: "4px",
                              }
                        }
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

                <div ref={bottomRef} />
              </div>

              {/* Send form */}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-3 px-5 py-4"
                style={{ borderTop: "1px solid rgba(212,160,175,0.18)" }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="พิมพ์ข้อความ..."
                  className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    background: "rgba(212,140,165,0.08)",
                    border: "1px solid rgba(212,160,175,0.22)",
                    color: "#0B1D3A",
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex size-10 flex-shrink-0 items-center justify-center rounded-full transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)" }}
                >
                  <Send className="size-4 text-[#0B1D3A]" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
