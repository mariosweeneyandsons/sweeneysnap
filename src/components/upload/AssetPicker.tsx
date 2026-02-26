"use client";

import { BrandAsset } from "@/types/database";

interface AssetPickerProps {
  assets: BrandAsset[];
  type: "frame" | "sticker";
  activeFrame?: BrandAsset | null;
  onSelectFrame?: (asset: BrandAsset | null) => void;
  onAddSticker?: (asset: BrandAsset) => void;
  primaryColor?: string;
}

export function AssetPicker({
  assets,
  type,
  activeFrame,
  onSelectFrame,
  onAddSticker,
  primaryColor,
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
            className="aspect-square rounded-lg overflow-hidden border-2 transition-colors bg-white/5 p-1"
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
