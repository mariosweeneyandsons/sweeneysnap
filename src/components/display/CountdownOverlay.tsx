"use client";

import { useState, useEffect } from "react";

interface CountdownOverlayProps {
  startsAt?: number;
  endsAt?: number;
}

function formatTime(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function CountdownOverlay({ startsAt, endsAt }: CountdownOverlayProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine which countdown to show
  let label: string;
  let remaining: number;

  if (startsAt && now < startsAt) {
    label = "Starts in";
    remaining = startsAt - now;
  } else if (endsAt && now < endsAt) {
    label = "Ends in";
    remaining = endsAt - now;
  } else {
    // Countdown finished or no dates set
    return null;
  }

  return (
    <div className="absolute top-4 right-4 z-10 pointer-events-none">
      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-right">
        <p className="text-white/60 text-xs uppercase tracking-wider">{label}</p>
        <p
          className="text-2xl font-mono font-bold"
          style={{ color: "var(--primary-color, #ffffff)" }}
        >
          {formatTime(remaining)}
        </p>
      </div>
    </div>
  );
}
