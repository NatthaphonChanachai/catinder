"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, sendEmailVerification } from "firebase/auth";
import { auth, googleProvider } from "@/services/firebase";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { MailCheck } from "lucide-react";
import Image from "next/image";

const GOOGLE_SVG = (
  <svg className="size-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export function RegisterContent() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.email.includes("@")) { setError(t("emailError")); return; }
    if (form.password.length < 8) { setError(t("passwordError")); return; }
    if (form.password !== form.confirm) { setError(t("matchError")); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });
      await sendEmailVerification(cred.user);
      setSentEmail(form.email);
      setVerificationSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setError(t("emailInUseError"));
      } else if (code === "auth/weak-password") {
        setError(t("weakPasswordError"));
      } else {
        setError(t("genericError"));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch {
      setError(t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { name: "name", label: t("fieldName"), placeholder: t("fieldNamePlaceholder"), type: "text" },
    { name: "email", label: t("fieldEmail"), placeholder: t("fieldEmailPlaceholder"), type: "email" },
    { name: "password", label: t("fieldPassword"), placeholder: t("fieldPasswordPlaceholder"), type: "password" },
    { name: "confirm", label: t("fieldConfirmPassword"), placeholder: t("fieldConfirmPasswordPlaceholder"), type: "password" },
  ] as const;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      {/* Heavenly background — Blackgroud3 (castle) */}
      <Image src="/img/Blackgroud3.png" alt="" fill className="object-cover object-center" quality={85} priority />
      <div className="absolute inset-0" style={{ background: "rgba(255,250,240,0.62)" }} />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 w-full max-w-md"
      >
        <motion.div variants={fadeUp} className="text-center">
          <Link href="/" className="inline-flex justify-center">
            <div className="relative h-14 w-48">
              <Image src="/img/logo_and_icon.png" alt="Catinder" fill className="object-contain" />
            </div>
          </Link>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ color: "#D4AF37" }}>{t("registerBadge")}</p>
          <h1 className="mt-3 font-heading text-2xl font-bold text-[#0B1D3A]">{t("registerTitle")}</h1>
          <p className="mt-2 text-sm" style={{ color: "#6B5232" }}>{t("registerSubtitle")}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {verificationSent ? (
            /* ── Verification sent state ── */
            <motion.div
              key="verify"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 rounded-3xl p-10 text-center"
              style={{
                background: "rgba(255,254,245,0.88)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(212,175,55,0.30)",
                boxShadow: "0 8px 40px rgba(11,29,58,0.12)",
              }}
            >
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[var(--soft-gold)]/30">
                <MailCheck className="size-8 text-[var(--rose-gold)]" />
              </div>
              <h2 className="text-lg font-extrabold">{t("verifyTitle")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("verifyBody1")} <strong>{sentEmail}</strong>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{t("verifyBody2")}</p>
              <Link
                href="/login"
                className="mt-6 inline-block rounded-full px-8 py-3 text-sm font-bold hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #EDD060 0%, #D4AF37 100%)", color: "#0B1D3A" }}
              >
                {t("verifyGoLogin")}
              </Link>
              <p className="mt-4 text-xs text-muted-foreground">{t("verifySpamHint")}</p>
            </motion.div>
          ) : (
            /* ── Registration form ── */
            <motion.div
              key="form"
              variants={fadeUp}
              className="mt-8 rounded-3xl p-8"
              style={{
                background: "rgba(255,254,245,0.88)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(212,175,55,0.30)",
                boxShadow: "0 8px 40px rgba(11,29,58,0.12)",
              }}
            >
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white py-3 text-sm font-semibold hover:bg-muted disabled:opacity-60"
              >
                {GOOGLE_SVG}
                {t("googleBtn")}
              </button>

              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground">{t("orWith")}</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {fields.map((field) => (
                  <div key={field.name}>
                    <label className="mb-1.5 block text-sm font-semibold">{field.label}</label>
                    <input
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
                    />
                  </div>
                ))}

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-[var(--petal-pink)]/30 px-4 py-3 text-sm font-semibold"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full py-3 text-sm font-bold hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #EDD060 0%, #D4AF37 100%)", color: "#0B1D3A" }}
                >
                  {loading ? t("registering") : t("registerBtn")}
                </button>
                <p className="text-center text-[11px] text-muted-foreground">{t("terms")}</p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {!verificationSent && (
          <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link href="/login" className="font-bold text-foreground hover:underline">
              {t("loginLink")}
            </Link>
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
