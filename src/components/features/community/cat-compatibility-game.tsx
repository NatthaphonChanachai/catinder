"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Upload, Share2, RefreshCw } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { addXP } from "@/lib/xp";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | "result";

const TRAITS = ["playful", "calm", "curious", "affectionate", "independent", "vocal"] as const;
const BREEDS = ["any", "scottish-fold", "british-shorthair", "persian", "maine-coon", "siamese"] as const;
const COLORS = ["any", "white", "black", "orange", "grey", "calico", "tabby"] as const;

const KITTEN_NAMES_TH = ["น้องมะลิ", "น้องจันทร์", "น้องเพชร", "น้องขนม", "น้องดาว", "น้องแป้ง", "น้องหิมะ", "น้องส้ม", "น้องโอริ", "น้องลาเต้"];
const KITTEN_NAMES_EN = ["Mochi", "Luna", "Leo", "Boba", "Coconut", "Mango", "Caramel", "Milky", "Ori", "Latte"];

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

export function CatCompatibilityGame() {
  const t = useTranslations("game");
  const [step, setStep] = useState<Step>(1);
  const [catName, setCatName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [myTraits, setMyTraits] = useState<string[]>([]);
  const [partnerBreed, setPartnerBreed] = useState("any");
  const [partnerColor, setPartnerColor] = useState("any");
  const [partnerTraits, setPartnerTraits] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [kittenNames, setKittenNames] = useState<string[]>([]);
  const [resultMsg, setResultMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function toggleTrait(trait: string, list: string[], setter: (v: string[]) => void) {
    if (list.includes(trait)) {
      setter(list.filter((t) => t !== trait));
    } else if (list.length < 3) {
      setter([...list, trait]);
    }
  }

  function generateResult() {
    setStep(3);
    setTimeout(() => {
      const s = Math.floor(Math.random() * 18) + 79;
      const msgs = t.raw("resultMessages") as string[];
      const msg = msgs[Math.floor(Math.random() * msgs.length)]!;
      const names = [...pickRandom(KITTEN_NAMES_TH, 2), pickRandom(KITTEN_NAMES_EN, 1)[0]!];
      setScore(s);
      setResultMsg(msg);
      setKittenNames(names);
      setStep("result");
      addXP(25, "เกมจับคู่แมว");
    }, 2200);
  }

  function reset() {
    setStep(1);
    setCatName("");
    setPhoto(null);
    setMyTraits([]);
    setPartnerBreed("any");
    setPartnerColor("any");
    setPartnerTraits([]);
    setScore(0);
    setKittenNames([]);
    setResultMsg("");
    setCopied(false);
  }

  function share() {
    const text = `${catName || "แมวของฉัน"} ได้ ${score}% ความเข้ากัน! 🐱 เล่นเกมจับคู่แมวที่ Catinder`;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section className="bg-gradient-to-br from-[var(--champagne)]/20 to-background px-6 py-14">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-8 text-center"
        >
          <motion.span variants={fadeUp} className="inline-block rounded-full bg-[var(--petal-pink)]/50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            {t("badge")}
          </motion.span>
          <motion.h2 variants={fadeUp} className="mt-3 text-2xl font-extrabold sm:text-3xl">
            {t("title")}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-sm text-muted-foreground">
            {t("subtitle")}
          </motion.p>
        </motion.div>

        {/* Game card */}
        <div className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/60">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Your cat ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                {/* Progress */}
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-[var(--soft-gold)]" />
                  <div className="h-1.5 flex-1 rounded-full bg-muted" />
                  <span className="ml-1 text-xs text-muted-foreground">1 / 2</span>
                </div>
                <p className="mb-6 text-center text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {t("step1Title")}
                </p>

                {/* Photo upload */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold">{t("photoLabel")}</label>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 py-8 transition-colors hover:bg-muted/50"
                  >
                    {photo ? (
                      <img src={photo} alt="cat" className="size-24 rounded-full object-cover ring-4 ring-[var(--soft-gold)]" />
                    ) : (
                      <>
                        <Upload className="size-8 text-muted-foreground" />
                        <span className="text-sm font-semibold text-muted-foreground">{t("photoPlaceholder")}</span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">{t("photoHint")}</span>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </div>

                {/* Cat name */}
                <div className="mb-5">
                  <label className="mb-1.5 block text-sm font-semibold">{t("nameLabel")}</label>
                  <input
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
                  />
                </div>

                {/* Personality */}
                <div className="mb-7">
                  <label className="mb-2 block text-sm font-semibold">{t("personalityLabel")}</label>
                  <div className="flex flex-wrap gap-2">
                    {TRAITS.map((trait) => (
                      <button
                        key={trait}
                        type="button"
                        onClick={() => toggleTrait(trait, myTraits, setMyTraits)}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                          myTraits.includes(trait)
                            ? "bg-[var(--soft-gold)] text-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {(t as (key: string) => string)(`traits.${trait}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!catName.trim()}
                  className="w-full rounded-full bg-[var(--soft-gold)] py-3 text-sm font-bold hover:opacity-90 disabled:opacity-40"
                >
                  {t("nextBtn")}
                </button>
              </motion.div>
            )}

            {/* ── Step 2: Partner preferences ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                {/* Progress */}
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-[var(--soft-gold)]" />
                  <div className="h-1.5 flex-1 rounded-full bg-[var(--soft-gold)]" />
                  <span className="ml-1 text-xs text-muted-foreground">2 / 2</span>
                </div>
                <p className="mb-6 text-center text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {t("step2Title")}
                </p>

                {/* Preferred breed */}
                <div className="mb-5">
                  <label className="mb-1.5 block text-sm font-semibold">{t("breedLabel")}</label>
                  <select
                    value={partnerBreed}
                    onChange={(e) => setPartnerBreed(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
                  >
                    {BREEDS.map((b) => (
                      <option key={b} value={b}>{(t as (key: string) => string)(`breeds.${b}`)}</option>
                    ))}
                  </select>
                </div>

                {/* Preferred color */}
                <div className="mb-5">
                  <label className="mb-1.5 block text-sm font-semibold">{t("colorLabel")}</label>
                  <select
                    value={partnerColor}
                    onChange={(e) => setPartnerColor(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
                  >
                    {COLORS.map((c) => (
                      <option key={c} value={c}>{(t as (key: string) => string)(`colors.${c}`)}</option>
                    ))}
                  </select>
                </div>

                {/* Partner personality */}
                <div className="mb-7">
                  <label className="mb-2 block text-sm font-semibold">{t("partnerPersonalityLabel")}</label>
                  <div className="flex flex-wrap gap-2">
                    {TRAITS.map((trait) => (
                      <button
                        key={trait}
                        type="button"
                        onClick={() => toggleTrait(trait, partnerTraits, setPartnerTraits)}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                          partnerTraits.includes(trait)
                            ? "bg-[var(--rose-blush)] text-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {(t as (key: string) => string)(`traits.${trait}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-full border border-border py-3 text-sm font-semibold hover:bg-muted"
                  >
                    {t("backBtn")}
                  </button>
                  <button
                    type="button"
                    onClick={generateResult}
                    className="flex-1 rounded-full bg-[var(--soft-gold)] py-3 text-sm font-bold hover:opacity-90"
                  >
                    {t("generateBtn")}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Loading ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6 p-20 text-center"
              >
                <motion.span
                  className="text-5xl"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                >
                  🐾
                </motion.span>
                <p className="text-sm font-semibold text-muted-foreground">{t("step3Title")}</p>
              </motion.div>
            )}

            {/* ── Result ── */}
            {step === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                className="p-10 text-center"
              >
                {/* Cat photo */}
                <div className="mx-auto mb-5 size-28">
                  {photo ? (
                    <img
                      src={photo}
                      alt={catName}
                      className="size-full rounded-full object-cover ring-4 ring-[var(--soft-gold)] ring-offset-2"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center rounded-full bg-[var(--rose-blush)]/40 text-5xl">
                      🐱
                    </div>
                  )}
                </div>

                {catName && <p className="text-lg font-extrabold">{catName}</p>}

                {/* Compatibility score */}
                <div className="my-6 inline-flex flex-col items-center gap-1 rounded-3xl bg-gradient-to-br from-[var(--soft-gold)] to-[var(--warm-peach)] px-10 py-5 shadow-md">
                  <span className="text-5xl font-extrabold">{score}%</span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">{t("compatibilityLabel")}</span>
                </div>

                {/* Message */}
                <p className="text-sm leading-relaxed text-muted-foreground">{resultMsg}</p>

                {/* Predicted kitten names */}
                <div className="mt-7">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {t("predictedKittensLabel")}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {kittenNames.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-[var(--petal-pink)]/50 px-5 py-2 text-sm font-semibold"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={share}
                    className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted"
                  >
                    <Share2 className="size-4" />
                    {copied ? "คัดลอกแล้ว!" : t("shareBtn")}
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="flex items-center gap-2 rounded-full bg-[var(--soft-gold)] px-5 py-2.5 text-sm font-bold hover:opacity-90"
                  >
                    <RefreshCw className="size-4" />
                    {t("playAgainBtn")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
