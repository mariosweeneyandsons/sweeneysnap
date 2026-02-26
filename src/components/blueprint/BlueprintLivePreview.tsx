"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { LivePreviewPanel } from "@/components/admin/LivePreviewPanel";
import { CopyLink } from "@/components/blueprint/BlueprintForm";
import { DisplayConfig } from "@/types/database";

interface BlueprintLivePreviewProps {
  eventId: string;
  displayConfig: DisplayConfig;
  uploadUrl: string;
  displayUrl: string;
  crewUrl: string;
  selfieCount: number;
  eventName: string;
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background border border-card-border rounded-xs px-3 py-2">
      <div className="text-label-caps opacity-50 !text-[9px]">{label}</div>
      <div className="text-xs text-foreground-emphasis font-mono">{value}</div>
    </div>
  );
}

export function BlueprintLivePreview({
  eventId,
  displayConfig,
  uploadUrl,
  displayUrl,
  crewUrl,
  selfieCount,
  eventName,
}: BlueprintLivePreviewProps) {
  return (
    <div className="space-y-4">
      {/* Preview heading */}
      <div className="text-label-caps opacity-60">display preview</div>

      {/* 16:9 live preview */}
      <LivePreviewPanel eventId={eventId} config={displayConfig} />

      {/* Stat chips */}
      <div className="grid grid-cols-2 gap-2">
        <StatChip
          label="layout"
          value={displayConfig.layoutMode || "grid"}
        />
        <StatChip
          label="grid"
          value={`${displayConfig.gridColumns || 4}x${displayConfig.gridColumns || 4}`}
        />
        <StatChip
          label="swap"
          value={`${displayConfig.swapInterval || 5}s`}
        />
        <StatChip
          label="transition"
          value={displayConfig.transition || "fade"}
        />
      </div>

      {/* Copy URLs */}
      <div className="bg-surface border border-card-border rounded-xs p-4 space-y-1">
        <CopyLink label="upload url" url={uploadUrl} />
        <CopyLink label="display url" url={displayUrl} />
        <CopyLink label="crew url" url={crewUrl} />
      </div>

      {/* QR + quick actions */}
      <div className="flex gap-4 items-start">
        <div className="bg-background border border-card-border rounded-xs p-3">
          <QRCodeSVG
            value={uploadUrl}
            size={80}
            bgColor="var(--background)"
            fgColor="var(--foreground)"
          />
          <div className="text-label-caps opacity-50 mt-1.5 text-center !text-[8px]">
            scan reference
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <Link
            href={`/admin/events/${eventId}/crew`}
            className="border border-border-strong rounded-xs px-3 py-2 text-label-caps text-foreground-emphasis hover:bg-secondary transition text-center"
          >
            manage crew
          </Link>
          <Link
            href={`/admin/events/${eventId}/activity`}
            className="border border-border-strong rounded-xs px-3 py-2 text-label-caps text-foreground-emphasis hover:bg-secondary transition text-center"
          >
            activity log
          </Link>
        </div>
      </div>
    </div>
  );
}
