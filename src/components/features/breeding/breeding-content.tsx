"use client";

import { useState, useEffect } from "react";
import { m } from "framer-motion";
import {
  Dna, HeartHandshake, CheckCircle, Crown, Lock, Star, Loader2, MessageCircle,
} from "lucide-react";
import {
  collection, query, where, onSnapshot,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { fadeUp, staggerContainer } from "@/lib/motion";

const TIPS = [
  { icon: Star,           title: "เลือกคู่ที่เหมาะสม",   desc: "ดูสายพันธุ์และใบเพดดีกรีเพื่อความเข้ากันทางพันธุกรรม" },
  { icon: CheckCircle,    title: "ตรวจสุขภาพก่อน",       desc: "ทั้งสองฝ่ายควรมีสุขภาพดีและวัคซีนครบ" },
  { icon: HeartHandshake, title: "ประสานงานกับเจ้าของ",  desc: "ใช้ระบบแชทเพื่อนัดหมายและตกลงรายละเอียด" },
];

interface MatchCat {
  id: string;
  name: string;
  breed: string;
  photoUrl: string;
  ownerId: string;
}

interface BreedingMatch {
  matchId: string;
  myCat?: MatchCat;
  partnerCat?: MatchCat;
}

export function BreedingContent() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<BreedingMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "matches"), where("users", "array-contains", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const rows: BreedingMatch[] = snap.docs.map((d) => {
        const cats: MatchCat[] = d.data().cats ?? [];
        return {
          matchId: d.id,
          myCat: cats.find((c) => c.ownerId === user.uid),
          partnerCat: cats.find((c) => c.ownerId !== user.uid),
        };
      });
      setMatches(rows);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const total = matches.length;

  return (
    <AppShell>
      <m.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-4xl space-y-5">

        {/* Header */}
        <m.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#0B1D3A]">ผสมพันธุ์</h1>
            <p className="text-xs text-[#6B5232]/60">จัดการคู่จับคู่ผสมพันธุ์ของคุณ</p>
          </div>
          <Link href="/discover"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            <HeartHandshake className="size-4" /> หาคู่ผสม
          </Link>
        </m.div>

        {/* Stats */}
        <m.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          {[
            { label: "คู่ที่จับคู่ได้", value: total, color: "#D4AF37" },
            { label: "พร้อมประสานงาน", value: total, color: "#7B5EA7" },
            { label: "สำเร็จแล้ว",     value: 0, color: "#22c55e" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center"
              style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
              <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] text-[#6B5232]/60">{s.label}</p>
            </div>
          ))}
        </m.div>

        {/* Matched breeding partners */}
        <m.div variants={fadeUp} className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(212,160,175,0.18)" }}>
            <h2 className="font-bold text-[#0B1D3A]">
              <Dna className="mr-1.5 inline size-4 text-[#D4AF37]" />
              คู่ที่จับคู่ได้
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-[#D4AF37]" /></div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Dna className="mb-3 size-8 text-[#D4AF37]/30" />
              <p className="text-sm font-bold text-[#0B1D3A]">ยังไม่มีคู่จับคู่</p>
              <p className="mt-1 text-xs text-[#6B5232]/50">ไปที่ &quot;จับคู่แมว&quot; เพื่อหาคู่ผสมพันธุ์ที่ใช่</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(212,160,175,0.15)" }}>
              {matches.map((m) => (
                <div key={m.matchId} className="flex items-center gap-3 px-4 py-3">
                  {/* partner cat photo */}
                  <div className="relative size-12 flex-shrink-0 overflow-hidden rounded-xl bg-[#FFF5F8]">
                    {m.partnerCat?.photoUrl ? (
                      <Image src={m.partnerCat.photoUrl} alt={m.partnerCat.name} fill className="object-cover" sizes="48px" unoptimized />
                    ) : (
                      <div className="flex h-full items-center justify-center"><Dna className="size-5 text-[#D4AF37]/40" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#0B1D3A]">{m.partnerCat?.name ?? "แมว"}</p>
                    <p className="truncate text-xs text-[#6B5232]/60">
                      {m.partnerCat?.breed ?? ""}
                      {m.myCat ? ` · จับคู่กับ ${m.myCat.name}` : ""}
                    </p>
                  </div>
                  <Link href="/chat"
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-bold hover:opacity-90 transition-opacity"
                    style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                    <MessageCircle className="size-3.5" /> นัดผสม
                  </Link>
                </div>
              ))}
            </div>
          )}
        </m.div>

        {/* Tips */}
        <m.div variants={fadeUp} className="grid gap-3 sm:grid-cols-3">
          {TIPS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl p-4"
              style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
              <Icon className="mb-2 size-5 text-[#D4AF37]" />
              <p className="text-xs font-bold text-[#0B1D3A]">{title}</p>
              <p className="mt-0.5 text-[11px] text-[#6B5232]/60">{desc}</p>
            </div>
          ))}
        </m.div>

        {/* Pedigree premium */}
        <m.div variants={fadeUp} className="flex items-center gap-4 rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg,#FDF0F4,#F9DDE8)", border: "1px solid rgba(212,140,165,0.30)" }}>
          <Lock className="size-5 flex-shrink-0 text-[#B04060]/60" />
          <div className="flex-1">
            <p className="font-bold text-[#4A1030]">Pedigree Certificate & Priority Listing</p>
            <p className="text-xs text-[#6B5232]/60">ปลดล็อก Pedigree ดิจิทัล + แสดงโปรไฟล์ก่อนใคร</p>
          </div>
          <Link href="/pricing" className="flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            <Crown className="mr-1 inline size-3" /> Premium
          </Link>
        </m.div>

      </m.div>
    </AppShell>
  );
}
