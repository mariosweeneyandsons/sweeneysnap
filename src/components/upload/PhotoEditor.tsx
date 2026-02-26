"use client";

import { useState, useRef, useCallback } from "react";
import { usePhotoEditor } from "@/hooks/usePhotoEditor";
import { FilterStrip } from "./FilterStrip";
import { StickerLayer } from "./StickerLayer";
import { AssetPicker } from "./AssetPicker";
import { Button } from "@/components/ui/Button";
import { BrandAsset } from "@/types/database";

const DEFAULT_FRAMES: BrandAsset[] = [
  { url: "/frames/classic-white.svg", type: "frame", name: "Classic White" },
  { url: "/frames/polaroid.svg", type: "frame", name: "Polaroid" },
  { url: "/frames/ornate-gold.svg", type: "frame", name: "Ornate Gold" },
];

interface PhotoEditorProps {
  imageFile: File;
  previewUrl: string;
  frames: BrandAsset[];
  stickers: BrandAsset[];
  filtersEnabled: boolean;
  framesEnabled: boolean;
  stickersEnabled: boolean;
  onConfirm: (editedFile: File) => void;
  onRetake: () => void;
  primaryColor?: string;
}

type AssetTab = "frames" | "stickers";

export function PhotoEditor({
  imageFile,
  previewUrl,
  frames,
  stickers,
  filtersEnabled,
  framesEnabled,
  stickersEnabled,
  onConfirm,
  onRetake,
  primaryColor,
}: PhotoEditorProps) {
  const {
    activeFilter,
    setActiveFilter,
    activeFrame,
    setActiveFrame,
    placedStickers,
    addSticker,
    removeSticker,
    moveSticker,
    exportComposite,
  } = usePhotoEditor();

  const [activeTab, setActiveTab] = useState<AssetTab>(
    framesEnabled ? "frames" : "stickers"
  );
  const [isExporting, setIsExporting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Merge default frames with event-specific frames
  const allFrames = framesEnabled
    ? [...(frames.length > 0 ? frames : DEFAULT_FRAMES)]
    : [];
  const allStickers = stickersEnabled ? stickers : [];

  const hasAssetTabs = allFrames.length > 0 || allStickers.length > 0;

  const handleConfirm = useCallback(async () => {
    setIsExporting(true);
    try {
      // Load the source image for export
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = previewUrl;
      });
      const editedFile = await exportComposite(img);
      onConfirm(editedFile);
    } catch {
      // If export fails, just pass the original file
      onConfirm(imageFile);
    } finally {
      setIsExporting(false);
    }
  }, [previewUrl, exportComposite, onConfirm, imageFile]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      {/* Preview with overlays */}
      <div className="relative w-full aspect-square rounded-xs overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={previewUrl}
          alt="Preview"
          className="w-full h-full object-cover"
          style={{ filter: activeFilter.css }}
        />
        {/* Frame overlay */}
        {activeFrame && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeFrame.url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        )}
        {/* Stickers */}
        <StickerLayer
          stickers={placedStickers}
          onMove={moveSticker}
          onRemove={removeSticker}
        />
      </div>

      {/* Filter strip */}
      {filtersEnabled && (
        <FilterStrip
          previewUrl={previewUrl}
          activeFilter={activeFilter}
          onSelect={setActiveFilter}
          primaryColor={primaryColor}
        />
      )}

      {/* Asset tabs */}
      {hasAssetTabs && (
        <div>
          <div className="flex gap-2 mb-3">
            {allFrames.length > 0 && (
              <button
                onClick={() => setActiveTab("frames")}
                className="px-3 py-1 rounded-xs text-sm font-medium transition-colors"
                style={{
                  backgroundColor:
                    activeTab === "frames"
                      ? primaryColor || "#ffffff"
                      : "rgba(255,255,255,0.1)",
                  color:
                    activeTab === "frames" ? "#000000" : "rgba(255,255,255,0.6)",
                }}
              >
                Frames
              </button>
            )}
            {allStickers.length > 0 && (
              <button
                onClick={() => setActiveTab("stickers")}
                className="px-3 py-1 rounded-xs text-sm font-medium transition-colors"
                style={{
                  backgroundColor:
                    activeTab === "stickers"
                      ? primaryColor || "#ffffff"
                      : "rgba(255,255,255,0.1)",
                  color:
                    activeTab === "stickers"
                      ? "#000000"
                      : "rgba(255,255,255,0.6)",
                }}
              >
                Stickers
              </button>
            )}
          </div>

          {activeTab === "frames" && allFrames.length > 0 && (
            <AssetPicker
              assets={allFrames}
              type="frame"
              activeFrame={activeFrame}
              onSelectFrame={setActiveFrame}
              primaryColor={primaryColor}
              showNoneOption
            />
          )}
          {activeTab === "stickers" && allStickers.length > 0 && (
            <AssetPicker
              assets={allStickers}
              type="sticker"
              onAddSticker={addSticker}
              primaryColor={primaryColor}
            />
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 w-full">
        <Button
          onClick={handleConfirm}
          size="lg"
          className="flex-1"
          loading={isExporting}
          disabled={isExporting}
          style={primaryColor ? { backgroundColor: primaryColor, color: "#fff" } : undefined}
        >
          Continue
        </Button>
        <Button onClick={onRetake} variant="ghost" size="lg" disabled={isExporting}>
          Retake
        </Button>
      </div>
    </div>
  );
}
