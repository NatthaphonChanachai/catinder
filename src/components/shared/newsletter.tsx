"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeUp } from "@/lib/motion";

export function Newsletter() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // Phase 1: capture-only — wire to a real subscriber service later.
    setDone(true);
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      className="mx-auto max-w-3xl px-6 py-20 text-center"
    >
      <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-[var(--rose-blush)]">
        <Mail className="size-6 text-foreground" />
      </div>
      <h2 className="mt-6 text-2xl font-extrabold sm:text-3xl">{t("title")}</h2>
      <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>

      {done ? (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-foreground">
          <Check className="size-4" /> {t("thanks")}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Input
            type="email"
            required
            placeholder={t("placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-full px-5 sm:w-72"
          />
          <Button type="submit" className="h-12 rounded-full px-8">
            {t("subscribe")}
          </Button>
        </form>
      )}
    </motion.section>
  );
}
