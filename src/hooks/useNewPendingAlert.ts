"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useNewPendingAlert(eventId: string) {
  const pendingCount =
    useQuery(api.selfies.countByEventAndStatus, {
      eventId: eventId as Id<"events">,
      status: "pending",
    }) ?? 0;

  const prevCountRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize prev count on first load (don't play sound)
    if (prevCountRef.current === null) {
      prevCountRef.current = pendingCount;
      return;
    }

    // Play sound when pending count increases
    if (pendingCount > prevCountRef.current) {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/notification.wav");
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Browser may block autoplay before user interaction
      });
    }

    prevCountRef.current = pendingCount;
  }, [pendingCount]);

  return { pendingCount };
}
