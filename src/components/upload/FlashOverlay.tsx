"use client";

import { motion } from "motion/react";

interface FlashOverlayProps {
  active: boolean;
  onComplete: () => void;
}

export function FlashOverlay({ active, onComplete }: FlashOverlayProps) {
  if (!active) return null;

  return (
    <motion.div
      className="absolute inset-0 bg-white z-20 pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onAnimationComplete={onComplete}
    />
  );
}
