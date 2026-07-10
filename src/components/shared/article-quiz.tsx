"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RefreshCw, Trophy, Star } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/constants/sample-content";

interface ArticleQuizProps {
  questions: QuizQuestion[];
  title: string;
  subtitle: string;
  correctMsg: string;
  wrongMsg: string;
  scoreMsg: string | ((n: number) => string);
  retryLabel: string;
  onComplete?: (score: number) => void;
}

export function ArticleQuiz({ questions, title, subtitle, correctMsg, wrongMsg, scoreMsg, retryLabel, onComplete }: ArticleQuizProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const completedRef = useRef(false);

  const q = questions[current]!;
  const score = answered.filter(Boolean).length;

  useEffect(() => {
    if (done && !completedRef.current) {
      completedRef.current = true;
      onComplete?.(score);
    }
  }, [done, score, onComplete]);

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    setTimeout(() => {
      const correct = i === q.correct;
      const newAnswered = [...answered, correct];
      setAnswered(newAnswered);
      if (current + 1 < questions.length) {
        setCurrent((c) => c + 1);
        setSelected(null);
      } else {
        setDone(true);
      }
    }, 900);
  }

  function reset() {
    setCurrent(0);
    setSelected(null);
    setAnswered([]);
    setDone(false);
    completedRef.current = false;
  }

  const xpEarned = score === questions.length ? 50 : score >= Math.ceil(questions.length / 2) ? 30 : 10;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      className="rounded-3xl bg-[var(--soft-cream)] px-6 py-8 sm:px-10"
    >
      <div className="flex items-center gap-2">
        <Trophy className="size-5 text-[var(--soft-gold)]" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{subtitle}</p>
          <h3 className="text-lg font-extrabold">{title}</h3>
        </div>
      </div>

      {/* Progress dots */}
      <div className="mt-4 flex gap-1.5">
        {questions.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              i < answered.length
                ? answered[i]
                  ? "bg-[var(--soft-gold)]"
                  : "bg-[var(--petal-pink)]"
                : i === current
                  ? "bg-[var(--rose-blush)]"
                  : "bg-border",
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <p className="text-sm font-semibold sm:text-base">{q.question}</p>
            <div className="mt-4 flex flex-col gap-2">
              {q.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = i === q.correct;
                const revealed = selected !== null;
                return (
                  <button
                    key={opt}
                    onClick={() => choose(i)}
                    disabled={revealed}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all",
                      !revealed && "bg-card hover:bg-[var(--rose-blush)]/30",
                      revealed && isCorrect && "bg-[var(--soft-gold)]/30",
                      revealed && isSelected && !isCorrect && "bg-[var(--petal-pink)]/40",
                      revealed && !isSelected && !isCorrect && "bg-card opacity-50",
                    )}
                  >
                    {revealed && isCorrect && <CheckCircle2 className="size-4 shrink-0 text-[var(--soft-gold)]" />}
                    {revealed && isSelected && !isCorrect && <XCircle className="size-4 shrink-0 text-[var(--petal-pink)]" />}
                    {(!revealed || (!isCorrect && !isSelected)) && (
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-bold">
                        {String.fromCharCode(65 + i)}
                      </span>
                    )}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm font-semibold"
              >
                {selected === q.correct ? (
                  <span className="text-[var(--rose-gold)]">{correctMsg}</span>
                ) : (
                  <span className="text-muted-foreground">
                    {wrongMsg} <strong>{q.options[q.correct]}</strong>
                  </span>
                )}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="mt-6 text-center"
          >
            {/* Score */}
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="inline-flex flex-col items-center gap-1 rounded-3xl bg-gradient-to-br from-[var(--soft-gold)]/40 to-[var(--warm-peach)]/40 px-10 py-5"
            >
              <p className="text-5xl font-extrabold">{score}/{questions.length}</p>
              <p className="text-sm text-muted-foreground">
                {typeof scoreMsg === "function" ? scoreMsg(score) : scoreMsg.replace("{n}", String(score))}
              </p>
            </motion.div>

            {/* XP reward banner */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[var(--soft-gold)]/20 px-5 py-3"
            >
              <Star className="size-4 fill-[var(--soft-gold)] text-[var(--soft-gold)]" />
              <span className="text-sm font-extrabold">+{xpEarned} XP</span>
              {score === questions.length && (
                <span className="text-xs font-semibold text-muted-foreground">Perfect Score! 🎉</span>
              )}
            </motion.div>

            <button
              onClick={reset}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--soft-gold)] px-6 py-2.5 text-sm font-semibold text-foreground hover:opacity-90"
            >
              <RefreshCw className="size-4" /> {retryLabel}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
