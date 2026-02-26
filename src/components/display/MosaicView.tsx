"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Selfie, DisplayConfig } from "@/types/database";

// Predefined tile size patterns: [colSpan, rowSpan]
const tilePatterns: [number, number][] = [
  [2, 2], // large
  [1, 1], // small
  [1, 1],
  [2, 1], // wide
  [1, 1],
  [1, 1],
  [1, 2], // tall
  [1, 1],
  [1, 1],
  [1, 1],
];

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

interface MosaicViewProps {
  selfies: Selfie[];
  config: DisplayConfig;
}

export function MosaicView({ selfies, config }: MosaicViewProps) {
  const columns = config.gridColumns || 4;
  const swapInterval = (config.swapInterval || 6) * 1000;
  const totalSlots = tilePatterns.length;
  const transition = config.transition || "fade";
  const variants = transitionVariants[transition] || transitionVariants.fade;
  const borderColor = config.frameBorderColor || "rgba(255,255,255,0.1)";
  const borderWidth = config.frameBorderWidth ?? 2;

  const [visibleSelfies, setVisibleSelfies] = useState<(Selfie | null)[]>(
    () => Array(totalSlots).fill(null)
  );
  const poolIndexRef = useRef(0);

  // Initialize
  useEffect(() => {
    if (selfies.length === 0) return;
    const initial: (Selfie | null)[] = [];
    for (let i = 0; i < totalSlots; i++) {
      initial.push(i < selfies.length ? selfies[i] : null);
    }
    setVisibleSelfies(initial);
    poolIndexRef.current = Math.min(totalSlots, selfies.length);
  }, [selfies.length === 0, totalSlots]); // eslint-disable-line react-hooks/exhaustive-deps

  // Swap timer
  const swap = useCallback(() => {
    if (selfies.length <= totalSlots) return;
    setVisibleSelfies((prev) => {
      const next = [...prev];
      const slotIndex = Math.floor(Math.random() * totalSlots);
      const nextSelfie = selfies[poolIndexRef.current % selfies.length];
      poolIndexRef.current = (poolIndexRef.current + 1) % selfies.length;
      next[slotIndex] = nextSelfie;
      return next;
    });
  }, [selfies, totalSlots]);

  useEffect(() => {
    if (selfies.length <= totalSlots) return;
    const timer = setInterval(swap, swapInterval);
    return () => clearInterval(timer);
  }, [swap, swapInterval, selfies.length, totalSlots]);

  return (
    <div
      className="grid gap-2 w-full h-full p-2 auto-rows-fr"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {visibleSelfies.map((selfie, i) => {
        const [colSpan, rowSpan] = tilePatterns[i % tilePatterns.length];
        return (
          <div
            key={i}
            className="relative overflow-hidden rounded-lg bg-white/5"
            style={{
              gridColumn: `span ${Math.min(colSpan, columns)}`,
              gridRow: `span ${rowSpan}`,
              border: `${borderWidth}px solid ${borderColor}`,
            }}
          >
            <AnimatePresence mode="wait">
              {selfie ? (
                <motion.div
                  key={selfie._id}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selfie.imageUrl || ""}
                    alt={selfie.displayName || `Selfie ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  {config.showNames && selfie.displayName && (
                    <div
                      className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent"
                      style={{ opacity: config.overlayOpacity ?? 0.8 }}
                    >
                      <p className="text-white font-medium text-sm truncate">
                        {selfie.displayName}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
