"use client";

import { useState, useEffect, useCallback } from "react";

interface AutoResetTimerProps {
  seconds: number;
  onReset: () => void;
}

export function AutoResetTimer({ seconds, onReset }: AutoResetTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onReset();
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onReset]);

  const handleSkip = useCallback(() => {
    onReset();
  }, [onReset]);

  const progress = remaining / seconds;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <button
      onClick={handleSkip}
      className="relative w-20 h-20 flex items-center justify-center"
      title="Tap to skip"
    >
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <span className="absolute text-xl font-bold text-white">
        {remaining}
      </span>
    </button>
  );
}
