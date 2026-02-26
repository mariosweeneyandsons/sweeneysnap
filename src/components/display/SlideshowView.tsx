"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Selfie, DisplayConfig } from "@/types/database";

const transitionVariants: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  slide: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  zoom: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.5, opacity: 0 },
  },
};

interface SlideshowViewProps {
  selfies: Selfie[];
  config: DisplayConfig;
}

export function SlideshowView({ selfies, config }: SlideshowViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const swapInterval = (config.swapInterval || 6) * 1000;
  const transition = config.transition || "fade";
  const variants = transitionVariants[transition] || transitionVariants.fade;

  const advance = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % selfies.length);
  }, [selfies.length]);

  useEffect(() => {
    if (selfies.length <= 1) return;
    const timer = setInterval(advance, swapInterval);
    return () => clearInterval(timer);
  }, [advance, swapInterval, selfies.length]);

  // Reset index if selfies list shrinks
  useEffect(() => {
    if (currentIndex >= selfies.length) {
      setCurrentIndex(0);
    }
  }, [selfies.length, currentIndex]);

  const selfie = selfies[currentIndex];
  if (!selfie) return null;

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={selfie._id}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="relative w-full h-full max-w-[80vh] mx-auto rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selfie.imageUrl || ""}
            alt={selfie.displayName || "Selfie"}
            className="w-full h-full object-cover"
            loading="eager"
          />
          {(config.showNames && selfie.displayName) && (
            <div
              className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
              style={{ opacity: config.overlayOpacity ?? 0.8 }}
            >
              <p className="text-white font-bold text-2xl">{selfie.displayName}</p>
              {config.showMessages && selfie.message && (
                <p className="text-white/70 text-lg mt-1">{selfie.message}</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
