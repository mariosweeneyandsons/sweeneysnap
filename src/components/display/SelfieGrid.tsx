"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SelfieFrame } from "./SelfieFrame";
import { Selfie, DisplayConfig } from "@/types/database";

interface SelfieGridProps {
  selfies: Selfie[];
  config: DisplayConfig;
}

export function SelfieGrid({ selfies, config }: SelfieGridProps) {
  const columns = config.gridColumns || 3;
  const swapInterval = (config.swapInterval || 6) * 1000;
  const totalSlots = columns * columns;

  // Visible frames — what's currently showing on screen
  const [visibleSelfies, setVisibleSelfies] = useState<(Selfie | null)[]>(
    () => Array(totalSlots).fill(null)
  );

  // Track which selfies are currently visible to avoid duplicates
  const visibleIdsRef = useRef<Set<string>>(new Set());
  const poolIndexRef = useRef(0);

  // Initialize visible frames when selfies first arrive
  useEffect(() => {
    if (selfies.length === 0) return;
    const initial: (Selfie | null)[] = [];
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
    if (selfies.length <= totalSlots) return; // No pool to draw from

    setVisibleSelfies((prev) => {
      const next = [...prev];
      // Pick a random slot to replace
      const slotIndex = Math.floor(Math.random() * totalSlots);
      // Get the next selfie from the pool (circular)
      const nextSelfie = selfies[poolIndexRef.current % selfies.length];
      poolIndexRef.current = (poolIndexRef.current + 1) % selfies.length;

      // Remove old from visible set, add new
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
      // No empty slot — replace a random one
      const slotIndex = Math.floor(Math.random() * totalSlots);
      const next = [...prev];
      const old = next[slotIndex];
      if (old) visibleIdsRef.current.delete(old._id);
      next[slotIndex] = newest;
      visibleIdsRef.current.add(newest._id);
      return next;
    });
  }, [selfies, totalSlots]);

  return (
    <div
      className="grid gap-2 w-full h-full p-2"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${columns}, 1fr)`,
        backgroundColor: config.backgroundColor || "#000000",
      }}
    >
      {visibleSelfies.map((selfie, i) => (
        <SelfieFrame key={i} selfie={selfie} config={config} index={i} />
      ))}
    </div>
  );
}
