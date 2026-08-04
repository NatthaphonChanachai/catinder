"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, MessageCircle, Sparkles } from "lucide-react";
import {
  collection, query, where, onSnapshot, doc, updateDoc, type DocumentData,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "@/i18n/navigation";

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt?: DocumentData;
}

function iconFor(type: string) {
  if (type === "match") return Heart;
  if (type === "message") return MessageCircle;
  return Sparkles;
}

function timeAgo(ts?: DocumentData): string {
  if (!ts?.toDate) return "";
  const diff = Date.now() - ts.toDate().getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "เมื่อสักครู่";
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชม.ที่แล้ว`;
  return `${Math.floor(h / 24)} วันที่แล้ว`;
}

export function NotificationsBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    // No orderBy → avoids a composite index; sorted client-side.
    const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Notif, "id">) }))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        .slice(0, 20);
      setNotifs(rows);
    }, () => {});
    return unsub;
  }, [user]);

  // close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const unread = notifs.filter((n) => !n.read).length;

  async function openNotif(n: Notif) {
    setOpen(false);
    if (!n.read && user) {
      updateDoc(doc(db, "notifications", n.id), { read: true }).catch(() => {});
    }
    if (n.link) router.push(n.link);
  }

  async function markAllRead() {
    await Promise.all(
      notifs.filter((n) => !n.read).map((n) => updateDoc(doc(db, "notifications", n.id), { read: true }).catch(() => {}))
    );
  }

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-9 items-center justify-center rounded-full transition-colors hover:bg-[#F9C5D1]/30"
        aria-label="การแจ้งเตือน"
      >
        <Bell className="size-5 text-[#6B5232]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ background: "#B04060", height: 18 }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl"
            style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.25)", boxShadow: "0 12px 40px rgba(11,29,58,0.15)" }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "rgba(212,160,175,0.18)" }}>
              <p className="text-sm font-bold text-[#0B1D3A]">การแจ้งเตือน</p>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[11px] font-semibold text-[#C4A020] hover:underline">อ่านทั้งหมด</button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell className="mb-2 size-8 text-[#D4AF37]/30" />
                  <p className="text-xs text-[#6B5232]/50">ยังไม่มีการแจ้งเตือน</p>
                </div>
              ) : (
                notifs.map((n) => {
                  const Icon = iconFor(n.type);
                  return (
                    <button key={n.id} onClick={() => openNotif(n)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#FFF5F8]"
                      style={{ background: n.read ? "transparent" : "rgba(212,175,55,0.06)" }}>
                      <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(212,175,55,0.14)" }}>
                        <Icon className="size-4 text-[#D4AF37]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#0B1D3A]">{n.title}</p>
                        <p className="truncate text-xs text-[#6B5232]/70">{n.body}</p>
                        <p className="mt-0.5 text-[10px] text-[#6B5232]/40">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && <span className="mt-1 size-2 flex-shrink-0 rounded-full" style={{ background: "#B04060" }} />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
