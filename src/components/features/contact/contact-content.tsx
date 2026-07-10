"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Send, Clock, HelpCircle } from "lucide-react";
import { LinkButton } from "@/components/shared/link-button";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function ContactContent() {
  const t = useTranslations("contactPage");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-[var(--warm-ivory)] to-background px-6 py-16 text-center sm:py-20">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-xl">
          <motion.span variants={fadeUp} className="inline-block rounded-full bg-[var(--champagne)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            {t("badge")}
          </motion.span>
          <motion.h1 variants={fadeUp} className="mt-5 text-3xl font-extrabold sm:text-4xl">
            {t("title")}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-base text-muted-foreground">
            {t("subtitle")}
          </motion.p>
        </motion.div>
      </section>

      {/* ── Form + Sidebar ── */}
      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-3">
          {/* Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="lg:col-span-2"
          >
            {sent ? (
              <div className="flex flex-col items-center gap-4 rounded-3xl bg-[var(--soft-cream)] py-16 text-center">
                <span className="text-4xl">🐾</span>
                <p className="text-base font-bold">{t("sent")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  { name: "name", label: t("fieldName"), placeholder: t("fieldNamePlaceholder"), type: "text" },
                  { name: "email", label: t("fieldEmail"), placeholder: t("fieldEmailPlaceholder"), type: "email" },
                  { name: "subject", label: t("fieldSubject"), placeholder: t("fieldSubjectPlaceholder"), type: "text" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="mb-1.5 block text-sm font-semibold">{field.label}</label>
                    <input
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
                    />
                  </div>
                ))}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">{t("fieldMessage")}</label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder={t("fieldMessagePlaceholder")}
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--soft-gold)] py-3 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  <Send className="size-4" />
                  {loading ? t("sending") : t("submit")}
                </button>
              </form>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
            className="flex flex-col gap-5"
          >
            <motion.div variants={fadeUp} className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border/60">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-[var(--soft-gold)]" />
                <p className="text-sm font-bold">{t("responseTime")}</p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="rounded-3xl bg-[var(--warm-ivory)] p-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-5 text-[var(--rose-gold)]" />
                <div>
                  <p className="text-sm font-bold">{t("faqShortcutTitle")}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t("faqShortcutSubtitle")}</p>
                </div>
              </div>
              <div className="mt-4">
                <LinkButton href="/faq" variant="outline" size="sm" className="w-full rounded-full">
                  {t("faqShortcutCta")}
                </LinkButton>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
