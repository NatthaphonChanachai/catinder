"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  collection, query, where, onSnapshot, addDoc, serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/services/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Crown, Loader2, Upload, CheckCircle, Clock, ShieldCheck,
  AlertTriangle, QrCode, ArrowLeft,
} from "lucide-react";

const PROMPTPAY_ID = process.env.NEXT_PUBLIC_PROMPTPAY_ID ?? "";

const PLANS = {
  monthly: { label: "รายเดือน", amount: 99, days: 30 },
  annual: { label: "รายปี", amount: 799, days: 365 },
} as const;

type PlanKey = keyof typeof PLANS;

interface PremiumRequest {
  id: string;
  status: "pending" | "approved" | "rejected";
  plan: string;
  amount: number;
  createdAt?: DocumentData;
}

function toMillis(ts?: DocumentData): number {
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis() as number;
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  return 0;
}

export function CheckoutContent() {
  const { user, userProfile, isPremium, loading } = useAuth();
  const router = useRouter();

  const [plan, setPlan] = useState<PlanKey>("monthly");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestRequest, setLatestRequest] = useState<PremiumRequest | null>(null);
  const slipInputRef = useRef<HTMLInputElement>(null);

  // Read plan from URL query on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("plan");
    if (p === "annual" || p === "monthly") setPlan(p);
  }, []);

  // Watch this user's premium requests, pick the latest client-side
  // (avoids needing a composite Firestore index for launch)
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "premiumRequests"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as PremiumRequest))
        .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      setLatestRequest(docs[0] ?? null);
    }, () => {});
    return unsub;
  }, [user]);

  const selected = PLANS[plan];
  const qrUrl = PROMPTPAY_ID
    ? `https://promptpay.io/${PROMPTPAY_ID}/${selected.amount}.png`
    : "";

  function handleSlipChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("รูปหลักฐานต้องไม่เกิน 5MB");
      return;
    }
    setError(null);
    if (slipPreview.startsWith("blob:")) URL.revokeObjectURL(slipPreview);
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!user) return;
    if (!slipFile) {
      setError("กรุณาแนบหลักฐานการโอนเงิน");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const ext = slipFile.name.split(".").pop() ?? "jpg";
      const path = `premiumSlips/${user.uid}/${Date.now()}.${ext}`;
      const snap = await uploadBytes(storageRef(storage, path), slipFile);
      const slipUrl = await getDownloadURL(snap.ref);

      await addDoc(collection(db, "premiumRequests"), {
        userId: user.uid,
        userName: userProfile?.displayName ?? "",
        userEmail: userProfile?.email ?? user.email ?? "",
        plan: plan,
        planLabel: selected.label,
        amount: selected.amount,
        days: selected.days,
        slipUrl,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      // onSnapshot will pick up the new pending request and switch the view
    } catch (err) {
      console.error("[checkout] submit error:", err);
      setError("ส่งคำขอไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#FFF5F8" }}>
        <Loader2 className="size-6 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  // ─── Not logged in (the fix for "กด premium แล้วเด้ง login") ─────────────────
  if (!user) {
    return (
      <Shell>
        <div className="rounded-3xl p-8 text-center" style={cardStyle}>
          <Crown className="mx-auto mb-4 size-12 text-[#D4AF37]" />
          <h2 className="font-heading text-xl font-bold text-[#0B1D3A]">
            สมัครฟรีก่อน แล้วอัปเกรดได้เลย
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[#6B5232]">
            การอัปเกรด Premium ต้องมีบัญชีก่อน เพื่อผูกสิทธิ์กับแมวของคุณ
            สมัครฟรีใช้เวลาไม่ถึงนาที
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register?next=/premium/checkout"
              className="rounded-full px-6 py-3 text-sm font-bold"
              style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}
            >
              สมัครฟรี
            </Link>
            <Link
              href="/login?next=/premium/checkout"
              className="rounded-full px-6 py-3 text-sm font-semibold"
              style={{ border: "1.5px solid rgba(212,175,55,0.4)", color: "#C4A020" }}
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  // ─── Already premium ─────────────────────────────────────────────────────────
  if (isPremium) {
    return (
      <Shell>
        <div className="rounded-3xl p-8 text-center" style={cardStyle}>
          <ShieldCheck className="mx-auto mb-4 size-12 text-green-500" />
          <h2 className="font-heading text-xl font-bold text-[#0B1D3A]">
            คุณเป็นสมาชิก Premium อยู่แล้ว 🎉
          </h2>
          {userProfile?.premiumUntil && (
            <p className="mt-2 text-sm text-[#6B5232]">
              ใช้งานได้ถึง{" "}
              {new Date(userProfile.premiumUntil).toLocaleDateString("th-TH", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          )}
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 rounded-full px-6 py-3 text-sm font-bold"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}
          >
            ไปที่แดชบอร์ด
          </button>
        </div>
      </Shell>
    );
  }

  // ─── Pending request ─────────────────────────────────────────────────────────
  if (latestRequest?.status === "pending") {
    return (
      <Shell>
        <div className="rounded-3xl p-8 text-center" style={cardStyle}>
          <Clock className="mx-auto mb-4 size-12 text-[#D4AF37]" />
          <h2 className="font-heading text-xl font-bold text-[#0B1D3A]">
            กำลังตรวจสอบการชำระเงิน
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[#6B5232]">
            เราได้รับหลักฐานการโอนของคุณแล้ว ทีมงานจะยืนยันและเปิดใช้งาน Premium
            ให้ภายใน 24 ชั่วโมง คุณจะได้รับการแจ้งเตือนเมื่อเปิดใช้งานเรียบร้อย
          </p>
          <div
            className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
            style={{ background: "rgba(212,175,55,0.12)", color: "#C4A020" }}
          >
            แผน {latestRequest.plan === "annual" ? "รายปี" : "รายเดือน"} · {latestRequest.amount} ฿
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 block w-full rounded-full py-3 text-sm font-semibold sm:mx-auto sm:w-auto sm:px-8"
            style={{ border: "1.5px solid rgba(212,175,55,0.4)", color: "#C4A020" }}
          >
            กลับไปใช้งานต่อ
          </button>
        </div>
      </Shell>
    );
  }

  // ─── Checkout form ───────────────────────────────────────────────────────────
  return (
    <Shell>
      {latestRequest?.status === "rejected" && (
        <div
          className="mb-4 flex items-center gap-2 rounded-2xl p-3 text-sm"
          style={{ background: "rgba(176,64,96,0.08)", color: "#B04060" }}
        >
          <AlertTriangle className="size-4 shrink-0" />
          คำขอก่อนหน้าไม่ผ่านการตรวจสอบ กรุณาโอนใหม่และแนบหลักฐานที่ชัดเจน
        </div>
      )}

      <div className="rounded-3xl p-6" style={cardStyle}>
        <div className="mb-5 flex items-center gap-2">
          <Crown className="size-5 text-[#D4AF37]" />
          <h2 className="font-heading text-lg font-bold text-[#0B1D3A]">อัปเกรดเป็น Premium</h2>
        </div>

        {/* Plan selector */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {(Object.keys(PLANS) as PlanKey[]).map((k) => {
            const p = PLANS[k];
            const active = plan === k;
            return (
              <button
                key={k}
                onClick={() => setPlan(k)}
                className="rounded-2xl p-4 text-left transition-all"
                style={
                  active
                    ? { background: "#0B1D3A", color: "#fff" }
                    : { background: "#FFF5F8", border: "1px solid rgba(212,160,175,0.35)", color: "#0B1D3A" }
                }
              >
                <p className="text-xs font-semibold opacity-70">{p.label}</p>
                <p className="mt-1 text-2xl font-black">
                  {p.amount}
                  <span className="text-sm font-normal opacity-60"> ฿</span>
                </p>
                {k === "annual" && (
                  <p className={`mt-0.5 text-[10px] font-bold ${active ? "text-amber-300" : "text-[#B04060]"}`}>
                    ประหยัด 32%
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* PromptPay QR */}
        <div className="mb-6 flex flex-col items-center rounded-2xl p-5" style={{ background: "#FFF5F8" }}>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#6B5232]">
            <QrCode className="size-4 text-[#D4AF37]" />
            สแกนจ่ายด้วย PromptPay
          </div>
          {qrUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="PromptPay QR"
                width={200}
                height={200}
                className="rounded-xl bg-white p-2"
              />
              <p className="mt-3 text-center text-sm text-[#0B1D3A]">
                ยอดชำระ <strong className="text-lg">{selected.amount} ฿</strong>
              </p>
              <p className="mt-1 text-center text-[11px] text-[#6B5232]/70">
                เปิดแอปธนาคาร → สแกน QR → โอนตามยอด → แคปหลักฐาน
              </p>
            </>
          ) : (
            <div className="rounded-xl bg-white/60 px-4 py-8 text-center text-xs text-[#B04060]">
              <AlertTriangle className="mx-auto mb-2 size-5" />
              ยังไม่ได้ตั้งค่า PromptPay ID<br />
              <span className="text-[#6B5232]/70">
                (ผู้ดูแลระบบต้องตั้งค่า NEXT_PUBLIC_PROMPTPAY_ID)
              </span>
            </div>
          )}
        </div>

        {/* Slip upload */}
        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-semibold text-[#6B5232]">
            แนบหลักฐานการโอนเงิน <span className="text-[#B04060]">*</span>
          </label>
          <button
            type="button"
            onClick={() => slipInputRef.current?.click()}
            className="flex w-full items-center justify-center overflow-hidden rounded-2xl transition-opacity hover:opacity-90"
            style={{
              minHeight: slipPreview ? "auto" : "5rem",
              background: "rgba(212,175,55,0.06)",
              border: "1.5px dashed rgba(212,175,55,0.50)",
            }}
          >
            {slipPreview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={slipPreview} alt="slip" className="max-h-52 w-full object-contain" />
            ) : (
              <span className="flex items-center gap-2 py-6 text-sm text-[#6B5232]">
                <Upload className="size-4 text-[#D4AF37]" />
                คลิกเพื่อแนบสลิป
              </span>
            )}
          </button>
          <input
            ref={slipInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSlipChange}
          />
        </div>

        {error && (
          <div
            className="mb-4 flex items-center gap-2 rounded-xl p-3 text-sm text-[#B04060]"
            style={{ background: "rgba(176,64,96,0.08)" }}
          >
            <AlertTriangle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !slipFile}
          className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
          {submitting ? "กำลังส่ง..." : "ส่งหลักฐานและยืนยัน"}
        </button>

        <p className="mt-3 text-center text-[11px] text-[#6B5232]/60">
          ทีมงานจะตรวจสอบและเปิดใช้งานภายใน 24 ชม. ·{" "}
          <Link href="/refund" className="underline">
            นโยบายการคืนเงิน
          </Link>
        </p>
      </div>
    </Shell>
  );
}

// ─── Shell wrapper ──────────────────────────────────────────────────────────────

const cardStyle = {
  background: "#FFFAFC",
  border: "1px solid rgba(212,160,175,0.22)",
  boxShadow: "0 4px 24px rgba(11,29,58,0.05)",
} as React.CSSProperties;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#FFF5F8" }}>
      <div className="mx-auto max-w-lg px-4 py-8 md:py-12">
        <Link
          href="/pricing"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: "#B04060" }}
        >
          <ArrowLeft className="size-4" />
          กลับไปหน้าแผนราคา
        </Link>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
