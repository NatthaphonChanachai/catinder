"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Sparkle positions ────────────────────────────────────────────────────────
const SPARKLES = [
  { top: "6%",  left: "8%",  size: 20, delay: 0,   bright: true  },
  { top: "10%", left: "80%", size: 13, delay: 1.1, bright: false },
  { top: "22%", left: "93%", size: 22, delay: 1.8, bright: true  },
  { top: "3%",  left: "52%", size: 16, delay: 2.6, bright: false },
  { top: "65%", left: "3%",  size: 18, delay: 0.6, bright: true  },
  { top: "74%", left: "90%", size: 14, delay: 2.0, bright: false },
  { top: "20%", left: "25%", size: 9,  delay: 3.0, bright: false },
  { top: "46%", left: "67%", size: 18, delay: 1.4, bright: true  },
  { top: "34%", left: "12%", size: 15, delay: 3.7, bright: false },
  { top: "58%", left: "80%", size: 20, delay: 2.3, bright: true  },
  { top: "14%", left: "42%", size: 10, delay: 4.1, bright: false },
  { top: "78%", left: "60%", size: 16, delay: 1.6, bright: false },
  { top: "50%", left: "35%", size: 12, delay: 2.9, bright: true  },
  { top: "30%", left: "70%", size: 9,  delay: 0.4, bright: false },
];

// ─── Cloud positions ──────────────────────────────────────────────────────────
const CLOUDS_LIGHT = [
  { top: "2%",  left: "-12%", width: 300, duration: 28, delay: 0,  driftX: 20,  driftY: -10 },
  { top: "8%",  left: "68%",  width: 340, duration: 34, delay: 5,  driftX: -16, driftY: 8   },
  { top: "50%", left: "74%",  width: 240, duration: 22, delay: 10, driftX: 14,  driftY: -7  },
  { top: "60%", left: "-8%",  width: 270, duration: 30, delay: 3,  driftX: 18,  driftY: 7   },
  { top: "32%", left: "33%",  width: 190, duration: 26, delay: 7,  driftX: -10, driftY: -4  },
  { top: "78%", left: "46%",  width: 220, duration: 32, delay: 2,  driftX: 12,  driftY: 6   },
];

// Dark hero: hug edges, keep center text area clear
const CLOUDS_DARK = [
  { top: "48%", left: "-24%", width: 400, duration: 42, delay: 0,  driftX: 12,  driftY: -8  },
  { top: "54%", left: "70%",  width: 450, duration: 46, delay: 5,  driftX: -10, driftY: 6   },
  { top: "0%",  left: "-16%", width: 280, duration: 32, delay: 9,  driftX: 16,  driftY: -7  },
  { top: "5%",  left: "74%",  width: 260, duration: 30, delay: 3,  driftX: -14, driftY: 5   },
  { top: "26%", left: "-18%", width: 210, duration: 28, delay: 6,  driftX: 10,  driftY: -4  },
  { top: "72%", left: "56%",  width: 320, duration: 38, delay: 2,  driftX: 9,   driftY: 4   },
];

// ─── Cat paw print positions (dark mode decorative) ───────────────────────────
const PAWS = [
  { top: "18%", left: "88%",  size: 28, delay: 0,   duration: 14 },
  { top: "42%", left: "5%",   size: 22, delay: 4.5, duration: 16 },
  { top: "72%", left: "82%",  size: 24, delay: 2,   duration: 13 },
  { top: "8%",  left: "62%",  size: 18, delay: 7,   duration: 15 },
  { top: "60%", left: "18%",  size: 20, delay: 3.5, duration: 17 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function FourStar({ size, delay, bright, dark }: { size: number; delay: number; bright: boolean; dark: boolean }) {
  const color = dark ? (bright ? "#F7D7AB" : "#D4AF37") : (bright ? "var(--soft-gold)" : "var(--rose-gold)");
  const maxOpacity = dark ? (bright ? 1 : 0.75) : (bright ? 0.90 : 0.50);
  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={{ scale: [0.4, 1.2, 0.4], opacity: [0.1, maxOpacity, 0.1], rotate: [0, 20, 0] }}
      transition={{ duration: 2.6 + delay * 0.2, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2 L13.9 9.4 L21.5 12 L13.9 14.6 L12 22 L10.1 14.6 L2.5 12 L10.1 9.4 Z" />
        <path d="M12 6.5 L12.7 11.3 L17.5 12 L12.7 12.7 L12 17.5 L11.3 12.7 L6.5 12 L11.3 11.3 Z"
          fill="white" fillOpacity={dark ? "0.8" : "0.4"} />
      </svg>
    </motion.div>
  );
}

// ─── Luxury cumulus cloud — CSS blur-merge technique ─────────────────────────
// Each div is solid fill; the container blur merges them into one organic silhouette.
// Tower proportions (tall peaks vs wide base) give the Greek Olympus cumulus feel.
function LuxuryCloud({ width, dark }: { width: number; dark: boolean }) {
  const W = width;
  const H = Math.round(W * 0.72);
  const B = Math.round(H * 0.22);   // base height
  const blur = Math.max(10, Math.round(W * 0.038));

  const base  = dark ? "rgba(247,237,200,0.93)" : "rgba(253,248,232,0.91)";
  const amber = dark
    ? "radial-gradient(ellipse 90% 60% at 50% 80%, rgba(212,175,55,0.78) 0%, rgba(180,140,20,0.28) 60%, transparent 100%)"
    : "radial-gradient(ellipse 90% 55% at 50% 80%, rgba(212,175,55,0.42) 0%, transparent 100%)";
  const shadow = dark
    ? "radial-gradient(ellipse 80% 50% at 50% 95%, rgba(100,60,5,0.40) 0%, transparent 100%)"
    : "radial-gradient(ellipse 80% 50% at 50% 95%, rgba(160,145,220,0.18) 0%, transparent 100%)";

  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      {/* Cloud body — blurred as a group so all parts merge seamlessly */}
      <div style={{
        position: "absolute",
        inset: `0 -${Math.round(W * 0.06)}px`,
        filter: `blur(${blur}px)`,
      }}>
        {/* ── Wide horizontal base (the anvil) ── */}
        <div style={{
          position: "absolute", bottom: 0, left: "4%", width: "92%", height: B,
          background: base, borderRadius: "9999px",
        }} />

        {/* ── Left dome ── */}
        <div style={{
          position: "absolute", bottom: B * 0.55, left: "6%",
          width: "30%", height: Math.round(H * 0.60),
          background: base, borderRadius: "50% 50% 42% 42%",
        }} />

        {/* ── Left-centre sub-peak ── */}
        <div style={{
          position: "absolute", bottom: B * 0.55, left: "24%",
          width: "20%", height: Math.round(H * 0.44),
          background: base, borderRadius: "50%",
        }} />

        {/* ── Centre crown — TALLEST peak (Zeus-style) ── */}
        <div style={{
          position: "absolute", bottom: B * 0.55, left: "34%",
          width: "32%", height: Math.round(H * 0.92),
          background: base, borderRadius: "50% 50% 38% 38%",
        }} />

        {/* ── Right-centre sub-peak ── */}
        <div style={{
          position: "absolute", bottom: B * 0.55, right: "22%",
          width: "18%", height: Math.round(H * 0.50),
          background: base, borderRadius: "50%",
        }} />

        {/* ── Right dome ── */}
        <div style={{
          position: "absolute", bottom: B * 0.55, right: "6%",
          width: "26%", height: Math.round(H * 0.64),
          background: base, borderRadius: "50% 50% 42% 42%",
        }} />
      </div>

      {/* ── Amber/gold underside — warm divine light from below ── */}
      <div style={{
        position: "absolute", bottom: `-${Math.round(H * 0.06)}px`,
        left: "4%", width: "92%", height: Math.round(H * 0.46),
        background: amber,
        filter: `blur(${Math.round(W * 0.042)}px)`,
      }} />

      {/* ── Cast shadow / depth ── */}
      <div style={{
        position: "absolute", bottom: `-${Math.round(H * 0.12)}px`,
        left: "8%", width: "84%", height: Math.round(H * 0.28),
        background: shadow,
        filter: `blur(${Math.round(W * 0.060)}px)`,
      }} />
    </div>
  );
}

// ─── Cat paw print (floating, subtle) ────────────────────────────────────────
function CatPaw({ size, delay, duration, dark }: { size: number; delay: number; duration: number; dark: boolean }) {
  const fill = dark ? "rgba(212,175,55,0.42)" : "rgba(212,175,55,0.28)";
  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={{ y: [0, -18, 0], rotate: [-8, 8, -8], opacity: [0.25, 0.65, 0.25] }}
      transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 40 40" fill={fill} xmlns="http://www.w3.org/2000/svg">
        {/* Main pad */}
        <ellipse cx="20" cy="29" rx="11" ry="9.5" />
        {/* Four toes */}
        <ellipse cx="8"  cy="16" rx="5.5" ry="5" />
        <ellipse cx="16" cy="11" rx="5.5" ry="5" />
        <ellipse cx="24" cy="11" rx="5.5" ry="5" />
        <ellipse cx="32" cy="16" rx="5.5" ry="5" />
      </svg>
    </motion.div>
  );
}

// ─── Floating heart ───────────────────────────────────────────────────────────
function FloatingHeart({ size, delay, duration, dark }: { size: number; delay: number; duration: number; dark: boolean }) {
  const fill = dark ? "#F9C5D1" : "var(--petal-pink)";
  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={{ y: [0, -(80 + size * 3)], opacity: [0, dark ? 0.90 : 0.65, 0] }}
      transition={{ duration, repeat: Infinity, delay, ease: "easeOut" }}
    >
      <svg viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L3.5 10.5C2 7.5 4 4 7.5 4.5C9.5 4.8 11 6.3 12 7.8C13 6.3 14.5 4.8 16.5 4.5C20 4 22 7.5 20.5 10.5L12 21Z" />
      </svg>
    </motion.div>
  );
}

// ─── God rays ─────────────────────────────────────────────────────────────────
function GodRays() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2"
      style={{
        width: 1200, height: 900,
        background: `conic-gradient(
          from -14deg at 50% 0%,
          transparent 0deg,   rgba(240,200,70,0.10) 6deg,
          transparent 13deg,  rgba(232,192,60,0.08) 20deg,
          transparent 28deg,  rgba(248,215,80,0.09) 38deg,
          transparent 46deg,  rgba(232,192,60,0.07) 56deg,
          transparent 64deg,  rgba(248,215,80,0.06) 74deg,
          transparent 82deg
        )`,
        maskImage: "radial-gradient(ellipse at 50% 0%, black 6%, transparent 68%)",
        WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 6%, transparent 68%)",
      }}
    />
  );
}

// ─── Halo rings ───────────────────────────────────────────────────────────────
function HaloRing() {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4 rounded-full"
        style={{
          width: 740, height: 740,
          border: "1px solid rgba(240,200,70,0.32)",
          boxShadow: "0 0 100px 4px rgba(220,170,40,0.18), inset 0 0 100px 4px rgba(220,170,40,0.10)",
        }}
        animate={{ scale: [0.97, 1.03, 0.97], opacity: [0.40, 0.88, 0.40] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4 rounded-full"
        style={{
          width: 540, height: 540,
          border: "1px solid rgba(240,200,70,0.22)",
          boxShadow: "0 0 65px 3px rgba(220,170,40,0.14)",
        }}
        animate={{ scale: [1.03, 0.97, 1.03], opacity: [0.30, 0.60, 0.30] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface HeavenBgProps {
  className?: string;
  dense?: boolean;
  hearts?: boolean;
  variant?: "dark" | "light";
}

export function HeavenBg({ className, dense = true, hearts = true, variant = "light" }: HeavenBgProps) {
  const isDark = variant === "dark";
  const stars  = dense ? SPARKLES : SPARKLES.filter((_, i) => i % 2 === 0);
  const clouds = isDark ? CLOUDS_DARK : CLOUDS_LIGHT;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>

      {isDark ? (
        /* ── DARK NAVY — matches logo branding ── */
        <>
          {/* Brand gold divine radiance from top center */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[620px] w-[950px] rounded-full blur-[130px]"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.30) 0%, rgba(180,140,20,0.10) 55%, transparent 100%)" }} />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-[300px] w-[460px] rounded-full blur-[70px]"
            style={{ background: "radial-gradient(circle, rgba(247,215,171,0.22) 0%, rgba(212,175,55,0.07) 65%, transparent 100%)" }} />
          {/* Soft navy atmospheric haze — sides */}
          <div className="absolute top-1/3 -left-20 h-[350px] w-[280px] rounded-full blur-[110px]"
            style={{ background: "rgba(13,42,120,0.10)" }} />
          <div className="absolute top-1/3 -right-20 h-[350px] w-[280px] rounded-full blur-[110px]"
            style={{ background: "rgba(13,42,120,0.10)" }} />
          {/* Brand rose glow at bottom — soft, not aggressive */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[200px] w-[80%] rounded-full blur-[80px]"
            style={{ background: "rgba(249,197,209,0.14)" }} />
          <GodRays />
          <HaloRing />
        </>
      ) : (
        /* ── LIGHT LAVENDER PASTEL ── */
        <>
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[var(--soft-gold)]/30 blur-[100px]" />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-[320px] w-[420px] rounded-full bg-[var(--warm-peach)]/40 blur-[65px]" />
          <div className="absolute top-0 -left-20 h-[320px] w-[320px] rounded-full bg-[var(--celestial)]/35 blur-[80px]" />
          <div className="absolute top-16 -right-16 h-[280px] w-[280px] rounded-full bg-[var(--celestial)]/30 blur-[70px]" />
          <div className="absolute top-1/2 -left-10 h-[200px] w-[200px] rounded-full bg-[var(--rose-blush)]/30 blur-[55px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[200px] w-[85%] rounded-full bg-[var(--petal-pink)]/25 blur-[55px]" />
        </>
      )}

      {/* ── Floating clouds ── */}
      {clouds.map((c, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: c.top, left: c.left }}
          animate={{ x: [0, c.driftX, 0], y: [0, c.driftY, 0] }}
          transition={{ duration: c.duration, repeat: Infinity, delay: c.delay, ease: "easeInOut" }}
        >
          <LuxuryCloud width={c.width} dark={isDark} />
        </motion.div>
      ))}

      {/* ── Sparkle stars ── */}
      {stars.map((s, i) => (
        <div key={i} className="absolute" style={{ top: s.top, left: s.left }}>
          <FourStar size={s.size} delay={s.delay} bright={s.bright} dark={isDark} />
        </div>
      ))}

      {/* ── Cat paw prints — tells visitors this is a cat site ── */}
      {PAWS.map((p, i) => (
        <div key={i} className="absolute" style={{ top: p.top, left: p.left }}>
          <CatPaw size={p.size} delay={p.delay} duration={p.duration} dark={isDark} />
        </div>
      ))}

      {/* ── Floating hearts ── */}
      {hearts && [
        { bottom: "12%", left: "15%", size: 14, delay: 0,   duration: 9  },
        { bottom: "6%",  left: "60%", size: 11, delay: 3.2, duration: 11 },
        { bottom: "18%", left: "82%", size: 16, delay: 1.5, duration: 10 },
        { bottom: "8%",  left: "36%", size: 9,  delay: 5.0, duration: 12 },
        { bottom: "3%",  left: "70%", size: 12, delay: 2.4, duration: 8  },
      ].map((h, i) => (
        <div key={i} className="absolute" style={{ bottom: h.bottom, left: h.left }}>
          <FloatingHeart size={h.size} delay={h.delay} duration={h.duration} dark={isDark} />
        </div>
      ))}
    </div>
  );
}
