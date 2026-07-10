"use client";

import { useEffect, useState } from "react";

/** Simple client-only localStorage-backed state. SSR-safe (starts at `initial`, syncs after mount). */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored) as T);
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota errors
    }
  }, [key, value, hydrated]);

  return [value, setValue] as const;
}

/** Returns a stable YYYY-MM-DD string for the current day, used to scope "daily" features. */
export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
