"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/shared/app-shell";
import {
  Shield, FileText, Headphones, Plus, Pencil, Trash2, X,
  Eye, EyeOff, Send, CheckCircle, AlertCircle, ChevronLeft,
  Loader2, Star, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FSArticle {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  imageUrl: string;
  readMinutes: number;
  published: boolean;
  featured: boolean;
  authorName: string;
  createdAt: DocumentData;
  updatedAt: DocumentData;
}

interface SupportChat {
  id: string;
  userName: string;
  userEmail: string;
  userPhoto: string;
  lastMessage: string;
  lastMessageAt: DocumentData;
  unreadAdmin: number;
}

interface SupportMessage {
  id: string;
  text: string;
  from: "user" | "admin";
  senderName: string;
  createdAt: DocumentData;
}

const EMPTY_ARTICLE = {
  title: "", excerpt: "", body: "", category: "health",
  imageUrl: "", readMinutes: 3, published: false, featured: false,
};

const CATEGORIES = [
  { value: "health", label: "สุขภาพ" },
  { value: "nutrition", label: "โภชนาการ" },
  { value: "behavior", label: "พฤติกรรม" },
  { value: "breeding", label: "การผสมพันธุ์" },
  { value: "vaccination", label: "วัคซีน" },
  { value: "grooming", label: "การดูแลขน" },
  { value: "heat-cycle", label: "วงจรสัด" },
  { value: "general", label: "ทั่วไป" },
];

// ─── Article Form Modal ───────────────────────────────────────────────────────

function ArticleModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Partial<FSArticle> & { id?: string };
  onClose: () => void;
  onSave: () => void;
}) {
  const { userProfile } = useAuth();
  const [form, setForm] = useState({ ...EMPTY_ARTICLE, ...initial });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.title.trim()) { setErr("กรุณาใส่หัวข้อบทความ"); return; }
    if (!form.excerpt.trim()) { setErr("กรุณาใส่สรุปบทความ"); return; }
    setSaving(true);
    setErr("");
    try {
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        body: form.body.trim(),
        category: form.category,
        imageUrl: form.imageUrl.trim(),
        readMinutes: Number(form.readMinutes) || 3,
        published: form.published,
        featured: form.featured,
        authorName: userProfile?.displayName ?? "Admin",
        updatedAt: serverTimestamp(),
      };
      if (initial?.id) {
        await updateDoc(doc(db, "articles", initial.id), payload);
      } else {
        await addDoc(collection(db, "articles"), { ...payload, createdAt: serverTimestamp(), likes: 0 });
      }
      onSave();
      onClose();
    } catch (e) {
      setErr("บันทึกไม่สำเร็จ: " + String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ background: "rgba(11,29,58,0.5)" }}>
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="relative w-full max-w-2xl overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{ background: "var(--background)", maxHeight: "92dvh" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-6 py-4" style={{ background: "var(--background)" }}>
          <h2 className="font-bold text-[#0B1D3A]">{initial?.id ? "แก้ไขบทความ" : "เพิ่มบทความใหม่"}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-muted"><X className="size-4" /></button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#0B1D3A]">หัวข้อบทความ *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
              placeholder="เช่น วัคซีนลูกแมว: คู่มือสำหรับมือใหม่" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#0B1D3A]">หมวดหมู่</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#0B1D3A]">เวลาอ่าน (นาที)</label>
              <input type="number" min={1} max={30} value={form.readMinutes} onChange={(e) => set("readMinutes", e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#0B1D3A]">สรุปบทความ *</label>
            <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2}
              className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
              placeholder="สรุปสั้นๆ 1-2 ประโยค" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#0B1D3A]">เนื้อหาบทความ</label>
            <textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={8}
              className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
              placeholder="เนื้อหาบทความ..." />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#0B1D3A]">URL รูปภาพ</label>
            <input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
              placeholder="https://..." />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div onClick={() => set("published", !form.published)}
                className={cn("h-5 w-9 rounded-full transition-colors", form.published ? "bg-[#D4AF37]" : "bg-border")}>
                <div className={cn("mt-0.5 ml-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", form.published ? "translate-x-4" : "translate-x-0")} />
              </div>
              <span className="text-sm font-medium text-[#0B1D3A]">เผยแพร่</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div onClick={() => set("featured", !form.featured)}
                className={cn("h-5 w-9 rounded-full transition-colors", form.featured ? "bg-[#D4AF37]" : "bg-border")}>
                <div className={cn("mt-0.5 ml-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", form.featured ? "translate-x-4" : "translate-x-0")} />
              </div>
              <span className="text-sm font-medium text-[#0B1D3A]">แนะนำ (Featured)</span>
            </label>
          </div>

          {err && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{err}</p>}

          <button onClick={handleSave} disabled={saving}
            className="w-full rounded-full py-3 text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            {saving ? <Loader2 className="mx-auto size-4 animate-spin" /> : initial?.id ? "บันทึกการแก้ไข" : "เพิ่มบทความ"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Articles Tab ─────────────────────────────────────────────────────────────

function ArticlesTab() {
  const [articles, setArticles] = useState<FSArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalArticle, setModalArticle] = useState<(Partial<FSArticle> & { id?: string }) | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FSArticle)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  async function togglePublished(id: string, current: boolean) {
    await updateDoc(doc(db, "articles", id), { published: !current, updatedAt: serverTimestamp() });
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`ลบบทความ "${title}" ใช่ไหม?`)) return;
    await deleteDoc(doc(db, "articles", id));
  }

  const catLabel = (v: string) => CATEGORIES.find((c) => c.value === v)?.label ?? v;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{articles.length} บทความ</p>
        <button onClick={() => { setModalArticle(null); setShowModal(true); }}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
          <Plus className="size-3.5" /> เพิ่มบทความ
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-[#D4AF37]" /></div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="mb-3 size-10 text-[#D4AF37]/30" />
          <p className="text-sm font-bold text-[#0B1D3A]">ยังไม่มีบทความ</p>
          <p className="text-xs text-muted-foreground">กดปุ่ม &quot;เพิ่มบทความ&quot; เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-2xl border border-border p-4">
              {a.imageUrl && (
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", a.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                    {a.published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                  </span>
                  {a.featured && <Star className="size-3 fill-[#D4AF37] text-[#D4AF37]" />}
                  <span className="rounded-full bg-[var(--warm-ivory)] px-2 py-0.5 text-[10px] text-muted-foreground">{catLabel(a.category)}</span>
                </div>
                <p className="mt-1 truncate text-sm font-bold text-[#0B1D3A]">{a.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{a.excerpt}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1">
                <button onClick={() => togglePublished(a.id, a.published)} title={a.published ? "ซ่อน" : "เผยแพร่"}
                  className="rounded-full p-1.5 hover:bg-muted transition-colors">
                  {a.published ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-[#D4AF37]" />}
                </button>
                <button onClick={() => { setModalArticle(a); setShowModal(true); }}
                  className="rounded-full p-1.5 hover:bg-muted transition-colors">
                  <Pencil className="size-4 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(a.id, a.title)}
                  className="rounded-full p-1.5 hover:bg-muted transition-colors">
                  <Trash2 className="size-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <ArticleModal
            initial={modalArticle ?? undefined}
            onClose={() => setShowModal(false)}
            onSave={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Support Tab ──────────────────────────────────────────────────────────────

function SupportTab() {
  const { userProfile } = useAuth();
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [selected, setSelected] = useState<SupportChat | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [rulesError, setRulesError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, "supportChats"), orderBy("lastMessageAt", "desc"));
    const unsub = onSnapshot(q,
      (snap) => {
        setChats(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportChat)));
        setLoadingChats(false);
        setRulesError(false);
      },
      () => { setRulesError(true); setLoadingChats(false); }
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (!selected) return;
    const q = query(collection(db, "supportChats", selected.id, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportMessage)));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return unsub;
  }, [selected]);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !selected || sending) return;
    setSending(true);
    const text = reply.trim();
    setReply("");
    try {
      await addDoc(collection(db, "supportChats", selected.id, "messages"), {
        text, from: "admin",
        senderName: userProfile?.displayName ?? "ทีมงาน Catinder",
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "supportChats", selected.id), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        unreadAdmin: 0,
      });
    } finally {
      setSending(false);
    }
  }

  function toDate(ts: DocumentData): Date {
    if (!ts) return new Date();
    if (typeof ts.toDate === "function") return ts.toDate() as Date;
    return new Date(ts as unknown as string);
  }

  function formatTime(ts: DocumentData) {
    return toDate(ts).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(ts: DocumentData) {
    return toDate(ts).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  }

  if (rulesError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-red-500" />
          <div>
            <p className="font-bold text-red-700">Firestore Rules ไม่อนุญาต</p>
            <p className="mt-1 text-sm text-red-600">เพิ่ม rule ใน Firebase Console → Firestore → Rules:</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-red-100 p-3 text-xs text-red-800">
{`match /supportChats/{uid} {
  allow read, write: if request.auth != null
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  match /messages/{msgId} {
    allow read, write: if request.auth != null
      && (request.auth.uid == uid
        || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Mobile: show chat list or detail
  if (selected) {
    return (
      <div className="flex flex-col" style={{ height: "calc(100dvh - 200px)" }}>
        {/* Header */}
        <div className="mb-3 flex items-center gap-3">
          <button onClick={() => setSelected(null)} className="rounded-full p-1.5 hover:bg-muted transition-colors">
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-[#0B1D3A]">{selected.userName || "ไม่ระบุชื่อ"}</p>
            <p className="truncate text-xs text-muted-foreground">{selected.userEmail}</p>
          </div>
          <CheckCircle className="size-4 flex-shrink-0 text-green-400" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.from === "admin" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5",
                m.from === "admin"
                  ? "rounded-br-sm text-[#0B1D3A]"
                  : "rounded-bl-sm bg-muted text-foreground")}
                style={m.from === "admin" ? { background: "linear-gradient(135deg,#EDD060,#D4AF37)" } : {}}>
                <p className="text-sm">{m.text}</p>
                <p className={cn("mt-1 text-[10px]", m.from === "admin" ? "text-[#0B1D3A]/60" : "text-muted-foreground")}>
                  {formatTime(m.createdAt)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply box */}
        <form onSubmit={sendReply} className="mt-3 flex gap-2">
          <input value={reply} onChange={(e) => setReply(e.target.value)}
            placeholder="ตอบกลับลูกค้า..."
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
            autoFocus />
          <button type="submit" disabled={!reply.trim() || sending}
            className="flex-shrink-0 rounded-full p-2.5 disabled:opacity-40 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)" }}>
            <Send className="size-4 text-[#0B1D3A]" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      {loadingChats ? (
        <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-[#D4AF37]" /></div>
      ) : chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Headphones className="mb-3 size-10 text-[#D4AF37]/30" />
          <p className="text-sm font-bold text-[#0B1D3A]">ยังไม่มีข้อความจากลูกค้า</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((c) => (
            <button key={c.id} onClick={() => setSelected(c)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left hover:bg-muted/40 transition-colors">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--petal-pink)]/40 text-sm font-bold text-[#4A1030]">
                {(c.userName || "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-bold text-[#0B1D3A]">{c.userName || "ไม่ระบุชื่อ"}</p>
                  <span className="ml-2 flex-shrink-0 text-[10px] text-muted-foreground">{formatDate(c.lastMessageAt)}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.lastMessage || "..."}</p>
              </div>
              {c.unreadAdmin > 0 && (
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: "#D4AF37" }}>{c.unreadAdmin}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Content ───────────────────────────────────────────────────────

type Tab = "articles" | "support";

export function AdminContent() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("articles");

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-[#D4AF37]" />
        </div>
      </AppShell>
    );
  }

  if (!user || !isAdmin) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Shield className="mb-4 size-12 text-[#D4AF37]/40" />
          <h2 className="text-lg font-extrabold text-[#0B1D3A]">เฉพาะ Admin เท่านั้น</h2>
          <p className="mt-2 text-sm text-muted-foreground">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </AppShell>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "articles", label: "ข่าวสาร", icon: <FileText className="size-4" /> },
    { key: "support", label: "ตอบลูกค้า", icon: <Headphones className="size-4" /> },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl pb-8">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)" }}>
            <Shield className="size-5 text-[#0B1D3A]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#0B1D3A]">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">จัดการข่าวสารและดูแลลูกค้า</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-2 rounded-2xl border border-border p-1" style={{ background: "var(--warm-ivory)" }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all",
                tab === t.key ? "bg-white text-[#0B1D3A] shadow-sm" : "text-muted-foreground hover:text-[#0B1D3A]")}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {tab === "articles" ? <ArticlesTab /> : <SupportTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
