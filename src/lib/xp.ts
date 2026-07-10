// XP system — all state lives in localStorage; dispatches custom events so any component can react.

const KEYS = {
  total: "catinder.xp.total",
  streak: "catinder.xp.streak",
  lastDay: "catinder.xp.lastDay",
  dailyXP: "catinder.xp.dailyXP",
};

export const LEVELS = [
  { min: 0,    name: "Kitten", nameTh: "ลูกแมว",  emoji: "🐱", next: 100  },
  { min: 100,  name: "Cat",    nameTh: "แมว",      emoji: "🐈", next: 300  },
  { min: 300,  name: "Tiger",  nameTh: "เสือ",     emoji: "🐯", next: 600  },
  { min: 600,  name: "Lion",   nameTh: "สิงห์",   emoji: "🦁", next: 1000 },
  { min: 1000, name: "Legend", nameTh: "ตำนาน",   emoji: "⭐", next: Infinity },
] as const;

export type Level = (typeof LEVELS)[number];

function read(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const v = localStorage.getItem(key);
  return v ? parseInt(v, 10) : fallback;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getXP(): number {
  return read(KEYS.total, 0);
}

export function getStreak(): number {
  return read(KEYS.streak, 0);
}

export function getDailyXP(): number {
  if (typeof window === "undefined") return 0;
  const lastDay = localStorage.getItem(KEYS.lastDay);
  if (lastDay !== todayStr()) return 0;
  return read(KEYS.dailyXP, 0);
}

export function getLevel(xp = getXP()): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i]!.min) return LEVELS[i]!;
  }
  return LEVELS[0]!;
}

export function getLevelProgress(xp = getXP()): { pct: number; current: number; needed: number } {
  const level = getLevel(xp);
  const nextMin = level.next === Infinity ? level.min + 400 : level.next;
  const needed = nextMin - level.min;
  const current = xp - level.min;
  const pct = level.next === Infinity ? 100 : Math.min(100, Math.round((current / needed) * 100));
  return { pct, current, needed };
}

export function addXP(amount: number, reason?: string): void {
  if (typeof window === "undefined") return;
  const today = todayStr();
  const currentTotal = read(KEYS.total, 0);
  const newTotal = currentTotal + amount;

  const lastDay = localStorage.getItem(KEYS.lastDay);
  let streak = read(KEYS.streak, 0);
  if (lastDay !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    streak = lastDay === yesterday.toISOString().slice(0, 10) ? streak + 1 : 1;
    localStorage.setItem(KEYS.dailyXP, String(amount));
    localStorage.setItem(KEYS.lastDay, today);
    localStorage.setItem(KEYS.streak, String(streak));
  } else {
    localStorage.setItem(KEYS.dailyXP, String(read(KEYS.dailyXP, 0) + amount));
  }

  localStorage.setItem(KEYS.total, String(newTotal));
  window.dispatchEvent(new CustomEvent("catinder:xp", { detail: { amount, reason, total: newTotal } }));
}

export function hasEarnedToday(key: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`catinder.earned.${key}`) === todayStr();
}

export function markEarnedToday(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`catinder.earned.${key}`, todayStr());
}
