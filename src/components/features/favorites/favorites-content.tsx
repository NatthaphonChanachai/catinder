"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Bookmark, HeartHandshake, Trash2, Loader2, MessageCircle } from "lucide-react";
import {
  collection, query, where, onSnapshot, doc, getDoc, deleteDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface FavCat {
  likeId: string;      // the likes doc id (fromCat_toCat) — used to remove
  catId: string;
  name: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  photo: string;
  matched: boolean;    // whether it became a mutual match
}

function ageLabel(months: number): string {
  if (months < 12) return `${months} เดือน`;
  const y = Math.floor(months / 12);
  return `${y} ปี`;
}

export function FavoritesContent() {
  const { user } = useAuth();
  const [favs, setFavs] = useState<FavCat[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    // Cats this user liked in Discover = their "saved / favorites" list.
    const q = query(collection(db, "likes"), where("fromUserId", "==", user.uid));
    const unsub = onSnapshot(q, async (snap) => {
      const rows = await Promise.all(
        snap.docs.map(async (likeDoc) => {
          const data = likeDoc.data();
          const catId: string = data.toCatId;
          try {
            const catSnap = await getDoc(doc(db, "cats", catId));
            if (!catSnap.exists()) return null;
            const c = catSnap.data();
            // matched if the reverse like exists (mutual)
            let matched = false;
            try {
              const rev = await getDoc(doc(db, "likes", `${data.toCatId}_${data.fromCatId}`));
              matched = rev.exists();
            } catch {
              /* ignore */
            }
            return {
              likeId: likeDoc.id,
              catId,
              name: c.name ?? "แมว",
              breed: c.breed ?? "",
              age: c.age ?? 0,
              gender: c.gender ?? "female",
              photo: c.photos?.[0] ?? "",
              matched,
            } as FavCat;
          } catch {
            return null;
          }
        })
      );
      setFavs(rows.filter((r): r is FavCat => r !== null));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  async function remove(likeId: string) {
    setRemovingId(likeId);
    try {
      await deleteDoc(doc(db, "likes", likeId));
      // onSnapshot will drop it from the list
    } catch {
      setRemovingId(null);
    }
  }

  return (
    <AppShell>
      <m.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-4xl space-y-5">

        {/* Header */}
        <m.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#0B1D3A]">รายการโปรด</h1>
            <p className="text-xs text-[#6B5232]/60">แมวที่คุณกดถูกใจ {favs.length} ตัว</p>
          </div>
          <Link href="/discover"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            <HeartHandshake className="size-4" /> ค้นหาเพิ่ม
          </Link>
        </m.div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="size-6 animate-spin text-[#D4AF37]" />
          </div>
        ) : favs.length === 0 ? (
          <m.div variants={fadeUp} className="flex flex-col items-center justify-center rounded-3xl py-20 text-center"
            style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
            <Bookmark className="mb-4 size-12 text-[#D4AF37]/40" />
            <h3 className="text-base font-bold text-[#0B1D3A]">ยังไม่มีรายการโปรด</h3>
            <p className="mt-1 text-xs text-[#6B5232]/50">ปัดขวาแมวที่คุณชอบใน &quot;จับคู่แมว&quot; แล้วจะมาอยู่ที่นี่</p>
            <Link href="/discover" className="mt-4 rounded-full px-5 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
              เริ่มค้นหา
            </Link>
          </m.div>
        ) : (
          <m.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {favs.map((f) => (
                <m.div key={f.likeId} layout
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="group overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
                  <div className="relative h-44 overflow-hidden bg-[#FFF5F8]">
                    {f.photo ? (
                      <Image src={f.photo} alt={f.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Bookmark className="size-10 text-[#D4AF37]/25" />
                      </div>
                    )}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,29,58,0.55) 0%, transparent 50%)" }} />
                    {/* Matched badge */}
                    {f.matched && (
                      <div className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-extrabold"
                        style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                        แมตช์แล้ว ✓
                      </div>
                    )}
                    {/* Name */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="truncate font-bold text-white">
                        {f.name} {f.gender === "female" ? "♀" : "♂"}
                      </p>
                      <p className="truncate text-xs text-white/70">{f.breed}{f.age ? ` · ${ageLabel(f.age)}` : ""}</p>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 p-3">
                    {f.matched ? (
                      <Link href="/chat"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                        <MessageCircle className="size-3.5" /> แชท
                      </Link>
                    ) : (
                      <div className="flex flex-1 items-center justify-center rounded-xl py-2 text-[11px] font-semibold"
                        style={{ background: "rgba(212,175,55,0.10)", color: "#6B5232" }}>
                        รอการตอบรับ
                      </div>
                    )}
                    <button onClick={() => remove(f.likeId)} disabled={removingId === f.likeId}
                      className="flex items-center justify-center rounded-xl px-3 py-2 text-[11px] font-bold hover:opacity-80 disabled:opacity-50"
                      style={{ background: "rgba(212,140,165,0.12)", color: "#B04060" }}>
                      {removingId === f.likeId ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                    </button>
                  </div>
                </m.div>
              ))}
            </AnimatePresence>
          </m.div>
        )}
      </m.div>
    </AppShell>
  );
}
