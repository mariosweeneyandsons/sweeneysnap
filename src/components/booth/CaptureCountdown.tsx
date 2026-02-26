"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

interface CaptureCountdownProps {
  onComplete: () => void;
}

export function CaptureCountdown({ onComplete }: CaptureCountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-white text-[12rem] font-bold leading-none"
        >
          {count > 0 ? count : ""}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
