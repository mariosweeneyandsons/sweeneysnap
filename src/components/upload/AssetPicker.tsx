"use client";

import { BrandAsset } from "@/types/database";

interface AssetPickerProps {
  assets: BrandAsset[];
  type: "frame" | "sticker";
  activeFrame?: BrandAsset | null;
  onSelectFrame?: (asset: BrandAsset | null) => void;
  onAddSticker?: (asset: BrandAsset) => void;
  primaryColor?: string;
  showNoneOption?: boolean;
}

export function AssetPicker({
  assets,
  type,
  activeFrame,
  onSelectFrame,
  onAddSticker,
  primaryColor,
  showNoneOption,
}: AssetPickerProps) {
  if (assets.length === 0) {
    return (
      <p className="text-center text-sm" style={{ opacity: 0.4 }}>
        No {type}s available
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {type === "frame" && showNoneOption && (
        <button
          onClick={() => onSelectFrame?.(null)}
          className="aspect-square rounded-xs overflow-hidden border-2 transition-colors bg-secondary p-1 flex items-center justify-center"
          style={{
            borderColor: !activeFrame ? (primaryColor || "#ffffff") : "transparent",
          }}
        >
          <span className="text-xs font-medium" style={{ opacity: 0.5 }}>None</span>
        </button>
      )}
      {assets.map((asset, i) => {
        const isActive = type === "frame" && activeFrame?.url === asset.url;
        return (
          <button
            key={`${asset.url}-${i}`}
            onClick={() => {
              if (type === "frame" && onSelectFrame) {
                onSelectFrame(isActive ? null : asset);
              } else if (type === "sticker" && onAddSticker) {
                onAddSticker(asset);
              }
            }}
            className="aspect-square rounded-xs overflow-hidden border-2 transition-colors bg-secondary p-1"
            style={{
              borderColor: isActive ? (primaryColor || "#ffffff") : "transparent",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset.url}
              alt={asset.name}
              className="w-full h-full object-contain"
            />
          </button>
        );
      })}
    </div>
  );
}
