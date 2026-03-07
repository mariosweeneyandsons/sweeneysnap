"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SelfieWithUrls, DisplayConfig } from "@/types/database";

interface UseSelfieSwapResult {
  visibleSelfies: (SelfieWithUrls | null)[];
  celebrationActive: boolean;
  spotlightSelfie: SelfieWithUrls | null;
}

export function useSelfieSwap(
  selfies: SelfieWithUrls[],
  totalSlots: number,
  config: DisplayConfig
): UseSelfieSwapResult {
  const swapInterval = (config.swapInterval || 6) * 1000;

  const [visibleSelfies, setVisibleSelfies] = useState<(SelfieWithUrls | null)[]>(
    () => Array(totalSlots).fill(null)
  );
  const visibleIdsRef = useRef<Set<string>>(new Set());
  const poolIndexRef = useRef(0);

  const [spotlightSelfie, setSpotlightSelfie] = useState<SelfieWithUrls | null>(null);
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

  // Swap timer
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
      const sound = config.newSelfieSound;
      if (sound && sound !== "none") {
        const src = `/sounds/${sound}.mp3`;
        if (!audioRef.current || audioRef.current.src !== src) {
          audioRef.current = new Audio(src);
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
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

  return { visibleSelfies, celebrationActive, spotlightSelfie };
}
