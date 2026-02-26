"use client";

import { FilterPreset, FILTER_PRESETS } from "@/hooks/usePhotoEditor";

interface FilterStripProps {
  previewUrl: string;
  activeFilter: FilterPreset;
  onSelect: (filter: FilterPreset) => void;
  primaryColor?: string;
}

export function FilterStrip({ previewUrl, activeFilter, onSelect, primaryColor }: FilterStripProps) {
  return (
    <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-none">
      {FILTER_PRESETS.map((filter) => {
        const isActive = filter.name === activeFilter.name;
        return (
          <button
            key={filter.name}
            onClick={() => onSelect(filter)}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div
              className="w-12 h-12 rounded-full overflow-hidden border-2 transition-colors"
              style={{
                borderColor: isActive ? (primaryColor || "#ffffff") : "transparent",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={filter.name}
                className="w-full h-full object-cover"
                style={{ filter: filter.css }}
              />
            </div>
            <span
              className="text-xs"
              style={{
                color: isActive ? (primaryColor || "#ffffff") : "rgba(255,255,255,0.5)",
              }}
            >
              {filter.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
