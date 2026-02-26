"use client";

import { useState, useCallback } from "react";
import { BrandAsset } from "@/types/database";

export interface FilterPreset {
  name: string;
  css: string;
}

export const FILTER_PRESETS: FilterPreset[] = [
  { name: "None", css: "none" },
  { name: "B&W", css: "grayscale(100%)" },
  { name: "Warm", css: "sepia(30%) saturate(140%) brightness(105%)" },
  { name: "Cool", css: "saturate(80%) hue-rotate(15deg) brightness(105%)" },
  { name: "Vintage", css: "sepia(40%) contrast(90%) brightness(95%) saturate(80%)" },
];

export interface PlacedSticker {
  id: string;
  assetUrl: string;
  x: number; // 0-1 ratio
  y: number; // 0-1 ratio
}

interface UsePhotoEditorReturn {
  activeFilter: FilterPreset;
  setActiveFilter: (f: FilterPreset) => void;
  activeFrame: BrandAsset | null;
  setActiveFrame: (f: BrandAsset | null) => void;
  placedStickers: PlacedSticker[];
  addSticker: (asset: BrandAsset) => void;
  removeSticker: (id: string) => void;
  moveSticker: (id: string, x: number, y: number) => void;
  exportComposite: (sourceImage: HTMLImageElement) => Promise<File>;
}

export function usePhotoEditor(): UsePhotoEditorReturn {
  const [activeFilter, setActiveFilter] = useState<FilterPreset>(FILTER_PRESETS[0]);
  const [activeFrame, setActiveFrame] = useState<BrandAsset | null>(null);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);

  const addSticker = useCallback((asset: BrandAsset) => {
    setPlacedStickers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        assetUrl: asset.url,
        x: 0.5,
        y: 0.5,
      },
    ]);
  }, []);

  const removeSticker = useCallback((id: string) => {
    setPlacedStickers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const moveSticker = useCallback((id: string, x: number, y: number) => {
    setPlacedStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x, y } : s))
    );
  }, []);

  const exportComposite = useCallback(
    async (sourceImage: HTMLImageElement): Promise<File> => {
      const size = 1080;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      // 1. Apply CSS filter
      if (activeFilter.css !== "none") {
        ctx.filter = activeFilter.css;
      }

      // 2. Draw base image (center-cropped to square)
      const imgW = sourceImage.naturalWidth;
      const imgH = sourceImage.naturalHeight;
      const cropSize = Math.min(imgW, imgH);
      const sx = (imgW - cropSize) / 2;
      const sy = (imgH - cropSize) / 2;
      ctx.drawImage(sourceImage, sx, sy, cropSize, cropSize, 0, 0, size, size);

      // Reset filter for overlays
      ctx.filter = "none";

      // 3. Draw frame overlay
      if (activeFrame) {
        const frameImg = await loadImage(activeFrame.url);
        ctx.drawImage(frameImg, 0, 0, size, size);
      }

      // 4. Draw stickers
      const stickerSize = size * 0.2;
      for (const sticker of placedStickers) {
        const stickerImg = await loadImage(sticker.assetUrl);
        const dx = sticker.x * size - stickerSize / 2;
        const dy = sticker.y * size - stickerSize / 2;
        ctx.drawImage(stickerImg, dx, dy, stickerSize, stickerSize);
      }

      // Export as WebP
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/webp", 0.9);
      });
      return new File([blob], "selfie-edited.webp", { type: "image/webp" });
    },
    [activeFilter, activeFrame, placedStickers]
  );

  return {
    activeFilter,
    setActiveFilter,
    activeFrame,
    setActiveFrame,
    placedStickers,
    addSticker,
    removeSticker,
    moveSticker,
    exportComposite,
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
