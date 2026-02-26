"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface CountdownOverlayProps {
  seconds: number;
  onComplete: () => void;
  primaryColor?: string;
}

export function CountdownOverlay({ seconds, onComplete, primaryColor }: CountdownOverlayProps) {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-8xl font-bold"
          style={{ color: primaryColor || "#ffffff" }}
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
