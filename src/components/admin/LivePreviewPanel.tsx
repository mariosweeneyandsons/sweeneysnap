"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { SelfieGrid } from "@/components/display/SelfieGrid";
import { DisplayConfig, SelfieWithUrls } from "@/types/database";
import { getLayoutTemplate } from "@/lib/layoutTemplates";

interface LivePreviewPanelProps {
  eventId: string;
  config: DisplayConfig;
  className?: string;
}

const PLACEHOLDER_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6",
];

function generatePlaceholders(count: number): SelfieWithUrls[] {
  return Array.from({ length: count }, (_, i) => ({
    _id: `placeholder-${i}`,
    _creationTime: Date.now() - i * 1000,
    eventId: "",
    storageId: "",
    imageUrl: null,
    status: "approved" as const,
    _placeholder: true,
    _color: PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length],
  }));
}

export function LivePreviewPanel({ eventId, config, className }: LivePreviewPanelProps) {
  const selfies = useQuery(api.selfies.listApprovedByEvent, {
    eventId: eventId as Id<"events">,
  });

  const template = config.layoutTemplateId
    ? getLayoutTemplate(config.layoutTemplateId)
    : null;

  const columns = template ? template.columns : (config.gridColumns || 3);
  const rows = template ? template.rows : (config.gridColumns || 3);
  const totalSlots = template ? template.slots.length : columns * rows;

  const hasSelfies = selfies && selfies.length > 0;

  return (
    <div className={className}>
      <div
        className="rounded-xs overflow-hidden border border-card-border"
        style={{ aspectRatio: "16 / 9" }}
      >
        {hasSelfies ? (
          <SelfieGrid selfies={selfies} config={config} />
        ) : (
          <div
            className="w-full h-full p-1"
            style={{ backgroundColor: config.backgroundColor || "#000000" }}
          >
            {template ? (
              <div
                className="grid gap-1 w-full h-full"
                style={{
                  gridTemplateColumns: `repeat(${template.columns}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${template.rows}, minmax(0, 1fr))`,
                }}
              >
                {template.slots.map((slot, i) => (
                  <div
                    key={i}
                    className="rounded-xs"
                    style={{
                      gridColumn: `${slot.colStart} / span ${slot.colSpan}`,
                      gridRow: `${slot.rowStart} / span ${slot.rowSpan}`,
                      backgroundColor: PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length],
                      opacity: 0.5,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div
                className="grid gap-1 w-full h-full"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                }}
              >
                {generatePlaceholders(totalSlots).map((p, i) => (
                  <div
                    key={i}
                    className="rounded-xs"
                    style={{ backgroundColor: (p as unknown as { _color: string })._color, opacity: 0.5 }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
