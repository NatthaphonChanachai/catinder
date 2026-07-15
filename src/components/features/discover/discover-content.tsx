"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  doc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/shared/app-shell";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { normalizeCatRecord, type CatRecord } from "@/lib/cat-record";
import {
  HeartHandshake,
  X,
  Heart,
  Info,
  PawPrint,
  Loader2,
  Shield,
  CheckCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Cat = CatRecord;

interface MatchModalData {
  myCat: Cat;
  theirCat: Cat;
}

// ─── Animation variants ───────────────────────────────────────────────────────

const cardVariants: Variants = {
  enter: { opacity: 0, scale: 0.93, x: 60 },
  center: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir: string) => ({
    opacity: 0,
    x: dir === "left" ? -320 : 320,
    scale: 0.9,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAge(months: number): string {
  if (months < 12) return `${months} เดือน`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m ? `${y} ปี ${m} เดือน` : `${y} ปี`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DiscoverContent() {
  const { user, userProfile } = useAuth();

  const [ownCats, setOwnCats] = useState<Cat[]>([]);
  const [activeCatIndex, setActiveCatIndex] = useState(0);
  const [queue, setQueue] = useState<Cat[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [exitDir, setExitDir] = useState<"left" | "right">("left");
  const [isLoading, setIsLoading] = useState(true);
  const [matchModal, setMatchModal] = useState<MatchModalData | null>(null);
  const [infoModal, setInfoModal] = useState<Cat | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const activeCat: Cat | undefined = ownCats[activeCatIndex];
  const currentCat: Cat | undefined = queue[queueIndex];

  // ─── Load queue for a given liker cat ──────────────────────────────────────

  const loadQueue = useCallback(
    async (liker: Cat) => {
      if (!user) return;
      setIsLoading(true);
      try {
        // Load all cats not owned by the current user (limit 50)
        const allSnap = await getDocs(
          query(collection(db, "cats"), limit(50))
        );
        const allCats: Cat[] = [];
        allSnap.forEach((d) => {
          const data = d.data();
          if (data.ownerId !== user.uid) {
            allCats.push(normalizeCatRecord(d.id, data));
          }
        });

        // Load already-liked and already-passed cat IDs in parallel
        const [likedSnap, passedSnap] = await Promise.all([
          getDocs(
            query(collection(db, "likes"), where("fromCatId", "==", liker.id))
          ),
          getDocs(
            query(collection(db, "passes"), where("fromCatId", "==", liker.id))
          ),
        ]);

        const skipIds = new Set<string>();
        likedSnap.forEach((d) => skipIds.add(d.data().toCatId as string));
        passedSnap.forEach((d) => skipIds.add(d.data().toCatId as string));

        setQueue(allCats.filter((c) => !skipIds.has(c.id)));
        setQueueIndex(0);
      } catch (err) {
        console.error("[Discover] loadQueue error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // ─── Load user's own cats on mount ─────────────────────────────────────────

  useEffect(() => {
    if (!user) {
      setOwnCats([]);
      setQueue([]);
      setIsLoading(false);
      return;
    }
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "cats"), where("ownerId", "==", user.uid))
        );
        const cats: Cat[] = [];
        snap.forEach((d) => cats.push(normalizeCatRecord(d.id, d.data())));
        setOwnCats(cats);
        const first = cats[0];
        if (first) {
          await loadQueue(first);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[Discover] loadOwnCats error:", err);
        setIsLoading(false);
      }
    })();
  }, [user, loadQueue]);

  // ─── Switch active liker cat ────────────────────────────────────────────────

  const handleSwitchCat = (index: number) => {
    setActiveCatIndex(index);
    const cat = ownCats[index];
    if (cat) void loadQueue(cat);
  };

  // ─── Advance queue ──────────────────────────────────────────────────────────

  const advance = (dir: "left" | "right") => {
    setExitDir(dir);
    setQueueIndex((i) => i + 1);
  };

  // ─── Pass ───────────────────────────────────────────────────────────────────

  const handlePass = async () => {
    const liker = activeCat;
    const target = currentCat;
    if (!liker || !target || actionLoading) return;
    setActionLoading(true);
    try {
      await setDoc(doc(db, "passes", `${liker.id}_${target.id}`), {
        fromCatId: liker.id,
        toCatId: target.id,
        fromUserId: user?.uid ?? "",
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("[Discover] pass error:", err);
    }
    setActionLoading(false);
    advance("left");
  };

  // ─── Like ───────────────────────────────────────────────────────────────────

  const handleLike = async () => {
    const liker = activeCat;
    const target = currentCat;
    if (!liker || !target || !user || actionLoading) return;
    setActionLoading(true);
    try {
      // Write like
      await setDoc(doc(db, "likes", `${liker.id}_${target.id}`), {
        fromCatId: liker.id,
        toCatId: target.id,
        fromUserId: user.uid,
        toUserId: target.ownerId,
        createdAt: serverTimestamp(),
      });

      // Check mutual like
      const mutualSnap = await getDoc(
        doc(db, "likes", `${target.id}_${liker.id}`)
      );

      if (mutualSnap.exists()) {
        // Create match!
        const matchId = [liker.id, target.id].sort().join("_");
        await setDoc(doc(db, "matches", matchId), {
          users: [user.uid, target.ownerId],
          cats: [
            {
              id: liker.id,
              name: liker.name,
              breed: liker.breed,
              photoUrl: liker.photos[0] ?? "",
              ownerId: user.uid,
            },
            {
              id: target.id,
              name: target.name,
              breed: target.breed,
              photoUrl: target.photos[0] ?? "",
              ownerId: target.ownerId,
            },
          ],
          createdAt: serverTimestamp(),
        });

        // Send email notification to the other cat's owner (fire-and-forget)
        if (userProfile?.email) {
          fetch("/api/match-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              toEmail: target.ownerEmail ?? "",
              toName: target.ownerName,
              matchedCatName: target.name,
              myName: liker.name,
            }),
          }).catch(() => {});
        }

        advance("right");
        // Small delay so card exit animation starts before overlay mounts
        setTimeout(
          () => setMatchModal({ myCat: liker, theirCat: target }),
          350
        );
      } else {
        advance("right");
      }
    } catch (err) {
      console.error("[Discover] like error:", err);
      advance("right");
    }
    setActionLoading(false);
  };

  // ─── Loading state ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="size-8 animate-spin text-[#D4AF37]" />
        </div>
      </AppShell>
    );
  }

  // ─── No own cats ────────────────────────────────────────────────────────────

  if (ownCats.length === 0) {
    return (
      <AppShell>
        <div className="mx-auto max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-3xl px-6 py-20 text-center"
            style={{
              background: "#FFFAFC",
              border: "1px solid rgba(212,160,175,0.25)",
            }}
          >
            <PawPrint className="mb-4 size-14 text-[#D4AF37]/40" />
            <h2 className="mb-2 text-lg font-extrabold text-[#0B1D3A]">
              เพิ่มแมวก่อน
            </h2>
            <p className="mb-6 text-sm text-[#6B5232]/60">
              เพิ่มโปรไฟล์แมวของคุณ เพื่อเริ่มจับคู่
            </p>
            <Link
              href="/cats"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#EDD060,#D4AF37)",
                color: "#0B1D3A",
              }}
            >
              <HeartHandshake className="size-4" /> เพิ่มโปรไฟล์แมว
            </Link>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  // ─── Main render ────────────────────────────────────────────────────────────

  return (
    <AppShell>
      <div className="mx-auto max-w-sm">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-extrabold text-[#0B1D3A]">จับคู่แมว</h1>
          <p className="text-xs text-[#6B5232]/60">
            {activeCat ? `จับคู่ให้ ${activeCat.name}` : "เลือกแมวที่ต้องการจับคู่"}
          </p>
        </div>

        {/* Cat selector (only shown when user has >1 cat) */}
        {ownCats.length > 1 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {ownCats.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => handleSwitchCat(i)}
                className="flex flex-shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-all"
                style={
                  i === activeCatIndex
                    ? {
                        background: "linear-gradient(135deg,#EDD060,#D4AF37)",
                        color: "#0B1D3A",
                      }
                    : {
                        background: "rgba(212,160,175,0.12)",
                        color: "#6B5232",
                        border: "1px solid rgba(212,160,175,0.25)",
                      }
                }
              >
                {cat.photos[0] && (
                  <span className="relative inline-block h-5 w-5 flex-shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={cat.photos[0]}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="20px"
                    />
                  </span>
                )}
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Swipe card area */}
        <div className="relative" style={{ height: 480 }}>
          <AnimatePresence mode="wait" custom={exitDir}>
            {currentCat ? (
              <motion.div
                key={currentCat.id}
                custom={exitDir}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl"
                style={{
                  background: "#FFFAFC",
                  border: "1px solid rgba(212,160,175,0.22)",
                  boxShadow: "0 8px 40px rgba(11,29,58,0.10)",
                }}
              >
                {/* Photo section */}
                <div className="relative flex-shrink-0" style={{ height: "58%" }}>
                  {currentCat.photos[0] ? (
                    <Image
                      src={currentCat.photos[0]}
                      alt={currentCat.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 384px"
                      priority
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center"
                      style={{ background: "rgba(212,160,175,0.08)" }}
                    >
                      <PawPrint className="size-16 text-[#D4AF37]/25" />
                    </div>
                  )}

                  {/* Bottom gradient overlay */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-20"
                    style={{
                      background:
                        "linear-gradient(transparent,rgba(11,29,58,0.22))",
                    }}
                  />

                  {/* Vaccinated badge (top-left) */}
                  {currentCat.vaccinated && (
                    <div className="absolute left-3 top-3">
                      <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                        style={{ background: "rgba(22,163,74,0.85)", color: "#fff" }}
                      >
                        <Shield className="size-2.5" /> ฉีดวัคซีน
                      </span>
                    </div>
                  )}

                  {/* Gender badge (top-right) */}
                  <div className="absolute right-3 top-3">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                      style={
                        currentCat.gender === "male"
                          ? { background: "rgba(59,130,246,0.85)", color: "#fff" }
                          : { background: "rgba(236,72,153,0.85)", color: "#fff" }
                      }
                    >
                      {currentCat.gender === "male" ? "♂ ผู้" : "♀ เมีย"}
                    </span>
                  </div>

                  {/* Photo dot indicators */}
                  {currentCat.photos.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
                      {currentCat.photos.slice(0, 5).map((_, idx) => (
                        <span
                          key={idx}
                          className="block h-1 rounded-full transition-all"
                          style={{
                            width: idx === 0 ? 16 : 6,
                            background:
                              idx === 0
                                ? "#EDD060"
                                : "rgba(255,255,255,0.55)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Info section */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-extrabold leading-tight text-[#0B1D3A]">
                          {currentCat.name}
                        </h2>
                        <p className="text-sm font-semibold text-[#D4AF37]">
                          {currentCat.breed}
                        </p>
                      </div>
                      <span className="mt-0.5 flex-shrink-0 text-sm font-medium text-[#6B5232]/70">
                        {formatAge(currentCat.age)}
                      </span>
                    </div>
                    {currentCat.description && (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#6B5232]/65">
                        {currentCat.description}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-[#6B5232]/45">
                    โดย {currentCat.ownerName}
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Queue empty state */
              <motion.div
                key="queue-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl px-8 text-center"
                style={{
                  background: "#FFFAFC",
                  border: "1px solid rgba(212,160,175,0.22)",
                }}
              >
                <PawPrint className="mb-4 size-16 text-[#D4AF37]/25" />
                <h2 className="mb-2 text-lg font-extrabold text-[#0B1D3A]">
                  หมดแล้ว!
                </h2>
                <p className="mb-5 text-sm text-[#6B5232]/60">
                  ลองใหม่ภายหลัง หรือรอแมวใหม่เข้ามา
                </p>
                <button
                  onClick={() => {
                    if (activeCat) void loadQueue(activeCat);
                  }}
                  className="rounded-full px-5 py-2 text-xs font-bold transition-opacity hover:opacity-80"
                  style={{
                    background: "rgba(212,175,55,0.12)",
                    color: "#6B5232",
                    border: "1px solid rgba(212,175,55,0.25)",
                  }}
                >
                  โหลดใหม่
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex items-center justify-center gap-5">
          {/* Pass (X) */}
          <button
            onClick={() => void handlePass()}
            disabled={!currentCat || actionLoading}
            aria-label="ผ่าน"
            className="flex h-14 w-14 items-center justify-center rounded-full transition-transform active:scale-90 disabled:opacity-40"
            style={{
              background: "#FFFAFC",
              border: "1.5px solid rgba(176,64,96,0.28)",
              boxShadow: "0 4px 16px rgba(176,64,96,0.10)",
            }}
          >
            <X className="size-6 text-[#B04060]" strokeWidth={2.5} />
          </button>

          {/* Info (i) */}
          <button
            onClick={() => {
              if (currentCat) setInfoModal(currentCat);
            }}
            disabled={!currentCat}
            aria-label="ข้อมูลเพิ่มเติม"
            className="flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-90 disabled:opacity-40"
            style={{
              background: "#FFFAFC",
              border: "1.5px solid rgba(107,82,50,0.20)",
              boxShadow: "0 2px 8px rgba(11,29,58,0.06)",
            }}
          >
            <Info className="size-4 text-[#6B5232]" />
          </button>

          {/* Like (heart) */}
          <button
            onClick={() => void handleLike()}
            disabled={!currentCat || actionLoading}
            aria-label="ถูกใจ"
            className="flex h-14 w-14 items-center justify-center rounded-full transition-transform active:scale-90 disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg,#EDD060,#D4AF37)",
              boxShadow: "0 4px 20px rgba(212,175,55,0.35)",
            }}
          >
            {actionLoading ? (
              <Loader2 className="size-6 animate-spin text-[#0B1D3A]" />
            ) : (
              <Heart className="size-6 fill-[#0B1D3A] text-[#0B1D3A]" />
            )}
          </button>
        </div>

        {/* Queue progress */}
        {queue.length > 0 && (
          <p className="mt-3 text-center text-xs text-[#6B5232]/35">
            {Math.min(queueIndex + 1, queue.length)} / {queue.length} แมว
          </p>
        )}
      </div>

      {/* ─── Info bottom sheet ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {infoModal && (
          <>
            <motion.div
              key="info-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInfoModal(null)}
              className="fixed inset-0 z-40"
              style={{
                background: "rgba(11,29,58,0.40)",
                backdropFilter: "blur(4px)",
              }}
            />
            <motion.div
              key="info-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[78vh] overflow-y-auto rounded-t-3xl p-6 pb-10"
              style={{
                background: "#FFFAFC",
                border: "1px solid rgba(212,160,175,0.22)",
                boxShadow: "0 -8px 40px rgba(11,29,58,0.12)",
              }}
            >
              {/* Drag handle */}
              <div
                className="mx-auto mb-4 h-1 w-10 rounded-full"
                style={{ background: "rgba(212,160,175,0.40)" }}
              />

              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-[#0B1D3A]">
                    {infoModal.name}
                  </h3>
                  <p className="text-sm font-semibold text-[#D4AF37]">
                    {infoModal.breed}
                  </p>
                </div>
                <button
                  onClick={() => setInfoModal(null)}
                  className="rounded-full p-1.5 transition-colors hover:bg-[rgba(212,160,175,0.12)]"
                >
                  <X className="size-5 text-[#6B5232]/60" />
                </button>
              </div>

              {/* Tags */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: "rgba(212,160,175,0.15)",
                    color: "#B04060",
                  }}
                >
                  {infoModal.gender === "male" ? "♂ เพศผู้" : "♀ เพศเมีย"}
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: "rgba(212,175,55,0.12)",
                    color: "#6B5232",
                  }}
                >
                  {formatAge(infoModal.age)}
                </span>
                {infoModal.vaccinated && (
                  <span
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: "rgba(22,163,74,0.10)", color: "#16a34a" }}
                  >
                    <CheckCircle className="size-3" /> ฉีดวัคซีนแล้ว
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed text-[#6B5232]/75">
                {infoModal.description || "ยังไม่มีคำอธิบาย"}
              </p>
              <p className="mt-3 text-xs text-[#6B5232]/45">
                โดย {infoModal.ownerName}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Match celebration overlay ───────────────────────────────────────── */}
      <AnimatePresence>
        {matchModal && (
          <motion.div
            key="match-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-5"
            style={{
              background: "rgba(11,29,58,0.72)",
              backdropFilter: "blur(14px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.82, opacity: 0, y: 28 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -10 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 190,
                delay: 0.08,
              }}
              className="w-full max-w-sm rounded-3xl p-8 text-center"
              style={{
                background: "linear-gradient(160deg,#FFF8E7 0%,#FFFAFC 100%)",
                border: "1px solid rgba(212,175,55,0.30)",
                boxShadow: "0 24px 80px rgba(11,29,58,0.28)",
              }}
            >
              <div className="mb-3 text-5xl">💛</div>
              <h2
                className="mb-1 text-3xl font-black text-[#0B1D3A]"
                style={{ fontFamily: "'Cinzel','Georgia',serif" }}
              >
                จับคู่สำเร็จ!
              </h2>
              <p className="mb-6 text-sm text-[#6B5232]/65">
                {matchModal.myCat.name} กับ {matchModal.theirCat.name} ชอบกัน!
              </p>

              {/* Side-by-side cat photos */}
              <div className="mb-6 flex items-center justify-center gap-4">
                <div
                  className="relative h-24 w-24 overflow-hidden rounded-full"
                  style={{
                    border: "3px solid #EDD060",
                    boxShadow: "0 4px 16px rgba(212,175,55,0.30)",
                  }}
                >
                  {matchModal.myCat.photos[0] ? (
                    <Image
                      src={matchModal.myCat.photos[0]}
                      alt={matchModal.myCat.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div
                      className="flex h-full items-center justify-center"
                      style={{ background: "rgba(212,160,175,0.12)" }}
                    >
                      <PawPrint className="size-8 text-[#D4AF37]/40" />
                    </div>
                  )}
                </div>

                <Heart className="size-8 fill-[#D4AF37] text-[#D4AF37]" />

                <div
                  className="relative h-24 w-24 overflow-hidden rounded-full"
                  style={{
                    border: "3px solid #EDD060",
                    boxShadow: "0 4px 16px rgba(212,175,55,0.30)",
                  }}
                >
                  {matchModal.theirCat.photos[0] ? (
                    <Image
                      src={matchModal.theirCat.photos[0]}
                      alt={matchModal.theirCat.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div
                      className="flex h-full items-center justify-center"
                      style={{ background: "rgba(212,160,175,0.12)" }}
                    >
                      <PawPrint className="size-8 text-[#D4AF37]/40" />
                    </div>
                  )}
                </div>
              </div>

              <p className="mb-1 text-sm font-bold text-[#D4AF37]">
                {matchModal.myCat.name}
              </p>
              <p className="mb-6 text-xs text-[#6B5232]/50">
                &amp; {matchModal.theirCat.name}
              </p>

              <div className="flex flex-col gap-2.5">
                <Link
                  href="/chat"
                  onClick={() => setMatchModal(null)}
                  className="flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-opacity hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg,#EDD060,#D4AF37)",
                    color: "#0B1D3A",
                  }}
                >
                  <HeartHandshake className="size-4" /> ส่งข้อความ
                </Link>
                <button
                  onClick={() => setMatchModal(null)}
                  className="rounded-full py-3 text-sm font-bold transition-opacity hover:opacity-75"
                  style={{
                    background: "rgba(212,160,175,0.10)",
                    color: "#6B5232",
                    border: "1px solid rgba(212,160,175,0.22)",
                  }}
                >
                  ดูต่อ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
