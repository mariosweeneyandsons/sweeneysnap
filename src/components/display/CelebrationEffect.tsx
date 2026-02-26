"use client";

import { useEffect, useState } from "react";

interface CelebrationEffectProps {
  effect: "confetti" | "ripple" | "glow";
}

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

const CONFETTI_COLORS = ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff", "#5f27cd", "#01a3a4", "#ff6348"];

export function CelebrationEffect({ effect }: CelebrationEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (effect === "confetti") {
      const newParticles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random() * 1.5,
        size: 6 + Math.random() * 8,
      }));
      setParticles(newParticles);
    }
  }, [effect]);

  if (effect === "confetti") {
    return (
      <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute animate-confetti-fall"
            style={{
              left: `${p.x}%`,
              top: "-20px",
              width: `${p.size}px`,
              height: `${p.size * 0.6}px`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              borderRadius: "2px",
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
        <style jsx>{`
          @keyframes confetti-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          .animate-confetti-fall {
            animation: confetti-fall 2s ease-in forwards;
          }
        `}</style>
      </div>
    );
  }

  if (effect === "ripple") {
    return (
      <div className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center">
        <div className="animate-ripple rounded-full border-4" style={{ borderColor: "var(--primary-color, #48dbfb)" }} />
        <div className="animate-ripple rounded-full border-4 [animation-delay:0.3s]" style={{ borderColor: "var(--primary-color, #48dbfb)" }} />
        <style jsx>{`
          @keyframes ripple {
            0% { width: 0; height: 0; opacity: 1; }
            100% { width: 120vmax; height: 120vmax; opacity: 0; }
          }
          .animate-ripple {
            position: absolute;
            animation: ripple 2s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }

  if (effect === "glow") {
    return (
      <div className="fixed inset-0 z-30 pointer-events-none">
        <div className="absolute inset-0 animate-glow-pulse" style={{ boxShadow: `inset 0 0 100px 20px var(--primary-color, #feca57)` }} />
        <style jsx>{`
          @keyframes glow-pulse {
            0% { opacity: 0; }
            30% { opacity: 0.6; }
            100% { opacity: 0; }
          }
          .animate-glow-pulse {
            animation: glow-pulse 2s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }

  return null;
}
