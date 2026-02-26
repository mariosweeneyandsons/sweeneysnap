"use client";

import { DownloadButton } from "./DownloadButton";
import { Selfie } from "@/types/database";

interface GalleryGridProps {
  selfies: Selfie[];
  allowDownload?: boolean;
  onSelfieClick: (index: number) => void;
}

export function GalleryGrid({ selfies, allowDownload = true, onSelfieClick }: GalleryGridProps) {
  if (selfies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-white/50 text-lg">No photos yet</p>
      </div>
    );
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
      {selfies.map((selfie, index) => (
        <div
          key={selfie._id}
          className="break-inside-avoid group relative rounded-xs overflow-hidden cursor-pointer bg-secondary"
          onClick={() => onSelfieClick(index)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selfie.mediumUrl || selfie.imageUrl || ""}
            alt={selfie.displayName || "Selfie"}
            className="w-full block"
            loading="lazy"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
            <div className="p-3 w-full opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
              {selfie.displayName && (
                <p className="text-white font-medium text-sm truncate">
                  {selfie.displayName}
                </p>
              )}
              {selfie.message && (
                <p className="text-white/70 text-xs truncate mt-0.5">
                  {selfie.message}
                </p>
              )}
              {allowDownload && selfie.imageUrl && (
                <DownloadButton
                  imageUrl={selfie.imageUrl}
                  fileName={`${selfie.displayName || "selfie"}.jpg`}
                  className="mt-2 px-3 py-1 rounded-xs bg-secondary hover:bg-white/30 text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download
                </DownloadButton>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
