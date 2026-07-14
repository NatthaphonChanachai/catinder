"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, Link } from "@/i18n/navigation";
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from "@/services/firebase";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import Image from "next/image";

const GOOGLE_SVG = (
  <svg className="size-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<{ msg: string; type: "invalid" | "notfound" | "other" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) { setError({ msg: "กรุณาใส่อีเมลที่ถูกต้อง", type: "other" }); return; }
    if (password.length < 6) { setError({ msg: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", type: "other" }); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError({ msg: "อีเมลหรือรหัสผ่านไม่ถูกต้อง", type: "invalid" });
      } else if (code === "auth/too-many-requests") {
        setError({ msg: "ลองหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่", type: "other" });
      } else if (code === "auth/user-disabled") {
        setError({ msg: "บัญชีนี้ถูกระงับ กรุณาติดต่อทีมงาน", type: "other" });
      } else {
        setError({ msg: "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง", type: "other" });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch {
      setError({ msg: "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง", type: "other" });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!email.includes("@")) {
      setError({ msg: "กรุณาใส่อีเมลก่อน แล้วกด 'ลืมรหัสผ่าน'", type: "other" });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError(null);
    } catch {
      setError({ msg: "ไม่สามารถส่งอีเมลรีเซ็ตได้ กรุณาตรวจสอบอีเมล", type: "other" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <Image src="/img/Blackgroud2.png" alt="" fill className="object-cover object-center" quality={85} priority />
      <div className="absolute inset-0" style={{ background: "rgba(255,250,240,0.60)" }} />

      <motion.div
        initial="hidden" animate="visible" variants={staggerContainer}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo + title */}
        <motion.div variants={fadeUp} className="text-center">
          <Link href="/" className="inline-flex justify-center">
            <div className="relative h-14 w-48">
              <Image src="/img/logo_and_icon.png" alt="Catinder" fill className="object-contain" />
            </div>
          </Link>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ color: "#D4AF37" }}>
            ยินดีต้อนรับกลับ
          </p>
          <h1 className="mt-3 font-heading text-2xl font-bold text-[#0B1D3A]">เข้าสู่ระบบ</h1>
          <p className="mt-2 text-sm" style={{ color: "#6B5232" }}>ดีใจที่ได้เจออีกครั้ง แมวของคุณคิดถึงคุณนะ</p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-8 rounded-3xl p-8"
          style={{
            background: "rgba(255,254,245,0.90)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(212,175,55,0.30)",
            boxShadow: "0 8px 40px rgba(11,29,58,0.12)",
          }}
        >
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white py-3 text-sm font-semibold hover:bg-muted disabled:opacity-60 transition-colors"
          >
            {GOOGLE_SVG} ดำเนินการต่อด้วย Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">หรือใช้อีเมล</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Reset sent banner */}
          <AnimatePresence>
            {resetSent && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-4 flex items-start gap-2 rounded-2xl px-4 py-3"
                style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)" }}
              >
                <CheckCircle className="mt-0.5 size-4 flex-shrink-0 text-green-500" />
                <div>
                  <p className="text-sm font-semibold text-[#0B1D3A]">ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว</p>
                  <p className="text-xs text-[#6B5232]">ตรวจสอบอีเมล <strong>{email}</strong> (รวมถึงโฟลเดอร์สแปม)</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#0B1D3A]">อีเมล</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); setResetSent(false); }}
                required
                autoFocus
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-semibold text-[#0B1D3A]">รหัสผ่าน</label>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="text-xs text-muted-foreground hover:text-[#D4AF37] transition-colors"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="รหัสผ่านของคุณ"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  required
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-2xl px-4 py-3"
                  style={{ background: "rgba(212,140,165,0.15)", border: "1px solid rgba(212,140,165,0.30)" }}
                >
                  <p className="text-sm font-semibold text-[#4A1030]">{error.msg}</p>
                  {error.type === "invalid" && (
                    <p className="mt-1 text-xs text-[#6B5232]">
                      ยังไม่มีบัญชีใช่ไหม?{" "}
                      <Link href="/register" className="font-bold text-[#D4AF37] hover:underline">
                        สมัครสมาชิกฟรี →
                      </Link>
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-3 text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
              style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </motion.div>

        <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-muted-foreground">
          ยังไม่มีบัญชีใช่ไหม?{" "}
          <Link href="/register" className="font-bold text-foreground hover:underline">
            สมัครสมาชิกฟรี
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
