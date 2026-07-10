"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: string; // e.g. "1,000+" or "50+"
  label: string;
  className?: string;
}

export function AnimatedCounter({ value, label, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayed, setDisplayed] = useState("0");

  // Extract numeric part and suffix
  const numeric = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const suffix = value.replace(/[0-9,]/g, "");

  useEffect(() => {
    if (!isInView) return;
    const duration = 1200;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * numeric);
      setDisplayed(current.toLocaleString());
      if (step >= steps) {
        setDisplayed(numeric.toLocaleString());
        clearInterval(timer);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [isInView, numeric]);

  return (
    <div ref={ref} className={className}>
      <p className="text-3xl font-extrabold sm:text-4xl">
        {displayed}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
