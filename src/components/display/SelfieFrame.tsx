"use client";

import { AnimatePresence, motion } from "motion/react";
import { Selfie, DisplayConfig } from "@/types/database";

interface SelfieFrameProps {
  selfie: Selfie | null;
  config: DisplayConfig;
  index: number;
}

export function SelfieFrame({ selfie, config, index }: SelfieFrameProps) {
  const borderColor = config.frameBorderColor || "rgba(255,255,255,0.1)";
  const borderWidth = config.frameBorderWidth ?? 2;

  return (
    <div
      className="relative w-full aspect-square overflow-hidden rounded-lg bg-white/5"
      style={{
        border: `${borderWidth}px solid ${borderColor}`,
      }}
    >
      <AnimatePresence mode="wait">
        {selfie ? (
          <motion.div
            key={selfie._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selfie.imageUrl || ""}
              alt={selfie.displayName || `Selfie ${index + 1}`}
              className="w-full h-full object-cover"
              loading="eager"
            />
            {(config.showNames && selfie.displayName) && (
              <div
                className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent"
                style={{ opacity: config.overlayOpacity ?? 0.8 }}
              >
                <p className="text-white font-medium text-sm truncate">
                  {selfie.displayName}
                </p>
                {config.showMessages && selfie.message && (
                  <p className="text-white/70 text-xs truncate">{selfie.message}</p>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
