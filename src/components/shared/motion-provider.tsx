"use client";

import { LazyMotion, domMax } from "framer-motion";

// Loads framer-motion's feature bundle lazily and lets components use the light
// `m` primitives instead of the full `motion` component. domMax covers
// animations, exit (AnimatePresence), gestures (hover/tap/drag) and layout.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domMax}>{children}</LazyMotion>;
}
