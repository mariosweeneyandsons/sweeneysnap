"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { SelfieGrid } from "@/components/display/SelfieGrid";
import { DisplayConfig, Selfie } from "@/types/database";

interface LivePreviewPanelProps {
  eventId: string;
  config: DisplayConfig;
}

function generatePlaceholders(count: number): Selfie[] {
  const colors = [
    "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
    "#ec4899", "#06b6d4", "#f97316", "#14b8a6",
  ];
  return Array.from({ length: count }, (_, i) => ({
    _id: `placeholder-${i}`,
    _creationTime: Date.now() - i * 1000,
    eventId: "",
    storageId: "",
    imageUrl: null,
    status: "approved" as const,
    _placeholder: true,
    _color: colors[i % colors.length],
  }));
}

export function LivePreviewPanel({ eventId, config }: LivePreviewPanelProps) {
  const selfies = useQuery(api.selfies.listApprovedByEvent, {
    eventId: eventId as Id<"events">,
  });

  const columns = config.gridColumns || 3;
  const totalSlots = columns * columns;

  // Use real selfies or colored placeholders
  const displaySelfies: Selfie[] =
    selfies && selfies.length > 0
      ? selfies
      : generatePlaceholders(totalSlots);

  return (
    <div className="sticky top-4">
      <h3 className="text-sm font-medium text-foreground-faint mb-2 uppercase tracking-wider">
        Live Preview
      </h3>
      <div
        className="rounded-lg overflow-hidden border border-border"
        style={{ aspectRatio: "16 / 9" }}
      >
        {selfies && selfies.length > 0 ? (
          <SelfieGrid selfies={displaySelfies} config={config} />
        ) : (
          <div
            className="grid gap-1 w-full h-full p-1"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gridTemplateRows: `repeat(${columns}, 1fr)`,
              backgroundColor: config.backgroundColor || "#000000",
            }}
          >
            {generatePlaceholders(totalSlots).map((p, i) => (
              <div
                key={i}
                className="rounded"
                style={{ backgroundColor: (p as unknown as { _color: string })._color, opacity: 0.5 }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
