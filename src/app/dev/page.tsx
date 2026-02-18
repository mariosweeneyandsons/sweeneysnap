"use client";

import Link from "next/link";
import { motion } from "motion/react";

const themes = [
  {
    number: 1,
    name: "Command Center",
    subtitle: "Dark Tactical",
    colors: ["#0a0e1a", "#00ff88", "#ffaa00"],
  },
  {
    number: 2,
    name: "Glass Loft",
    subtitle: "Frosted Minimal",
    colors: ["#f0ece4", "#e8e0f0", "#6366f1"],
  },
  {
    number: 3,
    name: "Neon Studio",
    subtitle: "Bold Creative",
    colors: ["#0d0015", "#ff0080", "#00d4ff", "#ffea00"],
  },
  {
    number: 4,
    name: "Film Set",
    subtitle: "Cinema-Inspired",
    colors: ["#1a1a1a", "#c9a84c", "#f5f0e8", "#cc3333"],
  },
  {
    number: 5,
    name: "Swiss Grid",
    subtitle: "Brutalist Precision",
    colors: ["#ffffff", "#000000", "#ff0000"],
  },
  {
    number: 6,
    name: "Greenhouse",
    subtitle: "Organic Dashboard",
    colors: ["#f7f3eb", "#4a7c59", "#d4845a"],
  },
  {
    number: 7,
    name: "Mainframe",
    subtitle: "Retro Terminal",
    colors: ["#1a1200", "#ffb000", "#ff8c00"],
  },
  {
    number: 8,
    name: "Blueprint",
    subtitle: "Technical Drafting",
    colors: ["#1a2744", "#4a7ab5", "#ff6b4a"],
  },
  {
    number: 9,
    name: "Confetti",
    subtitle: "Playful Chaos",
    colors: ["#fff5f5", "#f472b6", "#8b5cf6"],
  },
  {
    number: 10,
    name: "Darkroom",
    subtitle: "Moody Minimal",
    colors: ["#111111", "#c45a5a", "#999999"],
  },
];

export default function DevIndex() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Event Settings Themes</h1>
        <p className="text-white/50 mb-10">
          10 visual concepts for the event configuration page
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme, i) => (
            <motion.div
              key={theme.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                href={`/dev/theme-${theme.number}`}
                className="block group"
              >
                <div className="border border-white/10 rounded-xl p-6 bg-white/[0.03] hover:bg-white/[0.06] transition-colors duration-200">
                  <div className="text-sm text-white/30 font-mono mb-1">
                    Theme {theme.number}
                  </div>
                  <h2 className="text-xl font-semibold mb-1 group-hover:text-indigo-400 transition-colors">
                    {theme.name}
                  </h2>
                  <p className="text-sm text-white/40 mb-4">
                    {theme.subtitle}
                  </p>
                  <div className="flex gap-2">
                    {theme.colors.map((color) => (
                      <div
                        key={color}
                        className="w-5 h-5 rounded-full border border-white/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
