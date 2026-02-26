"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface CaptureCountdownOverlayProps {
  seconds?: number;
  onComplete: () => void;
  primaryColor?: string;
  variant?: "inline" | "fullscreen";
}

const variants = {
  inline: {
    container: "absolute inset-0 flex items-center justify-center bg-black/40 z-10",
    text: "text-8xl font-bold",
    initial: { scale: 1.5, opacity: 0 },
    exit: { scale: 0.8, opacity: 0 },
    duration: 0.4,
  },
  fullscreen: {
    container: "fixed inset-0 z-50 flex items-center justify-center bg-black/60",
    text: "text-[12rem] font-bold leading-none",
    initial: { scale: 2, opacity: 0 },
    exit: { scale: 0.5, opacity: 0 },
    duration: 0.3,
  },
} as const;

export function CaptureCountdownOverlay({
  seconds = 3,
  onComplete,
  primaryColor,
  variant = "inline",
}: CaptureCountdownOverlayProps) {
  const [count, setCount] = useState(seconds);
  const style = variants[variant];

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className={style.container}>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={style.initial}
          animate={{ scale: 1, opacity: 1 }}
          exit={style.exit}
          transition={{ duration: style.duration, ease: "easeOut" }}
          className={style.text}
          style={{ color: primaryColor || "#ffffff" }}
        >
          {count > 0 ? count : ""}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
