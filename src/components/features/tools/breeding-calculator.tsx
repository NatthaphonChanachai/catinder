"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { CalendarHeart, Baby, Stethoscope, Info, AlertTriangle } from "lucide-react";

// Real feline reproductive data (see sources at the bottom of the page):
// Cat gestation averages ~63–67 days (mean ~65). We show the full plausible range.
const GEST_MIN = 63;
const GEST_MAX = 67;

// Real pregnancy milestones for queens (day ranges from mating).
const MILESTONES = [
  { day: "วันที่ 1–7", title: "ปฏิสนธิ", desc: "ตัวอ่อนเดินทางสู่มดลูก ยังไม่เห็นอาการภายนอก" },
  { day: "วันที่ 15–18", title: "หัวนมเริ่มชมพู (Pinking)", desc: "หัวนมแดง-ชมพูขึ้นชัด บางตัวเบื่ออาหารช่วงสั้นๆ" },
  { day: "วันที่ 21–28", title: "ยืนยันการตั้งท้อง", desc: "สัตวแพทย์คลำท้องหรืออัลตราซาวด์เห็นตัวอ่อนได้" },
  { day: "วันที่ 35–45", title: "ท้องขยายชัด", desc: "น้ำหนักเพิ่ม กินมากขึ้น ควรเปลี่ยนเป็นอาหารลูกแมว (พลังงานสูง)" },
  { day: "วันที่ 50–56", title: "เห็นลูกดิ้น", desc: "เอกซเรย์นับจำนวนลูกได้ (โครงกระดูกเห็นชัด)" },
  { day: "วันที่ 57–63", title: "เตรียมทำรัง (Nesting)", desc: "แม่แมวหาที่เงียบสงบ กระวนกระวาย เตรียมกล่องคลอด" },
  { day: "วันที่ 63–67", title: "คลอด", desc: "อุณหภูมิร่างกายลดต่ำกว่า 37.8°C มักคลอดภายใน 24 ชม." },
];

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function fmt(d: Date): string {
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
}

export function BreedingCalculator() {
  const today = new Date().toISOString().slice(0, 10);
  const [matingDate, setMatingDate] = useState<string>("");

  const mating = matingDate ? new Date(matingDate) : null;
  const dueMin = mating ? addDays(mating, GEST_MIN) : null;
  const dueMax = mating ? addDays(mating, GEST_MAX) : null;

  // days elapsed since mating (if in the past)
  const daysElapsed = mating ? Math.floor((Date.now() - mating.getTime()) / 86400000) : null;
  const weeksAlong = daysElapsed !== null && daysElapsed >= 0 ? Math.floor(daysElapsed / 7) : null;
  const progress = daysElapsed !== null && daysElapsed >= 0 ? Math.min(100, Math.round((daysElapsed / 65) * 100)) : null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex size-14 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)" }}>
          <CalendarHeart className="size-7 text-[#0B1D3A]" />
        </div>
        <h1 className="font-heading text-2xl font-bold md:text-3xl" style={{ color: "#0B1D3A" }}>
          เครื่องคำนวณกำหนดคลอดแมว
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "#6B5232" }}>
          ใส่วันที่แมวผสมพันธุ์ เพื่อประมาณกำหนดคลอดและไทม์ไลน์การตั้งท้อง ตามข้อมูลสัตวแพทย์
        </p>
      </div>

      {/* Input */}
      <div className="rounded-3xl p-6" style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)", boxShadow: "0 4px 24px rgba(11,29,58,0.05)" }}>
        <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#6B5232" }}>วันที่ผสมพันธุ์</label>
        <input type="date" value={matingDate} max={today} onChange={(e) => setMatingDate(e.target.value)}
          className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
          style={{ background: "#FFF5F8", border: "1px solid rgba(212,160,175,0.35)", color: "#0B1D3A" }} />

        {mating && dueMin && dueMax && (
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl p-5 text-center"
            style={{ background: "linear-gradient(135deg,rgba(237,208,96,0.14),rgba(249,197,209,0.16))", border: "1px solid rgba(212,175,55,0.25)" }}>
            <p className="flex items-center justify-center gap-1.5 text-xs font-semibold" style={{ color: "#B04060" }}>
              <Baby className="size-3.5" /> กำหนดคลอดโดยประมาณ
            </p>
            <p className="mt-1.5 text-lg font-extrabold" style={{ color: "#0B1D3A" }}>
              {fmt(dueMin)} – {fmt(dueMax)}
            </p>
            <p className="mt-1 text-[11px]" style={{ color: "#6B5232" }}>
              (ตั้งท้องประมาณ {GEST_MIN}–{GEST_MAX} วัน)
            </p>

            {weeksAlong !== null && progress !== null && daysElapsed !== null && daysElapsed <= GEST_MAX + 3 && (
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-[11px] font-semibold" style={{ color: "#6B5232" }}>
                  <span>ตั้งท้องมาแล้ว ~{weeksAlong} สัปดาห์ ({daysElapsed} วัน)</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(212,160,175,0.20)" }}>
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#EDD060,#D4AF37)" }} />
                </div>
              </div>
            )}
          </m.div>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold" style={{ color: "#0B1D3A" }}>
          <Stethoscope className="size-5 text-[#D4AF37]" /> ไทม์ไลน์การตั้งท้อง
        </h2>
        <div className="space-y-3">
          {MILESTONES.map((m, i) => (
            <div key={i} className="flex gap-3 rounded-2xl p-4" style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
              <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: "rgba(212,175,55,0.14)", color: "#C4A020" }}>
                {i + 1}
              </div>
              <div>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <p className="text-sm font-bold" style={{ color: "#0B1D3A" }}>{m.title}</p>
                  <span className="text-[11px] font-semibold" style={{ color: "#D4AF37" }}>{m.day}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "#6B5232" }}>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Facts */}
      <div className="mt-8 rounded-2xl p-5" style={{ background: "rgba(74,144,217,0.06)", border: "1px solid rgba(74,144,217,0.18)" }}>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-bold" style={{ color: "#0B1D3A" }}>
          <Info className="size-4 text-[#4A90D9]" /> ข้อมูลควรรู้
        </p>
        <ul className="space-y-1.5 text-xs leading-relaxed" style={{ color: "#4A3820" }}>
          <li>• แมวตั้งท้องเฉลี่ย <strong>63–67 วัน</strong> (ประมาณ 9 สัปดาห์)</li>
          <li>• แมวเป็น <strong>Induced Ovulator</strong> — ตกไข่เมื่อมีการผสมเท่านั้น จึงมักตั้งท้องเมื่อผสม</li>
          <li>• รอบสัด (เป็นสัด) กินเวลา <strong>4–7 วัน</strong> และเกิดซ้ำทุก 2–3 สัปดาห์ในฤดูผสมพันธุ์หากไม่ได้ผสม</li>
          <li>• ควรพาไปตรวจกับสัตวแพทย์เพื่อยืนยันการตั้งท้องและดูแลตลอดช่วง</li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 flex items-start gap-2 rounded-2xl p-4 text-xs" style={{ background: "rgba(176,64,96,0.06)", color: "#6B5232" }}>
        <AlertTriangle className="size-4 flex-shrink-0" style={{ color: "#B04060" }} />
        <span>
          เครื่องมือนี้ให้ค่าประมาณเพื่อการวางแผนเบื้องต้นเท่านั้น ไม่ใช่คำวินิจฉัยทางการแพทย์ กรุณาปรึกษาสัตวแพทย์สำหรับการดูแลที่ถูกต้อง
        </span>
      </div>

      {/* Sources */}
      <p className="mt-6 text-center text-[11px]" style={{ color: "#6B5232" }}>
        แหล่งอ้างอิง: Cornell Feline Health Center · Little, S.E. (2011) <em>The Cat: Clinical Medicine and Management</em> · International Cat Care (icatcare.org)
      </p>
    </div>
  );
}
