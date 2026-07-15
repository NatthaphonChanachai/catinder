"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/services/firebase";
import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/shared/app-shell";
import { fadeUp, staggerContainer } from "@/lib/motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  normalizeCatRecord,
  type CatGender,
  type CatRecord,
} from "@/lib/cat-record";
import {
  Plus,
  PawPrint,
  Crown,
  Camera,
  X,
  Trash2,
  Pencil,
  CheckCircle,
  Loader2,
  ChevronDown,
  Shield,
  AlertTriangle,
  FileText,
  Upload,
  ExternalLink,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_CAT_LIMIT = 2;

const BREED_OPTIONS = [
  "เปอร์เซีย",
  "สก็อตติชโฟลด์",
  "อเมริกันช็อตแฮร์",
  "เมนคูน",
  "รัสเซียนบลู",
  "สยาม",
  "เบงกอล",
  "อบิสซิเนียน",
  "โคราช",
  "วิเชียรมาศ",
  "แมวไทย",
  "ลูกผสม",
  "อื่นๆ",
] as const;

const AGE_OPTIONS = [
  { label: "น้อยกว่า 6 เดือน", value: 3 },
  { label: "6-12 เดือน", value: 9 },
  { label: "1 ปี", value: 12 },
  { label: "2 ปี", value: 24 },
  { label: "3 ปี", value: 36 },
  { label: "4 ปี", value: 48 },
  { label: "5 ปี", value: 60 },
  { label: "มากกว่า 5 ปี", value: 72 },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type Cat = CatRecord;

interface CatFormValues {
  name: string;
  breed: string;
  age: number;
  gender: CatGender;
  description: string;
  vaccinated: boolean;
  registry: string;
  registrationNumber: string;
}

const REGISTRY_OPTIONS = [
  { value: "", label: "ยังไม่มีการลงทะเบียน" },
  { value: "TICA", label: "TICA – The International Cat Association" },
  { value: "WCF", label: "WCF – World Cat Federation" },
  { value: "GCCF", label: "GCCF – Governing Council of the Cat Fancy" },
  { value: "CFA", label: "CFA – Cat Fanciers' Association" },
  { value: "สมาคมแมวไทย", label: "สมาคมแมวแห่งประเทศไทย" },
  { value: "อื่นๆ", label: "สมาคม / ชมรมอื่นๆ" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAgeLabel(months: number): string {
  return (
    AGE_OPTIONS.find((o) => o.value === months)?.label ?? `${months} เดือน`
  );
}

async function tryDeleteStoragePhoto(photoUrl: string): Promise<void> {
  try {
    const url = new URL(photoUrl);
    const m = url.pathname.match(/\/o\/(.+?)(?:\?|$)/);
    if (m?.[1]) {
      await deleteObject(storageRef(storage, decodeURIComponent(m[1])));
    }
  } catch {
    // Best-effort — ignore errors if the file is already gone
  }
}

// ─── Cat Form Modal ───────────────────────────────────────────────────────────

interface CatFormModalProps {
  cat: Cat | null;
  userId: string;
  userDisplayName: string;
  onClose: () => void;
  onSaved: () => void;
}

function CatFormModal({
  cat,
  userId,
  userDisplayName,
  onClose,
  onSaved,
}: CatFormModalProps) {
  const [form, setForm] = useState<CatFormValues>(() =>
    cat
      ? {
          name: cat.name,
          breed: cat.breed,
          age: cat.age,
          gender: cat.gender,
          description: cat.description,
          vaccinated: cat.vaccinated,
          registry: cat.registry ?? "",
          registrationNumber: cat.registrationNumber ?? "",
        }
      : {
          name: "",
          breed: "เปอร์เซีย",
          age: 12,
          gender: "female",
          description: "",
          vaccinated: false,
          registry: "",
          registrationNumber: "",
        }
  );

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(
    cat?.photos[0] ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [showPetInfo, setShowPetInfo] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certFileName, setCertFileName] = useState<string>(
    cat?.petCertificateUrl ? "เอกสารที่อัปโหลดแล้ว" : ""
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
  // Track latest photoPreview in a ref to avoid stale closure in cleanup
  const latestPreviewRef = useRef<string>(photoPreview);
  useEffect(() => {
    latestPreviewRef.current = photoPreview;
  }, [photoPreview]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      const preview = latestPreviewRef.current;
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, []);

  function patchForm<K extends keyof CatFormValues>(
    key: K,
    value: CatFormValues[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFieldError("รูปภาพต้องไม่เกิน 5MB");
      return;
    }
    setFieldError(null);
    if (latestPreviewRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(latestPreviewRef.current);
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleCertFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setFieldError("ไฟล์ใบเพดดีกรีต้องไม่เกิน 10MB");
      return;
    }
    setFieldError(null);
    setCertFile(file);
    setCertFileName(file.name);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFieldError("กรุณากรอกชื่อแมว");
      return;
    }
    setSaving(true);
    setFieldError(null);

    try {
      let photos: string[] = cat?.photos ?? [];

      if (photoFile) {
        const ext = photoFile.name.split(".").pop() ?? "jpg";
        const path = `cats/${userId}/${Date.now()}.${ext}`;
        const snap = await uploadBytes(storageRef(storage, path), photoFile);
        const downloadUrl = await getDownloadURL(snap.ref);
        const oldPhoto = cat?.photos[0];
        if (oldPhoto) await tryDeleteStoragePhoto(oldPhoto);
        photos = [downloadUrl, ...(cat?.photos.slice(1) ?? [])];
      }

      let petCertificateUrl: string | undefined = cat?.petCertificateUrl;
      if (certFile) {
        const ext = certFile.name.split(".").pop() ?? "pdf";
        const path = `cats/${userId}/docs/${Date.now()}.${ext}`;
        const snap = await uploadBytes(storageRef(storage, path), certFile);
        petCertificateUrl = await getDownloadURL(snap.ref);
      }

      const baseFields = {
        name: form.name.trim(),
        breed: form.breed,
        age: form.age,
        gender: form.gender,
        description: form.description.trim(),
        vaccinated: form.vaccinated,
        photos,
        ownerName: userDisplayName,
        registry: form.registry,
        registrationNumber: form.registrationNumber.trim(),
        ...(petCertificateUrl !== undefined ? { petCertificateUrl } : {}),
      };

      if (cat) {
        await updateDoc(doc(db, "cats", cat.id), {
          ...baseFields,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "cats"), {
          ...baseFields,
          ownerId: userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      onSaved();
    } catch (err) {
      console.error("Failed to save cat:", err);
      setFieldError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel: bottom sheet on mobile, centered card on sm+ */}
      <div className="absolute inset-0 flex items-end justify-center sm:items-center sm:p-4">
        <motion.div
          initial={{ y: "100%" }}
          animate={{
            y: 0,
            transition: { type: "spring", damping: 26, stiffness: 280 },
          }}
          exit={{ y: "100%", transition: { duration: 0.22 } }}
          className="relative w-full max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl sm:max-w-md"
          style={{
            background: "#FFFAFC",
            border: "1px solid rgba(212,160,175,0.22)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar — mobile only */}
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-[#D4AF37]/30" />
          </div>

          <div className="px-5 py-4 pb-8">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-[#0B1D3A]">
                {cat ? "แก้ไขโปรไฟล์แมว" : "เพิ่มแมวใหม่"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-[#F9C5D1]/30"
              >
                <X className="size-4 text-[#6B5232]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo upload */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">
                  รูปภาพแมว
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl transition-opacity hover:opacity-90"
                  style={{
                    background: "rgba(212,175,55,0.06)",
                    border: "1.5px dashed rgba(212,175,55,0.50)",
                  }}
                >
                  {photoPreview ? (
                    <>
                      <Image
                        src={photoPreview}
                        alt="preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <Camera className="size-7 text-white" />
                        <span className="text-xs font-semibold text-white">
                          เปลี่ยนรูป
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#D4AF37]/60">
                      <Camera className="size-10" />
                      <span className="text-xs">คลิกเพื่อเลือกรูปแมว</span>
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">
                  ชื่อแมว{" "}
                  <span className="text-[#B04060]">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => patchForm("name", e.target.value)}
                  placeholder="เช่น มีมี่, มะม่วง"
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm text-[#0B1D3A] outline-none transition-colors placeholder:text-[#6B5232]/40"
                  style={{
                    background: "#FFF5F8",
                    border: "1px solid rgba(212,160,175,0.35)",
                  }}
                />
              </div>

              {/* Breed */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">
                  สายพันธุ์
                </label>
                <div className="relative">
                  <select
                    value={form.breed}
                    onChange={(e) => patchForm("breed", e.target.value)}
                    className="w-full appearance-none rounded-xl px-3.5 py-2.5 pr-9 text-sm text-[#0B1D3A] outline-none"
                    style={{
                      background: "#FFF5F8",
                      border: "1px solid rgba(212,160,175,0.35)",
                    }}
                  >
                    {BREED_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#6B5232]/50" />
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">
                  อายุ
                </label>
                <div className="relative">
                  <select
                    value={form.age}
                    onChange={(e) => patchForm("age", Number(e.target.value))}
                    className="w-full appearance-none rounded-xl px-3.5 py-2.5 pr-9 text-sm text-[#0B1D3A] outline-none"
                    style={{
                      background: "#FFF5F8",
                      border: "1px solid rgba(212,160,175,0.35)",
                    }}
                  >
                    {AGE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#6B5232]/50" />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">
                  เพศ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["female", "male"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => patchForm("gender", g)}
                      className="rounded-xl py-2.5 text-sm font-semibold transition-all"
                      style={
                        form.gender === g
                          ? {
                              background:
                                "linear-gradient(135deg,#EDD060,#D4AF37)",
                              color: "#0B1D3A",
                            }
                          : {
                              background: "#FFF5F8",
                              border: "1px solid rgba(212,160,175,0.35)",
                              color: "#6B5232",
                            }
                      }
                    >
                      {g === "female" ? "♀ เมีย" : "♂ ผู้"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vaccinated toggle */}
              <button
                type="button"
                onClick={() => patchForm("vaccinated", !form.vaccinated)}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all"
                style={
                  form.vaccinated
                    ? {
                        background: "rgba(34,197,94,0.10)",
                        border: "1px solid rgba(34,197,94,0.35)",
                        color: "#166534",
                      }
                    : {
                        background: "#FFF5F8",
                        border: "1px solid rgba(212,160,175,0.35)",
                        color: "#6B5232",
                      }
                }
              >
                <Shield
                  className={`size-4 ${form.vaccinated ? "text-green-600" : "text-[#6B5232]/50"}`}
                />
                ฉีดวัคซีนแล้ว
                {form.vaccinated && (
                  <CheckCircle className="ml-auto size-4 text-green-600" />
                )}
              </button>

              {/* ─── Pet Certificate Section ────────────────────────────── */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(212,175,55,0.30)" }}
              >
                {/* Section header / toggle */}
                <button
                  type="button"
                  onClick={() => setShowPetInfo((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
                  style={{ background: "rgba(212,175,55,0.08)", color: "#6B5232" }}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="size-4 text-[#D4AF37]" />
                    ใบเพดดีกรี / ทะเบียนพันธุ์แท้ (Pet Certificate)
                  </span>
                  <ChevronDown
                    className={`size-4 transition-transform ${showPetInfo ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {showPetInfo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 py-4 space-y-4">
                        {/* Educational panel */}
                        <div
                          className="rounded-xl p-3.5 text-xs leading-relaxed text-[#6B5232] space-y-2"
                          style={{ background: "rgba(237,208,96,0.10)" }}
                        >
                          <p className="font-semibold text-[#0B1D3A] flex items-center gap-1.5">
                            <FileText className="size-3.5 text-[#D4AF37]" />
                            ใบเพดดีกรีคืออะไร?
                          </p>
                          <p>
                            เอกสารรับรองว่าแมวมีสายพันธุ์แท้ ออกโดยสมาคมแมวที่ได้รับการยอมรับระดับสากล เช่น
                            <strong> TICA</strong>, <strong>WCF</strong>, <strong>GCCF</strong>, <strong>CFA</strong>
                            หรือ <strong>สมาคมแมวแห่งประเทศไทย</strong>
                          </p>
                          <p className="font-semibold text-[#0B1D3A]">วิธีตรวจสอบ:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>ตรวจเลขทะเบียนบนใบเพดดีกรีว่าตรงกับชื่อแมว</li>
                            <li>มีตราประทับและลายเซ็นจากสมาคม</li>
                            <li>ระบุชื่อพ่อ–แม่พันธุ์ (parentage) อย่างชัดเจน</li>
                            <li>สามารถค้นหาออนไลน์ที่ <strong>tica.org</strong> หรือ <strong>wcf-online.org</strong></li>
                          </ul>
                          <div className="flex gap-2 pt-1 flex-wrap">
                            <a
                              href="https://tica.org/find-a-cat"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                              style={{ background: "rgba(212,175,55,0.20)", color: "#6B5232" }}
                            >
                              <ExternalLink className="size-3" /> tic.org
                            </a>
                            <a
                              href="https://wcf-online.org"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                              style={{ background: "rgba(212,175,55,0.20)", color: "#6B5232" }}
                            >
                              <ExternalLink className="size-3" /> wcf-online.org
                            </a>
                          </div>
                        </div>

                        {/* Registry selector */}
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">
                            สมาคม / ชมรมที่ลงทะเบียน
                          </label>
                          <div className="relative">
                            <select
                              value={form.registry}
                              onChange={(e) => patchForm("registry", e.target.value)}
                              className="w-full appearance-none rounded-xl px-3.5 py-2.5 pr-9 text-sm text-[#0B1D3A] outline-none"
                              style={{
                                background: "#FFF5F8",
                                border: "1px solid rgba(212,160,175,0.35)",
                              }}
                            >
                              {REGISTRY_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#6B5232]/50" />
                          </div>
                        </div>

                        {/* Registration number */}
                        {form.registry && form.registry !== "ยังไม่มีการลงทะเบียน" && (
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">
                              เลขทะเบียน
                            </label>
                            <input
                              type="text"
                              value={form.registrationNumber}
                              onChange={(e) => patchForm("registrationNumber", e.target.value)}
                              placeholder="เช่น TH-TICA-2023-00123"
                              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-[#0B1D3A] outline-none"
                              style={{
                                background: "#FFF5F8",
                                border: "1px solid rgba(212,160,175,0.35)",
                              }}
                            />
                          </div>
                        )}

                        {/* Certificate file upload */}
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">
                            อัปโหลดใบเพดดีกรี (PDF / รูปภาพ)
                          </label>
                          <button
                            type="button"
                            onClick={() => certInputRef.current?.click()}
                            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-opacity hover:opacity-80"
                            style={{
                              background: "#FFF5F8",
                              border: "1.5px dashed rgba(212,175,55,0.50)",
                              color: "#6B5232",
                            }}
                          >
                            <Upload className="size-4 shrink-0 text-[#D4AF37]" />
                            <span className="truncate text-xs">
                              {certFileName || "เลือกไฟล์ใบเพดดีกรี..."}
                            </span>
                          </button>
                          <input
                            ref={certInputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={handleCertFileChange}
                          />
                          {cat?.petCertificateUrl && !certFile && (
                            <a
                              href={cat.petCertificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1.5 flex items-center gap-1 text-xs text-[#D4AF37] underline"
                            >
                              <ExternalLink className="size-3" />
                              ดูเอกสารที่อัปโหลดแล้ว
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">
                  คำอธิบาย
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => patchForm("description", e.target.value)}
                  placeholder="เล่าเรื่องราวน่ารักของแมวคุณ..."
                  rows={3}
                  className="w-full resize-none rounded-xl px-3.5 py-2.5 text-sm text-[#0B1D3A] outline-none placeholder:text-[#6B5232]/40"
                  style={{
                    background: "#FFF5F8",
                    border: "1px solid rgba(212,160,175,0.35)",
                  }}
                />
              </div>

              {/* Error message */}
              {fieldError && (
                <div
                  className="flex items-center gap-2 rounded-xl p-3 text-sm text-[#B04060]"
                  style={{ background: "rgba(176,64,96,0.08)" }}
                >
                  <AlertTriangle className="size-4 shrink-0" />
                  {fieldError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg,#EDD060,#D4AF37)",
                  color: "#0B1D3A",
                }}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle className="size-4" />
                )}
                {saving ? "กำลังบันทึก..." : cat ? "บันทึกการแก้ไข" : "เพิ่มแมว"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Cat Card ─────────────────────────────────────────────────────────────────

interface CatCardProps {
  cat: Cat;
  isConfirmingDelete: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onAskDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function CatCard({
  cat,
  isConfirmingDelete,
  isDeleting,
  onEdit,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}: CatCardProps) {
  const photo = cat.photos[0];

  return (
    <motion.div
      variants={fadeUp}
      className="overflow-hidden rounded-3xl"
      style={{
        background: "#FFFAFC",
        border: "1px solid rgba(212,160,175,0.22)",
      }}
    >
      {/* Photo area */}
      <div className="relative h-48 bg-[#FFF5F8]">
        {photo ? (
          <Image
            src={photo}
            alt={cat.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PawPrint className="size-16 text-[#D4AF37]/25" />
          </div>
        )}

        {/* Gender badge */}
        <div
          className="absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur-sm"
          style={
            cat.gender === "female"
              ? { background: "rgba(249,197,209,0.90)", color: "#B04060" }
              : { background: "rgba(191,219,254,0.90)", color: "#1e40af" }
          }
        >
          {cat.gender === "female" ? "♀ เมีย" : "♂ ผู้"}
        </div>

        {/* Vaccination badge */}
        {cat.vaccinated && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-green-500/90 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
            <Shield className="size-3" />
            ฉีดวัคซีน
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-heading text-base font-bold text-[#0B1D3A]">
          {cat.name}
        </h3>
        <p className="mt-0.5 text-xs text-[#6B5232]/70">
          {cat.breed} · {getAgeLabel(cat.age)}
        </p>
        {cat.registry && (
          <span
            className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: "rgba(212,175,55,0.18)", color: "#6B5232" }}
          >
            <FileText className="size-3" />
            {cat.registry}
          </span>
        )}
        {cat.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#6B5232]/60">
            {cat.description}
          </p>
        )}

        {/* Action row with animated state switch */}
        <AnimatePresence mode="wait">
          {isConfirmingDelete ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="mt-3 space-y-2"
            >
              <p className="flex items-center gap-1.5 text-xs text-[#B04060]">
                <AlertTriangle className="size-3.5 shrink-0" />
                ยืนยันการลบโปรไฟล์แมวนี้?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onConfirmDelete}
                  disabled={isDeleting}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: "#B04060" }}
                >
                  {isDeleting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  ยืนยันลบ
                </button>
                <button
                  onClick={onCancelDelete}
                  disabled={isDeleting}
                  className="flex flex-1 items-center justify-center rounded-full py-2 text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{
                    background: "#FFF5F8",
                    border: "1px solid rgba(212,160,175,0.35)",
                    color: "#6B5232",
                  }}
                >
                  ยกเลิก
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="mt-3 flex gap-2"
            >
              <button
                onClick={onEdit}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{
                  background: "#FFF5F8",
                  border: "1px solid rgba(212,160,175,0.35)",
                  color: "#6B5232",
                }}
              >
                <Pencil className="size-3.5" />
                แก้ไข
              </button>
              <button
                onClick={onAskDelete}
                className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#F9C5D1]/50"
                style={{ color: "#B04060" }}
                aria-label="ลบแมว"
              >
                <Trash2 className="size-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CatsContent() {
  const { user } = useAuth();
  const [cats, setCats] = useState<Cat[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Cat | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Real-time Firestore listener filtered to the current user's cats
  useEffect(() => {
    if (!user) {
      setCats([]);
      setCatsLoading(false);
      return;
    }

    const q = query(collection(db, "cats"), where("ownerId", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Cat[] = snapshot.docs.map((d) =>
          normalizeCatRecord(d.id, d.data())
        );
        setCats(data);
        setCatsLoading(false);
      },
      (err) => {
        console.error("Cats snapshot error:", err);
        setCatsLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  function openAddModal() {
    setEditingCat(null);
    setShowModal(true);
  }

  function openEditModal(cat: Cat) {
    setEditingCat(cat);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingCat(null);
  }

  async function handleDeleteCat(catId: string) {
    setDeletingId(catId);
    try {
      const target = cats.find((c) => c.id === catId);
      await deleteDoc(doc(db, "cats", catId));
      // Best-effort: delete all photos from Storage
      if (target?.photos.length) {
        await Promise.allSettled(target.photos.map(tryDeleteStoragePhoto));
      }
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Failed to delete cat:", err);
    } finally {
      setDeletingId(null);
    }
  }

  const atLimit = cats.length >= FREE_CAT_LIMIT;
  const displayName =
    user?.displayName ?? user?.email?.split("@")[0] ?? "ผู้ใช้";

  return (
    <AppShell>
      {/* Modal (AnimatePresence enables exit animation) */}
      <AnimatePresence>
        {showModal && user && (
          <CatFormModal
            key="cat-form-modal"
            cat={editingCat}
            userId={user.uid}
            userDisplayName={displayName}
            onClose={closeModal}
            onSaved={closeModal}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mx-auto max-w-4xl space-y-5"
      >
        {/* Header */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-heading text-xl font-extrabold text-[#0B1D3A]">
              โปรไฟล์แมวของฉัน
            </h1>
            <p className="text-xs text-[#6B5232]/60">
              จัดการโปรไฟล์และข้อมูลแมวของคุณ
            </p>
          </div>

          {atLimit ? (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#EDD060,#D4AF37)",
                color: "#0B1D3A",
              }}
            >
              <Crown className="size-4" /> อัปเกรด
            </Link>
          ) : (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#EDD060,#D4AF37)",
                color: "#0B1D3A",
              }}
            >
              <Plus className="size-4" /> เพิ่มแมว
            </button>
          )}
        </motion.div>

        {/* Loading skeleton */}
        {catsLoading && (
          <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-3xl"
                style={{
                  background: "#FFFAFC",
                  border: "1px solid rgba(212,160,175,0.22)",
                }}
              >
                <div className="h-48 bg-[#F9C5D1]/20" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-24 rounded-full bg-[#F9C5D1]/30" />
                  <div className="h-3 w-36 rounded-full bg-[#F9C5D1]/20" />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Content: empty state or cat grid */}
        {!catsLoading && (
          <>
            {cats.length === 0 ? (
              /* Empty state */
              <motion.div variants={fadeUp}>
                <div
                  className="flex flex-col items-center justify-center rounded-3xl py-16 text-center"
                  style={{
                    background: "#FFFAFC",
                    border: "1px solid rgba(212,160,175,0.22)",
                  }}
                >
                  <PawPrint className="mb-4 size-12 text-[#D4AF37]/40" />
                  <h3 className="text-base font-bold text-[#0B1D3A]">
                    ยังไม่มีแมวในโปรไฟล์
                  </h3>
                  <p className="mt-1 text-xs text-[#6B5232]/50">
                    เพิ่มแมวของคุณเพื่อเริ่มจับคู่
                  </p>
                  <button
                    onClick={openAddModal}
                    className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg,#EDD060,#D4AF37)",
                      color: "#0B1D3A",
                    }}
                  >
                    <Plus className="size-4" /> เพิ่มแมวตัวแรก
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Cat cards grid */
              <motion.div
                variants={fadeUp}
                className="grid gap-4 sm:grid-cols-2"
              >
                {cats.map((cat) => (
                  <CatCard
                    key={cat.id}
                    cat={cat}
                    isConfirmingDelete={confirmDeleteId === cat.id}
                    isDeleting={deletingId === cat.id}
                    onEdit={() => openEditModal(cat)}
                    onAskDelete={() => setConfirmDeleteId(cat.id)}
                    onConfirmDelete={() => handleDeleteCat(cat.id)}
                    onCancelDelete={() => setConfirmDeleteId(null)}
                  />
                ))}

                {/* Add card or premium upsell (fills the grid) */}
                {!atLimit ? (
                  <button
                    onClick={openAddModal}
                    className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed py-16 text-center transition-all hover:border-[#D4AF37]"
                    style={{ borderColor: "rgba(212,175,55,0.35)" }}
                  >
                    <div
                      className="mb-3 flex size-14 items-center justify-center rounded-full"
                      style={{ background: "rgba(212,175,55,0.12)" }}
                    >
                      <Plus className="size-7 text-[#D4AF37]" />
                    </div>
                    <p className="text-sm font-bold text-[#0B1D3A]">
                      เพิ่มแมวตัวใหม่
                    </p>
                    <p className="mt-1 text-xs text-[#6B5232]/50">
                      เหลืออีก {FREE_CAT_LIMIT - cats.length} ตัว (แผนฟรี)
                    </p>
                  </button>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center rounded-3xl p-8 text-center"
                    style={{
                      background: "linear-gradient(135deg,#FDF0F4,#F9DDE8)",
                      border: "1px solid rgba(212,140,165,0.30)",
                    }}
                  >
                    <Crown className="mb-2 size-8 text-[#D4AF37]" />
                    <p className="text-sm font-bold text-[#4A1030]">
                      เพิ่มแมวได้ไม่จำกัด
                    </p>
                    <p className="mt-1 text-xs text-[#6B5232]/70">
                      อัปเกรดเป็น Premium เพื่อลงทะเบียนแมวได้ไม่จำกัดตัว พร้อม
                      Health Passport เต็มรูปแบบ
                    </p>
                    <Link
                      href="/pricing"
                      className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-opacity hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg,#EDD060,#D4AF37)",
                        color: "#0B1D3A",
                      }}
                    >
                      <Crown className="size-4" /> ดูแผน Premium
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </AppShell>
  );
}
