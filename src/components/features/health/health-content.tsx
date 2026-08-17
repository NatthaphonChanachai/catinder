"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  HeartPulse, Syringe, FileText, Lock, Crown, Plus, PawPrint, X,
  Stethoscope, Pill, Loader2, Trash2, CheckCircle, AlertTriangle, Calendar, ChevronDown,
} from "lucide-react";
import {
  collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface Cat {
  id: string;
  name: string;
  breed: string;
  vaccinated?: boolean;
}

type RecordType = "vaccine" | "checkup" | "treatment" | "other";

interface HealthRecord {
  id: string;
  type: RecordType;
  title: string;
  date: string; // yyyy-mm-dd
  vet?: string;
  notes?: string;
  createdAt?: DocumentData;
}

const RECORD_TYPES: { value: RecordType; label: string; icon: typeof Syringe; color: string }[] = [
  { value: "vaccine",   label: "วัคซีน",       icon: Syringe,     color: "#22c55e" },
  { value: "checkup",   label: "ตรวจสุขภาพ",  icon: Stethoscope, color: "#4A90D9" },
  { value: "treatment", label: "การรักษา",     icon: Pill,        color: "#E8706A" },
  { value: "other",     label: "อื่นๆ",        icon: FileText,    color: "#D4AF37" },
];

function typeMeta(t: RecordType) {
  return RECORD_TYPES.find((r) => r.value === t) ?? RECORD_TYPES[3];
}

function fmtDate(d: string): string {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Add Record Modal ─────────────────────────────────────────────────────────

function AddRecordModal({ catId, onClose }: { catId: string; onClose: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [type, setType] = useState<RecordType>("vaccine");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [vet, setVet] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (!title.trim()) { setErr("กรุณาใส่ชื่อรายการ เช่น วัคซีนพิษสุนัขบ้า"); return; }
    setSaving(true);
    setErr(null);
    try {
      await addDoc(collection(db, "cats", catId, "healthRecords"), {
        type, title: title.trim(), date,
        vet: vet.trim(), notes: notes.trim(),
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (e) {
      setErr("บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง");
      console.error("[health] add record:", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-end justify-center sm:items-center sm:p-4">
        <m.div
          initial={{ y: "100%" }} animate={{ y: 0, transition: { type: "spring", damping: 26, stiffness: 280 } }} exit={{ y: "100%", transition: { duration: 0.22 } }}
          className="relative w-full max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl sm:max-w-md"
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}
          onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-center pt-3 sm:hidden"><div className="h-1 w-10 rounded-full bg-[#D4AF37]/30" /></div>
          <div className="px-5 py-4 pb-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-[#0B1D3A]">เพิ่มบันทึกสุขภาพ</h2>
              <button onClick={onClose} className="flex size-8 items-center justify-center rounded-full hover:bg-[#F9C5D1]/30">
                <X className="size-4 text-[#6B5232]" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">ประเภท</label>
                <div className="grid grid-cols-2 gap-2">
                  {RECORD_TYPES.map((rt) => {
                    const active = type === rt.value;
                    const Icon = rt.icon;
                    return (
                      <button key={rt.value} type="button" onClick={() => setType(rt.value)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
                        style={active
                          ? { background: rt.color, color: "#fff" }
                          : { background: "#FFF5F8", border: "1px solid rgba(212,160,175,0.35)", color: "#6B5232" }}>
                        <Icon className="size-4" /> {rt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">รายการ <span className="text-[#B04060]">*</span></label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น วัคซีนพิษสุนัขบ้า, ตรวจสุขภาพประจำปี"
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm text-[#0B1D3A] outline-none placeholder:text-[#6B5232]/40"
                  style={{ background: "#FFF5F8", border: "1px solid rgba(212,160,175,0.35)" }} />
              </div>

              {/* Date */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">วันที่</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm text-[#0B1D3A] outline-none"
                  style={{ background: "#FFF5F8", border: "1px solid rgba(212,160,175,0.35)" }} />
              </div>

              {/* Vet */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">คลินิก / สัตวแพทย์ (ถ้ามี)</label>
                <input value={vet} onChange={(e) => setVet(e.target.value)} placeholder="เช่น รพ.สัตว์ทองหล่อ"
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm text-[#0B1D3A] outline-none placeholder:text-[#6B5232]/40"
                  style={{ background: "#FFF5F8", border: "1px solid rgba(212,160,175,0.35)" }} />
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">บันทึกเพิ่มเติม</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="รายละเอียด, นัดครั้งถัดไป ฯลฯ"
                  className="w-full resize-none rounded-xl px-3.5 py-2.5 text-sm text-[#0B1D3A] outline-none placeholder:text-[#6B5232]/40"
                  style={{ background: "#FFF5F8", border: "1px solid rgba(212,160,175,0.35)" }} />
              </div>

              {err && (
                <div className="flex items-center gap-2 rounded-xl p-3 text-sm text-[#B04060]" style={{ background: "rgba(176,64,96,0.08)" }}>
                  <AlertTriangle className="size-4 shrink-0" /> {err}
                </div>
              )}

              <button onClick={save} disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </m.div>
      </div>
    </m.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function HealthContent() {
  const { user } = useAuth();
  const [cats, setCats] = useState<Cat[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  // Load the user's cats
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "cats"), where("ownerId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Cat, "id">) }));
      setCats(list);
      setSelectedCatId((cur) => cur && list.some((c) => c.id === cur) ? cur : list[0]?.id ?? null);
      setLoadingCats(false);
    }, () => setLoadingCats(false));
    return unsub;
  }, [user]);

  // Load records for the selected cat
  useEffect(() => {
    if (!selectedCatId) { setRecords([]); return; }
    setLoadingRecords(true);
    const q = collection(db, "cats", selectedCatId, "healthRecords");
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<HealthRecord, "id">) }))
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      setRecords(list);
      setLoadingRecords(false);
    }, () => setLoadingRecords(false));
    return unsub;
  }, [selectedCatId]);

  async function confirmDelete() {
    if (!pendingDelete || !selectedCatId) return;
    try {
      await deleteDoc(doc(db, "cats", selectedCatId, "healthRecords", pendingDelete));
    } catch (e) {
      console.error("[health] delete:", e);
    } finally {
      setPendingDelete(null);
    }
  }

  const selectedCat = cats.find((c) => c.id === selectedCatId);

  return (
    <AppShell>
      <m.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-4xl space-y-5">

        {/* Header */}
        <m.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#0B1D3A]">บันทึกสุขภาพ</h1>
            <p className="text-xs text-[#6B5232]/60">ติดตามวัคซีนและประวัติสุขภาพของแมวคุณ</p>
          </div>
          {selectedCat && (
            <button onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
              <Plus className="size-4" /> เพิ่มบันทึก
            </button>
          )}
        </m.div>

        {loadingCats ? (
          <div className="flex justify-center py-24"><Loader2 className="size-6 animate-spin text-[#D4AF37]" /></div>
        ) : cats.length === 0 ? (
          /* No cats yet */
          <m.div variants={fadeUp} className="flex flex-col items-center justify-center rounded-3xl py-16 text-center"
            style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
            <HeartPulse className="mb-4 size-12 text-[#D4AF37]/40" />
            <h3 className="text-base font-bold text-[#0B1D3A]">ยังไม่มีแมวในโปรไฟล์</h3>
            <p className="mt-1 text-xs text-[#6B5232]/50">เพิ่มแมวเพื่อเริ่มติดตามสุขภาพ</p>
            <Link href="/cats" className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
              <PawPrint className="size-4" /> เพิ่มแมว
            </Link>
          </m.div>
        ) : (
          <>
            {/* Cat selector */}
            <m.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-1">
              {cats.map((c) => {
                const active = c.id === selectedCatId;
                return (
                  <button key={c.id} onClick={() => setSelectedCatId(c.id)}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all"
                    style={active
                      ? { background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }
                      : { background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.30)", color: "#6B5232" }}>
                    <PawPrint className="size-3.5" /> {c.name}
                  </button>
                );
              })}
            </m.div>

            {/* Records */}
            <m.div variants={fadeUp} className="rounded-2xl overflow-hidden"
              style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(212,160,175,0.18)" }}>
                <h2 className="font-bold text-[#0B1D3A]">
                  <Syringe className="mr-1.5 inline size-4 text-[#D4AF37]" />
                  ประวัติของ {selectedCat?.name}
                </h2>
                {selectedCat?.vaccinated && (
                  <span className="rounded-full bg-green-500/90 px-2.5 py-1 text-[10px] font-bold text-white">วัคซีนครบ</span>
                )}
              </div>

              {loadingRecords ? (
                <div className="flex justify-center py-10"><Loader2 className="size-5 animate-spin text-[#D4AF37]" /></div>
              ) : records.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Syringe className="mb-3 size-8 text-[#D4AF37]/30" />
                  <p className="text-sm font-bold text-[#0B1D3A]">ยังไม่มีบันทึก</p>
                  <p className="mt-1 text-xs text-[#6B5232]/50">กด &quot;เพิ่มบันทึก&quot; เพื่อบันทึกวัคซีนหรือการตรวจ</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(212,160,175,0.15)" }}>
                  {records.map((r) => {
                    const meta = typeMeta(r.type);
                    const Icon = meta.icon;
                    return (
                      <div key={r.id} className="group flex items-start gap-3 px-4 py-3.5">
                        <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${meta.color}1a` }}>
                          <Icon className="size-4" style={{ color: meta.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[#0B1D3A]">{r.title}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#6B5232]/60">
                            <span className="inline-flex items-center gap-1"><Calendar className="size-3" />{fmtDate(r.date)}</span>
                            <span className="rounded-full px-2 py-0.5 font-semibold" style={{ background: `${meta.color}1a`, color: meta.color }}>{meta.label}</span>
                            {r.vet && <span>{r.vet}</span>}
                          </div>
                          {r.notes && <p className="mt-1 text-xs leading-relaxed text-[#6B5232]/70">{r.notes}</p>}
                        </div>
                        <button onClick={() => setPendingDelete(r.id)}
                          className="flex-shrink-0 rounded-full p-1.5 opacity-0 transition-opacity hover:bg-[#F9C5D1]/30 group-hover:opacity-100">
                          <Trash2 className="size-3.5 text-[#B04060]" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </m.div>
          </>
        )}

        {/* Premium health passport */}
        <m.div variants={fadeUp} className="rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg,#FDF0F4,#F9DDE8)", border: "1px solid rgba(212,140,165,0.30)" }}>
          <div className="flex items-start gap-4">
            <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)" }}>
              <FileText className="size-6 text-[#0B1D3A]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Lock className="size-3.5 text-[#B04060]/60" />
                <h3 className="font-bold text-[#4A1030]">Health Passport เต็มรูปแบบ</h3>
              </div>
              <p className="mt-1 text-xs text-[#6B5232]/60">รายงานสุขภาพ PDF · แชร์กับสัตวแพทย์ · แจ้งเตือนวัคซีนครบกำหนด · ติดตามผลเลือด</p>
              <Link href="/pricing" className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                <Crown className="size-3" /> ปลดล็อกด้วย Premium
              </Link>
            </div>
          </div>
        </m.div>

      </m.div>

      <AnimatePresence>
        {showAdd && selectedCatId && <AddRecordModal catId={selectedCatId} onClose={() => setShowAdd(false)} />}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {pendingDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(11,29,58,0.45)" }}>
            <m.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl p-6" style={{ background: "#FFFAFC" }}>
              <p className="mb-1 font-bold text-[#0B1D3A]">ลบบันทึกนี้?</p>
              <p className="mb-5 text-sm text-[#6B5232]/70">การลบไม่สามารถกู้คืนได้</p>
              <div className="flex gap-3">
                <button onClick={() => setPendingDelete(null)}
                  className="flex-1 rounded-full py-2.5 text-sm font-semibold hover:opacity-80"
                  style={{ border: "1px solid rgba(212,160,175,0.35)", color: "#6B5232" }}>ยกเลิก</button>
                <button onClick={confirmDelete}
                  className="flex-1 rounded-full py-2.5 text-sm font-bold text-white hover:opacity-90" style={{ background: "#B04060" }}>ลบ</button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
