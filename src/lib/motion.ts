import type { Variants, Transition, TargetAndTransition } from "framer-motion";

// Slow, elegant, natural motion presets — per brand guidance: no excessive animation.
const easeSoft: Transition["ease"] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeSoft } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.9, ease: "easeOut" } },
};

export const floatingCloud: { animate: TargetAndTransition } = {
  animate: {
    y: [0, -14, 0],
    transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
  },
};

export const softHover: TargetAndTransition = {
  y: -4,
  transition: { duration: 0.3, ease: "easeOut" },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
