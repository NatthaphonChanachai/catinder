"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: number;
  amount: number;
  reason?: string;
}

export function XPToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function onXP(e: Event) {
      const { amount, reason } = (e as CustomEvent<{ amount: number; reason?: string }>).detail;
      const id = Date.now();
      setToasts((prev) => [...prev.slice(-3), { id, amount, reason }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
    }
    window.addEventListener("catinder:xp", onXP);
    return () => window.removeEventListener("catinder:xp", onXP);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-[200] flex flex-col items-end gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 56, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 56, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="flex items-center gap-2 rounded-full bg-[var(--soft-gold)] px-4 py-2.5 shadow-lg ring-1 ring-[var(--soft-gold)]/50"
          >
            <span className="text-base leading-none">⭐</span>
            <span className="text-sm font-extrabold leading-none">+{toast.amount} XP</span>
            {toast.reason && (
              <span className="text-xs font-medium leading-none opacity-70">{toast.reason}</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
