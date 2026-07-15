"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useRouter } from "@/i18n/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/services/firebase";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { CheckCircle, Eye, EyeOff, RefreshCw } from "lucide-react";
import Image from "next/image";

const GOOGLE_SVG = (
  <svg className="size-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

type Step = "info" | "otp" | "password" | "done";

const STEP_LABELS = ["ข้อมูล", "ยืนยัน OTP", "รหัสผ่าน"];
const STEP_MAP: Record<Step, number> = { info: 0, otp: 1, password: 2, done: 3 };

export function RegisterContent() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");

  // Form data
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otp, setOtp]     = useState(["", "", "", "", "", ""]);
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);

  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Step 1: Info → send OTP ─────────────────────────────────────────────────

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("กรุณาใส่ชื่อของคุณ"); return; }
    if (!email.includes("@")) { setError("กรุณาใส่อีเมลที่ถูกต้อง"); return; }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 9) {
      setError("กรุณาใส่เบอร์โทรศัพท์ที่ถูกต้อง"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ไม่สามารถส่ง OTP ได้");
      setOtpToken(data.token);
      setOtp(["", "", "", "", "", ""]);
      setStep("otp");
    } catch (err: unknown) {
      setError((err as Error).message ?? "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────

  function handleOtpChange(idx: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setError("");
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = Array.from({ length: 6 }, (_, i) => text[i] ?? "");
    setOtp(next);
    otpRefs.current[Math.min(text.length, 5)]?.focus();
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("กรุณาใส่รหัส 6 หลักให้ครบ"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, token: otpToken }),
      });
      const data = await res.json();
      if (!data.valid) {
        setError("รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอรหัสใหม่");
        return;
      }
      setStep("password");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3: Create account ──────────────────────────────────────────────────

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return; }
    if (password !== confirm) { setError("รหัสผ่านไม่ตรงกัน"); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        displayName: name,
        email,
        phone,
        role: "user",
        createdAt: serverTimestamp(),
      });
      setStep("done");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setError("มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว กรุณาเข้าสู่ระบบแทน");
      } else if (code === "auth/weak-password") {
        setError("รหัสผ่านอ่อนแอเกินไป กรุณาเลือกรหัสผ่านที่แข็งแกร่งกว่านี้");
      } else {
        setError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Google sign-up ──────────────────────────────────────────────────────────

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const u = cred.user;
      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);
      // Only create doc on first sign-in; never overwrite existing role
      if (!snap.exists()) {
        await setDoc(userRef, {
          displayName: u.displayName ?? "",
          email: u.email ?? "",
          phone: "",
          role: "user",
          createdAt: serverTimestamp(),
        });
      }
      router.push("/dashboard");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  // ── Progress bar ────────────────────────────────────────────────────────────

  const currentStepIdx = STEP_MAP[step] ?? 0;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <Image src="/img/Blackgroud3.png" alt="" fill className="object-cover object-center" quality={85} priority />
      <div className="absolute inset-0" style={{ background: "rgba(255,250,240,0.62)" }} />

      <motion.div
        initial="hidden" animate="visible" variants={staggerContainer}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div variants={fadeUp} className="text-center">
          <Link href="/" className="inline-flex justify-center">
            <div className="relative h-14 w-48">
              <Image src="/img/logo_and_icon.png" alt="Catinder" fill className="object-contain" />
            </div>
          </Link>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ color: "#D4AF37" }}>เข้าร่วมฟรี</p>
          <h1 className="mt-3 font-heading text-2xl font-bold text-[#0B1D3A]">สร้างบัญชีของคุณ</h1>
        </motion.div>

        {/* Step indicator */}
        {step !== "done" && (
          <motion.div variants={fadeUp} className="mt-6 flex items-center justify-center gap-2">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className="flex size-6 items-center justify-center rounded-full text-[10px] font-bold transition-all"
                    style={{
                      background: i < currentStepIdx ? "#22c55e" : i === currentStepIdx ? "linear-gradient(135deg,#EDD060,#D4AF37)" : "rgba(212,175,55,0.15)",
                      color: i <= currentStepIdx ? "#0B1D3A" : "#6B5232",
                    }}
                  >
                    {i < currentStepIdx ? <CheckCircle className="size-3.5 text-white" /> : i + 1}
                  </div>
                  <span className="hidden text-[11px] font-semibold sm:block"
                    style={{ color: i === currentStepIdx ? "#0B1D3A" : "#6B5232" }}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className="h-px w-8 transition-all"
                    style={{ background: i < currentStepIdx ? "#22c55e" : "rgba(212,175,55,0.20)" }} />
                )}
              </div>
            ))}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* ── Step 1: Info ── */}
          {step === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="mt-6 rounded-3xl p-8"
              style={{ background: "rgba(255,254,245,0.90)", backdropFilter: "blur(20px)", border: "1px solid rgba(212,175,55,0.30)", boxShadow: "0 8px 40px rgba(11,29,58,0.12)" }}
            >
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white py-3 text-sm font-semibold hover:bg-muted disabled:opacity-60 transition-colors"
              >
                {GOOGLE_SVG} สมัครด้วย Google
              </button>

              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground">หรือใช้อีเมล</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#0B1D3A]">ชื่อเต็ม</label>
                  <input
                    type="text"
                    placeholder="ชื่อของคุณ"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#0B1D3A]">อีเมล</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#0B1D3A]">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    placeholder="0812345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
                  />
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-[var(--petal-pink)]/30 px-4 py-3 text-sm font-semibold">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full py-3 text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
                  style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}
                >
                  {loading ? "กำลังส่งรหัส..." : "ส่งรหัส OTP →"}
                </button>
                <p className="text-center text-[11px] text-muted-foreground">
                  การสมัครสมาชิกถือว่าคุณยอมรับข้อกำหนดการใช้บริการและนโยบายความเป็นส่วนตัว
                </p>
              </form>
            </motion.div>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="mt-6 rounded-3xl p-8"
              style={{ background: "rgba(255,254,245,0.90)", backdropFilter: "blur(20px)", border: "1px solid rgba(212,175,55,0.30)", boxShadow: "0 8px 40px rgba(11,29,58,0.12)" }}
            >
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full"
                  style={{ background: "rgba(212,175,55,0.15)" }}>
                  <span className="text-2xl">📧</span>
                </div>
                <h2 className="text-base font-extrabold text-[#0B1D3A]">ยืนยันอีเมลของคุณ</h2>
                <p className="mt-1 text-sm text-[#6B5232]">
                  เราส่งรหัส 6 หลักไปที่<br/>
                  <strong className="text-[#0B1D3A]">{email}</strong>
                </p>
                <p className="mt-1 text-xs text-[#6B5232]/60">รหัสหมดอายุใน 10 นาที</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* 6-box OTP input */}
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="size-12 rounded-2xl border-2 text-center text-xl font-extrabold outline-none transition-all focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
                      style={{
                        borderColor: digit ? "#D4AF37" : "rgba(212,175,55,0.30)",
                        background: digit ? "rgba(212,175,55,0.08)" : "white",
                        color: "#0B1D3A",
                      }}
                    />
                  ))}
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-[var(--petal-pink)]/30 px-4 py-3 text-center text-sm font-semibold">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="w-full rounded-full py-3 text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
                  style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}
                >
                  {loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส OTP"}
                </button>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setStep("info")}
                    className="text-[#6B5232] hover:text-[#0B1D3A]"
                  >
                    ← แก้ไขอีเมล
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendOtp({ preventDefault: () => {} } as React.FormEvent)}
                    disabled={loading}
                    className="flex items-center gap-1 font-semibold text-[#D4AF37] hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className="size-3" /> ส่งรหัสใหม่
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── Step 3: Password ── */}
          {step === "password" && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="mt-6 rounded-3xl p-8"
              style={{ background: "rgba(255,254,245,0.90)", backdropFilter: "blur(20px)", border: "1px solid rgba(212,175,55,0.30)", boxShadow: "0 8px 40px rgba(11,29,58,0.12)" }}
            >
              <div className="mb-5 flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.20)" }}>
                <CheckCircle className="size-4 flex-shrink-0 text-green-500" />
                <p className="text-sm font-semibold text-[#0B1D3A]">ยืนยันอีเมล <strong>{email}</strong> แล้ว ✓</p>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#0B1D3A]">ตั้งรหัสผ่าน</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="อย่างน้อย 8 ตัวอักษร"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      required
                      autoFocus
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  <div className="mt-2 flex gap-1">
                    {[8, 10, 12].map((threshold) => (
                      <div key={threshold} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: password.length >= threshold ? "#22c55e" : "rgba(212,175,55,0.20)" }} />
                    ))}
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      {password.length === 0 ? "" : password.length < 8 ? "อ่อน" : password.length < 10 ? "พอใช้" : password.length < 12 ? "ดี" : "แข็งแกร่ง"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#0B1D3A]">ยืนยันรหัสผ่าน</label>
                  <div className="relative">
                    <input
                      type={showCf ? "text" : "password"}
                      placeholder="ใส่รหัสผ่านอีกครั้ง"
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                      required
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
                      style={{ borderColor: confirm && confirm !== password ? "rgba(220,80,80,0.50)" : "" }}
                    />
                    <button type="button" onClick={() => setShowCf((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showCf ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-[var(--petal-pink)]/30 px-4 py-3 text-sm font-semibold">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full py-3 text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
                  style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}
                >
                  {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชีฟรี 🐾"}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Step 4: Done ── */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mt-8 rounded-3xl p-10 text-center"
              style={{ background: "rgba(255,254,245,0.90)", backdropFilter: "blur(20px)", border: "1px solid rgba(212,175,55,0.30)", boxShadow: "0 8px 40px rgba(11,29,58,0.12)" }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="mx-auto mb-4 text-5xl"
              >
                🎉
              </motion.div>
              <h2 className="text-xl font-extrabold text-[#0B1D3A]">ยินดีต้อนรับสู่ Catinder!</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6B5232]">
                บัญชีของ <strong>{name}</strong> พร้อมแล้ว<br/>
                เริ่มต้นการเดินทางกับแมวของคุณได้เลย 🐾
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-6 inline-block rounded-full px-8 py-3 text-sm font-bold hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}
              >
                ไปหน้าหลัก →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {(step === "info" || step === "otp") && (
          <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-muted-foreground">
            มีบัญชีอยู่แล้วใช่ไหม?{" "}
            <Link href="/login" className="font-bold text-foreground hover:underline">
              เข้าสู่ระบบ
            </Link>
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
