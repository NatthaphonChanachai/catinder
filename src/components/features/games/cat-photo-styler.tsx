"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Upload, Download, Share2, Loader2,
  ImageIcon, Paintbrush, Pencil, Wand2, Zap, Film, Feather, Star,
  PawPrint, Palette,
} from "lucide-react";
import { addXP } from "@/lib/xp";

type LucideFC = React.FC<React.SVGProps<SVGSVGElement> & { className?: string; size?: number | string }>;

const STYLES: { id: string; label: string; Icon: LucideFC; filter: string; color: string }[] = [
  { id: "original",   label: "ต้นฉบับ",   Icon: ImageIcon as LucideFC,   filter: "none",                                                                        color: "#6B5232" },
  { id: "watercolor", label: "สีน้ำ",      Icon: Paintbrush as LucideFC,  filter: "saturate(1.5) contrast(0.85) brightness(1.12)",                               color: "#4A8AC8" },
  { id: "sketch",     label: "ภาพวาด",    Icon: Pencil as LucideFC,      filter: "grayscale(1) contrast(2.4) brightness(0.82)",                                  color: "#4A4A4A" },
  { id: "anime",      label: "อะนิเมะ",   Icon: Wand2 as LucideFC,       filter: "saturate(2.1) contrast(1.2) brightness(1.08) hue-rotate(348deg)",             color: "#C060A0" },
  { id: "neon",       label: "นีออน",      Icon: Zap as LucideFC,         filter: "saturate(3) brightness(1.1) contrast(1.45) hue-rotate(255deg)",               color: "#6040D0" },
  { id: "vintage",    label: "วินเทจ",    Icon: Film as LucideFC,        filter: "sepia(0.8) contrast(1.1) brightness(0.90) saturate(0.85)",                    color: "#8B6340" },
  { id: "pastel",     label: "พาสเทล",    Icon: Feather as LucideFC,     filter: "saturate(0.70) brightness(1.22) contrast(0.80)",                              color: "#D070A0" },
  { id: "golden",     label: "โกลเดน",    Icon: Star as LucideFC,        filter: "sepia(0.35) saturate(1.6) brightness(1.12) hue-rotate(348deg) contrast(1.08)", color: "#D4AF37" },
];

export function CatPhotoStyler({ onClose }: { onClose: () => void }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [style, setStyle] = useState("original");
  const [loading, setLoading] = useState(false);
  const [xpGiven, setXpGiven] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const currentStyle = STYLES.find((s) => s.id === style)!;

  const onFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImgSrc(e.target?.result as string);
      setStyle("original");
      setLoading(false);
      if (!xpGiven) { addXP(20, "photo-styler"); setXpGiven(true); }
    };
    reader.readAsDataURL(file);
  }, [xpGiven]);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  async function download() {
    const imgEl = imgRef.current;
    if (!imgEl || !imgSrc) return;
    const canvas = document.createElement("canvas");
    canvas.width = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (currentStyle.filter !== "none") ctx.filter = currentStyle.filter;
    ctx.drawImage(imgEl, 0, 0);
    const link = document.createElement("a");
    link.download = `cat-${style}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  }

  async function share() {
    const imgEl = imgRef.current;
    if (!imgEl || !imgSrc) return;
    const canvas = document.createElement("canvas");
    canvas.width = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (currentStyle.filter !== "none") ctx.filter = currentStyle.filter;
    ctx.drawImage(imgEl, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `cat-${style}.jpg`, { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "น้องแมวของฉัน" });
      } else {
        download();
      }
    }, "image/jpeg", 0.95);
  }

  return (
    <div className="rounded-3xl p-5" style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }}>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl"
            style={{ background: "rgba(249,197,209,0.35)" }}>
            <Palette className="size-4 text-[#C8506A]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0B1D3A]">Cat Photo Styler</h3>
            <p className="text-[11px] text-[#6B5232]/50">ถ่ายหรืออัปโหลดรูปน้องแมว แล้วเลือกสไตล์</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 text-[#6B5232]/40 hover:bg-[#F9C5D1]/30 transition-colors">✕</button>
      </div>

      {/* Hidden inputs */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onInputChange} />

      {!imgSrc ? (
        /* Upload area */
        <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center rounded-3xl py-14 text-center transition-colors"
          style={{ background: "rgba(212,140,165,0.06)", border: "2px dashed rgba(212,160,175,0.35)" }}>
          {loading ? (
            <Loader2 className="mb-3 size-10 animate-spin text-[#D4AF37]" />
          ) : (
            <>
              <div className="mb-5 flex size-20 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg,rgba(249,197,209,0.40),rgba(232,160,180,0.25))" }}>
                <PawPrint className="size-10 text-[#E8A0B4]" strokeWidth={1.5} />
              </div>
              <p className="mb-5 text-sm font-bold text-[#0B1D3A]">ถ่ายหรืออัปโหลดรูปน้องแมว</p>
              <div className="flex gap-3">
                <button onClick={() => cameraRef.current?.click()}
                  className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#F9C5D1,#E8A0B4)", color: "#4A1030" }}>
                  <Camera className="size-4" /> ถ่ายรูป
                </button>
                <button onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: "rgba(212,175,55,0.15)", color: "#B8920A", border: "1px solid rgba(212,175,55,0.30)" }}>
                  <Upload className="size-4" /> เลือกจากคลัง
                </button>
              </div>
              <p className="mt-4 text-[11px] text-[#6B5232]/40">หรือลากวางรูปที่นี่</p>
            </>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={style} initial={{ opacity: 0.7 }} animate={{ opacity: 1 }}>
            {/* Preview */}
            <div className="relative mb-4 overflow-hidden rounded-3xl"
              style={{ background: "#F0E8EC", aspectRatio: "4/3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={imgRef} src={imgSrc} alt="preview"
                className="h-full w-full object-cover transition-all duration-500"
                style={{ filter: currentStyle.filter }} />
              {/* Style label overlay */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: "rgba(11,29,58,0.72)", backdropFilter: "blur(8px)" }}>
                <currentStyle.Icon className="size-3.5" style={{ color: currentStyle.color === "#6B5232" ? "#D4AF37" : currentStyle.color }} />
                <span className="text-xs font-bold text-white">{currentStyle.label}</span>
              </div>
              {/* Change photo button */}
              <button onClick={() => fileRef.current?.click()}
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all hover:opacity-90"
                style={{ background: "rgba(255,255,255,0.88)", color: "#4A1030" }}>
                <Upload className="size-3" /> เปลี่ยนรูป
              </button>
            </div>

            {/* Style picker */}
            <div className="mb-5 grid grid-cols-4 gap-2">
              {STYLES.map((s) => {
                const active = style === s.id;
                return (
                  <button key={s.id} onClick={() => setStyle(s.id)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl py-3 text-center transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: active ? "linear-gradient(135deg,rgba(212,175,55,0.22),rgba(237,208,96,0.15))" : "rgba(212,140,165,0.06)",
                      border: active ? "1.5px solid rgba(212,175,55,0.55)" : "1px solid rgba(212,160,175,0.15)",
                    }}>
                    <s.Icon className="size-4.5" style={{ color: active ? s.color : `${s.color}99` }} />
                    <span className="text-[10px] font-semibold" style={{ color: active ? "#B8920A" : "#6B5232" }}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={share}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all hover:opacity-80"
                style={{ background: "rgba(212,140,165,0.12)", color: "#B04060" }}>
                <Share2 className="size-4" /> แชร์
              </button>
              <button onClick={download}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
                <Download className="size-4" /> ดาวน์โหลด
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
