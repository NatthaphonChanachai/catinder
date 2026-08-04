"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  collection, doc, query, orderBy, onSnapshot, addDoc, setDoc,
  serverTimestamp, increment, type DocumentData,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { Send, Headphones, Loader2, ArrowLeft, Phone, Mail } from "lucide-react";

interface Msg {
  id: string;
  text: string;
  from: "user" | "admin";
  senderName?: string;
  createdAt?: DocumentData;
}

export function SupportContent() {
  const { user, userProfile, loading } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "supportChats", user.uid, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Msg, "id">) })));
      setLoadingMsgs(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    }, () => setLoadingMsgs(false));
    return unsub;
  }, [user]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !user || sending) return;
    setSending(true);
    const body = text.trim();
    setText("");
    try {
      const name = userProfile?.displayName ?? user.displayName ?? user.email?.split("@")[0] ?? "ผู้ใช้";
      await addDoc(collection(db, "supportChats", user.uid, "messages"), {
        text: body, from: "user", senderName: name, createdAt: serverTimestamp(),
      });
      // create/update the parent thread so it appears in the admin inbox
      await setDoc(doc(db, "supportChats", user.uid), {
        userName: name,
        userEmail: userProfile?.email ?? user.email ?? "",
        userPhoto: user.photoURL ?? "",
        lastMessage: body,
        lastMessageAt: serverTimestamp(),
        unreadAdmin: increment(1),
      }, { merge: true });
    } catch (err) {
      console.error("[support] send:", err);
      setText(body); // restore on failure
    } finally {
      setSending(false);
    }
  }

  // ── Loading ──
  if (loading) {
    return <Shell><div className="flex h-64 items-center justify-center"><Loader2 className="size-6 animate-spin text-[#D4AF37]" /></div></Shell>;
  }

  // ── Not logged in ──
  if (!user) {
    return (
      <Shell>
        <div className="rounded-3xl p-8 text-center" style={cardStyle}>
          <Headphones className="mx-auto mb-4 size-12 text-[#D4AF37]" />
          <h2 className="font-heading text-xl font-bold text-[#0B1D3A]">แชทกับทีมงาน Catinder</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[#6B5232]">
            เข้าสู่ระบบเพื่อเริ่มแชทกับทีมงาน — เราตอบทุกข้อความภายใน 24 ชั่วโมง
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/login?next=/support" className="rounded-full px-6 py-3 text-sm font-bold"
              style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>เข้าสู่ระบบ</Link>
            <Link href="/register?next=/support" className="rounded-full px-6 py-3 text-sm font-semibold"
              style={{ border: "1.5px solid rgba(212,175,55,0.4)", color: "#C4A020" }}>สมัครฟรี</Link>
          </div>
          <div className="mt-6 border-t pt-5 text-sm text-[#6B5232]" style={{ borderColor: "rgba(212,160,175,0.25)" }}>
            หรือติดต่อทางอีเมล <a href="mailto:support@catinder.app" className="font-semibold underline">support@catinder.app</a>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Chat ──
  return (
    <Shell>
      <div className="flex flex-col overflow-hidden rounded-3xl" style={{ ...cardStyle, height: "min(70vh, 560px)" }}>
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-5 py-3.5" style={{ borderColor: "rgba(212,160,175,0.20)" }}>
          <div className="flex size-9 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)" }}>
            <Headphones className="size-4 text-[#0B1D3A]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0B1D3A]">ทีมงาน Catinder</p>
            <p className="text-[11px] text-[#6B5232]/60">ตอบภายใน 24 ชม.</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ background: "#FFF5F8" }}>
          {loadingMsgs ? (
            <div className="flex h-full items-center justify-center"><Loader2 className="size-5 animate-spin text-[#D4AF37]" /></div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Headphones className="mb-2 size-8 text-[#D4AF37]/30" />
              <p className="text-sm font-bold text-[#0B1D3A]">สวัสดีค่ะ 👋</p>
              <p className="mt-1 max-w-xs text-xs text-[#6B5232]/60">มีอะไรให้เราช่วยไหมคะ? พิมพ์ข้อความด้านล่างได้เลย</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm"
                  style={m.from === "user"
                    ? { background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A", borderBottomRightRadius: 4 }
                    : { background: "#FFFAFC", color: "#4A3820", border: "1px solid rgba(212,160,175,0.25)", borderBottomLeftRadius: 4 }}>
                  {m.from === "admin" && <p className="mb-0.5 text-[10px] font-bold text-[#B04060]">ทีมงาน</p>}
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={send} className="flex gap-2 border-t px-3 py-3" style={{ borderColor: "rgba(212,160,175,0.20)" }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="พิมพ์ข้อความ..."
            className="flex-1 rounded-full px-4 py-2.5 text-sm text-[#0B1D3A] outline-none"
            style={{ background: "#FFF5F8", border: "1px solid rgba(212,160,175,0.30)" }} />
          <button type="submit" disabled={!text.trim() || sending}
            className="flex size-11 flex-shrink-0 items-center justify-center rounded-full disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)" }}>
            {sending ? <Loader2 className="size-4 animate-spin text-[#0B1D3A]" /> : <Send className="size-4 text-[#0B1D3A]" />}
          </button>
        </form>
      </div>

      {/* Other channels */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3" style={cardStyle}>
          <Mail className="size-4 flex-shrink-0 text-[#D4AF37]" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#6B5232]/60">อีเมล</p>
            <a href="mailto:support@catinder.app" className="block truncate text-xs font-bold text-[#0B1D3A]">support@catinder.app</a>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3" style={cardStyle}>
          <Phone className="size-4 flex-shrink-0 text-[#D4AF37]" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#6B5232]/60">โทร</p>
            <p className="text-xs font-bold text-[#6B5232]/50">เร็วๆ นี้</p>
          </div>
        </div>
      </div>
    </Shell>
  );
}

const cardStyle = {
  background: "#FFFAFC",
  border: "1px solid rgba(212,160,175,0.22)",
  boxShadow: "0 4px 24px rgba(11,29,58,0.05)",
} as React.CSSProperties;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#FFF5F8" }}>
      <div className="mx-auto max-w-lg px-4 py-8 md:py-12">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70" style={{ color: "#B04060" }}>
          <ArrowLeft className="size-4" /> กลับหน้าแรก
        </Link>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
