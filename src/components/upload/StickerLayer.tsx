"use client";

import { useRef, useCallback } from "react";
import { PlacedSticker } from "@/hooks/usePhotoEditor";

interface StickerLayerProps {
  stickers: PlacedSticker[];
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
}

export function StickerLayer({ stickers, onMove, onRemove }: StickerLayerProps) {
  return (
    <>
      {stickers.map((sticker) => (
        <DraggableSticker
          key={sticker.id}
          sticker={sticker}
          onMove={onMove}
          onRemove={onRemove}
        />
      ))}
    </>
  );
}

interface DraggableStickerProps {
  sticker: PlacedSticker;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
}

function DraggableSticker({ sticker, onMove, onRemove }: DraggableStickerProps) {
  const stickerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const getRelativePosition = useCallback(
    (clientX: number, clientY: number) => {
      const parent = stickerRef.current?.parentElement;
      if (!parent) return { x: sticker.x, y: sticker.y };
      const rect = parent.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      return { x, y };
    },
    [sticker.x, sticker.y]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;

      const handleMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const pos = getRelativePosition(ev.clientX, ev.clientY);
        onMove(sticker.id, pos.x, pos.y);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [sticker.id, onMove, getRelativePosition]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      isDragging.current = true;

      const handleTouchMove = (ev: TouchEvent) => {
        if (!isDragging.current) return;
        ev.preventDefault();
        const touch = ev.touches[0];
        const pos = getRelativePosition(touch.clientX, touch.clientY);
        onMove(sticker.id, pos.x, pos.y);
      };

      const handleTouchEnd = () => {
        isDragging.current = false;
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };

      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    },
    [sticker.id, onMove, getRelativePosition]
  );

  return (
    <div
      ref={stickerRef}
      className="absolute cursor-grab active:cursor-grabbing"
      style={{
        left: `${sticker.x * 100}%`,
        top: `${sticker.y * 100}%`,
        transform: "translate(-50%, -50%)",
        width: "20%",
        height: "20%",
        touchAction: "none",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sticker.assetUrl}
        alt=""
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(sticker.id);
        }}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-xs hover:bg-red-500 transition-colors"
      >
        ×
      </button>
    </div>
  );
}
