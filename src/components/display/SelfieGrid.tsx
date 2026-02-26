"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SelfieFrame } from "./SelfieFrame";
import { CelebrationEffect } from "./CelebrationEffect";
import { SelfieWithUrls, DisplayConfig } from "@/types/database";

interface SelfieGridProps {
  selfies: SelfieWithUrls[];
  config: DisplayConfig;
}

export function SelfieGrid({ selfies, config }: SelfieGridProps) {
  const columns = config.gridColumns || 3;
  const swapInterval = (config.swapInterval || 6) * 1000;
  const totalSlots = columns * columns;

  // Visible frames — what's currently showing on screen
  const [visibleSelfies, setVisibleSelfies] = useState<(SelfieWithUrls | null)[]>(
    () => Array(totalSlots).fill(null)
  );

  // Track which selfies are currently visible to avoid duplicates
  const visibleIdsRef = useRef<Set<string>>(new Set());
  const poolIndexRef = useRef(0);

  // Spotlight state
  const [spotlightSelfie, setSpotlightSelfie] = useState<SelfieWithUrls | null>(null);

  // New selfie detection for sound + celebration
  const prevCountRef = useRef(selfies.length);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize visible frames when selfies first arrive
  useEffect(() => {
    if (selfies.length === 0) return;
    const initial: (SelfieWithUrls | null)[] = [];
    const ids = new Set<string>();
    for (let i = 0; i < totalSlots; i++) {
      if (i < selfies.length) {
        initial.push(selfies[i]);
        ids.add(selfies[i]._id);
      } else {
        initial.push(null);
      }
    }
    setVisibleSelfies(initial);
    visibleIdsRef.current = ids;
    poolIndexRef.current = Math.min(totalSlots, selfies.length);
  }, [selfies.length === 0, totalSlots]); // eslint-disable-line react-hooks/exhaustive-deps

  // Swap timer — replace one random frame with the next selfie from the pool
  const swap = useCallback(() => {
    if (selfies.length <= totalSlots) return;

    setVisibleSelfies((prev) => {
      const next = [...prev];
      const slotIndex = Math.floor(Math.random() * totalSlots);
      const nextSelfie = selfies[poolIndexRef.current % selfies.length];
      poolIndexRef.current = (poolIndexRef.current + 1) % selfies.length;

      const old = next[slotIndex];
      if (old) visibleIdsRef.current.delete(old._id);
      visibleIdsRef.current.add(nextSelfie._id);
      next[slotIndex] = nextSelfie;

      return next;
    });
  }, [selfies, totalSlots]);

  useEffect(() => {
    if (selfies.length <= totalSlots) return;
    const timer = setInterval(swap, swapInterval);
    return () => clearInterval(timer);
  }, [swap, swapInterval, selfies.length, totalSlots]);

  // Add newly arriving selfies immediately if there are empty slots
  useEffect(() => {
    if (selfies.length === 0) return;
    const newest = selfies[0];
    if (visibleIdsRef.current.has(newest._id)) return;

    setVisibleSelfies((prev) => {
      const emptyIndex = prev.findIndex((s) => s === null);
      if (emptyIndex !== -1) {
        const next = [...prev];
        next[emptyIndex] = newest;
        visibleIdsRef.current.add(newest._id);
        return next;
      }
      const slotIndex = Math.floor(Math.random() * totalSlots);
      const next = [...prev];
      const old = next[slotIndex];
      if (old) visibleIdsRef.current.delete(old._id);
      next[slotIndex] = newest;
      visibleIdsRef.current.add(newest._id);
      return next;
    });
  }, [selfies, totalSlots]);

  // New selfie detection — sound + celebration
  useEffect(() => {
    if (selfies.length > prevCountRef.current) {
      // Play sound
      const sound = config.newSelfieSound;
      if (sound && sound !== "none") {
        const src = `/sounds/${sound}.mp3`;
        if (!audioRef.current || audioRef.current.src !== src) {
          audioRef.current = new Audio(src);
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      // Trigger celebration
      const effect = config.celebrationEffect;
      if (effect && effect !== "none") {
        setCelebrationActive(true);
        setTimeout(() => setCelebrationActive(false), 2500);
      }
    }
    prevCountRef.current = selfies.length;
  }, [selfies.length, config.newSelfieSound, config.celebrationEffect]);

  // Spotlight timer
  useEffect(() => {
    if (!config.spotlightEnabled || selfies.length === 0) return;
    const interval = (config.spotlightInterval || 30) * 1000;
    const duration = (config.spotlightDuration || 5) * 1000;

    const timer = setInterval(() => {
      const randomSelfie = selfies[Math.floor(Math.random() * selfies.length)];
      setSpotlightSelfie(randomSelfie);
      setTimeout(() => setSpotlightSelfie(null), duration);
    }, interval);

    return () => clearInterval(timer);
  }, [config.spotlightEnabled, config.spotlightInterval, config.spotlightDuration, selfies]);

  // Spotlight view
  if (spotlightSelfie) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <AnimatePresence>
          <motion.div
            key={`spotlight-${spotlightSelfie._id}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative w-full h-full max-w-[80vh] mx-auto rounded-2xl overflow-hidden shadow-2xl ring-4"
            style={{ "--tw-ring-color": "var(--primary-color, #ffffff)" } as React.CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={spotlightSelfie.imageUrl || ""}
              alt={spotlightSelfie.displayName || "Spotlight"}
              className="w-full h-full object-cover"
            />
            {spotlightSelfie.displayName && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-bold text-3xl">{spotlightSelfie.displayName}</p>
                {spotlightSelfie.message && (
                  <p className="text-white/70 text-xl mt-1">{spotlightSelfie.message}</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <div
        className="grid gap-2 w-full h-full p-2"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${columns}, 1fr)`,
        }}
      >
        {visibleSelfies.map((selfie, i) => (
          <SelfieFrame key={i} selfie={selfie} config={config} index={i} />
        ))}
      </div>
      {celebrationActive && config.celebrationEffect && config.celebrationEffect !== "none" && (
        <CelebrationEffect effect={config.celebrationEffect} />
      )}
    </>
  );
}
