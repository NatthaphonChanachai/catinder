"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Bookmark, HeartHandshake, Trash2, Loader2, MessageCircle, Heart, Sparkles,
} from "lucide-react";
import {
  collection, query, where, onSnapshot, doc, getDoc, deleteDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LikedCat {
  likeId: string;
  catId: string;
  name: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  photo: string;
  matched: boolean;
}

interface MatchCat {
  id: string;
  name: string;
  breed: string;
  photoUrl: string;
  ownerId: string;
}
interface MatchRow {
  matchId: string;
  myCat?: MatchCat;
  partnerCat?: MatchCat;
}

function ageLabel(months: number): string {
  if (!months) return "";
  if (months < 12) return `${months} เดือน`;
  return `${Math.floor(months / 12)} ปี`;
}

type Tab = "liked" | "matched";

// ─── Main ─────────────────────────────────────────────────────────────────────

export function MatchesContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("matched");

  const [liked, setLiked] = useState<LikedCat[]>([]);
  const [loadingLiked, setLoadingLiked] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Liked cats (Discover right-swipes)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "likes"), where("fromUserId", "==", user.uid));
    const unsub = onSnapshot(q, async (snap) => {
      const rows = await Promise.all(snap.docs.map(async (likeDoc) => {
        const data = likeDoc.data();
        try {
          const catSnap = await getDoc(doc(db, "cats", data.toCatId));
          if (!catSnap.exists()) return null;
          const c = catSnap.data();
          let matched = false;
          try {
            const rev = await getDoc(doc(db, "likes", `${data.toCatId}_${data.fromCatId}`));
            matched = rev.exists();
          } catch { /* ignore */ }
          return {
            likeId: likeDoc.id, catId: data.toCatId,
            name: c.name ?? "แมว", breed: c.breed ?? "", age: c.age ?? 0,
            gender: c.gender ?? "female", photo: c.photos?.[0] ?? "", matched,
          } as LikedCat;
        } catch { return null; }
      }));
      setLiked(rows.filter((r): r is LikedCat => r !== null));
      setLoadingLiked(false);
    }, () => setLoadingLiked(false));
    return unsub;
  }, [user]);

  // Matches
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "matches"), where("users", "array-contains", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setMatches(snap.docs.map((d) => {
        const cats: MatchCat[] = d.data().cats ?? [];
        return {
          matchId: d.id,
          myCat: cats.find((c) => c.ownerId === user.uid),
          partnerCat: cats.find((c) => c.ownerId !== user.uid),
        };
      }));
      setLoadingMatches(false);
    }, () => setLoadingMatches(false));
    return unsub;
  }, [user]);

  async function removeLike(likeId: string) {
    setRemovingId(likeId);
    try { await deleteDoc(doc(db, "likes", likeId)); }
    catch { setRemovingId(null); }
  }

  // Pending = liked but not yet matched
  const pending = liked.filter((l) => !l.matched);

  const tabs: { key: Tab; label: string; count: number; icon: typeof Heart }[] = [
    { key: "matched", label: "แมตช์แล้ว", count: matches.length, icon: HeartHandshake },
    { key: "liked", label: "ที่ถูกใจ", count: pending.length, icon: Heart },
  ];

  return (
    <AppShell>
      <m.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-4xl space-y-5">

        {/* Header */}
        <m.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#0B1D3A]">คู่ของฉัน</h1>
            <p className="text-xs text-[#6B5232]/60">แมวที่คุณถูกใจและที่แมตช์กันแล้ว</p>
          </div>
          <Link href="/discover"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            <Sparkles className="size-4" /> จับคู่เพิ่ม
          </Link>
        </m.div>

        {/* Tabs */}
        <m.div variants={fadeUp} className="flex gap-2 rounded-2xl p-1"
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition-all",
                tab === t.key ? "text-[#0B1D3A]" : "text-[#6B5232]/60 hover:text-[#0B1D3A]")}
              style={tab === t.key ? { background: "linear-gradient(135deg,#EDD060,#D4AF37)" } : {}}>
              <t.icon className="size-4" /> {t.label}
              <span className={cn("rounded-full px-1.5 text-[10px]", tab === t.key ? "bg-[#0B1D3A]/15" : "bg-[#D4AF37]/15")}>{t.count}</span>
            </button>
          ))}
        </m.div>

        <AnimatePresence mode="wait">
          {tab === "matched" ? (
            <m.div key="matched" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              {loadingMatches ? (
                <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-[#D4AF37]" /></div>
              ) : matches.length === 0 ? (
                <EmptyState icon={HeartHandshake} title="ยังไม่มีแมตช์" sub="เมื่อแมวที่คุณถูกใจ ถูกใจกลับ จะเกิดแมตช์และมาอยู่ที่นี่" />
              ) : (
                <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
                  <div className="divide-y" style={{ borderColor: "rgba(212,160,175,0.15)" }}>
                    {matches.map((m) => (
                      <div key={m.matchId} className="flex items-center gap-3 px-4 py-3">
                        <div className="relative size-12 flex-shrink-0 overflow-hidden rounded-xl bg-[#FFF5F8]">
                          {m.partnerCat?.photoUrl ? (
                            <Image src={m.partnerCat.photoUrl} alt={m.partnerCat.name} fill className="object-cover" sizes="48px" unoptimized />
                          ) : (
                            <div className="flex h-full items-center justify-center"><HeartHandshake className="size-5 text-[#D4AF37]/40" /></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[#0B1D3A]">{m.partnerCat?.name ?? "แมว"}</p>
                          <p className="truncate text-xs text-[#6B5232]/60">
                            {m.partnerCat?.breed ?? ""}{m.myCat ? ` · จับคู่กับ ${m.myCat.name}` : ""}
                          </p>
                        </div>
                        <Link href="/chat"
                          className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-bold hover:opacity-90 transition-opacity"
                          style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                          <MessageCircle className="size-3.5" /> แชท
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </m.div>
          ) : (
            <m.div key="liked" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              {loadingLiked ? (
                <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-[#D4AF37]" /></div>
              ) : pending.length === 0 ? (
                <EmptyState icon={Heart} title="ยังไม่มีแมวที่ถูกใจ" sub="ปัดขวาแมวที่คุณชอบใน 'จับคู่' แล้วจะมาอยู่ที่นี่ รอเขาถูกใจกลับ" />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {pending.map((f) => (
                      <m.div key={f.likeId} layout
                        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="group overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
                        style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
                        <div className="relative h-44 overflow-hidden bg-[#FFF5F8]">
                          {f.photo ? (
                            <Image src={f.photo} alt={f.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                          ) : (
                            <div className="flex h-full items-center justify-center"><Bookmark className="size-10 text-[#D4AF37]/25" /></div>
                          )}
                          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,29,58,0.55) 0%, transparent 50%)" }} />
                          <div className="absolute bottom-3 left-3 right-3">
                            <p className="truncate font-bold text-white">{f.name} {f.gender === "female" ? "♀" : "♂"}</p>
                            <p className="truncate text-xs text-white/70">{f.breed}{f.age ? ` · ${ageLabel(f.age)}` : ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3">
                          <div className="flex flex-1 items-center justify-center rounded-xl py-2 text-[11px] font-semibold"
                            style={{ background: "rgba(212,175,55,0.10)", color: "#6B5232" }}>
                            รอการตอบรับ
                          </div>
                          <button onClick={() => removeLike(f.likeId)} disabled={removingId === f.likeId}
                            className="flex items-center justify-center rounded-xl px-3 py-2 text-[11px] font-bold hover:opacity-80 disabled:opacity-50"
                            style={{ background: "rgba(212,140,165,0.12)", color: "#B04060" }}>
                            {removingId === f.likeId ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                          </button>
                        </div>
                      </m.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </AppShell>
  );
}

function EmptyState({ icon: Icon, title, sub }: { icon: typeof Heart; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl py-20 text-center"
      style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
      <Icon className="mb-4 size-12 text-[#D4AF37]/40" />
      <h3 className="text-base font-bold text-[#0B1D3A]">{title}</h3>
      <p className="mt-1 max-w-xs text-xs text-[#6B5232]/50">{sub}</p>
      <Link href="/discover" className="mt-4 rounded-full px-5 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
        style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
        เริ่มจับคู่
      </Link>
    </div>
  );
}
