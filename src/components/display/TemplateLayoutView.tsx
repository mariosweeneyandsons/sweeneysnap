"use client";

import { SelfieFrame } from "./SelfieFrame";
import { CelebrationEffect } from "./CelebrationEffect";
import { useSelfieSwap } from "@/hooks/useSelfieSwap";
import { getLayoutTemplate, LayoutTemplate } from "@/lib/layoutTemplates";
import { SelfieWithUrls, DisplayConfig } from "@/types/database";
import { AnimatePresence, motion } from "motion/react";

interface TemplateLayoutViewProps {
  selfies: SelfieWithUrls[];
  config: DisplayConfig;
}

export function TemplateLayoutView({ selfies, config }: TemplateLayoutViewProps) {
  const template = getLayoutTemplate(config.layoutTemplateId || "grid-3x3");
  if (!template) return null;

  return <TemplateLayoutInner selfies={selfies} config={config} template={template} />;
}

function TemplateLayoutInner({
  selfies,
  config,
  template,
}: TemplateLayoutViewProps & { template: LayoutTemplate }) {
  const totalSlots = template.slots.length;
  const { visibleSelfies, celebrationActive, spotlightSelfie } = useSelfieSwap(
    selfies,
    totalSlots,
    config
  );

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
          gridTemplateColumns: `repeat(${template.columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${template.rows}, minmax(0, 1fr))`,
        }}
      >
        {template.slots.map((slot, i) => (
          <div
            key={i}
            style={{
              gridColumn: `${slot.colStart} / span ${slot.colSpan}`,
              gridRow: `${slot.rowStart} / span ${slot.rowSpan}`,
            }}
          >
            <SelfieFrame
              selfie={visibleSelfies[i] ?? null}
              config={config}
              index={i}
            />
          </div>
        ))}
      </div>
      {celebrationActive && config.celebrationEffect && config.celebrationEffect !== "none" && (
        <CelebrationEffect effect={config.celebrationEffect} />
      )}
    </>
  );
}
